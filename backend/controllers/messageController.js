const { db } = require("../config/db");

// Get all conversations for a user (including group chats)
exports.getUserConversations = async (req, res) => {
  try {
    console.log('Fetching conversations for user:', req.user.id);
    
    // Get conversations from group memberships
    const groupConvos = await db.query(`
      SELECT 
        c.conversationid,
        c.name,
        c.type,
        c.groupid,
        c.lastmessageat,
        cm.lastreadat,
        cm.role,
        mg.groupname,
        (SELECT COUNT(*) FROM messages m 
         WHERE m.conversationid = c.conversationid 
           AND m.createdat > COALESCE(cm.lastreadat, '1970-01-01')
           AND m.senderid != $1) AS unreadcount,
        (SELECT COUNT(*) FROM conversation_members 
         WHERE conversationid = c.conversationid AND isactive = true) AS membercount,
        (SELECT m.content FROM messages m 
         WHERE m.conversationid = c.conversationid 
         ORDER BY m.createdat DESC LIMIT 1) AS lastmessage,
        (SELECT u.firstname || ' ' || u.lastname 
         FROM users u 
         JOIN messages m ON m.senderid = u.userid 
         WHERE m.conversationid = c.conversationid 
         ORDER BY m.createdat DESC LIMIT 1) AS lastmessagesender
      FROM conversations c
      JOIN conversation_members cm ON cm.conversationid = c.conversationid
      LEFT JOIN motshelogroups mg ON mg.groupid = c.groupid
      WHERE cm.userid = $1 AND c.isactive = true AND cm.isactive = true
      ORDER BY c.lastmessageat DESC NULLS LAST
    `, [req.user.id]);

    console.log('Found conversations:', groupConvos.rows.length);
    res.json({ success: true, data: groupConvos.rows || [] });
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ success: false, error: err.message, data: [] });
  }
};

// Get messages in a conversation
exports.getConversationMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { limit = 50, before } = req.query;

  try {
    let query = `
      SELECT * FROM vw_message_details 
      WHERE conversationid = $1
    `;
    
    const params = [conversationId];
    
    if (before) {
      query += ` AND createdat < $2`;
      params.push(before);
    }
    
    query += ` ORDER BY createdat DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);
    
    // Reverse to get ascending order (oldest first)
    const messages = result.rows.reverse();
    
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  const { conversationId, content, messagetype = 'text', replytomessageid } = req.body;

  if (!conversationId || !content) {
    return res.status(400).json({ error: "Conversation ID and content are required" });
  }

  try {
    // Verify user is member of conversation
    const memberCheck = await db.query(
      `SELECT 1 FROM conversation_members 
       WHERE conversationid = $1 AND userid = $2 AND isactive = true`,
      [conversationId, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not a member of this conversation" });
    }

    const result = await db.query(
      `INSERT INTO messages (conversationid, senderid, content, messagetype, replytomessageid)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [conversationId, req.user.id, content, messagetype, replytomessageid || null]
    );

    // Update conversation's last message time
    await db.query(
      `UPDATE conversations SET lastmessageat = CURRENT_TIMESTAMP, updatedat = CURRENT_TIMESTAMP
       WHERE conversationid = $1`,
      [conversationId]
    );

    const message = result.rows[0];
    
    // Get sender info
    const senderInfo = await db.query(
      `SELECT firstname, lastname, email FROM users WHERE userid = $1`,
      [req.user.id]
    );

    res.status(201).json({ 
      success: true, 
      data: {
        ...message,
        senderfirstname: senderInfo.rows[0].firstname,
        senderlastname: senderInfo.rows[0].lastname,
        senderemail: senderInfo.rows[0].email
      }
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: err.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  const { conversationId } = req.params;

  try {
    await db.query("SELECT sp_mark_messages_read($1, $2)", [conversationId, req.user.id]);
    
    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    console.error("Error marking as read:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new conversation (1-on-1 or group)
exports.createConversation = async (req, res) => {
  const { name, type = 'direct', participantIds, groupid } = req.body;

  try {
    // Create conversation
    const convResult = await db.query(
      `INSERT INTO conversations (name, type, groupid, createdby, lastmessageat)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [name || null, type, groupid || null, req.user.id]
    );

    const conversation = convResult.rows[0];

    // Add creator as member
    await db.query(
      `INSERT INTO conversation_members (conversationid, userid, role)
       VALUES ($1, $2, 'admin')`,
      [conversation.conversationid, req.user.id]
    );

    // Add other participants
    if (participantIds && participantIds.length > 0) {
      for (const participantId of participantIds) {
        await db.query(
          `INSERT INTO conversation_members (conversationid, userid)
           VALUES ($1, $2)`,
          [conversation.conversationid, participantId]
        );
      }
    }

    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const result = await db.query("SELECT sp_get_unread_count($1)", [req.user.id]);
    res.json({ success: true, data: { count: result.rows[0].sp_get_unread_count } });
  } catch (err) {
    console.error("Error getting unread count:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create a conversation for a group (auto-created when member joins)
exports.getOrCreateGroupConversation = async (req, res) => {
  const { groupId } = req.params;

  try {
    // Check if user is member of the group
    const memberCheck = await db.query(
      `SELECT 1 FROM groupmembers 
       WHERE groupid = $1 AND userid = $2 AND isactive = true`,
      [groupId, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // Check if conversation already exists for this group
    let conversation = await db.query(
      `SELECT * FROM conversations WHERE groupid = $1 AND isactive = true`,
      [groupId]
    );

    if (conversation.rows.length === 0) {
      // Create new conversation for the group
      const groupInfo = await db.query(
        `SELECT groupname FROM motshelogroups WHERE groupid = $1`,
        [groupId]
      );

      const convResult = await db.query(
        `INSERT INTO conversations (name, type, groupid, createdby, lastmessageat)
         VALUES ($1, 'group', $2, $3, CURRENT_TIMESTAMP)
         RETURNING *`,
        [groupInfo.rows[0].groupname, groupId, req.user.id]
      );

      const newConversation = convResult.rows[0];

      // Get all group members and add them to conversation
      const members = await db.query(
        `SELECT userid, role FROM groupmembers WHERE groupid = $1 AND isactive = true`,
        [groupId]
      );

      for (const member of members.rows) {
        await db.query(
          `INSERT INTO conversation_members (conversationid, userid, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (conversationid, userid) DO NOTHING`,
          [newConversation.conversationid, member.userid, member.role === 'admin' || member.role === 'signatory' ? 'admin' : 'member']
        );
      }

      // Add welcome message
      await db.query(
        `INSERT INTO messages (conversationid, senderid, content, messagetype)
         VALUES ($1, $2, $3, 'system')`,
        [newConversation.conversationid, req.user.id, `🎉 Group chat created for ${groupInfo.rows[0].groupname}`]
      );

      conversation = await db.query(
        `SELECT * FROM conversations WHERE conversationid = $1`,
        [newConversation.conversationid]
      );
    }

    res.json({ success: true, data: conversation.rows[0] });
  } catch (err) {
    console.error("Error getting/creating group conversation:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a message (soft delete)
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    // Verify user owns the message
    const msgCheck = await db.query(
      `SELECT senderid FROM messages WHERE messageid = $1`,
      [messageId]
    );

    if (msgCheck.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (msgCheck.rows[0].senderid !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    await db.query(
      `UPDATE messages SET isdeleted = true, updatedat = CURRENT_TIMESTAMP
       WHERE messageid = $1`,
      [messageId]
    );

    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: err.message });
  }
};

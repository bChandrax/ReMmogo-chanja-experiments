const { db } = require("../config/db");

// GET USER NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  const { limit = 50, unreadOnly = false } = req.query;
  
  try {
    let query = `
      SELECT 
        n.notificationid,
        n.type,
        n.title,
        n.message,
        n.relatedid,
        n.groupid,
        n.isread,
        n.createdat,
        mg.groupname
      FROM notifications n
      LEFT JOIN motshelogroups mg ON mg.groupid = n.groupid
      WHERE n.userid = $1
    `;
    
    const params = [req.user.id];
    
    if (unreadOnly === 'true') {
      query += ` AND n.isread = false`;
    }
    
    query += ` ORDER BY n.createdat DESC LIMIT $2`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  
  try {
    await db.query(
      `UPDATE notifications SET isread = false, readat = NOW() WHERE notificationid = $1 AND userid = $2`,
      [notificationId, req.user.id]
    );
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK ALL NOTIFICATIONS AS READ
exports.markAllAsRead = async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET isread = false, readat = NOW() WHERE userid = $1`,
      [req.user.id]
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET UNREAD COUNT
exports.getUnreadCount = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM notifications WHERE userid = $1 AND isread = false`,
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET PENDING MEMBERSHIP REQUESTS (for signatories)
exports.getPendingMembershipRequests = async (req, res) => {
  const { groupId } = req.params;
  
  try {
    // Check if user is a signatory of this group
    const signatoryCheck = await db.query(
      `SELECT 1 FROM groupmembers 
       WHERE userid = $1 AND groupid = $2 AND role IN ('signatory', 'admin') AND isactive = true`,
      [req.user.id, groupId]
    );
    
    if (signatoryCheck.rows.length === 0) {
      return res.status(403).json({ error: "Only signatories can view membership requests" });
    }
    
    const result = await db.query(
      `SELECT * FROM vw_pending_membership_requests WHERE groupid = $1`,
      [groupId]
    );
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// APPROVE MEMBERSHIP REQUEST
exports.approveMembershipRequest = async (req, res) => {
  const { requestId } = req.params;
  
  try {
    // Get request details to find group
    const requestCheck = await db.query(
      `SELECT groupid FROM membershiprequests WHERE requestid = $1`,
      [requestId]
    );
    
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    const groupId = requestCheck.rows[0].groupid;
    
    // Check if user is a signatory of this group
    const signatoryCheck = await db.query(
      `SELECT 1 FROM groupmembers 
       WHERE userid = $1 AND groupid = $2 AND role IN ('signatory', 'admin') AND isactive = true`,
      [req.user.id, groupId]
    );
    
    if (signatoryCheck.rows.length === 0) {
      return res.status(403).json({ error: "Only signatories can approve requests" });
    }
    
    await db.query("SELECT sp_approve_membership_request($1, $2)", [requestId, req.user.id]);
    res.json({ message: "Membership request approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REJECT MEMBERSHIP REQUEST
exports.rejectMembershipRequest = async (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body;
  
  try {
    // Get request details to find group
    const requestCheck = await db.query(
      `SELECT groupid FROM membershiprequests WHERE requestid = $1`,
      [requestId]
    );
    
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    const groupId = requestCheck.rows[0].groupid;
    
    // Check if user is a signatory of this group
    const signatoryCheck = await db.query(
      `SELECT 1 FROM groupmembers 
       WHERE userid = $1 AND groupid = $2 AND role IN ('signatory', 'admin') AND isactive = true`,
      [req.user.id, groupId]
    );
    
    if (signatoryCheck.rows.length === 0) {
      return res.status(403).json({ error: "Only signatories can reject requests" });
    }
    
    await db.query("SELECT sp_reject_membership_request($1, $2, $3)", [requestId, req.user.id, reason || null]);
    res.json({ message: "Membership request rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

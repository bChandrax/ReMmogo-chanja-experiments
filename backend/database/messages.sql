-- WhatsApp-like Messaging System for Re-Mmogo
-- Run this after the main database setup

-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS conversation_members CASCADE;

-- ============================================================
-- CONVERSATIONS (Chat rooms/groups)
-- ============================================================
CREATE TABLE conversations (
    conversationid SERIAL PRIMARY KEY,
    name VARCHAR(255), -- For group chats, NULL for 1-on-1
    type VARCHAR(50) DEFAULT 'direct', -- 'direct' or 'group'
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE, -- If associated with a group
    createdby INTEGER REFERENCES users(userid) ON DELETE SET NULL,
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    lastmessageat TIMESTAMPTZ,
    isactive BOOLEAN DEFAULT true
);

-- ============================================================
-- CONVERSATION MEMBERS (Who's in each conversation)
-- ============================================================
CREATE TABLE conversation_members (
    memberid SERIAL PRIMARY KEY,
    conversationid INTEGER REFERENCES conversations(conversationid) ON DELETE CASCADE,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
    joinedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    lastreadat TIMESTAMPTZ, -- Last time user read messages
    isactive BOOLEAN DEFAULT true,
    UNIQUE(conversationid, userid)
);

-- Index for fast lookup of user's conversations
CREATE INDEX idx_conv_members_userid ON conversation_members(userid);
CREATE INDEX idx_conv_members_convid ON conversation_members(conversationid);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
    messageid SERIAL PRIMARY KEY,
    conversationid INTEGER REFERENCES conversations(conversationid) ON DELETE CASCADE,
    senderid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
    content TEXT NOT NULL,
    messagetype VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
    status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read'
    replytomessageid INTEGER REFERENCES messages(messageid) ON DELETE SET NULL, -- For threaded replies
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    isdeleted BOOLEAN DEFAULT false,
    editedat TIMESTAMPTZ
);

-- Indexes for fast message retrieval
CREATE INDEX idx_messages_convid ON messages(conversationid);
CREATE INDEX idx_messages_senderid ON messages(senderid);
CREATE INDEX idx_messages_createdat ON messages(createdat);
CREATE INDEX idx_messages_convid_createdat ON messages(conversationid, createdat DESC);

-- ============================================================
-- MESSAGE READ RECEIPTS (Who has read what)
-- ============================================================
CREATE TABLE message_reads (
    readid SERIAL PRIMARY KEY,
    messageid INTEGER REFERENCES messages(messageid) ON DELETE CASCADE,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    readat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(messageid, userid)
);

-- Index for read receipt lookup
CREATE INDEX idx_message_reads_messageid ON message_reads(messageid);
CREATE INDEX idx_message_reads_userid ON message_reads(userid);

-- ============================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================

-- View: User's conversations with last message
CREATE OR REPLACE VIEW vw_user_conversations AS
SELECT 
    c.conversationid,
    c.name,
    c.type,
    c.groupid,
    c.createdby,
    c.lastmessageat,
    cm.userid,
    cm.lastreadat,
    cm.role,
    (SELECT COUNT(*) FROM messages m WHERE m.conversationid = c.conversationid AND m.createdat > COALESCE(cm.lastreadat, '1970-01-01') AND m.senderid != cm.userid) AS unreadcount,
    (SELECT COUNT(*) FROM conversation_members WHERE conversationid = c.conversationid AND isactive = true) AS membercount,
    (SELECT m.content FROM messages m WHERE m.conversationid = c.conversationid ORDER BY m.createdat DESC LIMIT 1) AS lastmessage,
    (SELECT u.firstname || ' ' || u.lastname FROM users u JOIN messages m ON m.senderid = u.userid WHERE m.conversationid = c.conversationid ORDER BY m.createdat DESC LIMIT 1) AS lastmessagesender
FROM conversations c
JOIN conversation_members cm ON cm.conversationid = c.conversationid
WHERE c.isactive = true AND cm.isactive = true;

-- View: Message details with sender info
CREATE OR REPLACE VIEW vw_message_details AS
SELECT 
    m.messageid,
    m.conversationid,
    m.senderid,
    m.content,
    m.messagetype,
    m.status,
    m.replytomessageid,
    m.createdat,
    m.editedat,
    m.isdeleted,
    u.firstname AS senderfirstname,
    u.lastname AS senderlastname,
    u.email AS senderemail,
    (SELECT COUNT(*) FROM message_reads mr WHERE mr.messageid = m.messageid) AS readcount
FROM messages m
LEFT JOIN users u ON u.userid = m.senderid
WHERE m.isdeleted = false
ORDER BY m.createdat ASC;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function: Mark all messages in a conversation as read
CREATE OR REPLACE FUNCTION sp_mark_messages_read(
    p_conversationid INTEGER,
    p_userid INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Update user's last read time
    UPDATE conversation_members 
    SET lastreadat = CURRENT_TIMESTAMP
    WHERE conversationid = p_conversationid AND userid = p_userid;
    
    -- Mark messages as read
    INSERT INTO message_reads (messageid, userid, readat)
    SELECT m.messageid, p_userid, CURRENT_TIMESTAMP
    FROM messages m
    WHERE m.conversationid = p_conversationid 
      AND m.senderid != p_userid
      AND NOT EXISTS (
          SELECT 1 FROM message_reads mr 
          WHERE mr.messageid = m.messageid AND mr.userid = p_userid
      );
END;
$$ LANGUAGE plpgsql;

-- Function: Get unread count for user
CREATE OR REPLACE FUNCTION sp_get_unread_count(p_userid INTEGER)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(
        (SELECT COUNT(*) FROM messages m 
         WHERE m.conversationid = cm.conversationid 
           AND m.createdat > COALESCE(cm.lastreadat, '1970-01-01')
           AND m.senderid != p_userid)
    ), 0) INTO unread_count
    FROM conversation_members cm
    WHERE cm.userid = p_userid AND cm.isactive = true;
    
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED DATA: Create sample conversations
-- ============================================================

-- Create a general group chat for all users
INSERT INTO conversations (name, type, createdby, lastmessageat)
SELECT 'General Chat', 'group', 1, CURRENT_TIMESTAMP;

-- Add all users to the general chat
INSERT INTO conversation_members (conversationid, userid, role)
SELECT 1, userid, CASE WHEN userid = 1 THEN 'admin' ELSE 'member' END
FROM users;

-- Add a welcome message
INSERT INTO messages (conversationid, senderid, content, messagetype)
VALUES (1, 1, '👋 Welcome to Re-Mmogo! This is the general chat for all members.', 'system');

-- ============================================================
-- VERIFICATION
-- ============================================================
-- SELECT * FROM vw_user_conversations WHERE userid = 1;
-- SELECT * FROM vw_message_details WHERE conversationid = 1;

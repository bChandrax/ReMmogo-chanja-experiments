-- Re-Mmogo Database Setup - Create Tables Only
-- Run this on your Render PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phonenumber VARCHAR(20),
    passwordhash VARCHAR(255) NOT NULL,
    nationalid VARCHAR(50),
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Motshelo Groups table
CREATE TABLE IF NOT EXISTS motshelogroups (
    groupid SERIAL PRIMARY KEY,
    groupname VARCHAR(255) NOT NULL,
    description TEXT,
    monthlycontribution DECIMAL(12,2) DEFAULT 1000.00,
    requiredinterest DECIMAL(12,2) DEFAULT 5000.00,
    loaninterestrate DECIMAL(5,4) DEFAULT 0.20,
    yearstartdate DATE NOT NULL,
    yearenddate DATE NOT NULL,
    isactive BOOLEAN DEFAULT true,
    isopen BOOLEAN DEFAULT true,
    maxmembers INTEGER DEFAULT 12,
    location VARCHAR(255),
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Members table
CREATE TABLE IF NOT EXISTS groupmembers (
    memberid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joindate DATE DEFAULT CURRENT_DATE,
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(groupid, userid)
);

-- Group Signatories table
CREATE TABLE IF NOT EXISTS groupsignatories (
    signatoryid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    memberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    assignedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isactive BOOLEAN DEFAULT true,
    UNIQUE(groupid, memberid)
);

-- Monthly Contributions table
CREATE TABLE IF NOT EXISTS monthlycontributions (
    contributionid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    memberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    contributionmonth VARCHAR(20) NOT NULL,
    amountdue DECIMAL(12,2) DEFAULT 1000.00,
    amountpaid DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'not_paid',
    proofofpayment TEXT,
    submittedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(groupid, memberid, contributionmonth)
);

-- Contribution Approvals table
CREATE TABLE IF NOT EXISTS contributionapprovals (
    approvalid SERIAL PRIMARY KEY,
    contributionid INTEGER REFERENCES monthlycontributions(contributionid) ON DELETE CASCADE,
    signatorymemberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    decision VARCHAR(50),
    decisionnote TEXT,
    decidedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contributionid, signatorymemberid)
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
    loanid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    borrowermemberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    principalamount DECIMAL(12,2) NOT NULL,
    interestrate DECIMAL(5,4) DEFAULT 0.20,
    outstandingbalance DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    purpose TEXT,
    requestedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disbursedat TIMESTAMP,
    duedate DATE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Approvals table
CREATE TABLE IF NOT EXISTS loanapprovals (
    loanapprovalid SERIAL PRIMARY KEY,
    loanid INTEGER REFERENCES loans(loanid) ON DELETE CASCADE,
    signatorymemberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    decision VARCHAR(50),
    decisionnote TEXT,
    decidedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(loanid, signatorymemberid)
);

-- Loan Repayments table
CREATE TABLE IF NOT EXISTS loanrepayments (
    repaymentid SERIAL PRIMARY KEY,
    loanid INTEGER REFERENCES loans(loanid) ON DELETE CASCADE,
    memberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    amountpaid DECIMAL(12,2) NOT NULL,
    repaymentdate DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'pending',
    proofofpayment TEXT,
    submittedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Repayment Approvals table
CREATE TABLE IF NOT EXISTS repaymentapprovals (
    repayapprovalid SERIAL PRIMARY KEY,
    repaymentid INTEGER REFERENCES loanrepayments(repaymentid) ON DELETE CASCADE,
    signatorymemberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    decision VARCHAR(50),
    decisionnote TEXT,
    decidedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repaymentid, signatorymemberid)
);

-- Loan Interest Schedule table
CREATE TABLE IF NOT EXISTS loaninterestschedule (
    scheduleid SERIAL PRIMARY KEY,
    loanid INTEGER REFERENCES loans(loanid) ON DELETE CASCADE,
    periodmonth DATE NOT NULL,
    openingbalance DECIMAL(12,2) NOT NULL,
    interestcharged DECIMAL(12,2) NOT NULL,
    closingbalance DECIMAL(12,2) NOT NULL,
    isapplied BOOLEAN DEFAULT false,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(loanid, periodmonth)
);

-- Conversations table (for messaging)
CREATE TABLE IF NOT EXISTS conversations (
    conversationid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    createdby INTEGER REFERENCES users(userid),
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation Members table
CREATE TABLE IF NOT EXISTS conversation_members (
    memberid SERIAL PRIMARY KEY,
    conversationid INTEGER REFERENCES conversations(conversationid) ON DELETE CASCADE,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    joinedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversationid, userid)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    messageid SERIAL PRIMARY KEY,
    conversationid INTEGER REFERENCES conversations(conversationid) ON DELETE CASCADE,
    senderid INTEGER REFERENCES users(userid),
    content TEXT NOT NULL,
    messagetype VARCHAR(50) DEFAULT 'text',
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editedat TIMESTAMP
);

-- Message Reads table
CREATE TABLE IF NOT EXISTS message_reads (
    readid SERIAL PRIMARY KEY,
    messageid INTEGER REFERENCES messages(messageid) ON DELETE CASCADE,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    readat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(messageid, userid)
);

-- Membership Requests table
CREATE TABLE IF NOT EXISTS membershiprequests (
    requestid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    requestedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewedat TIMESTAMP,
    reviewedby INTEGER REFERENCES users(userid),
    reviewnote TEXT,
    UNIQUE(groupid, userid, status)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notificationid SERIAL PRIMARY KEY,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    relatedid INTEGER,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    isread BOOLEAN DEFAULT false,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    readat TIMESTAMP
);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Member Balances View
CREATE OR REPLACE VIEW vw_member_balances AS
SELECT
    gm.memberid,
    gm.groupid,
    gm.userid,
    u.firstname,
    u.lastname,
    u.email,
    gm.role,
    COUNT(DISTINCT mc.contributionid) AS totalcontributions,
    COALESCE(SUM(mc.amountpaid), 0) AS totalpaid,
    COALESCE(SUM(mc.amountdue), 0) AS totaldue,
    COALESCE(SUM(CASE WHEN mc.status = 'paid' THEN mc.amountpaid ELSE 0 END), 0) AS paidcontributions,
    COALESCE((
        SELECT SUM(l.outstandingbalance)
        FROM loans l
        WHERE l.borrowermemberid = gm.memberid AND l.status = 'active'
    ), 0) AS outstandingloans,
    COALESCE((
        SELECT SUM(l.principalamount)
        FROM loans l
        WHERE l.borrowermemberid = gm.memberid AND l.status IN ('active', 'settled')
    ), 0) AS totalloanstaken
FROM groupmembers gm
INNER JOIN users u ON u.userid = gm.userid
LEFT JOIN monthlycontributions mc ON mc.memberid = gm.memberid AND mc.status = 'paid'
WHERE gm.isactive = true
GROUP BY gm.memberid, gm.groupid, gm.userid, u.firstname, u.lastname, u.email, gm.role;

-- Year End Report View
CREATE OR REPLACE VIEW vw_year_end_report AS
SELECT
    gm.memberid,
    u.firstname,
    u.lastname,
    gm.groupid,
    mg.groupname,
    mg.yearstartdate,
    mg.yearenddate,
    COALESCE(SUM(mc.amountpaid), 0) AS totalcontributed,
    COALESCE(SUM(mc.amountdue), 0) AS totaldue,
    COALESCE((
        SELECT SUM(l.outstandingbalance)
        FROM loans l
        WHERE l.borrowermemberid = gm.memberid AND l.status = 'active'
    ), 0) AS outstandingloans,
    COALESCE((
        SELECT SUM(l.principalamount - l.outstandingbalance)
        FROM loans l
        WHERE l.borrowermemberid = gm.memberid
    ), 0) AS loansrepaid,
    (COALESCE(SUM(mc.amountpaid), 0) +
     COALESCE((SELECT SUM(mc2.amountdue * 0.15) FROM monthlycontributions mc2 WHERE mc2.memberid = gm.memberid AND mc2.status = 'paid'), 0) -
     COALESCE((SELECT SUM(l.outstandingbalance) FROM loans l WHERE l.borrowermemberid = gm.memberid AND l.status = 'active'), 0)
    ) AS estimatedpayout
FROM groupmembers gm
INNER JOIN users u ON u.userid = gm.userid
INNER JOIN motshelogroups mg ON mg.groupid = gm.groupid
LEFT JOIN monthlycontributions mc ON mc.memberid = gm.memberid AND mc.contributionmonth LIKE CONCAT(EXTRACT(YEAR FROM mg.yearstartdate), '%') AND mc.status = 'paid'
WHERE gm.isactive = true
GROUP BY gm.memberid, gm.groupid, gm.userid, u.firstname, u.lastname, mg.groupname, mg.yearstartdate, mg.yearenddate;

-- Pending Membership Requests View
CREATE OR REPLACE VIEW vw_pending_membership_requests AS
SELECT
    mr.requestid,
    mr.groupid,
    mr.userid,
    mg.groupname,
    u.firstname,
    u.lastname,
    u.email,
    u.phonenumber,
    mr.message,
    mr.requestedat,
    mr.status
FROM membershiprequests mr
INNER JOIN motshelogroups mg ON mg.groupid = mr.groupid
INNER JOIN users u ON u.userid = mr.userid
WHERE mr.status = 'pending'
ORDER BY mr.requestedat DESC;

-- User Conversations View
CREATE OR REPLACE VIEW vw_user_conversations AS
SELECT
    c.conversationid,
    c.groupid,
    c.createdby,
    c.createdat,
    cm.userid,
    mg.groupname
FROM conversations c
INNER JOIN conversation_members cm ON cm.conversationid = c.conversationid
INNER JOIN motshelogroups mg ON mg.groupid = c.groupid;

-- Message Details View
CREATE OR REPLACE VIEW vw_message_details AS
SELECT
    m.messageid,
    m.conversationid,
    m.senderid,
    m.content,
    m.messagetype,
    m.createdat,
    u.firstname || ' ' || u.lastname AS sendername,
    mg.groupname
FROM messages m
INNER JOIN users u ON u.userid = m.senderid
INNER JOIN conversations c ON c.conversationid = m.conversationid
INNER JOIN motshelogroups mg ON mg.groupid = c.groupid;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Function to generate monthly contributions
CREATE OR REPLACE FUNCTION sp_generate_monthly_contributions(
    p_groupid INTEGER,
    p_periodmonth VARCHAR(20)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO monthlycontributions (groupid, memberid, contributionmonth, amountdue, status)
    SELECT
        p_groupid,
        gm.memberid,
        p_periodmonth,
        mg.monthlycontribution,
        'not_paid'
    FROM groupmembers gm
    CROSS JOIN motshelogroups mg
    WHERE gm.groupid = p_groupid
      AND gm.isactive = true
      AND mg.groupid = p_groupid
      AND NOT EXISTS (
          SELECT 1 FROM monthlycontributions mc
          WHERE mc.groupid = p_groupid
            AND mc.memberid = gm.memberid
            AND mc.contributionmonth = p_periodmonth
      )
    ON CONFLICT (groupid, memberid, contributionmonth) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to apply monthly loan interest
CREATE OR REPLACE FUNCTION sp_apply_monthly_loan_interest(
    p_groupid INTEGER,
    p_periodmonth DATE
) RETURNS VOID AS $$
BEGIN
    INSERT INTO loaninterestschedule (loanid, periodmonth, openingbalance, interestcharged, closingbalance)
    SELECT
        l.loanid,
        p_periodmonth,
        l.outstandingbalance,
        l.outstandingbalance * l.interestrate,
        l.outstandingbalance + (l.outstandingbalance * l.interestrate)
    FROM loans l
    WHERE l.groupid = p_groupid
      AND l.status = 'active'
      AND NOT EXISTS (
          SELECT 1 FROM loaninterestschedule lis
          WHERE lis.loanid = l.loanid AND lis.periodmonth = p_periodmonth
      );

    UPDATE loans l
    SET outstandingbalance = outstandingbalance + (outstandingbalance * l.interestrate),
        updatedat = CURRENT_TIMESTAMP
    WHERE l.groupid = p_groupid
      AND l.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to approve membership request
CREATE OR REPLACE FUNCTION sp_approve_membership_request(
    p_requestid INTEGER,
    p_approverid INTEGER
) RETURNS VOID AS $$
DECLARE
    v_groupid INTEGER;
    v_userid INTEGER;
    v_memberid INTEGER;
BEGIN
    SELECT groupid, userid INTO v_groupid, v_userid
    FROM membershiprequests
    WHERE requestid = p_requestid AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed';
    END IF;

    INSERT INTO groupmembers (groupid, userid, role, joindate, isactive)
    VALUES (v_groupid, v_userid, 'member', CURRENT_DATE, true)
    ON CONFLICT (groupid, userid) DO UPDATE SET isactive = true, joindate = CURRENT_DATE
    RETURNING memberid INTO v_memberid;

    UPDATE membershiprequests
    SET status = 'approved',
        reviewedat = NOW(),
        reviewedby = p_approverid,
        reviewnote = 'Approved by signatory'
    WHERE requestid = p_requestid;

    INSERT INTO notifications (userid, type, title, message, relatedid, groupid)
    VALUES (
        v_userid,
        'membership_approved',
        'Join Request Approved',
        'Your request to join the group has been approved!',
        p_requestid,
        v_groupid
    );

    INSERT INTO conversations (groupid, memberid, createdat)
    VALUES (v_groupid, v_memberid, NOW())
    ON CONFLICT (groupid, memberid) DO NOTHING;

END;
$$ LANGUAGE plpgsql;

-- Function to reject membership request
CREATE OR REPLACE FUNCTION sp_reject_membership_request(
    p_requestid INTEGER,
    p_approverid INTEGER,
    p_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE membershiprequests
    SET status = 'rejected',
        reviewedat = NOW(),
        reviewedby = p_approverid,
        reviewnote = p_reason
    WHERE requestid = p_requestid AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed';
    END IF;

    DECLARE
        v_userid INTEGER;
        v_groupid INTEGER;
    BEGIN
        SELECT userid, groupid INTO v_userid, v_groupid
        FROM membershiprequests
        WHERE requestid = p_requestid;

        INSERT INTO notifications (userid, type, title, message, relatedid, groupid)
        VALUES (
            v_userid,
            'membership_rejected',
            'Join Request Update',
            COALESCE(p_reason, 'Your request to join the group was not approved.'),
            p_requestid,
            v_groupid
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_groupmembers_groupid ON groupmembers(groupid);
CREATE INDEX IF NOT EXISTS idx_groupmembers_userid ON groupmembers(userid);
CREATE INDEX IF NOT EXISTS idx_monthlycontributions_groupid ON monthlycontributions(groupid);
CREATE INDEX IF NOT EXISTS idx_monthlycontributions_memberid ON monthlycontributions(memberid);
CREATE INDEX IF NOT EXISTS idx_loans_groupid ON loans(groupid);
CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans(borrowermemberid);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_membershiprequests_groupid ON membershiprequests(groupid);
CREATE INDEX IF NOT EXISTS idx_membershiprequests_userid ON membershiprequests(userid);
CREATE INDEX IF NOT EXISTS idx_membershiprequests_status ON membershiprequests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_userid ON notifications(userid);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(userid, isread);

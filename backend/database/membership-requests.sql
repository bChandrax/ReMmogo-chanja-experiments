-- Membership Requests and Notifications Schema
-- Run this on your PostgreSQL database to add join request functionality

-- ============================================================================
-- MEMBERSHIP REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS membershiprequests (
    requestid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    requestedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewedat TIMESTAMP,
    reviewedby INTEGER REFERENCES users(userid),
    reviewnote TEXT,
    UNIQUE(groupid, userid, status)
);

CREATE INDEX IF NOT EXISTS idx_membershiprequests_group ON membershiprequests(groupid);
CREATE INDEX IF NOT EXISTS idx_membershiprequests_user ON membershiprequests(userid);
CREATE INDEX IF NOT EXISTS idx_membershiprequests_status ON membershiprequests(status);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    notificationid SERIAL PRIMARY KEY,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- join_request, loan_request, contribution_approved, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    relatedid INTEGER, -- ID of the related entity (request, loan, contribution, etc.)
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    isread BOOLEAN DEFAULT false,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    readat TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userid);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(userid, isread);

-- ============================================================================
-- FUNCTION: Approve Membership Request (called by signatory)
-- ============================================================================
CREATE OR REPLACE FUNCTION sp_approve_membership_request(
    p_requestid INTEGER,
    p_approverid INTEGER
) RETURNS VOID AS $$
DECLARE
    v_groupid INTEGER;
    v_userid INTEGER;
    v_memberid INTEGER;
BEGIN
    -- Get request details
    SELECT groupid, userid INTO v_groupid, v_userid
    FROM membershiprequests
    WHERE requestid = p_requestid AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed';
    END IF;

    -- Add user as member of the group
    INSERT INTO groupmembers (groupid, userid, role, joindate, isactive)
    VALUES (v_groupid, v_userid, 'member', CURRENT_DATE, true)
    ON CONFLICT (groupid, userid) DO UPDATE SET isactive = true, joindate = CURRENT_DATE
    RETURNING memberid INTO v_memberid;

    -- Update request status
    UPDATE membershiprequests
    SET status = 'approved',
        reviewedat = NOW(),
        reviewedby = p_approverid,
        reviewnote = 'Approved by signatory'
    WHERE requestid = p_requestid;

    -- Create notification for the approved user
    INSERT INTO notifications (userid, type, title, message, relatedid, groupid)
    VALUES (
        v_userid,
        'membership_approved',
        'Join Request Approved',
        'Your request to join the group has been approved!',
        p_requestid,
        v_groupid
    );

    -- Create notification in group chat
    INSERT INTO conversations (groupid, memberid, createdat)
    VALUES (v_groupid, v_memberid, NOW())
    ON CONFLICT (groupid, memberid) DO NOTHING;

END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Reject Membership Request (called by signatory)
-- ============================================================================
CREATE OR REPLACE FUNCTION sp_reject_membership_request(
    p_requestid INTEGER,
    p_approverid INTEGER,
    p_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Update request status
    UPDATE membershiprequests
    SET status = 'rejected',
        reviewedat = NOW(),
        reviewedby = p_approverid,
        reviewnote = p_reason
    WHERE requestid = p_requestid AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed';
    END IF;

    -- Get user info for notification
    DECLARE
        v_userid INTEGER;
        v_groupid INTEGER;
    BEGIN
        SELECT userid, groupid INTO v_userid, v_groupid
        FROM membershiprequests
        WHERE requestid = p_requestid;

        -- Create notification for the rejected user
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
-- VIEW: Pending Membership Requests with User Details
-- ============================================================================
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

-- Manual fix for daboys group signatories
-- This adds the group creator (Pako) as admin and signatory

-- First, find the user ID for Pako
DO $$
DECLARE
    v_userid INTEGER;
    v_groupid INTEGER;
    v_memberid INTEGER;
BEGIN
    -- Get Pako's user ID
    SELECT userid INTO v_userid FROM users WHERE email = 'pakoserumola02@gmail.com';
    
    -- Get daboys group ID
    SELECT groupid INTO v_groupid FROM motshelogroups WHERE groupname = 'daboys';
    
    -- Check if user is already a member
    SELECT memberid INTO v_memberid FROM groupmembers WHERE groupid = v_groupid AND userid = v_userid;
    
    IF v_memberid IS NULL THEN
        -- Add user as admin member
        INSERT INTO groupmembers (groupid, userid, role, joindate, isactive)
        VALUES (v_groupid, v_userid, 'admin', CURRENT_DATE, true)
        RETURNING memberid INTO v_memberid;
        
        RAISE NOTICE 'Added Pako as admin to daboys group';
    ELSE
        -- Update existing member to admin role
        UPDATE groupmembers SET role = 'admin' WHERE memberid = v_memberid;
        RAISE NOTICE 'Updated Pako to admin role in daboys group';
    END IF;
    
    -- Add to signatories table
    INSERT INTO groupsignatories (groupid, memberid)
    VALUES (v_groupid, v_memberid)
    ON CONFLICT (groupid, memberid) DO NOTHING;
    
    RAISE NOTICE 'Added Pako to groupsignatories table';
END $$;

-- Verify the fix
SELECT 
  mg.groupname AS "Group",
  u.firstname || ' ' || u.lastname AS "Signatory",
  gm.role AS "Role"
FROM groupmembers gm
JOIN motshelogroups mg ON mg.groupid = gm.groupid
JOIN users u ON u.userid = gm.userid
JOIN groupsignatories gs ON gs.groupid = gm.groupid AND gs.memberid = gm.memberid
WHERE gm.isactive = true
ORDER BY mg.groupname, gm.role;

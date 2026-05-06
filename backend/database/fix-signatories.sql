-- Fix existing signatories data
-- This script ensures all admins and signatories are in the groupsignatories table

-- Insert missing signatory records for all admins
INSERT INTO groupsignatories (groupid, memberid)
SELECT DISTINCT gm.groupid, gm.memberid
FROM groupmembers gm
WHERE gm.role IN ('admin', 'signatory')
  AND gm.isactive = true
  AND NOT EXISTS (
    SELECT 1 FROM groupsignatories gs 
    WHERE gs.groupid = gm.groupid AND gs.memberid = gm.memberid
  )
ON CONFLICT (groupid, memberid) DO NOTHING;

-- Verify the fix
SELECT 
  mg.groupname,
  u.firstname || ' ' || u.lastname AS signatory_name,
  gm.role
FROM groupmembers gm
JOIN motshelogroups mg ON mg.groupid = gm.groupid
JOIN users u ON u.userid = gm.userid
WHERE gm.role IN ('admin', 'signatory')
  AND gm.isactive = true
ORDER BY mg.groupname, gm.role, u.firstname;

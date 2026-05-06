# Check signatories for all groups

$pgpassword = "Pakobenson@02"
$env:PGPASSWORD = $pgpassword
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$dbServer = "localhost"
$dbUser = "postgres"
$dbName = "remmogo"

Write-Host "========================================"
Write-Host "Checking Group Members & Signatories"
Write-Host "========================================"
Write-Host ""

& $psqlPath -h $dbServer -U $dbUser -d $dbName -c "SELECT mg.groupname AS GroupName, u.firstname || ' ' || u.lastname AS MemberName, gm.role AS Role, CASE WHEN gs.memberid IS NOT NULL THEN 'Yes' ELSE 'No' END AS InSignatoriesTable FROM groupmembers gm JOIN motshelogroups mg ON mg.groupid = gm.groupid JOIN users u ON u.userid = gm.userid LEFT JOIN groupsignatories gs ON gs.groupid = gm.groupid AND gs.memberid = gm.memberid WHERE gm.isactive = true ORDER BY mg.groupname, gm.role, u.firstname;"

Write-Host ""
Write-Host "========================================"
Write-Host "Fixing Missing Signatories"
Write-Host "========================================"
Write-Host ""

& $psqlPath -h $dbServer -U $dbUser -d $dbName -c "INSERT INTO groupsignatories (groupid, memberid) SELECT DISTINCT gm.groupid, gm.memberid FROM groupmembers gm WHERE gm.role IN ('admin', 'signatory') AND gm.isactive = true AND NOT EXISTS (SELECT 1 FROM groupsignatories gs WHERE gs.groupid = gm.groupid AND gs.memberid = gm.memberid) ON CONFLICT (groupid, memberid) DO NOTHING;"

Write-Host ""
Write-Host "Done! Refresh your group dashboard to see the signatories."

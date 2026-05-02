const { sql } = require("../config/db");

// ENROLL MEMBER INTO GROUP
exports.enrollMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId, role } = req.body;

  if (!userId) return res.status(400).json({ error: "userId is required" });

  const memberRole = role || "member";
  if (!["member", "signatory", "admin"].includes(memberRole)) {
    return res.status(400).json({ error: "Role must be member, signatory or admin" });
  }

  try {
    // Check user exists
    const userCheck = await sql.query`SELECT UserID FROM Users WHERE UserID = ${userId} AND IsActive = 1`;
    if (userCheck.recordset.length === 0) return res.status(404).json({ error: "User not found" });

    // Check not already a member
    const existingMember = await sql.query`
      SELECT MemberID FROM GroupMembers WHERE GroupID = ${groupId} AND UserID = ${userId}
    `;
    if (existingMember.recordset.length > 0) {
      return res.status(400).json({ error: "User is already a member of this group" });
    }

    // If signatory, check max 2
    if (memberRole === "signatory") {
      const sigCount = await sql.query`
        SELECT COUNT(*) AS cnt FROM GroupMembers
        WHERE GroupID = ${groupId} AND Role = 'signatory' AND IsActive = 1
      `;
      if (sigCount.recordset[0].cnt >= 2) {
        return res.status(400).json({ error: "Group already has 2 signatories" });
      }
    }

    const result = await sql.query`
      INSERT INTO GroupMembers (GroupID, UserID, Role, JoinDate)
      OUTPUT INSERTED.*
      VALUES (${groupId}, ${userId}, ${memberRole}, CAST(GETDATE() AS DATE))
    `;

    const member = result.recordset[0];

    // If signatory, also add to GroupSignatories
    if (memberRole === "signatory") {
      await sql.query`
        INSERT INTO GroupSignatories (GroupID, MemberID)
        VALUES (${groupId}, ${member.MemberID})
      `;
    }

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL MEMBERS OF A GROUP
exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await sql.query`
      SELECT gm.MemberID, gm.Role, gm.JoinDate, gm.IsActive,
             u.UserID, u.FirstName, u.LastName, u.Email, u.PhoneNumber
      FROM GroupMembers gm
      INNER JOIN Users u ON u.UserID = gm.UserID
      WHERE gm.GroupID = ${groupId} AND gm.IsActive = 1
      ORDER BY gm.Role, u.FirstName
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET MEMBER BALANCE (from view)
exports.getMemberBalance = async (req, res) => {
  const { groupId, memberId } = req.params;
  try {
    const result = await sql.query`
      SELECT * FROM vw_MemberBalances
      WHERE GroupID = ${groupId} AND MemberID = ${memberId}
    `;
    if (result.recordset.length === 0) return res.status(404).json({ error: "Member not found" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL MEMBER BALANCES FOR A GROUP
exports.getAllMemberBalances = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await sql.query`
      SELECT * FROM vw_MemberBalances WHERE GroupID = ${groupId}
      ORDER BY MemberName
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REMOVE MEMBER
exports.removeMember = async (req, res) => {
  const { groupId, memberId } = req.params;
  try {
    await sql.query`
      UPDATE GroupMembers SET IsActive = 0 WHERE MemberID = ${memberId} AND GroupID = ${groupId}
    `;
    res.json({ message: "Member removed from group" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
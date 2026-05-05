const { db } = require("../config/db");

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
    const userCheck = await db.query("SELECT userid FROM users WHERE userid = $1 AND isactive = true", [userId]);
    if (userCheck.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const existingMember = await db.query(
      "SELECT memberid FROM groupmembers WHERE groupid = $1 AND userid = $2",
      [groupId, userId]
    );
    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: "User is already a member of this group" });
    }

    if (memberRole === "signatory") {
      const sigCount = await db.query(
        "SELECT COUNT(*) AS cnt FROM groupmembers WHERE groupid = $1 AND role = 'signatory' AND isactive = true",
        [groupId]
      );
      if (parseInt(sigCount.rows[0].cnt) >= 2) {
        return res.status(400).json({ error: "Group already has 2 signatories" });
      }
    }

    const result = await db.query(
      `INSERT INTO groupmembers (groupid, userid, role, joindate)
       VALUES ($1, $2, $3, CURRENT_DATE) RETURNING *`,
      [groupId, userId, memberRole]
    );

    const member = result.rows[0];

    if (memberRole === "signatory") {
      await db.query(
        "INSERT INTO groupsignatories (groupid, memberid) VALUES ($1, $2)",
        [groupId, member.memberid]
      );
    }

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL MEMBERS OF A GROUP WITH BALANCE DATA
exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await db.query(
      `SELECT 
        gm.memberid, 
        gm.role, 
        gm.joindate, 
        gm.isactive,
        u.userid, 
        u.firstname, 
        u.lastname, 
        u.email, 
        u.phonenumber,
        COALESCE(mb.totalpaid, 0) AS totalpaid,
        COALESCE(mb.totalcontributions, 0) AS totalcontributions,
        COALESCE(mb.paidcontributions, 0) AS paidcontributions,
        COALESCE(mb.outstandingloans, 0) AS loanbalance,
        COALESCE(mb.totalloanstaken, 0) AS totalloanstaken
       FROM groupmembers gm
       INNER JOIN users u ON u.userid = gm.userid
       LEFT JOIN vw_member_balances mb ON mb.memberid = gm.memberid AND mb.groupid = gm.groupid
       WHERE gm.groupid = $1 AND gm.isactive = true
       ORDER BY gm.role DESC, u.firstname`,
      [groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET GROUP SIGNATORIES
exports.getGroupSignatories = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await db.query(
      `SELECT 
        gs.signatoryid,
        gm.memberid,
        u.firstname,
        u.lastname,
        u.email,
        gm.role
       FROM groupsignatories gs
       INNER JOIN groupmembers gm ON gm.memberid = gs.memberid
       INNER JOIN users u ON u.userid = gm.userid
       WHERE gs.groupid = $1 AND gs.isactive = true AND gm.isactive = true
       ORDER BY gs.assignedat`,
      [groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET MEMBER BALANCE (from view)
exports.getMemberBalance = async (req, res) => {
  const { groupId, memberId } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM vw_member_balances WHERE groupid = $1 AND memberid = $2",
      [groupId, memberId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Member not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL MEMBER BALANCES FOR A GROUP
exports.getAllMemberBalances = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM vw_member_balances WHERE groupid = $1 ORDER BY membername",
      [groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REMOVE MEMBER
exports.removeMember = async (req, res) => {
  const { groupId, memberId } = req.params;
  try {
    await db.query(
      "UPDATE groupmembers SET isactive = false WHERE memberid = $1 AND groupid = $2",
      [memberId, groupId]
    );
    res.json({ message: "Member removed from group" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const { db } = require("../config/db");

// Get year-end report for a group
exports.getYearEndReport = async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const result = await db.query(
      "SELECT * FROM vw_year_end_report WHERE groupid = $1",
      [groupId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching year-end report:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get group summary statistics
exports.getGroupSummary = async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const group = await db.query(
      "SELECT * FROM motshelogroups WHERE groupid = $1",
      [groupId]
    );
    
    if (group.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    const memberCount = await db.query(
      "SELECT COUNT(*) as count FROM groupmembers WHERE groupid = $1 AND isactive = true",
      [groupId]
    );
    
    const totalContributions = await db.query(
      "SELECT SUM(amountpaid) as total FROM monthlycontributions WHERE groupid = $1 AND status = 'paid'",
      [groupId]
    );
    
    const totalLoans = await db.query(
      "SELECT SUM(outstandingbalance) as total FROM loans WHERE groupid = $1 AND status = 'active'",
      [groupId]
    );
    
    res.json({
      success: true,
      data: {
        group: group.rows[0],
        memberCount: memberCount.rows[0].count,
        totalContributions: totalContributions.rows[0].total || 0,
        totalLoans: totalLoans.rows[0].total || 0
      }
    });
  } catch (err) {
    console.error("Error fetching group summary:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get member statement
exports.getMemberStatement = async (req, res) => {
  const { groupId, memberId } = req.params;
  
  try {
    const result = await db.query(
      "SELECT * FROM vw_member_balances WHERE groupid = $1 AND memberid = $2",
      [groupId, memberId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching member statement:", err);
    res.status(500).json({ error: err.message });
  }
};

const { db } = require("../config/db");

// YEAR-END REPORT FOR A GROUP
exports.getYearEndReport = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM vw_year_end_report WHERE groupid = $1 ORDER BY membername",
      [groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GROUP SUMMARY STATS
exports.getGroupSummary = async (req, res) => {
  const { groupId } = req.params;
  try {
    const members = await db.query(
      "SELECT COUNT(*) AS totalmembers FROM groupmembers WHERE groupid = $1 AND isactive = true",
      [groupId]
    );

    const contributions = await db.query(
      `SELECT
         SUM(CASE WHEN status = 'approved' THEN amountpaid ELSE 0 END) AS totalcollected,
         SUM(CASE WHEN status = 'pending' THEN amountdue ELSE 0 END) AS totalpending,
         COUNT(CASE WHEN status = 'submitted' THEN 1 END) AS pendingapprovals
       FROM monthlycontributions WHERE groupid = $1`,
      [groupId]
    );

    const loans = await db.query(
      `SELECT
         COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) AS pendingloans,
         COUNT(CASE WHEN status = 'disbursed' THEN 1 END) AS activeloans,
         SUM(CASE WHEN status = 'disbursed' THEN outstandingbalance ELSE 0 END) AS totaloutstanding,
         SUM(CASE WHEN status = 'settled' THEN principalamount ELSE 0 END) AS totalsettled
       FROM loans WHERE groupid = $1`,
      [groupId]
    );

    res.json({
      members: members.rows[0],
      contributions: contributions.rows[0],
      loans: loans.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MEMBER STATEMENT
exports.getMemberStatement = async (req, res) => {
  const { groupId, memberId } = req.params;
  try {
    const balance = await db.query(
      "SELECT * FROM vw_member_balances WHERE groupid = $1 AND memberid = $2",
      [groupId, memberId]
    );

    const contributions = await db.query(
      "SELECT * FROM monthlycontributions WHERE groupid = $1 AND memberid = $2 ORDER BY contributionmonth DESC",
      [groupId, memberId]
    );

    const loans = await db.query(
      `SELECT l.*, lis.interestcharged
       FROM loans l
       LEFT JOIN loaninterestschedule lis ON lis.loanid = l.loanid
       WHERE l.groupid = $1 AND l.borrowermemberid = $2
       ORDER BY l.requestedat DESC`,
      [groupId, memberId]
    );

    res.json({
      balance: balance.rows[0],
      contributions: contributions.rows,
      loans: loans.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

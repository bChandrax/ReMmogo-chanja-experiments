const { sql } = require("../config/db");

// YEAR-END REPORT FOR A GROUP
exports.getYearEndReport = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await sql.query`
      SELECT * FROM vw_YearEndReport WHERE GroupID = ${groupId}
      ORDER BY MemberName
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GROUP SUMMARY STATS
exports.getGroupSummary = async (req, res) => {
  const { groupId } = req.params;
  try {
    const members = await sql.query`
      SELECT COUNT(*) AS TotalMembers FROM GroupMembers WHERE GroupID = ${groupId} AND IsActive = 1
    `;

    const contributions = await sql.query`
      SELECT
        SUM(CASE WHEN Status = 'approved' THEN AmountPaid ELSE 0 END) AS TotalCollected,
        SUM(CASE WHEN Status = 'pending' THEN AmountDue ELSE 0 END) AS TotalPending,
        COUNT(CASE WHEN Status = 'submitted' THEN 1 END) AS PendingApprovals
      FROM MonthlyContributions WHERE GroupID = ${groupId}
    `;

    const loans = await sql.query`
      SELECT
        COUNT(CASE WHEN Status = 'pending_approval' THEN 1 END) AS PendingLoans,
        COUNT(CASE WHEN Status = 'disbursed' THEN 1 END) AS ActiveLoans,
        SUM(CASE WHEN Status = 'disbursed' THEN OutstandingBalance ELSE 0 END) AS TotalOutstanding,
        SUM(CASE WHEN Status = 'settled' THEN PrincipalAmount ELSE 0 END) AS TotalSettled
      FROM Loans WHERE GroupID = ${groupId}
    `;

    res.json({
      members: members.recordset[0],
      contributions: contributions.recordset[0],
      loans: loans.recordset[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MEMBER STATEMENT (all activity for one member)
exports.getMemberStatement = async (req, res) => {
  const { groupId, memberId } = req.params;
  try {
    const balance = await sql.query`
      SELECT * FROM vw_MemberBalances WHERE GroupID = ${groupId} AND MemberID = ${memberId}
    `;

    const contributions = await sql.query`
      SELECT * FROM MonthlyContributions
      WHERE GroupID = ${groupId} AND MemberID = ${memberId}
      ORDER BY ContributionMonth DESC
    `;

    const loans = await sql.query`
      SELECT l.*, lis.InterestCharged
      FROM Loans l
      LEFT JOIN LoanInterestSchedule lis ON lis.LoanID = l.LoanID
      WHERE l.GroupID = ${groupId} AND l.BorrowerMemberID = ${memberId}
      ORDER BY l.RequestedAt DESC
    `;

    res.json({
      balance: balance.recordset[0],
      contributions: contributions.recordset,
      loans: loans.recordset,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
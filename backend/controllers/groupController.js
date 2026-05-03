const { sql } = require("../config/db");

// CREATE GROUP
exports.createGroup = async (req, res) => {
  const { groupName, description, yearStartDate, yearEndDate, monthlyContribution, requiredInterest, loanInterestRate } = req.body;

  if (!groupName || !yearStartDate || !yearEndDate) {
    return res.status(400).json({ error: "Group name, start date and end date are required" });
  }

  try {
    const result = await sql.query`
      INSERT INTO MotsheloGroups (GroupName, Description, MonthlyContribution, RequiredInterest, LoanInterestRate, YearStartDate, YearEndDate)
      OUTPUT INSERTED.*
      VALUES (
        ${groupName},
        ${description || null},
        ${monthlyContribution || 1000.00},
        ${requiredInterest || 5000.00},
        ${loanInterestRate || 0.20},
        ${yearStartDate},
        ${yearEndDate}
      )
    `;

    const group = result.recordset[0];

    // Auto-enroll creator as admin
    await sql.query`
      INSERT INTO GroupMembers (GroupID, UserID, Role, JoinDate)
      VALUES (${group.GroupID}, ${req.user.id}, 'admin', CAST(GETDATE() AS DATE))
    `;

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL GROUPS (that the user belongs to)
exports.getMyGroups = async (req, res) => {
  try {
    const result = await sql.query`
      SELECT mg.*, gm.Role, gm.MemberID
      FROM MotsheloGroups mg
      INNER JOIN GroupMembers gm ON gm.GroupID = mg.GroupID
      WHERE gm.UserID = ${req.user.id} AND gm.IsActive = 1 AND mg.IsActive = 1
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL GROUPS (public listing)
exports.getAllGroups = async (req, res) => {
  try {
    const result = await sql.query`
      SELECT GroupID, GroupName, Description, MonthlyContribution, YearStartDate, YearEndDate, CreatedAt
      FROM MotsheloGroups WHERE IsActive = 1
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE GROUP
exports.getGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await sql.query`
      SELECT mg.*,
        (SELECT COUNT(*) FROM GroupMembers WHERE GroupID = mg.GroupID AND IsActive = 1) AS MemberCount
      FROM MotsheloGroups mg
      WHERE mg.GroupID = ${groupId} AND mg.IsActive = 1
    `;
    if (result.recordset.length === 0) return res.status(404).json({ error: "Group not found" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE GROUP
exports.updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { groupName, description } = req.body;

  try {
    // FIX 3: Only group admins can update group details
    const adminCheck = await sql.query`
      SELECT MemberID FROM GroupMembers
      WHERE GroupID = ${groupId} AND UserID = ${req.user.id}
        AND Role = 'admin' AND IsActive = 1
    `;
    if (adminCheck.recordset.length === 0) {
      return res.status(403).json({ error: "Only group admins can update group details" });
    }

    await sql.query`
      UPDATE MotsheloGroups
      SET GroupName = ${groupName}, Description = ${description}, UpdatedAt = GETDATE()
      WHERE GroupID = ${groupId}
    `;
    res.json({ message: "Group updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GENERATE MONTHLY CONTRIBUTIONS for a group
exports.generateContributions = async (req, res) => {
  const { groupId } = req.params;
  const { periodMonth } = req.body; // e.g. "2025-03-01"

  if (!periodMonth) return res.status(400).json({ error: "periodMonth is required (YYYY-MM-DD)" });

  try {
    await sql.query`EXEC sp_GenerateMonthlyContributions @GroupID = ${groupId}, @PeriodMonth = ${periodMonth}`;
    res.json({ message: `Contributions generated for ${periodMonth}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// APPLY MONTHLY LOAN INTEREST
exports.applyMonthlyInterest = async (req, res) => {
  const { groupId } = req.params;
  const { periodMonth } = req.body;

  if (!periodMonth) return res.status(400).json({ error: "periodMonth is required (YYYY-MM-DD)" });

  try {
    await sql.query`EXEC sp_ApplyMonthlyLoanInterest @GroupID = ${groupId}, @PeriodMonth = ${periodMonth}`;
    res.json({ message: `Monthly interest applied for ${periodMonth}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
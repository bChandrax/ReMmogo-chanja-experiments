const { db } = require("../config/db");

// CREATE GROUP
exports.createGroup = async (req, res) => {
  const { groupName, description, yearStartDate, yearEndDate, monthlyContribution, requiredInterest, loanInterestRate } = req.body;

  if (!groupName || !yearStartDate || !yearEndDate) {
    return res.status(400).json({ error: "Group name, start date and end date are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO motshelogroups (groupname, description, monthlycontribution, requiredinterest, loaninterestrate, yearstartdate, yearenddate)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        groupName,
        description || null,
        monthlyContribution || 1000.00,
        requiredInterest || 5000.00,
        loanInterestRate || 0.20,
        yearStartDate,
        yearEndDate,
      ]
    );

    const group = result.rows[0];

    // Auto-enroll creator as admin
    await db.query(
      `INSERT INTO groupmembers (groupid, userid, role, joindate) VALUES ($1, $2, 'admin', CURRENT_DATE)`,
      [group.groupid, req.user.id]
    );

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET GROUPS THE USER BELONGS TO
exports.getMyGroups = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT mg.*, gm.role, gm.memberid
       FROM motshelogroups mg
       INNER JOIN groupmembers gm ON gm.groupid = mg.groupid
       WHERE gm.userid = $1 AND gm.isactive = true AND mg.isactive = true`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL GROUPS (public listing)
exports.getAllGroups = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT groupid, groupname, description, monthlycontribution, yearstartdate, yearenddate, createdat
       FROM motshelogroups WHERE isactive = true`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE GROUP
exports.getGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await db.query(
      `SELECT mg.*,
         (SELECT COUNT(*) FROM groupmembers WHERE groupid = mg.groupid AND isactive = true) AS membercount
       FROM motshelogroups mg
       WHERE mg.groupid = $1 AND mg.isactive = true`,
      [groupId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Group not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE GROUP (admin only)
exports.updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { groupName, description } = req.body;

  try {
    // FIX 3: Only group admins can update group details
    const adminCheck = await db.query(
      `SELECT memberid FROM groupmembers
       WHERE groupid = $1 AND userid = $2 AND role = 'admin' AND isactive = true`,
      [groupId, req.user.id]
    );
    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ error: "Only group admins can update group details" });
    }

    await db.query(
      `UPDATE motshelogroups SET groupname = $1, description = $2, updatedat = NOW() WHERE groupid = $3`,
      [groupName, description, groupId]
    );
    res.json({ message: "Group updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GENERATE MONTHLY CONTRIBUTIONS for a group
exports.generateContributions = async (req, res) => {
  const { groupId } = req.params;
  const { periodMonth } = req.body;

  if (!periodMonth) return res.status(400).json({ error: "periodMonth is required (YYYY-MM-DD)" });

  try {
    await db.query("SELECT sp_generate_monthly_contributions($1, $2)", [groupId, periodMonth]);
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
    await db.query("SELECT sp_apply_monthly_loan_interest($1, $2)", [groupId, periodMonth]);
    res.json({ message: `Monthly interest applied for ${periodMonth}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

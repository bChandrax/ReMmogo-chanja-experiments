const { db } = require("../config/db");

// CREATE CONTRIBUTION (record payment)
exports.createContribution = async (req, res) => {
  const { groupid, contributionmonth, amountpaid, status, proofofpayment } = req.body;

  if (!groupid || !contributionmonth) {
    return res.status(400).json({ error: "groupid and contributionmonth are required" });
  }

  try {
    // Get user's member ID
    const memberCheck = await db.query(
      "SELECT memberid FROM groupmembers WHERE userid = $1 AND groupid = $2 AND isactive = true",
      [req.user.id, groupid]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const memberid = memberCheck.rows[0].memberid;

    // Check if contribution already exists for this month
    const existingCheck = await db.query(
      "SELECT contributionid, status FROM monthlycontributions WHERE groupid = $1 AND memberid = $2 AND contributionmonth = $3",
      [groupid, memberid, contributionmonth]
    );

    if (existingCheck.rows.length > 0) {
      // Update existing contribution
      await db.query(
        `UPDATE monthlycontributions 
         SET amountpaid = $1, status = $2, proofofpayment = $3, submittedat = NOW(), updatedat = NOW()
         WHERE contributionid = $4`,
        [amountpaid || 1000, status || 'submitted', proofofpayment || null, existingCheck.rows[0].contributionid]
      );
      res.json({ message: "Payment updated successfully" });
    } else {
      // Create new contribution
      await db.query(
        `INSERT INTO monthlycontributions (groupid, memberid, contributionmonth, amountdue, amountpaid, status, proofofpayment)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [groupid, memberid, contributionmonth, 1000, amountpaid || 1000, status || 'submitted', proofofpayment || null]
      );
      res.status(201).json({ message: "Payment recorded successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL CONTRIBUTIONS FOR A GROUP
exports.getGroupContributions = async (req, res) => {
  const { groupId } = req.params;
  const { month } = req.query;

  try {
    let result;
    if (month) {
      result = await db.query(
        `SELECT mc.*, u.firstname || ' ' || u.lastname AS membername
         FROM monthlycontributions mc
         INNER JOIN groupmembers gm ON gm.memberid = mc.memberid
         INNER JOIN users u ON u.userid = gm.userid
         WHERE mc.groupid = $1 AND mc.contributionmonth = $2
         ORDER BY membername`,
        [groupId, month]
      );
    } else {
      result = await db.query(
        `SELECT mc.*, u.firstname || ' ' || u.lastname AS membername
         FROM monthlycontributions mc
         INNER JOIN groupmembers gm ON gm.memberid = mc.memberid
         INNER JOIN users u ON u.userid = gm.userid
         WHERE mc.groupid = $1
         ORDER BY mc.contributionmonth DESC, membername`,
        [groupId]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MEMBER SUBMITS PAYMENT ("I have paid")
exports.submitContribution = async (req, res) => {
  const { contributionId } = req.params;
  const { amountPaid, proofOfPayment } = req.body;

  if (!amountPaid || amountPaid <= 0) {
    return res.status(400).json({ error: "Valid amount is required" });
  }

  try {
    const check = await db.query(
      `SELECT mc.contributionid, mc.status, gm.userid
       FROM monthlycontributions mc
       INNER JOIN groupmembers gm ON gm.memberid = mc.memberid
       WHERE mc.contributionid = $1`,
      [contributionId]
    );

    if (check.rows.length === 0) return res.status(404).json({ error: "Contribution not found" });
    if (check.rows[0].userid !== req.user.id) return res.status(403).json({ error: "Not your contribution" });
    if (check.rows[0].status !== "pending") return res.status(400).json({ error: "Contribution already submitted or approved" });

    await db.query(
      `UPDATE monthlycontributions
       SET amountpaid = $1, status = 'submitted', submittedat = NOW(),
           proofofpayment = $2, updatedat = NOW()
       WHERE contributionid = $3`,
      [amountPaid, proofOfPayment || null, contributionId]
    );

    res.json({ message: "Payment submitted. Awaiting signatory approval." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SIGNATORY APPROVES/REJECTS CONTRIBUTION
exports.approveContribution = async (req, res) => {
  const { contributionId } = req.params;
  const { decision, decisionNote, groupId } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Decision must be approved or rejected" });
  }

  try {
    const sigCheck = await db.query(
      `SELECT memberid FROM groupmembers
       WHERE userid = $1 AND groupid = $2 AND role IN ('signatory', 'admin') AND isactive = true`,
      [req.user.id, groupId]
    );
    if (sigCheck.rows.length === 0) return res.status(403).json({ error: "Signatory access required" });

    const signatoryMemberID = sigCheck.rows[0].memberid;

    const contribCheck = await db.query(
      "SELECT status FROM monthlycontributions WHERE contributionid = $1",
      [contributionId]
    );
    if (contribCheck.rows[0].status !== "submitted") {
      return res.status(400).json({ error: "Contribution is not in submitted state" });
    }

    // FIX 5: Prevent same signatory approving twice
    const alreadyApproved = await db.query(
      "SELECT 1 FROM contributionapprovals WHERE contributionid = $1 AND signatorymemberid = $2",
      [contributionId, signatoryMemberID]
    );
    if (alreadyApproved.rows.length > 0) {
      return res.status(400).json({ error: "You have already reviewed this contribution" });
    }

    await db.query(
      "INSERT INTO contributionapprovals (contributionid, signatorymemberid, decision, decisionnote) VALUES ($1, $2, $3, $4)",
      [contributionId, signatoryMemberID, decision, decisionNote || null]
    );

    // FIX 5: Rejection is immediate
    if (decision === "rejected") {
      await db.query(
        "UPDATE monthlycontributions SET status = 'rejected', updatedat = NOW() WHERE contributionid = $1",
        [contributionId]
      );
      return res.json({ message: "Contribution rejected" });
    }

    // FIX 5: Needs both signatories
    const approvalCount = await db.query(
      "SELECT COUNT(*) AS cnt FROM contributionapprovals WHERE contributionid = $1 AND decision = 'approved'",
      [contributionId]
    );

    if (parseInt(approvalCount.rows[0].cnt) >= 2) {
      await db.query(
        "UPDATE monthlycontributions SET status = 'approved', updatedat = NOW() WHERE contributionid = $1",
        [contributionId]
      );
      return res.json({ message: "Both signatories approved. Contribution recorded." });
    }

    res.json({ message: "Your approval recorded. Waiting for second signatory." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET MY CONTRIBUTIONS
exports.getMyContributions = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await db.query(
      `SELECT mc.*
       FROM monthlycontributions mc
       INNER JOIN groupmembers gm ON gm.memberid = mc.memberid
       WHERE gm.userid = $1 AND mc.groupid = $2
       ORDER BY mc.contributionmonth DESC`,
      [req.user.id, groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SIGNATORY UPDATES MEMBER CONTRIBUTION AMOUNT
exports.updateContributionAmount = async (req, res) => {
  const { contributionId } = req.params;
  const { amountPaid, status } = req.body;

  try {
    // Get contribution details
    const contribCheck = await db.query(
      `SELECT mc.*, gm.groupid FROM monthlycontributions mc
       INNER JOIN groupmembers gm ON gm.memberid = mc.memberid
       WHERE mc.contributionid = $1`,
      [contributionId]
    );

    if (contribCheck.rows.length === 0) {
      return res.status(404).json({ error: "Contribution not found" });
    }

    const groupId = contribCheck.rows[0].groupid;

    // Check if user is signatory of this group
    const signatoryCheck = await db.query(
      `SELECT memberid FROM groupmembers
       WHERE userid = $1 AND groupid = $2 AND role IN ('signatory', 'admin') AND isactive = true`,
      [req.user.id, groupId]
    );

    if (signatoryCheck.rows.length === 0) {
      return res.status(403).json({ error: "Only signatories can update contribution amounts" });
    }

    // Update contribution
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (amountPaid !== undefined) {
      updates.push(`amountpaid = $${paramCount}`);
      values.push(amountPaid);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    updates.push(`updatedat = NOW()`);
    values.push(contributionId);

    await db.query(
      `UPDATE monthlycontributions SET ${updates.join(', ')} WHERE contributionid = $${paramCount}`,
      values
    );

    res.json({ message: "Contribution updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

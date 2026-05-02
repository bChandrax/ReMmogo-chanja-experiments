const { sql } = require("../config/db");

// GET ALL CONTRIBUTIONS FOR A GROUP
exports.getGroupContributions = async (req, res) => {
  const { groupId } = req.params;
  const { month } = req.query; // optional filter e.g. ?month=2025-01-01

  try {
    let result;
    if (month) {
      result = await sql.query`
        SELECT mc.*, u.FirstName + ' ' + u.LastName AS MemberName
        FROM MonthlyContributions mc
        INNER JOIN GroupMembers gm ON gm.MemberID = mc.MemberID
        INNER JOIN Users u ON u.UserID = gm.UserID
        WHERE mc.GroupID = ${groupId} AND mc.ContributionMonth = ${month}
        ORDER BY MemberName
      `;
    } else {
      result = await sql.query`
        SELECT mc.*, u.FirstName + ' ' + u.LastName AS MemberName
        FROM MonthlyContributions mc
        INNER JOIN GroupMembers gm ON gm.MemberID = mc.MemberID
        INNER JOIN Users u ON u.UserID = gm.UserID
        WHERE mc.GroupID = ${groupId}
        ORDER BY mc.ContributionMonth DESC, MemberName
      `;
    }
    res.json(result.recordset);
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
    // Verify this contribution belongs to the current user
    const check = await sql.query`
      SELECT mc.ContributionID, mc.Status, gm.UserID
      FROM MonthlyContributions mc
      INNER JOIN GroupMembers gm ON gm.MemberID = mc.MemberID
      WHERE mc.ContributionID = ${contributionId}
    `;

    if (check.recordset.length === 0) return res.status(404).json({ error: "Contribution not found" });
    if (check.recordset[0].UserID !== req.user.id) return res.status(403).json({ error: "Not your contribution" });
    if (check.recordset[0].Status !== "pending") return res.status(400).json({ error: "Contribution already submitted or approved" });

    await sql.query`
      UPDATE MonthlyContributions
      SET AmountPaid = ${amountPaid},
          Status = 'submitted',
          SubmittedAt = GETDATE(),
          ProofOfPayment = ${proofOfPayment || null},
          UpdatedAt = GETDATE()
      WHERE ContributionID = ${contributionId}
    `;

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
    // Get signatory's MemberID
    const sigCheck = await sql.query`
      SELECT MemberID FROM GroupMembers
      WHERE UserID = ${req.user.id} AND GroupID = ${groupId}
        AND Role IN ('signatory', 'admin') AND IsActive = 1
    `;
    if (sigCheck.recordset.length === 0) return res.status(403).json({ error: "Signatory access required" });

    const signatoryMemberID = sigCheck.recordset[0].MemberID;

    // Check contribution status
    const contribCheck = await sql.query`
      SELECT Status FROM MonthlyContributions WHERE ContributionID = ${contributionId}
    `;
    if (contribCheck.recordset[0].Status !== "submitted") {
      return res.status(400).json({ error: "Contribution is not in submitted state" });
    }

    // Record approval
    await sql.query`
      INSERT INTO ContributionApprovals (ContributionID, SignatoryMemberID, Decision, DecisionNote)
      VALUES (${contributionId}, ${signatoryMemberID}, ${decision}, ${decisionNote || null})
    `;

    // Update contribution status
    await sql.query`
      UPDATE MonthlyContributions
      SET Status = ${decision}, UpdatedAt = GETDATE()
      WHERE ContributionID = ${contributionId}
    `;

    res.json({ message: `Contribution ${decision} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET MY CONTRIBUTIONS
exports.getMyContributions = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await sql.query`
      SELECT mc.*
      FROM MonthlyContributions mc
      INNER JOIN GroupMembers gm ON gm.MemberID = mc.MemberID
      WHERE gm.UserID = ${req.user.id} AND mc.GroupID = ${groupId}
      ORDER BY mc.ContributionMonth DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
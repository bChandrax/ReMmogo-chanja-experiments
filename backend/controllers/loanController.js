const { sql } = require("../config/db");

// REQUEST A LOAN
exports.requestLoan = async (req, res) => {
  const { groupId, principalAmount, notes } = req.body;

  if (!groupId || !principalAmount || principalAmount <= 0) {
    return res.status(400).json({ error: "groupId and valid principalAmount are required" });
  }

  try {
    // Get borrower's MemberID
    const memberCheck = await sql.query`
      SELECT MemberID FROM GroupMembers
      WHERE UserID = ${req.user.id} AND GroupID = ${groupId} AND IsActive = 1
    `;
    if (memberCheck.recordset.length === 0) return res.status(403).json({ error: "You are not a member of this group" });

    const borrowerMemberID = memberCheck.recordset[0].MemberID;

    // Get group interest rate
    const groupCheck = await sql.query`
      SELECT LoanInterestRate FROM MotsheloGroups WHERE GroupID = ${groupId}
    `;
    const interestRate = groupCheck.recordset[0].LoanInterestRate;

    const result = await sql.query`
      INSERT INTO Loans (GroupID, BorrowerMemberID, PrincipalAmount, InterestRate, OutstandingBalance, Notes)
      OUTPUT INSERTED.*
      VALUES (${groupId}, ${borrowerMemberID}, ${principalAmount}, ${interestRate}, ${principalAmount}, ${notes || null})
    `;

    res.status(201).json({ message: "Loan request submitted. Awaiting signatory approval.", loan: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL LOANS FOR A GROUP
exports.getGroupLoans = async (req, res) => {
  const { groupId } = req.params;
  const { status } = req.query;

  try {
    let result;
    if (status) {
      result = await sql.query`
        SELECT l.*, u.FirstName + ' ' + u.LastName AS BorrowerName
        FROM Loans l
        INNER JOIN GroupMembers gm ON gm.MemberID = l.BorrowerMemberID
        INNER JOIN Users u ON u.UserID = gm.UserID
        WHERE l.GroupID = ${groupId} AND l.Status = ${status}
        ORDER BY l.RequestedAt DESC
      `;
    } else {
      result = await sql.query`
        SELECT l.*, u.FirstName + ' ' + u.LastName AS BorrowerName
        FROM Loans l
        INNER JOIN GroupMembers gm ON gm.MemberID = l.BorrowerMemberID
        INNER JOIN Users u ON u.UserID = gm.UserID
        WHERE l.GroupID = ${groupId}
        ORDER BY l.RequestedAt DESC
      `;
    }
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET MY LOANS
exports.getMyLoans = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await sql.query`
      SELECT l.*
      FROM Loans l
      INNER JOIN GroupMembers gm ON gm.MemberID = l.BorrowerMemberID
      WHERE gm.UserID = ${req.user.id} AND l.GroupID = ${groupId}
      ORDER BY l.RequestedAt DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SIGNATORY APPROVES/REJECTS LOAN
exports.approveLoan = async (req, res) => {
  const { loanId } = req.params;
  const { decision, decisionNote, groupId } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Decision must be approved or rejected" });
  }

  try {
    // Verify signatory
    const sigCheck = await sql.query`
      SELECT MemberID FROM GroupMembers
      WHERE UserID = ${req.user.id} AND GroupID = ${groupId}
        AND Role IN ('signatory', 'admin') AND IsActive = 1
    `;
    if (sigCheck.recordset.length === 0) return res.status(403).json({ error: "Signatory access required" });

    const signatoryMemberID = sigCheck.recordset[0].MemberID;

    // Check loan status
    const loanCheck = await sql.query`SELECT Status FROM Loans WHERE LoanID = ${loanId}`;
    if (!["pending_approval", "approved"].includes(loanCheck.recordset[0].Status)) {
      return res.status(400).json({ error: "Loan is not pending approval" });
    }

    // Record decision
    await sql.query`
      INSERT INTO LoanApprovals (LoanID, SignatoryMemberID, Decision, DecisionNote)
      VALUES (${loanId}, ${signatoryMemberID}, ${decision}, ${decisionNote || null})
    `;

    if (decision === "rejected") {
      await sql.query`UPDATE Loans SET Status = 'rejected', UpdatedAt = GETDATE() WHERE LoanID = ${loanId}`;
      return res.json({ message: "Loan rejected" });
    }

    // Check if both signatories approved
    const approvalCount = await sql.query`
      SELECT COUNT(*) AS cnt FROM LoanApprovals WHERE LoanID = ${loanId} AND Decision = 'approved'
    `;

    if (approvalCount.recordset[0].cnt >= 2) {
      await sql.query`
        UPDATE Loans SET Status = 'disbursed', DisbursedAt = GETDATE(), UpdatedAt = GETDATE()
        WHERE LoanID = ${loanId}
      `;
      return res.json({ message: "Both signatories approved. Loan disbursed!" });
    }

    await sql.query`UPDATE Loans SET Status = 'approved', UpdatedAt = GETDATE() WHERE LoanID = ${loanId}`;
    res.json({ message: "Your approval recorded. Waiting for second signatory." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MEMBER SUBMITS REPAYMENT
exports.submitRepayment = async (req, res) => {
  const { loanId } = req.params;
  const { amountPaid, proofOfPayment } = req.body;

  if (!amountPaid || amountPaid <= 0) {
    return res.status(400).json({ error: "Valid amount is required" });
  }

  try {
    // Verify loan belongs to current user
    const loanCheck = await sql.query`
      SELECT l.LoanID, l.Status, gm.UserID
      FROM Loans l
      INNER JOIN GroupMembers gm ON gm.MemberID = l.BorrowerMemberID
      WHERE l.LoanID = ${loanId}
    `;
    if (loanCheck.recordset.length === 0) return res.status(404).json({ error: "Loan not found" });
    if (loanCheck.recordset[0].UserID !== req.user.id) return res.status(403).json({ error: "Not your loan" });
    if (loanCheck.recordset[0].Status !== "disbursed") return res.status(400).json({ error: "Loan is not disbursed" });

    // Get MemberID
    const memberCheck = await sql.query`
      SELECT gm.MemberID FROM GroupMembers gm
      INNER JOIN Loans l ON l.BorrowerMemberID = gm.MemberID
      WHERE l.LoanID = ${loanId}
    `;

    const result = await sql.query`
      INSERT INTO LoanRepayments (LoanID, MemberID, AmountPaid, ProofOfPayment)
      OUTPUT INSERTED.*
      VALUES (${loanId}, ${memberCheck.recordset[0].MemberID}, ${amountPaid}, ${proofOfPayment || null})
    `;

    res.status(201).json({ message: "Repayment submitted. Awaiting signatory approval.", repayment: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SIGNATORY APPROVES REPAYMENT
exports.approveRepayment = async (req, res) => {
  const { repaymentId } = req.params;
  const { decision, decisionNote, groupId } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Decision must be approved or rejected" });
  }

  try {
    // Verify signatory
    const sigCheck = await sql.query`
      SELECT MemberID FROM GroupMembers
      WHERE UserID = ${req.user.id} AND GroupID = ${groupId}
        AND Role IN ('signatory', 'admin') AND IsActive = 1
    `;
    if (sigCheck.recordset.length === 0) return res.status(403).json({ error: "Signatory access required" });

    const signatoryMemberID = sigCheck.recordset[0].MemberID;

    await sql.query`
      EXEC sp_ApproveRepayment
        @RepaymentID = ${repaymentId},
        @SignatoryMemberID = ${signatoryMemberID},
        @Decision = ${decision},
        @DecisionNote = ${decisionNote || null}
    `;

    res.json({ message: `Repayment ${decision}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET LOAN INTEREST SCHEDULE
exports.getLoanInterest = async (req, res) => {
  const { loanId } = req.params;
  try {
    const result = await sql.query`
      SELECT * FROM LoanInterestSchedule WHERE LoanID = ${loanId} ORDER BY PeriodMonth
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
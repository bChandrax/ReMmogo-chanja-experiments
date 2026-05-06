const express = require("express");
const router = express.Router();
const { requestLoan, getGroupLoans, getMyLoans, approveLoan, submitRepayment, approveRepayment, getLoanInterest } = require("../controllers/loanController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, requestLoan);
router.post("/request", protect, requestLoan);
router.get("/:groupId", protect, getGroupLoans);
router.get("/:groupId/mine", protect, getMyLoans);
router.put("/:loanId/approve", protect, approveLoan);
router.post("/:loanId/repay", protect, submitRepayment);
router.put("/repayments/:repaymentId/approve", protect, approveRepayment);
router.get("/:loanId/interest", protect, getLoanInterest);

module.exports = router;
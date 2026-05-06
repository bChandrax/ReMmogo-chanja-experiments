const express = require("express");
const router = express.Router();
const { getGroupContributions, submitContribution, approveContribution, getMyContributions, updateContributionAmount, createContribution } = require("../controllers/contributionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createContribution);
router.get("/:groupId", protect, getGroupContributions);
router.get("/:groupId/mine", protect, getMyContributions);
router.put("/:contributionId/submit", protect, submitContribution);
router.put("/:contributionId/approve", protect, approveContribution);
router.put("/:contributionId", protect, updateContributionAmount);

module.exports = router;
const express = require("express");
const router = express.Router();
const { getGroupContributions, submitContribution, approveContribution, getMyContributions } = require("../controllers/contributionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:groupId", protect, getGroupContributions);
router.get("/:groupId/mine", protect, getMyContributions);
router.put("/:contributionId/submit", protect, submitContribution);
router.put("/:contributionId/approve", protect, approveContribution);

module.exports = router;
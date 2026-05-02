const express = require("express");
const router = express.Router();
const { getYearEndReport, getGroupSummary, getMemberStatement } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:groupId/year-end", protect, getYearEndReport);
router.get("/:groupId/summary", protect, getGroupSummary);
router.get("/:groupId/member/:memberId", protect, getMemberStatement);

module.exports = router;
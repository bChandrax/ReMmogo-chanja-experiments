const express = require("express");
const router = express.Router();
const { createGroup, getMyGroups, getAllGroups, getGroup, updateGroup, generateContributions, applyMonthlyInterest, deleteGroup } = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllGroups);
router.get("/mine", protect, getMyGroups);
router.post("/", protect, createGroup);
router.get("/:groupId", protect, getGroup);
router.put("/:groupId", protect, updateGroup);
router.delete("/:groupId", protect, deleteGroup);
router.post("/:groupId/generate-contributions", protect, generateContributions);
router.post("/:groupId/apply-interest", protect, applyMonthlyInterest);

module.exports = router;
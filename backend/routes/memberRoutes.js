const express = require("express");
const router = express.Router();
const { enrollMember, getGroupMembers, getMemberBalance, getAllMemberBalances, removeMember } = require("../controllers/memberController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:groupId/enroll", protect, enrollMember);
router.get("/:groupId", protect, getGroupMembers);
router.get("/:groupId/balances/all", protect, getAllMemberBalances);
router.get("/:groupId/balances/:memberId", protect, getMemberBalance);
router.delete("/:groupId/:memberId", protect, removeMember);

module.exports = router;
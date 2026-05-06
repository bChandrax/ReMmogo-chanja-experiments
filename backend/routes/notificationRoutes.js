const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getPendingMembershipRequests,
  approveMembershipRequest,
  rejectMembershipRequest
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Notification endpoints
router.get("/", getNotifications);
router.get("/unread", getUnreadCount);
router.post("/mark-all-read", markAllAsRead);
router.post("/:notificationId/read", markAsRead);

// Membership request endpoints (for signatories)
router.get("/membership-requests/:groupId", getPendingMembershipRequests);
router.post("/membership-requests/:requestId/approve", approveMembershipRequest);
router.post("/membership-requests/:requestId/reject", rejectMembershipRequest);

module.exports = router;

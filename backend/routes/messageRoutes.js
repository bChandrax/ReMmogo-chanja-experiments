const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markAsRead,
  createConversation,
  getUnreadCount,
  deleteMessage,
  getOrCreateGroupConversation
} = require("../controllers/messageController");

// All routes require authentication
router.use(protect);

// Get all conversations for user
router.get("/", getUserConversations);

// Get unread count
router.get("/unread", getUnreadCount);

// Create new conversation
router.post("/", createConversation);

// Get or create group conversation
router.post("/group/:groupId", getOrCreateGroupConversation);

// Conversation-specific routes
router.get("/:conversationId/messages", getConversationMessages);
router.post("/:conversationId/messages", sendMessage);
router.post("/:conversationId/read", markAsRead);

// Message-specific routes
router.delete("/messages/:messageId", deleteMessage);

module.exports = router;

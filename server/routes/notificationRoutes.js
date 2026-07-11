const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

// Get user notifications (Protected)
router.get("/", authMiddleware, getNotifications);

// Mark notification as read (Protected)
router.put("/:id/read", authMiddleware, markAsRead);

module.exports = router;

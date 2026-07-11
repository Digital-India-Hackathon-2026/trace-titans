const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  readNotification,
} = require("../controllers/claimController");

// Protect all notification routes using JWT middleware
router.use(authMiddleware);

// GET /api/notifications - Returns notifications for logged-in user ordered by newest first
router.get("/", getNotifications);

// PUT /api/notifications/:id/read - Marks notification as read
router.put("/:id/read", readNotification);

module.exports = router;

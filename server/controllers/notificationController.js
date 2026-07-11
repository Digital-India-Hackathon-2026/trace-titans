const Notification = require("../models/Notification");
const { saveDb } = require("../config/localDb");

// Helper to check and init in-memory database arrays
const initInMemory = () => {
  global.inMemoryNotifications = global.inMemoryNotifications || [];
};

// Get notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    if (global.useInMemoryDB) {
      initInMemory();
      const notifications = [...global.inMemoryNotifications]
        .filter(n => n.user === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json(notifications);
    }

    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    if (global.useInMemoryDB) {
      initInMemory();
      const notification = global.inMemoryNotifications.find(n => n._id === notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      if (notification.user !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to modify this notification" });
      }

      notification.isRead = true;
      notification.updatedAt = new Date();
      saveDb();

      return res.status(200).json({ message: "Notification marked as read (In-Memory)", notification });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to modify this notification" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read.",
      notification,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

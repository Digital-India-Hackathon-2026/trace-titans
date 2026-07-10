const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  reportLostItem,
  reportFoundItem,
  getAllItems,
  getItemById,
  searchMatches
} = require("../controllers/itemController");

// Report Lost Item (Protected)
router.post("/lost", authMiddleware, reportLostItem);

// Report Found Item (Protected)
router.post("/found", authMiddleware, reportFoundItem);

// Search matches (Protected)
router.post("/search-matches", authMiddleware, searchMatches);

// Get User Items (Protected)
router.get("/", authMiddleware, getAllItems);

// Get Item By ID (Public)
router.get("/:id", getItemById);

module.exports = router;
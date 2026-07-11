const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createClaim,
  getMyReceivedClaims,
  getMySentClaims,
  acceptClaim,
  rejectClaim,
} = require("../controllers/claimController");

// Create claim (Protected)
router.post("/", authMiddleware, createClaim);

// Get received claims (Protected)
router.get("/my-received", authMiddleware, getMyReceivedClaims);

// Get sent claims (Protected)
router.get("/my-sent", authMiddleware, getMySentClaims);

// Accept claim (Protected)
router.put("/:id/accept", authMiddleware, acceptClaim);

// Reject claim (Protected)
router.put("/:id/reject", authMiddleware, rejectClaim);

module.exports = router;

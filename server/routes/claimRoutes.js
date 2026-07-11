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

// Protect all claims routes using JWT middleware
router.use(authMiddleware);

// POST /api/claims - Create a new claim
router.post("/", createClaim);

// GET /api/claims/my-received - Returns all claims where the logged-in user is the finder
router.get("/my-received", getMyReceivedClaims);

// GET /api/claims/my-sent - Returns all claims initiated by the logged-in user
router.get("/my-sent", getMySentClaims);

// PUT /api/claims/:id/accept - Updates claim status to Accepted and marks notification as read
router.put("/:id/accept", acceptClaim);

// PUT /api/claims/:id/reject - Updates claim status to Rejected and marks notification as read
router.put("/:id/reject", rejectClaim);

module.exports = router;

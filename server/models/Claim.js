const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    finder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
      required: true,
    },
  },
  {
    timestamps: true, // This automatically handles createdAt and updatedAt
  }
);

// Prevent duplicate claims for the same lost & found item pair
claimSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });

module.exports = mongoose.model("Claim", claimSchema);

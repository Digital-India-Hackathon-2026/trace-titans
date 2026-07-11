const Claim = require("../models/Claim");
const Notification = require("../models/Notification");
const Item = require("../models/Item");
const User = require("../models/User");
const { saveDb } = require("../config/localDb");

// Helper to check and init in-memory database arrays
const initInMemory = () => {
  global.inMemoryClaims = global.inMemoryClaims || [];
  global.inMemoryNotifications = global.inMemoryNotifications || [];
  global.inMemoryItems = global.inMemoryItems || [];
  global.inMemoryUsers = global.inMemoryUsers || [];
};

// Create Claim
exports.createClaim = async (req, res) => {
  try {
    const { lostItemId, foundItemId } = req.body;

    if (!lostItemId || !foundItemId) {
      return res.status(400).json({ message: "Both lostItemId and foundItemId are required" });
    }

    if (global.useInMemoryDB) {
      initInMemory();

      // Find items
      const lostItem = global.inMemoryItems.find(i => i._id === lostItemId);
      const foundItem = global.inMemoryItems.find(i => i._id === foundItemId);

      if (!lostItem) {
        return res.status(404).json({ message: "Lost item not found" });
      }
      if (!foundItem) {
        return res.status(404).json({ message: "Found item not found" });
      }

      // Verify claimant owns lostItem
      if (lostItem.user !== req.user.id) {
        return res.status(403).json({ message: "You must own the lost item to make a claim" });
      }

      // Finder is the owner of foundItem
      const finderId = foundItem.user;
      if (finderId === req.user.id) {
        return res.status(400).json({ message: "You cannot claim your own found item" });
      }

      // Check for duplicate claims
      const duplicate = global.inMemoryClaims.find(
        c => c.lostItem === lostItemId && c.foundItem === foundItemId
      );
      if (duplicate) {
        return res.status(400).json({ message: "A claim request has already been initiated for these items" });
      }

      // Create claim
      const claim = {
        _id: Date.now().toString(),
        claimant: req.user.id,
        finder: finderId,
        lostItem: lostItemId,
        foundItem: foundItemId,
        status: "Pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      global.inMemoryClaims.push(claim);

      // Create notification for finder
      const claimantUser = global.inMemoryUsers.find(u => u._id === req.user.id);
      const claimantName = claimantUser ? claimantUser.name : "A user";
      const notification = {
        _id: (Date.now() + 1).toString(),
        user: finderId,
        title: "New Claim Request",
        message: `${claimantName} believes the found ${foundItem.title} belongs to them.`,
        type: "claim",
        claimId: claim._id,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      global.inMemoryNotifications.push(notification);
      saveDb();

      return res.status(201).json({
        message: "Claim request has been sent successfully. (In-Memory)",
        claim,
      });
    }

    // MongoDB Implementation
    const lostItem = await Item.findById(lostItemId);
    const foundItem = await Item.findById(foundItemId);

    if (!lostItem) {
      return res.status(404).json({ message: "Lost item not found" });
    }
    if (!foundItem) {
      return res.status(404).json({ message: "Found item not found" });
    }

    // Verify claimant owns lostItem
    if (lostItem.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You must own the lost item to make a claim" });
    }

    // Finder is the owner of foundItem
    const finderId = foundItem.user;
    if (finderId.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot claim your own found item" });
    }

    // Check for duplicate claims
    const duplicate = await Claim.findOne({ lostItem: lostItemId, foundItem: foundItemId });
    if (duplicate) {
      return res.status(400).json({ message: "A claim request has already been initiated for these items" });
    }

    // Create claim
    const claim = new Claim({
      claimant: req.user.id,
      finder: finderId,
      lostItem: lostItemId,
      foundItem: foundItemId,
      status: "Pending",
    });
    await claim.save();

    // Fetch claimant name for notification
    const claimantUser = await User.findById(req.user.id);
    const claimantName = claimantUser ? claimantUser.name : "A user";

    // Create notification for finder
    const notification = new Notification({
      user: finderId,
      title: "New Claim Request",
      message: `${claimantName} believes the found ${foundItem.title} belongs to them.`,
      type: "claim",
      claimId: claim._id,
      isRead: false,
    });
    await notification.save();

    res.status(201).json({
      message: "Claim request has been sent successfully.",
      claim,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Received Claims (where user is finder)
exports.getMyReceivedClaims = async (req, res) => {
  try {
    if (global.useInMemoryDB) {
      initInMemory();
      const claims = global.inMemoryClaims
        .filter(c => c.finder === req.user.id)
        .map(c => {
          const lostItem = global.inMemoryItems.find(i => i._id === c.lostItem);
          const foundItem = global.inMemoryItems.find(i => i._id === c.foundItem);
          const claimant = global.inMemoryUsers.find(u => u._id === c.claimant);
          return {
            ...c,
            lostItem,
            foundItem,
            claimant: claimant ? { _id: claimant._id, name: claimant.name, email: claimant.email } : null,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json(claims);
    }

    const claims = await Claim.find({ finder: req.user.id })
      .populate("lostItem")
      .populate("foundItem")
      .populate("claimant", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(claims);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Sent Claims (where user is claimant)
exports.getMySentClaims = async (req, res) => {
  try {
    if (global.useInMemoryDB) {
      initInMemory();
      const claims = global.inMemoryClaims
        .filter(c => c.claimant === req.user.id)
        .map(c => {
          const lostItem = global.inMemoryItems.find(i => i._id === c.lostItem);
          const foundItem = global.inMemoryItems.find(i => i._id === c.foundItem);
          const finder = global.inMemoryUsers.find(u => u._id === c.finder);
          return {
            ...c,
            lostItem,
            foundItem,
            finder: finder ? { _id: finder._id, name: finder.name, email: finder.email } : null,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json(claims);
    }

    const claims = await Claim.find({ claimant: req.user.id })
      .populate("lostItem")
      .populate("foundItem")
      .populate("finder", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(claims);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Accept Claim
exports.acceptClaim = async (req, res) => {
  try {
    const claimId = req.params.id;

    if (global.useInMemoryDB) {
      initInMemory();
      const claim = global.inMemoryClaims.find(c => c._id === claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      if (claim.finder !== req.user.id) {
        return res.status(403).json({ message: "Only the finder can accept this claim" });
      }

      claim.status = "Accepted";
      claim.updatedAt = new Date();

      // Mark notification as read
      global.inMemoryNotifications.forEach(n => {
        if (n.claimId === claimId && n.user === req.user.id) {
          n.isRead = true;
          n.updatedAt = new Date();
        }
      });
      saveDb();

      return res.status(200).json({ message: "Claim accepted successfully (In-Memory)", claim });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claim.finder.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the finder can accept this claim" });
    }

    claim.status = "Accepted";
    await claim.save();

    // Mark associated notifications for the finder as read
    await Notification.updateMany(
      { claimId: claim._id, user: req.user.id },
      { isRead: true }
    );

    res.status(200).json({
      message: "Claim accepted successfully.",
      claim,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Reject Claim
exports.rejectClaim = async (req, res) => {
  try {
    const claimId = req.params.id;

    if (global.useInMemoryDB) {
      initInMemory();
      const claim = global.inMemoryClaims.find(c => c._id === claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      if (claim.finder !== req.user.id) {
        return res.status(403).json({ message: "Only the finder can reject this claim" });
      }

      claim.status = "Rejected";
      claim.updatedAt = new Date();

      // Mark notification as read
      global.inMemoryNotifications.forEach(n => {
        if (n.claimId === claimId && n.user === req.user.id) {
          n.isRead = true;
          n.updatedAt = new Date();
        }
      });
      saveDb();

      return res.status(200).json({ message: "Claim rejected successfully (In-Memory)", claim });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claim.finder.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the finder can reject this claim" });
    }

    claim.status = "Rejected";
    await claim.save();

    // Mark associated notifications for the finder as read
    await Notification.updateMany(
      { claimId: claim._id, user: req.user.id },
      { isRead: true }
    );

    res.status(200).json({
      message: "Claim rejected successfully.",
      claim,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

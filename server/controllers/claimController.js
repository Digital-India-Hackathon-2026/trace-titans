const Claim = require("../models/Claim");
const Notification = require("../models/Notification");
const Item = require("../models/Item");
const User = require("../models/User");

// Create a new claim
exports.createClaim = async (req, res) => {
  try {
    const { foundItem: foundItemId } = req.body;
    let { lostItem: lostItemId } = req.body;

    if (!foundItemId) {
      return res.status(400).json({ message: "foundItem is required" });
    }

    if (global.useInMemoryDB) {
      if (!global.inMemoryClaims) global.inMemoryClaims = [];
      if (!global.inMemoryNotifications) global.inMemoryNotifications = [];

      // 1. Fetch foundItem
      const foundItem = global.inMemoryItems.find(i => i._id === foundItemId);
      if (!foundItem) {
        return res.status(404).json({ message: "Found item not found" });
      }

      // 2. Fetch or resolve lostItem
      let lostItem;
      if (lostItemId) {
        lostItem = global.inMemoryItems.find(i => i._id === lostItemId);
      } else {
        // Resolve best match lost item owned by the current user
        const userLostItems = global.inMemoryItems.filter(i => i.user === req.user.id && i.status === "Lost");
        if (userLostItems.length === 0) {
          return res.status(400).json({ message: "You must report a lost item before making a claim." });
        }
        lostItem = userLostItems.find(i => i.category === foundItem.category) || userLostItems[0];
      }

      if (!lostItem) {
        return res.status(404).json({ message: "Lost item not found" });
      }

      // 3. Verifications
      if (lostItem.user !== req.user.id) {
        return res.status(403).json({ message: "You do not own this lost item" });
      }
      if (foundItem.user === req.user.id) {
        return res.status(400).json({ message: "You cannot claim your own found item" });
      }

      const finderId = foundItem.user;

      // Check duplicates
      const existing = global.inMemoryClaims.find(
        c => c.lostItem === lostItem._id && c.foundItem === foundItem._id
      );
      if (existing) {
        return res.status(400).json({ message: "Claim already exists for these items" });
      }

      // Create Claim
      const claim = {
        _id: Date.now().toString(),
        claimant: req.user.id,
        finder: finderId,
        lostItem: lostItem._id,
        foundItem: foundItem._id,
        status: "Pending",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.inMemoryClaims.push(claim);

      // Create Notification for Finder
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
        updatedAt: new Date()
      };
      global.inMemoryNotifications.push(notification);

      return res.status(201).json({
        message: "Claim request has been sent successfully.",
        claim
      });
    }

    // --- MONGODB MODE ---
    // 1. Fetch foundItem
    const foundItem = await Item.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({ message: "Found item not found" });
    }

    // 2. Fetch or resolve lostItem
    let lostItem;
    if (lostItemId) {
      lostItem = await Item.findById(lostItemId);
    } else {
      const userLostItems = await Item.find({ user: req.user.id, status: "Lost" });
      if (userLostItems.length === 0) {
        return res.status(400).json({ message: "You must report a lost item before making a claim." });
      }
      lostItem = userLostItems.find(i => i.category === foundItem.category) || userLostItems[0];
    }

    if (!lostItem) {
      return res.status(404).json({ message: "Lost item not found" });
    }

    // 3. Verifications
    if (lostItem.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You do not own this lost item" });
    }
    if (foundItem.user.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot claim your own found item" });
    }

    const finderId = foundItem.user;

    // Check duplicates
    const existing = await Claim.findOne({
      lostItem: lostItem._id,
      foundItem: foundItem._id
    });
    if (existing) {
      return res.status(400).json({ message: "Claim already exists for these items" });
    }

    // Create Claim
    const claim = new Claim({
      claimant: req.user.id,
      finder: finderId,
      lostItem: lostItem._id,
      foundItem: foundItem._id,
      status: "Pending"
    });
    await claim.save();

    // Create Notification for Finder
    const claimantUser = await User.findById(req.user.id);
    const claimantName = claimantUser ? claimantUser.name : "A user";

    const notification = new Notification({
      user: finderId,
      title: "New Claim Request",
      message: `${claimantName} believes the found ${foundItem.title} belongs to them.`,
      type: "claim",
      claimId: claim._id
    });
    await notification.save();

    return res.status(201).json({
      message: "Claim request has been sent successfully.",
      claim
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get claims received where the logged-in user is the finder
exports.getMyReceivedClaims = async (req, res) => {
  try {
    if (global.useInMemoryDB) {
      if (!global.inMemoryClaims) global.inMemoryClaims = [];
      const claims = global.inMemoryClaims
        .filter(c => c.finder === req.user.id)
        .map(c => {
          const claimantUser = global.inMemoryUsers.find(u => u._id === c.claimant);
          const lostItem = global.inMemoryItems.find(i => i._id === c.lostItem);
          const foundItem = global.inMemoryItems.find(i => i._id === c.foundItem);
          return {
            ...c,
            claimant: claimantUser ? { _id: claimantUser._id, name: claimantUser.name, email: claimantUser.email } : null,
            lostItem,
            foundItem
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(claims);
    }

    const claims = await Claim.find({ finder: req.user.id })
      .populate("claimant", "name email")
      .populate("lostItem")
      .populate("foundItem")
      .sort({ createdAt: -1 });

    return res.status(200).json(claims);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get claims initiated by the logged-in user
exports.getMySentClaims = async (req, res) => {
  try {
    if (global.useInMemoryDB) {
      if (!global.inMemoryClaims) global.inMemoryClaims = [];
      const claims = global.inMemoryClaims
        .filter(c => c.claimant === req.user.id)
        .map(c => {
          const finderUser = global.inMemoryUsers.find(u => u._id === c.finder);
          const lostItem = global.inMemoryItems.find(i => i._id === c.lostItem);
          const foundItem = global.inMemoryItems.find(i => i._id === c.foundItem);
          return {
            ...c,
            finder: finderUser ? { _id: finderUser._id, name: finderUser.name, email: finderUser.email } : null,
            lostItem,
            foundItem
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(claims);
    }

    const claims = await Claim.find({ claimant: req.user.id })
      .populate("finder", "name email")
      .populate("lostItem")
      .populate("foundItem")
      .sort({ createdAt: -1 });

    return res.status(200).json(claims);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Accept a claim
exports.acceptClaim = async (req, res) => {
  try {
    const claimId = req.params.id;

    if (global.useInMemoryDB) {
      if (!global.inMemoryClaims) global.inMemoryClaims = [];
      if (!global.inMemoryNotifications) global.inMemoryNotifications = [];

      const claim = global.inMemoryClaims.find(c => c._id === claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      if (claim.finder !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to accept this claim" });
      }

      claim.status = "Accepted";
      claim.updatedAt = new Date();

      // Mark notification as read
      global.inMemoryNotifications.forEach(n => {
        if (n.claimId === claim._id && n.user === req.user.id) {
          n.isRead = true;
          n.updatedAt = new Date();
        }
      });

      return res.status(200).json({ message: "Claim accepted successfully", claim });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claim.finder.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this claim" });
    }

    claim.status = "Accepted";
    await claim.save();

    // Mark notification as read
    await Notification.updateMany({ claimId: claim._id, user: req.user.id }, { isRead: true });

    return res.status(200).json({ message: "Claim accepted successfully", claim });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Reject a claim
exports.rejectClaim = async (req, res) => {
  try {
    const claimId = req.params.id;

    if (global.useInMemoryDB) {
      if (!global.inMemoryClaims) global.inMemoryClaims = [];
      if (!global.inMemoryNotifications) global.inMemoryNotifications = [];

      const claim = global.inMemoryClaims.find(c => c._id === claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      if (claim.finder !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to reject this claim" });
      }

      claim.status = "Rejected";
      claim.updatedAt = new Date();

      // Mark notification as read
      global.inMemoryNotifications.forEach(n => {
        if (n.claimId === claim._id && n.user === req.user.id) {
          n.isRead = true;
          n.updatedAt = new Date();
        }
      });

      return res.status(200).json({ message: "Claim rejected successfully", claim });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claim.finder.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to reject this claim" });
    }

    claim.status = "Rejected";
    await claim.save();

    // Mark notification as read
    await Notification.updateMany({ claimId: claim._id, user: req.user.id }, { isRead: true });

    return res.status(200).json({ message: "Claim rejected successfully", claim });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    if (global.useInMemoryDB) {
      if (!global.inMemoryNotifications) global.inMemoryNotifications = [];
      const notifications = global.inMemoryNotifications
        .filter(n => n.user === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(notifications);
    }

    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Mark notification as read
exports.readNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    if (global.useInMemoryDB) {
      if (!global.inMemoryNotifications) global.inMemoryNotifications = [];
      const notification = global.inMemoryNotifications.find(n => n._id === notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      if (notification.user !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to edit this notification" });
      }

      notification.isRead = true;
      notification.updatedAt = new Date();

      return res.status(200).json({ message: "Notification marked as read", notification });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to edit this notification" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

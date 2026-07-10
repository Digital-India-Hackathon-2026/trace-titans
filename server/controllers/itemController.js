const Item = require("../models/Item");

// Report Lost Item
exports.reportLostItem = async (req, res) => {
  try {

    if (global.useInMemoryDB) {
      const item = {
        _id: Date.now().toString(),
        ...req.body,
        status: "Lost",
        user: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.inMemoryItems.push(item);
      return res.status(201).json({
        message: "Lost item reported successfully (In-Memory)",
        item,
      });
    }

    const item = new Item({
      ...req.body,
      status: "Lost",
      user: req.user.id,
    });

    await item.save();

    res.status(201).json({
      message: "Lost item reported successfully",
      item,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Report Found Item
exports.reportFoundItem = async (req, res) => {
  try {

    if (global.useInMemoryDB) {
      const item = {
        _id: Date.now().toString(),
        ...req.body,
        status: "Found",
        user: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.inMemoryItems.push(item);
      return res.status(201).json({
        message: "Found item reported successfully (In-Memory)",
        item,
      });
    }

    const item = new Item({
      ...req.body,
      status: "Found",
      user: req.user.id,
    });

    await item.save();

    res.status(201).json({
      message: "Found item reported successfully",
      item,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get All Items
exports.getAllItems = async (req, res) => {
  try {

    if (global.useInMemoryDB) {
      const sorted = [...global.inMemoryItems]
        .filter(item => item.user === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(sorted);
    }

    const items = await Item.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json(items);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Item By ID
exports.getItemById = async (req, res) => {
  try {

    if (global.useInMemoryDB) {
      const item = global.inMemoryItems.find(i => i._id === req.params.id);
      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }
      return res.status(200).json(item);
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.status(200).json(item);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Search Matches for an item
exports.searchMatches = async (req, res) => {
  try {
    const { queryText, status } = req.body;

    if (!queryText) {
      return res.status(400).json({ message: "queryText is required" });
    }

    // Determine target status: if search is for "Lost" item, match against "Found" items, and vice versa
    const targetStatus = status === "Lost" ? "Found" : "Lost";

    let items;
    if (global.useInMemoryDB) {
      items = global.inMemoryItems.filter(i => i.status === targetStatus);
    } else {
      items = await Item.find({ status: targetStatus });
    }

    const STOP_WORDS = new Set([
      "the", "and", "a", "of", "to", "is", "in", "that", "it", "he", "was",
      "for", "on", "are", "as", "with", "his", "they", "i", "at", "be",
      "this", "have", "from", "or", "one", "had", "by", "word", "but",
      "not", "what", "all", "were", "we", "when", "your", "can", "said",
      "there", "use", "an", "each", "which", "she", "do", "how", "their",
      "if", "about", "near", "lost", "found", "my", "your", "me", "him", "her"
    ]);

    const tokenize = (text) => {
      if (!text) return [];
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    };

    const queryTokens = tokenize(queryText);

    if (queryTokens.length === 0) {
      // If no valid tokens, return empty matches
      return res.status(200).json([]);
    }

    const matches = items.map(item => {
      const title = item.title || "";
      const description = item.description || "";
      const location = item.location || "";
      const category = item.category || "";

      const itemTokens = tokenize(`${title} ${description} ${location} ${category}`);
      const itemTokenSet = new Set(itemTokens);

      let matchCount = 0;
      queryTokens.forEach(token => {
        if (itemTokenSet.has(token)) {
          matchCount += 1;
        } else {
          for (const itemToken of itemTokenSet) {
            if (itemToken.includes(token) || token.includes(itemToken)) {
              matchCount += 0.5;
              break;
            }
          }
        }
      });

      // Calculate confidence score
      let score = (matchCount / queryTokens.length) * 100;
      
      // Boost score if categories are an exact match
      const queryLower = queryText.toLowerCase();
      if (category && (queryLower.includes(category.toLowerCase()) || category.toLowerCase().includes(queryLower))) {
        score += 15;
      }

      score = Math.round(score);
      score = Math.max(10, Math.min(98, score)); // Keep score between 10% and 98% for realistic AI matching

      return {
        ...(item._doc || item),
        score
      };
    })
    .filter(match => match.score > 20) // Only return matches with score > 20%
    .sort((a, b) => b.score - a.score);

    res.status(200).json(matches);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
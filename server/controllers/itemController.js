const Item = require("../models/Item");

// Report Lost Item
exports.reportLostItem = async (req, res) => {
  try {

    const item = new Item({
      ...req.body,
      status: "Lost",
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

    const item = new Item({
      ...req.body,
      status: "Found",
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

    const items = await Item.find().sort({ createdAt: -1 });

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
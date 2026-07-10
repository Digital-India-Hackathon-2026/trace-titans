const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Disable buffering so queries fail fast if not connected
    mongoose.set("bufferCommands", false);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });

    console.log("✅ MongoDB Connected Successfully");
    global.useInMemoryDB = false;
  } catch (error) {
    console.warn("⚠️ MongoDB Connection Failed. Falling back to In-Memory DB Mode for demo/testing.");
    console.warn(error.message);
    
    global.useInMemoryDB = true;
    global.inMemoryUsers = [];
    global.inMemoryItems = [];
  }
};

module.exports = connectDB;
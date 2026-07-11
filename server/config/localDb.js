const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "../in_memory_db.json");

const loadDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      global.inMemoryUsers = data.users || [];
      global.inMemoryItems = data.items || [];
      global.inMemoryClaims = data.claims || [];
      global.inMemoryNotifications = data.notifications || [];
      console.log("📂 Loaded persistent in-memory database from file successfully.");
    } else {
      global.inMemoryUsers = [];
      global.inMemoryItems = [];
      global.inMemoryClaims = [];
      global.inMemoryNotifications = [];
    }
  } catch (error) {
    console.error("❌ Failed to load local in-memory database file:", error.message);
    global.inMemoryUsers = [];
    global.inMemoryItems = [];
    global.inMemoryClaims = [];
    global.inMemoryNotifications = [];
  }
};

const saveDb = () => {
  try {
    const data = {
      users: global.inMemoryUsers || [],
      items: global.inMemoryItems || [],
      claims: global.inMemoryClaims || [],
      notifications: global.inMemoryNotifications || [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("❌ Failed to save local in-memory database file:", error.message);
  }
};

module.exports = {
  loadDb,
  saveDb
};

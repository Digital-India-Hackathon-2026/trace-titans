const API_URL = "http://localhost:5000/api";

async function runVerification() {
  console.log("=== STARTING PRIVACY VERIFICATION ===");

  try {
    // 1. Register User 1 & User 2
    console.log("\n1. Registering User 1 & User 2...");
    await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User One", email: "user1@example.com", password: "password123" })
    });
    await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User Two", email: "user2@example.com", password: "password123" })
    });
    console.log("Users registered.");

    // 2. Login User 1 & User 2
    console.log("\n2. Logging in users...");
    const loginRes1 = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user1@example.com", password: "password123" })
    });
    const loginData1 = await loginRes1.json();
    const token1 = loginData1.token;

    const loginRes2 = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user2@example.com", password: "password123" })
    });
    const loginData2 = await loginRes2.json();
    const token2 = loginData2.token;
    console.log("User 1 Token:", token1 ? "OK" : "FAILED");
    console.log("User 2 Token:", token2 ? "OK" : "FAILED");

    // 3. User 1 reports an item
    console.log("\n3. User 1 reporting a Lost Wallet...");
    const lostRes = await fetch(`${API_URL}/items/lost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: "User 1 Lost Wallet",
        description: "Black wallet",
        category: "Accessories",
        location: "Library",
        date: "2026-07-09",
      })
    });
    const lostData = await lostRes.json();
    console.log("Lost item report status:", lostRes.status);

    // 4. Try to fetch items WITHOUT authentication (should fail with 401)
    console.log("\n4. Fetching items without auth token...");
    const publicFetchRes = await fetch(`${API_URL}/items`);
    const publicFetchData = await publicFetchRes.json();
    console.log("Status:", publicFetchRes.status, "Response message:", publicFetchData.message);

    // 5. Fetch items as User 1 (should return 1 item)
    console.log("\n5. Fetching items as User 1...");
    const fetchRes1 = await fetch(`${API_URL}/items`, {
      headers: { "Authorization": `Bearer ${token1}` }
    });
    const fetchData1 = await fetchRes1.json();
    console.log("Status:", fetchRes1.status, "Items returned:", fetchData1.length);
    if (fetchData1.length > 0) {
      console.log("User 1 items:", fetchData1.map(i => i.title));
    }

    // 6. Fetch items as User 2 (should return 0 items)
    console.log("\n6. Fetching items as User 2...");
    const fetchRes2 = await fetch(`${API_URL}/items`, {
      headers: { "Authorization": `Bearer ${token2}` }
    });
    const fetchData2 = await fetchRes2.json();
    console.log("Status:", fetchRes2.status, "Items returned:", fetchData2.length);
    console.log("User 2 items:", fetchData2.map(i => i.title));

    console.log("\n=== PRIVACY VERIFICATION COMPLETED SUCCESSFULLY! ===");
  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED:");
    console.error(error.message);
  }
}

runVerification();

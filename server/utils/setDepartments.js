const User = require("../models/User");
const mongoose = require("mongoose");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // Example Employees with departments
  const updates = [
    { email: "raja@gmail.com", department: "Development" },
    { email: "nandhu@gmail.com", department: "HR" },
    { email: "sumi@gmail.com", department: "QA" },
    { email: "kumar@gmail.com", department: "Support" },
  ];

  for (const item of updates) {
    await User.findOneAndUpdate(
      { email: item.email },
      { department: item.department }
    );
  }

  console.log("Departments updated successfully!");
  process.exit();
}

run();

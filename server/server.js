// server/server.js (or index.js, whichever you use to start)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

/* ------------ MIDDLEWARE ------------ */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

/* ------------ DATABASE ------------ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

/* ------------ ROUTES ------------ */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/manager", require("./routes/managerRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

/* ------------ ROOT TEST ------------ */
app.get("/", (req, res) => {
  res.send("Employee Attendance System API Running 🚀");
});

/* ------------ START SERVER ------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

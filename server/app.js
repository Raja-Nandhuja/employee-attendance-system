const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();

/* -------------------- MIDDLEWARES -------------------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet()); // Adds security headers
app.use(morgan("dev")); // Logs API requests

// Rate limiter for brute-force prevention
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/* -------------------- MONGODB CONNECTION -------------------- */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 MongoDB connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}
connectDB();

/* -------------------- API ROUTES -------------------- */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/manager", require("./routes/managerRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

/* -------------------- ROOT TEST ROUTE -------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Employee Attendance System Backend Running 🚀",
    status: "OK",
    time: new Date(),
  });
});

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route Not Found" });
});

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on: http://localhost:${PORT}`);
});

/* -------------------- GRACEFUL SHUTDOWN -------------------- */
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

function shutdown(signal) {
  console.log(`\n🛑 ${signal} detected. Closing server...`);
  server.close(() => {
    console.log("📦 Server closed. Goodbye!");
    process.exit(0);
  });
}

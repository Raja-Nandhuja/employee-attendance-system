const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getHistory,
  getSummary,
  getAnalyticsData
} = require("../controllers/attendanceController");

router.post("/checkin", protect, checkIn);
router.post("/checkout", protect, checkOut);

router.post("/break/start", protect, startBreak);
router.post("/break/end", protect, endBreak);

router.get("/history", protect, getHistory);
router.get("/summary", protect, getSummary);
router.get("/analytics", protect, getAnalyticsData);

module.exports = router;

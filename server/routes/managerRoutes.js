const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");

const {
  getTodayOverview,
  getTeamSummary,
  exportTodayCsv, // <-- added
} = require("../controllers/managerController");

router.get(
  "/today",
  protect,
  requireRole(["manager", "admin", "hr"]),
  getTodayOverview
);

router.get(
  "/summary",
  protect,
  requireRole(["manager", "admin", "hr"]),
  getTeamSummary
);

// ================== EXPORT CSV ROUTE ==================
router.get(
  "/export/csv",
  protect,
  requireRole(["manager", "admin", "hr"]),
  exportTodayCsv
);

module.exports = router;

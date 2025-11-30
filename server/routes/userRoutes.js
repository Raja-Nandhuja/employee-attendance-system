const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getUserStats } = require("../controllers/userController");

// GET user statistics
router.get("/stats", protect, getUserStats);

module.exports = router;

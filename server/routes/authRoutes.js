const express = require("express");
const router = express.Router();

const {
  register,
  loginUser,
  verifyMagicLink
} = require("../controllers/authController");

// AUTH ROUTES
router.post("/register", register);
router.post("/login", loginUser);
router.post("/verify-magic", verifyMagicLink);

module.exports = router;

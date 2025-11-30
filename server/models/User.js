const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // can be null for pure magic-link users
  role: { type: String, enum: ["employee", "manager", "admin", "hr"], default: "employee" },
  employeeId: { type: String, unique: true, sparse: true },
  department: {
  type: String,
  enum: ["Development", "Design", "HR", "Finance", "Support", "QA", "Sales"],
  default: "Development",
},


  // for magic link login
  magicLinkToken: { type: String },
  magicLinkExpiresAt: { type: Date },

  // gamification / stats
  onTimeStreak: { type: Number, default: 0 },
  bestOnTimeStreak: { type: Number, default: 0 },
  totalPresentDays: { type: Number, default: 0 },
  totalLateDays: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

// Hash password if modified
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", UserSchema);

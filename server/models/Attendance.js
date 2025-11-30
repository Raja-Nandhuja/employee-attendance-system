const mongoose = require("mongoose");

const BreakSchema = new mongoose.Schema({
  startTime: { type: Date },
  endTime: { type: Date }
}, { _id: false });

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true }, // store at 00:00 UTC for that day
  checkInTime: { type: Date },
  checkOutTime: { type: Date },

  status: {
    type: String,
    enum: ["present", "absent", "late", "half-day"],
    default: "absent"
  },

  totalHours: { type: Number, default: 0 },        // in hours
  breaks: [BreakSchema],
  notes: { type: String },

  // geofencing info
  checkInLocation: {
    lat: Number,
    lng: Number
  },
  checkOutLocation: {
    lat: Number,
    lng: Number
  },

  createdAt: { type: Date, default: Date.now }
});

// Unique per user per date
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);

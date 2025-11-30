const Attendance = require("../models/Attendance");
const User = require("../models/User");

// DEMO OFFICE LOCATION
const OFFICE_LAT = 9.99727368641802;
const OFFICE_LNG = 77.45770896724405;
const OFFICE_RADIUS_METERS = 50000; // 50km demo radius

// Convert Date to Midnight
function toStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Calculate distance
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lat2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinOffice(lat, lng) {
  if (!lat || !lng) return false;
  return haversineDistance(lat, lng, OFFICE_LAT, OFFICE_LNG) <= OFFICE_RADIUS_METERS;
}

/*------------------------------------------------------------------
  CHECK-IN
------------------------------------------------------------------*/
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const { lat, lng, notes } = req.body;

    if (!lat || !lng)
      return res.status(400).json({ error: "Location is required for check-in" });

    if (!isWithinOffice(lat, lng))
      return res.status(400).json({ error: "You are outside office geofence ❌" });

    const today = toStartOfDay(new Date());
    const now = new Date();

    let attendance = await Attendance.findOne({ userId, date: today });
    if (attendance)
      return res.status(400).json({ error: "Already checked in today" });

    const nineAM = new Date(today);
    nineAM.setHours(9, 0, 0, 0);

    const status = now > nineAM ? "late" : "present";

    attendance = await Attendance.create({
      userId,
      date: today,
      checkInTime: now,
      status,
      checkInLocation: { lat, lng },
      notes
    });

    const user = await User.findById(userId);

    if (status === "present") {
      user.onTimeStreak += 1;
      user.bestOnTimeStreak = Math.max(user.bestOnTimeStreak, user.onTimeStreak);
    } else {
      user.onTimeStreak = 0;
      user.totalLateDays += 1;
    }

    user.totalPresentDays += 1;
    await user.save();

    res.json({
      message: `Checked In Successfully 🎉 (${status === "late" ? "Late" : "On Time"})`,
      attendance
    });

  } catch (err) {
    console.error("CHECK-IN ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

/*------------------------------------------------------------------
  CHECK-OUT
------------------------------------------------------------------*/
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const { lat, lng, notes } = req.body;
    const today = toStartOfDay(new Date());

    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) return res.status(400).json({ error: "Check-In required first" });
    if (attendance.checkOutTime) return res.status(400).json({ error: "Already checked out today" });

    const now = new Date();
    attendance.checkOutTime = now;
    attendance.notes = notes || attendance.notes;
    attendance.checkOutLocation = { lat, lng };

    const diffHours = Math.max(0, (now - attendance.checkInTime) / 1000 / 60 / 60);
    attendance.totalHours = parseFloat(diffHours.toFixed(2));

    await attendance.save();

    res.json({ message: "Checked Out Successfully 🏁", attendance });
  } catch (err) {
    console.error("CHECK-OUT ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

/*------------------------------------------------------------------
  BREAK START
------------------------------------------------------------------*/
exports.startBreak = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = toStartOfDay();
    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) return res.status(400).json({ error: "Check in first" });

    attendance.breaks.push({ startTime: new Date() });
    await attendance.save();

    res.json({ message: "Break Started ☕", attendance });
  } catch (err) {
    console.error("BREAK START ERROR:", err);
    res.status(500).json({ error: "Break Start Error" });
  }
};

/*------------------------------------------------------------------
  BREAK END
------------------------------------------------------------------*/
exports.endBreak = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = toStartOfDay();
    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) return res.status(400).json({ error: "Check in first" });

    const active = attendance.breaks.find((b) => b.startTime && !b.endTime);
    if (!active) return res.status(400).json({ error: "No active break" });

    active.endTime = new Date();
    await attendance.save();

    res.json({ message: "Break Ended 🚀", attendance });
  } catch (err) {
    console.error("BREAK END ERROR:", err);
    res.status(500).json({ error: "Break End Error" });
  }
};

/*------------------------------------------------------------------
  GET HISTORY
------------------------------------------------------------------*/
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const records = await Attendance.find({ userId }).sort({ date: -1 });

    res.json({ records });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/*------------------------------------------------------------------
  GET SUMMARY
------------------------------------------------------------------*/
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const records = await Attendance.find({ userId });

    const summary = {
      present: records.filter(x => x.status === "present").length,
      late: records.filter(x => x.status === "late").length,
      absent: records.filter(x => x.status === "absent").length,
      halfDay: records.filter(x => x.status === "half-day").length,
      totalHours: records.reduce((sum, x) => sum + (x.totalHours || 0), 0)
    };

    res.json(summary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/*------------------------------------------------------------------
  GET TIMELINE
------------------------------------------------------------------*/
exports.getTimeline = async (req, res) => {
  try {
    const userId = req.user._id;

    const records = await Attendance.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    let timeline = [];

    records.forEach((record) => {
      const dateDisplay = new Date(record.date).toDateString();

      if (record.checkInTime) {
        timeline.push({
          icon: "🟢",
          type: "Check-In",
          date: dateDisplay,
          time: record.checkInTime,
          notes: record.notes || "No notes",
          status: record.status
        });
      }

      record.breaks?.forEach((b) => {
        if (b.startTime) {
          timeline.push({ icon: "☕", type: "Break Start", date: dateDisplay, time: b.startTime });
        }
        if (b.endTime) {
          timeline.push({ icon: "🚀", type: "Break End", date: dateDisplay, time: b.endTime });
        }
      });

      if (record.checkOutTime) {
        timeline.push({
          icon: "🏁",
          type: "Check-Out",
          date: dateDisplay,
          time: record.checkOutTime,
          hours: record.totalHours
        });
      }
    });

    timeline.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, timeline });

  } catch (err) {
    console.error("TIMELINE ERROR:", err);
    res.status(500).json({ success: false, error: "Cannot fetch timeline" });
  }
};

/*------------------------------------------------------------------
  ANALYTICS DASHBOARD DATA
------------------------------------------------------------------*/
exports.getAnalyticsData = async (req, res) => {
  try {
    const userId = req.user._id;

    const records = await Attendance.find({ userId });

    const present = records.filter(r => r.status === "present").length;
    const late = records.filter(r => r.status === "late").length;
    const absent = records.filter(r => r.status === "absent").length;

    const weekHours = {};
    records.forEach(r => {
      const week = new Date(r.date).getWeek();
      weekHours[week] = (weekHours[week] || 0) + (r.totalHours || 0);
    });

    const monthlyHours = {};
    records.forEach(r => {
      const month = new Date(r.date).getMonth() + 1;
      monthlyHours[month] = (monthlyHours[month] || 0) + (r.totalHours || 0);
    });

    res.json({
      success: true,
      pie: { present, late, absent },
      weekly: weekHours,
      monthly: monthlyHours,
    });

  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ success: false, error: "Cannot load analytics data" });
  }
};

// Helper to get week number
Date.prototype.getWeek = function () {
  const oneJan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
};
/*------------------------------------------------------------------
  ANALYTICS DASHBOARD DATA
------------------------------------------------------------------*/
exports.getAnalyticsData = async (req, res) => {
  try {
    const userId = req.user._id;
    const records = await Attendance.find({ userId });

    const summary = {
      present: records.filter(r => r.status === "present").length,
      absent: records.filter(r => r.status === "absent").length,
      late: records.filter(r => r.status === "late").length,
      halfDay: records.filter(r => r.status === "half-day").length
    };

    // WEEKLY HOURS (last 7 days)
    const weeklyHours = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const hours = records
        .filter(x => new Date(x.date).toDateString() === d.toDateString())
        .reduce((sum, x) => sum + (x.totalHours || 0), 0);

      weeklyHours.push({
        week: d.toLocaleDateString("en-IN", { weekday: "short" }),
        hours
      });
    }

    // MONTHLY TREND (group by month name)
    const monthlyMap = {};
    records.forEach(r => {
      const month = new Date(r.date).toLocaleString("default", { month: "short" });
      monthlyMap[month] = (monthlyMap[month] || 0) + (r.totalHours || 0);
    });

    const monthlyTrend = Object.entries(monthlyMap).map(([month, hours]) => ({
      month,
      hours,
    }));

    // Dummy leaderboard (mock best performers)
    const leaderboard = await User.find().select("name totalHours").limit(5);

    res.json({
      success: true,
      summary,
      weeklyHours,
      monthlyTrend,
      leaderboard,
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ success: false, error: "Cannot fetch analytics data" });
  }
};

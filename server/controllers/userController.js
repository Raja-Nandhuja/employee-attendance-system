const User = require("../models/User");
const Attendance = require("../models/Attendance"); // to calculate stats from records

// GET USER STATS (Enhanced)
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Base user fields
    const user = await User.findById(userId).select(
      "name department role onTimeStreak bestOnTimeStreak totalPresentDays totalLateDays"
    );

    // Attendance aggregation
    const attendance = await Attendance.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$userId",
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          halfday: { $sum: { $cond: [{ $eq: ["$status", "half-day"] }, 1, 0] } },
          totalHours: { $sum: "$totalHours" },
          recordCount: { $sum: 1 },
        },
      },
    ]);

    const stats = attendance[0] || {
      present: 0,
      late: 0,
      absent: 0,
      halfday: 0,
      totalHours: 0,
      recordCount: 0,
    };

    const averageHours =
      stats.recordCount > 0 ? (stats.totalHours / stats.recordCount).toFixed(1) : 0;

    const attendancePercent =
      stats.recordCount > 0
        ? (((stats.present + stats.halfday * 0.5) / stats.recordCount) * 100).toFixed(1)
        : 0;

    res.json({
      success: true,
      user: {
        name: user.name,
        department: user.department,
        role: user.role,
      },
      streaks: {
        onTimeStreak: user.onTimeStreak || 0,
        bestOnTimeStreak: user.bestOnTimeStreak || 0,
      },
      stats: {
        present: stats.present,
        late: stats.late,
        absent: stats.absent,
        halfday: stats.halfday,
        totalHours: stats.totalHours.toFixed(1),
        averageHours,
        attendancePercent,
      },
    });
  } catch (err) {
    console.error("GetUserStats Error:", err);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
};

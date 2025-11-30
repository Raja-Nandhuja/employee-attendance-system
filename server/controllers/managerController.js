const Attendance = require("../models/Attendance");
const User = require("../models/User");

// ===================== TODAY OVERVIEW =====================
exports.getTodayOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await Attendance.find({ date: today })
      .populate("userId", "name department role");

    const present = records.filter(r => ["present", "late", "half-day"].includes(r.status)).length;
    const late = records.filter(r => r.status === "late").length;
    const absent = records.filter(r => r.status === "absent").length;

    res.json({
      stats: { present, late, absent, total: records.length },
      records
    });
  } catch (err) {
    console.error("Today Overview Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ===================== TEAM SUMMARY =====================
exports.getTeamSummary = async (req, res) => {
  try {
    const records = await Attendance.aggregate([
      {
        $group: {
          _id: "$userId",
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          totalHours: { $sum: "$totalHours" }
        }
      }
    ]);

    const populated = await User.populate(records, {
      path: "_id",
      select: "name department role"
    });

    res.json({ summary: populated });
  } catch (err) {
    console.error("Team Summary Error:", err);
    res.status(500).json({ error: "Cannot fetch summary" });
  }
};

// ===================== EXPORT CSV =====================
exports.exportTodayCsv = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await Attendance.find({ date: today })
      .populate("userId", "name department");

    let csv = "Name,Department,Status,Check In,Check Out,Total Hours\n";

    csv += records
      .map(r => {
        const name = r.userId?.name || "";
        const dep = r.userId?.department || "";
        const status = r.status || "";
        const checkIn = r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "";
        const checkOut = r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "";
        const hours = r.totalHours != null ? r.totalHours.toFixed(2) : "";

        return `"${name}","${dep}","${status}","${checkIn}","${checkOut}","${hours}"`;
      })
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`
    );

    return res.status(200).send(csv);
  } catch (err) {
    console.error("Export CSV Error:", err);
    res.status(500).json({ error: "CSV export failed" });
  }
};

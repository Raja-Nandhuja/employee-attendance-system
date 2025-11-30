import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { motion } from "framer-motion";

function getDayKey(dateStr) {
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

function statusColor(status) {
  switch (status) {
    case "present": return "bg-green-500 text-white";
    case "late": return "bg-yellow-400 text-black";
    case "half-day": return "bg-orange-400 text-white";
    case "absent": return "bg-red-500 text-white";
    default: return "bg-gray-200 dark:bg-gray-600 text-black dark:text-white";
  }
}

export default function AttendanceHistory() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    (async () => {
      const [hRes, sRes] = await Promise.all([
        api.get("/attendance/history", { params: { month } }),
        api.get("/attendance/summary", { params: { month } })
      ]);
      setRecords(hRes.data.records || []);
      setSummary(sRes.data);
      setSelected(null);
    })();
  }, [month]);

  const byDay = {};
  records.forEach((r) => (byDay[getDayKey(r.date)] = r));

  const d = new Date(month + "-01");
  const y = d.getFullYear();
  const m = d.getMonth();
  const firstIndex = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstIndex; i++) cells.push(null);
  for (let day = 1; day <= days; day++) {
    const obj = new Date(y, m, day);
    const k = getDayKey(obj);
    cells.push({ day, record: byDay[k], date: obj });
  }

  const today = new Date().getDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto mt-10 grid gap-6 md:grid-cols-3"
    >
      {/* CALENDAR */}
      <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">📅 Attendance Calendar</h2>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="border px-2 py-1 rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
        </div>

        <div className="grid grid-cols-7 text-xs font-medium mb-1">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs">
          {cells.map((c, i) =>
            !c ? (
              <div key={i}></div>
            ) : (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelected(c.record || c)}
                className={`h-12 rounded-lg flex items-center justify-center border text-sm transition-all 
                  ${
                    selected?.day === c.day
                      ? "ring-4 ring-blue-500 bg-blue-600 text-white shadow-lg"
                      : c.record
                      ? statusColor(c.record.status)
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }
                  ${today === c.day && month === `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`
                      ? "ring-2 ring-yellow-400 font-bold"
                      : ""}`}
                title={c.record ? `${c.record.status.toUpperCase()}` : "No data"}
              >
                {c.day}
              </motion.button>
            )
          )}
        </div>

        {/* LEGEND */}
        <div className="flex gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div>Present</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div>Absent</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded"></div>Late</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400 rounded"></div>Half-day</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 border border-black dark:border-white rounded"></div>No Record</span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
        <h3 className="font-semibold mb-2">📍 Details</h3>
        {selected ? (
          <>
            <p><b>Date:</b> {new Date(selected.date).toDateString()}</p>
            {selected?.status && <p><b>Status:</b> {selected.status}</p>}
            {selected?.checkInTime && <p><b>Check In:</b> {new Date(selected.checkInTime).toLocaleTimeString()}</p>}
            {selected?.checkOutTime && <p><b>Check Out:</b> {new Date(selected.checkOutTime).toLocaleTimeString()}</p>}
            {selected?.totalHours && <p><b>Hours:</b> {selected.totalHours}</p>}
          </>
        ) : (
          <p className="text-gray-500 text-sm">Click a date to see details.</p>
        )}

        <hr className="my-3 border-gray-300 dark:border-gray-700" />

        <h3 className="font-semibold mb-1">📦 Monthly Summary</h3>
        {summary ? (
          <div className="text-sm space-y-1">
            <p>Present: {summary.present}</p>
            <p>Late: {summary.late}</p>
            <p>Absent: {summary.absent}</p>
            <p>Half-day: {summary.halfDay}</p>
            <p>Total hours: {summary.totalHours}</p>
          </div>
        ) : <p className="text-gray-500">Loading...</p>}
      </div>
    </motion.div>
  );
}

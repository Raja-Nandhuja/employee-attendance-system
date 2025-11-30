import { useEffect, useState } from "react";
import { api } from "../../utils/api";

export default function TeamAttendance() {
  const [today, setToday] = useState(null);
  const [summary, setSummary] = useState([]);
  const [range, setRange] = useState({
    from: "",
    to: ""
  });

  useEffect(() => {
    (async () => {
      const res = await api.get("/manager/today");
      setToday(res.data);
    })();
  }, []);

  const loadSummary = async () => {
    const res = await api.get("/manager/summary", { params: range });
    setSummary(res.data.summary || []);
  };

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setRange((r) => ({ ...r, to: todayStr }));
  }, []);

  // --- NEW FUNCTION: Calculate Stats for Cards ---
  const calculateStats = () => {
    if (!summary.length) return {
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
      hours: 0,
    };

    return summary.reduce(
      (acc, s) => {
        acc.total += 1;
        acc.present += s.present;
        acc.late += s.late;
        acc.absent += s.absent;
        acc.hours += s.totalHours;
        return acc;
      },
      { total: 0, present: 0, late: 0, absent: 0, hours: 0 }
    );
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6 max-w-5xl mx-auto mt-8">
      
      {/* ---------------- TODAY SECTION ---------------- */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Today's Attendance</h2>
        {today ? (
          <>
            <p className="text-sm mb-3">
              Present: {today.stats.present} • Late: {today.stats.late} • Absent: {today.stats.absent}
            </p>
            <div className="overflow-x-auto text-sm">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-1 pr-4">Name</th>
                    <th className="text-left py-1 pr-4">Dept</th>
                    <th className="text-left py-1 pr-4">Status</th>
                    <th className="text-left py-1 pr-4">Check-in</th>
                    <th className="text-left py-1 pr-4">Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {today.records.map((r) => (
                    <tr key={r._id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-1 pr-4">{r.userId.name}</td>
                      <td className="py-1 pr-4">{r.userId.department || "-"}</td>
                      <td className="py-1 pr-4 capitalize">{r.status}</td>
                      <td className="py-1 pr-4">
                        {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "-"}
                      </td>
                      <td className="py-1 pr-4">{r.totalHours || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}
      </section>

      {/* ---------------- TEAM SUMMARY SECTION ---------------- */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Team Summary</h2>
          <div className="flex items-center space-x-2 text-sm">
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              className="border px-2 py-1 rounded dark:bg-gray-900 dark:border-gray-700"
            />
            <span>-</span>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="border px-2 py-1 rounded dark:bg-gray-900 dark:border-gray-700"
            />
            <button
              onClick={loadSummary}
              className="px-3 py-1 rounded bg-blue-600 text-white"
            >
              Apply
            </button>
          </div>
        </div>

        {/* ---------- NEW STATS CARDS UI ---------- */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-300">Employees</p>
            <h3 className="text-lg font-bold">{stats.total}</h3>
          </div>
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-700 text-center">
            <p className="text-xs">Present</p>
            <h3 className="text-lg font-bold">{stats.present}</h3>
          </div>
          <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-700 text-center">
            <p className="text-xs">Late</p>
            <h3 className="text-lg font-bold">{stats.late}</h3>
          </div>
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-700 text-center">
            <p className="text-xs">Absent</p>
            <h3 className="text-lg font-bold">{stats.absent}</h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-700 text-center">
            <p className="text-xs">Total Hours</p>
            <h3 className="text-lg font-bold">{stats.hours.toFixed(1)}</h3>
          </div>
        </div>

        {/* ---------- TABLE OR PLACEHOLDER ---------- */}
        {summary.length > 0 ? (
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-1 pr-4">Name</th>
                  <th className="text-left py-1 pr-4">Dept</th>
                  <th className="text-left py-1 pr-4">Present</th>
                  <th className="text-left py-1 pr-4">Late</th>
                  <th className="text-left py-1 pr-4">Absent</th>
                  <th className="text-left py-1 pr-4">Hours</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s) => (
                  <tr key={s._id._id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-1 pr-4">{s._id.name}</td>
                    <td className="py-1 pr-4">{s._id.department || "-"}</td>
                    <td className="py-1 pr-4">{s.present}</td>
                    <td className="py-1 pr-4">{s.late}</td>
                    <td className="py-1 pr-4">{s.absent}</td>
                    <td className="py-1 pr-4">{s.totalHours.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500">
            <p className="mb-2 font-medium">No summary loaded yet.</p>
            <p className="text-xs opacity-70">Select a date range and click Apply to generate summary</p>
          </div>
        )}
      </section>
    </div>
  );
}

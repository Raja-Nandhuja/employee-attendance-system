import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function Reports() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const sumRes = await api.get(`/attendance/summary?month=${month}`);
      const histRes = await api.get(`/attendance/history?month=${month}`);

      setSummary(sumRes.data);
      setRecords(histRes.data.records);
    } catch (err) {
      console.error("Report Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [month]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">📊 Attendance Reports</h1>

      <label className="font-semibold text-lg">
        Select Month:
        <input
          type="month"
          className="ml-3 p-2 rounded text-black"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </label>

      {loading && <p className="mt-4">Loading reports...</p>}

      {summary && (
        <div className="mt-6 p-4 bg-gray-800 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>Present: <b>{summary.present}</b></div>
            <div>Absent: <b>{summary.absent}</b></div>
            <div>Late: <b>{summary.late}</b></div>
            <div>Half-day: <b>{summary.halfDay}</b></div>
            <div className="col-span-2 mt-2">
              Total Hours: <b>{summary.totalHours}</b>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-3">Daily History</h2>
      <table className="w-full text-left bg-gray-900 rounded-xl overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Status</th>
            <th className="p-3">Check In</th>
            <th className="p-3">Check Out</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id} className="border-b border-gray-700">
              <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
              <td className="p-3">{r.status}</td>
              <td className="p-3">{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "-"}</td>
              <td className="p-3">{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { motion } from "framer-motion";
import { Download, Search, Edit3 } from "lucide-react";
import axios from "axios";

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingDeptId, setSavingDeptId] = useState(null);

  const loadData = async () => {
    try {
      const res = await api.get("/manager/today");
      setStats(res.data.stats);
      setRecords(res.data.records);
    } catch (error) {
      console.log("Manager Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ------------------ EXPORT CSV ------------------
  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/manager/export/csv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV Export Error:", err?.response || err);
      alert("⚠ Unable to export CSV. Please try again.");
    }
  };

  // ------------------ UPDATE DEPARTMENT ------------------
  const handleUpdateDepartment = async (userId, currentDept) => {
    const dept = prompt(
      "Enter department for this employee:",
      currentDept || ""
    );
    if (dept === null) return; // cancelled
    if (!dept.trim()) {
      alert("Department cannot be empty.");
      return;
    }

    try {
      setSavingDeptId(userId);
      await api.put(`/users/${userId}/department`, {
        department: dept.trim(),
      });
      await loadData(); // refresh table
    } catch (err) {
      console.error("Update department error:", err?.response || err);
      alert("⚠ Failed to update department.");
    } finally {
      setSavingDeptId(null);
    }
  };

  // ------------------ SEARCH FILTER ------------------
  const filtered = records.filter(
    (r) =>
      r.userId?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.userId?.department?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-400 font-bold";
      case "late":
        return "text-yellow-300 font-bold";
      case "absent":
        return "text-red-400 font-bold";
      case "half-day":
        return "text-orange-400 font-bold";
      default:
        return "text-gray-300";
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-white text-lg">
        ⏳ Loading dashboard...
      </p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto mt-10 p-6 bg-white/10 text-white rounded-xl backdrop-blur-xl shadow-2xl relative z-10"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 relative z-50">
        <h1 className="text-3xl font-bold">📊 Manager Dashboard</h1>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-semibold shadow-lg hover:shadow-blue-800/50"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* QUICK STATS */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Present", value: stats.present, color: "text-green-400" },
            { label: "Late", value: stats.late, color: "text-yellow-300" },
            { label: "Absent", value: stats.absent, color: "text-red-400" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.06 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-6 bg-black/40 rounded-xl text-center shadow-xl hover:shadow-white/10"
            >
              <p className="text-lg opacity-80">{item.label}</p>
              <h3 className={`text-4xl font-bold mt-1 ${item.color}`}>
                {item.value}
              </h3>
            </motion.div>
          ))}
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="flex items-center gap-2 mb-4 bg-black/30 px-3 py-2 rounded-lg">
        <Search size={18} className="opacity-70" />
        <input
          type="text"
          placeholder="Search employee or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none w-full text-white placeholder-gray-400"
        />
      </div>

      {/* TABLE */}
      <table className="w-full text-left bg-black/40 rounded-xl overflow-hidden">
        <thead className="bg-white/10">
          <tr>
            <th className="p-3">Employee</th>
            <th className="p-3">Department</th>
            <th className="p-3">Status</th>
            <th className="p-3">Check-In</th>
            <th className="p-3">Check-Out</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length > 0 ? (
            filtered.map((r) => (
              <tr
                key={r._id}
                className="border-b border-white/10 hover:bg-white/10 transition"
              >
                <td className="p-3">{r.userId?.name}</td>
{/* DEPARTMENT DISPLAY ONLY */}
<td className="p-3 text-purple-200 font-medium">
  {r.userId?.department || "—"}
</td>


                <td className={`p-3 capitalize ${statusColor(r.status)}`}>
                  {r.status}
                </td>
                <td className="p-3">
                  {r.checkInTime
                    ? new Date(r.checkInTime).toLocaleTimeString()
                    : "-"}
                </td>
                <td className="p-3">
                  {r.checkOutTime
                    ? new Date(r.checkOutTime).toLocaleTimeString()
                    : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-400">
                No matching records found ❌
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
}

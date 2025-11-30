import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { motion } from "framer-motion";
import { FiUsers, FiClock, FiThumbsUp, FiAlertTriangle } from "react-icons/fi";

export default function Analytics() {
  const [data, setData] = useState(null);

  const loadAnalytics = async () => {
    try {
      const res = await api.get("/attendance/summary");
      setData(res.data);
    } catch (err) {
      console.error("Analytics Error:", err);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl animate-pulse">
        Loading Analytics...
      </div>
    );

  const presentPct = Math.round(
    (data.present / (data.present + data.absent + data.late)) * 100
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 text-white">
      <motion.h1
        className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📊 Attendance Insights Dashboard
      </motion.h1>

      {/* ---- STAT CARDS ---- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Stat icon={<FiThumbsUp />} value={data.present} label="Present" color="text-green-400" />
        <Stat icon={<FiAlertTriangle />} value={data.late} label="Late" color="text-yellow-300" />
        <Stat icon={<FiUsers />} value={data.absent} label="Absent" color="text-red-400" />
        <Stat icon={<FiClock />} value={`${data.totalHours} hrs`} label="Total Hours" color="text-blue-400" />
      </div>

      {/* ---- PROGRESS RING ---- */}
      <motion.div
        className="bg-white/10 rounded-2xl shadow-xl border border-white/10 p-6 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-xl mb-3">Overall Performance</p>

        <div className="relative w-40 h-40">
          <svg className="w-full h-full">
            <circle
              cx="50%" cy="50%" r="70"
              stroke="#333"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="50%" cy="50%" r="70"
              stroke="#a855f7"
              strokeWidth="12"
              fill="none"
              strokeDasharray="440"
              strokeDashoffset={440 - (440 * presentPct) / 100}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex justify-center items-center text-3xl font-bold">
            {presentPct}%
          </span>
        </div>
      </motion.div>

      {/* ---- PLACEHOLDER CALENDAR VIEW ---- */}
      <motion.div
        className="mt-10 bg-white/10 p-6 rounded-xl border border-white/10 shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-xl font-semibold mb-4">📅 Attendance Heatmap (Coming Soon)</h2>
        <p className="text-white/60">Visual monthly attendance trends will appear here.</p>
      </motion.div>
    </div>
  );
}

const Stat = ({ icon, value, label, color }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 flex flex-col items-center shadow-xl border border-white/20 hover:scale-105 transition cursor-pointer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className={`text-4xl mb-3 ${color}`}>{icon}</div>
    <div className="text-3xl font-bold">{value}</div>
    <div className="mt-1 text-md text-white/70">{label}</div>
  </motion.div>
);

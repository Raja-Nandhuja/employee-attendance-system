// src/features/attendance/AnalyticsDashboard.jsx
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { motion } from "framer-motion";

import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const loadData = async () => {
    try {
      const res = await api.get("/attendance/analytics");
      setSummary(res.data.summary);
      setWeekly(res.data.weeklyHours);
      setMonthly(res.data.monthlyTrend);
    } catch (err) {
      console.log("Analytics error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!summary)
    return <p className="text-white text-center mt-20 text-xl animate-pulse">Loading analytics...</p>;

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 mt-10 text-white bg-white/10 rounded-xl backdrop-blur-xl shadow-xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold text-center mb-6">📈 My Attendance Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat title="Present" value={summary.present} color="text-green-400" />
        <Stat title="Absent" value={summary.absent} color="text-red-400" />
        <Stat title="Late" value={summary.late} color="text-yellow-300" />
        <Stat title="Half-Day" value={summary.halfDay} color="text-orange-400" />
      </div>

      {/* PIE CHART */}
      <section className="bg-black/40 p-4 rounded-xl mb-6">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={[
                { name: "Present", value: summary.present },
                { name: "Absent", value: summary.absent },
                { name: "Late", value: summary.late },
                { name: "Half Day", value: summary.halfDay }
              ]}
              cx="50%" cy="50%" outerRadius={90} dataKey="value" label
            >
              {["#22c55e", "#ef4444", "#eab308", "#fb923c"].map((c, i) => (
                <Cell key={i} fill={c} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* WEEKLY BAR */}
      <section className="bg-black/40 p-4 rounded-xl mb-6">
        <h3 className="text-lg font-semibold text-center mb-2">Weekly Productivity</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weekly}>
            <XAxis dataKey="week" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* MONTHLY LINE */}
      <section className="bg-black/40 p-4 rounded-xl">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="month" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#a855f7" strokeWidth={4} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </motion.div>
  );
}

const Stat = ({ title, value, color }) => (
  <div className="bg-white/10 rounded-xl p-4 text-center shadow-xl">
    <p className={`text-xl font-bold ${color}`}>{title}</p>
    <p className="text-4xl font-bold mt-1">{value}</p>
  </div>
);

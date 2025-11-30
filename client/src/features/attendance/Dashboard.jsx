import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    onTimeStreak: 0,
    bestOnTimeStreak: 0,
    totalPresentDays: 0
  });

  const loadStats = async () => {
    try {
      const res = await api.get("/user/stats");
      setStats(res.data.stats || {
        onTimeStreak: 0,
        bestOnTimeStreak: 0,
        totalPresentDays: 0
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getStreakMessage = () => {
    if (stats.onTimeStreak >= 10) return "🔥 You’re on fire! Keep this beast mode going.";
    if (stats.onTimeStreak >= 5) return "⚡ Great consistency! You’re building a strong habit.";
    if (stats.onTimeStreak > 0) return "✨ Nice! You're getting started. Keep showing up.";
    return "Start your streak today. Every on-time day counts! 💪";
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 space-y-8">
      {/* Header Welcome */}
      <section className="text-center space-y-2">
        <p className="text-sm uppercase tracking-[0.25em] text-purple-400/80">
          Dashboard
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Welcome, {user?.name} 👋
        </h2>
        <p className="text-sm md:text-base text-gray-300/90 mt-2">
          Track your attendance, stay consistent, and grow your streak every day.
        </p>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* On-Time Streak */}
        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.8)] transition-all duration-300 hover:-translate-y-1">
          <p className="text-xs uppercase tracking-wider text-purple-300/80 mb-1">
            Current Streak
          </p>
          <h3 className="text-4xl md:text-5xl font-extrabold text-purple-300 animate-pulse">
            {stats.onTimeStreak}
          </h3>
          <p className="text-xs mt-2 text-gray-300">
            Days in a row you’ve been on time.
          </p>
        </div>

        {/* Best Streak */}
        <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.8)] transition-all duration-300 hover:-translate-y-1">
          <p className="text-xs uppercase tracking-wider text-blue-300/80 mb-1">
            Best Streak
          </p>
          <h3 className="text-4xl md:text-5xl font-extrabold text-blue-300">
            {stats.bestOnTimeStreak}
          </h3>
          <p className="text-xs mt-2 text-gray-300">
            Your longest on-time run so far.
          </p>
        </div>

        {/* Total Present Days */}
        <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] transition-all duration-300 hover:-translate-y-1">
          <p className="text-xs uppercase tracking-wider text-emerald-300/80 mb-1">
            Total Present Days
          </p>
          <h3 className="text-4xl md:text-5xl font-extrabold text-emerald-300">
            {stats.totalPresentDays}
          </h3>
          <p className="text-xs mt-2 text-gray-300">
            Total days you’ve marked attendance.
          </p>
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-wrap justify-center gap-4 mb-4">
        <Link
          to="/attendance"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/80 hover:-translate-y-1 transition-all duration-300"
        >
          Mark Attendance
        </Link>

        <Link
          to="/history"
          className="px-6 py-3 rounded-2xl bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
        >
          Attendance History
        </Link>

        {["manager", "admin", "hr"].includes(user?.role) && (
          <Link
            to="/manager/team"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 text-white font-semibold shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/80 hover:-translate-y-1 transition-all duration-300"
          >
            Team Attendance
          </Link>
        )}
      </section>

      {/* Motivation + Info */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Streak Message */}
        <div className="bg-white/5 border border-purple-400/40 rounded-2xl p-5 shadow-lg">
          <h3 className="font-semibold text-lg mb-2 text-purple-200">
            Your Streak Status 🌟
          </h3>
          <p className="text-sm text-gray-200">{getStreakMessage()}</p>
        </div>

        {/* Daily Tip */}
        <div className="bg-white/5 border border-blue-400/40 rounded-2xl p-5 shadow-lg">
          <h3 className="font-semibold text-lg mb-2 text-blue-200">
            Daily Productivity Tip 💡
          </h3>
          <p className="text-sm text-gray-200">
            Plan your day the night before. Keep 5 minutes aside before sleep to
            decide when you will reach the office tomorrow. Tiny planning = big impact.
          </p>
        </div>
      </section>
    </div>
  );
}

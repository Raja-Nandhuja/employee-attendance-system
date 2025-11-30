import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Clock, LogIn, LogOut, Coffee, Ban } from "lucide-react";

export default function CheckInOut() {
  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState("Not Checked In");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null });

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user location from browser
  const fetchLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          resolve({ lat: latitude, lng: longitude });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  const handleAction = async (endpoint, successStatus) => {
    try {
      setLoading(true);
      setMessage("");

      const coords = await fetchLocation();  // Get LAT LNG

      const res = await api.post(`/attendance/${endpoint}`, {
        lat: coords.lat,
        lng: coords.lng,
        notes: notes || undefined
      });

      setStatus(successStatus);

      toast.success(res.data.message || `${successStatus} Successfully 🎉`, {
        duration: 2500,
        position: "top-center",
      });
    } catch (err) {
      console.error("Attendance Action Error:", err);

      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong, please try again";

      toast.error(msg, {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #ef4444",
          fontSize: "15px",
          padding: "12px 16px",
          borderRadius: "10px",
        }
      });

      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto mt-12 p-8 rounded-3xl bg-white/10 dark:bg-black/40
        backdrop-blur-xl border border-white/10 shadow-2xl text-center text-white"
    >
      {/* Live Clock */}
      <div className="flex justify-center items-center gap-2 text-xl font-semibold mb-4">
        <Clock className="text-blue-400 animate-pulse" size={26} />
        <span>{time.toLocaleDateString()} • {time.toLocaleTimeString()}</span>
      </div>

      {/* Status */}
      <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">Attendance</h2>
      <p className="text-lg">
        Status: <span className="text-blue-400 font-semibold">{status}</span>
      </p>

      {/* Error Message */}
      {message && <p className="text-red-400 font-medium mt-2">{message}</p>}

      {/* Notes */}
      <textarea
        placeholder="Add notes (optional)"
        className="mt-6 w-full p-3 rounded-xl bg-white/10 border border-white/20
        focus:ring-2 ring-blue-400 outline-none"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">

        <motion.button
          onClick={() => handleAction("checkin", "Checked In")}
          disabled={loading}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl
          font-semibold shadow-lg hover:shadow-green-500/40 transition-all disabled:opacity-50"
        >
          <LogIn size={20} /> {loading ? "Please wait..." : "Check In"}
        </motion.button>

        <motion.button
          onClick={() => handleAction("checkout", "Checked Out")}
          disabled={loading}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl
          font-semibold shadow-lg hover:shadow-red-500/40 transition-all disabled:opacity-50"
        >
          <LogOut size={20} /> Check Out
        </motion.button>

        <motion.button
          onClick={() => handleAction("break/start", "Break Started")}
          disabled={loading}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl
          font-semibold shadow-lg hover:shadow-yellow-400/40 transition-all disabled:opacity-50"
        >
          <Coffee size={20} /> Start Break
        </motion.button>

        <motion.button
          onClick={() => handleAction("break/end", "Break Ended")}
          disabled={loading}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl
          font-semibold shadow-lg hover:shadow-indigo-400/40 transition-all disabled:opacity-50"
        >
          <Ban size={20} /> End Break
        </motion.button>

      </div>
    </motion.div>
  );
}

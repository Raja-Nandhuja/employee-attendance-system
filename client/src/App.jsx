// client/src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import AnalyticsDashboard from "./features/attendance/AnalyticsDashboard";
import Login from "./features/auth/Login";
import Magiclogin from "./features/auth/Magiclogin";
import Dashboard from "./features/attendance/Dashboard";
import CheckInOut from "./features/attendance/CheckInOut";
import AttendanceHistory from "./features/attendance/AttendanceHistory";
import TeamAttendance from "./features/manager/TeamAttendance";
import ManagerDashboard from "./features/manager/ManagerDashboard";

import StarBackground from "./components/StarBackground";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";

/* ------------------ PROTECTED ROUTE ------------------ */
function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/* ------------------ NAVIGATION LINKS ------------------ */
function NavLinks() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const linkClass = (path) =>
    `px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
      location.pathname === path
        ? "bg-purple-600 text-white shadow-lg scale-105"
        : "hover:bg-white/20 text-purple-300"
    }`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <nav className="flex items-center gap-4">
      <Link className={linkClass("/dashboard")} to="/dashboard">
        Dashboard
      </Link>
      <Link className={linkClass("/attendance")} to="/attendance">
        Attendance
      </Link>
      <Link className={linkClass("/history")} to="/history">
        History
      </Link>

      {/* Manager Dropdown */}
      {["manager", "admin", "hr"].includes(user?.role) && (
        <div className="relative select-none z-[9999]" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 transition"
          >
            Manager Panel <ChevronDown size={16} />
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-2xl z-[9999] animate-dropdown border p-2"
            >
              <Link
                to="/manager/dashboard"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                Manager Dashboard
              </Link>

              <Link
                to="/analytics"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                Analytics Dashboard
              </Link>

              <Link
                to="/manager/team"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                Team Attendance
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold shadow-md"
      >
        Logout
      </button>
    </nav>
  );
}

/* ------------------ LAYOUT ------------------ */
function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const hideNavbar = ["/login", "/magic-login"].includes(location.pathname);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <div className={`${dark ? "dark" : ""} transition-all duration-700`}>
      <StarBackground />

      {!hideNavbar && user && (
        <header className="flex justify-between items-center px-6 py-4 bg-black/30 border-b border-white/20 shadow-lg backdrop-blur-md relative z-50">
          <h1 className="font-bold text-xl text-purple-300 tracking-wide select-none">
            Employee Attendance System
          </h1>

          <NavLinks />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-purple-600/30 transition border border-purple-500 text-purple-300"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>
      )}

      <main className="p-6 relative z-10">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/magic-login" element={<Magiclogin />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <CheckInOut />
              </PrivateRoute>
            }
          />

          <Route
            path="/history"
            element={
              <PrivateRoute>
                <AttendanceHistory />
              </PrivateRoute>
            }
          />

          <Route
            path="/manager/dashboard"
            element={
              <PrivateRoute roles={["manager", "admin", "hr"]}>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/analytics" element={<PrivateRoute><AnalyticsDashboard /></PrivateRoute>} />

          <Route
            path="/manager/team"
            element={
              <PrivateRoute roles={["manager", "admin", "hr"]}>
                <TeamAttendance />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/* ------------------ ROOT APP ------------------ */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#111",
              color: "white",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "0.9rem",
              border: "1px solid rgba(255,255,255,0.15)",
            },
          }}
        />
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}

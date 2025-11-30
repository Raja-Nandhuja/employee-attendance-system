import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete api.defaults.headers.common["Authorization"];
  }, [token]);

  // Auto logout after 2 hours idle time
  useEffect(() => {
    let timeout = setTimeout(() => {
      if (token) logout();
    }, 2 * 60 * 60 * 1000);

    window.onclick = window.onmousemove = window.onkeypress = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, 2 * 60 * 60 * 1000);
    };

    return () => clearTimeout(timeout);
  }, [token]);

  const loginWithPassword = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setToken(res.data.token);

      toast.success(`Welcome back, ${res.data.user.name}! 🎉`);
      navigate("/dashboard");
      return { ok: true };
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed ❌");
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);

    toast("Logged out 👋");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

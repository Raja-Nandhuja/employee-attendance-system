import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [mode, setMode] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithPassword, requestMagicLink, loading } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

 const handlePasswordLogin = async (e) => {
  e.preventDefault();
  
  const res = await loginWithPassword(email, password);
  if (!res.ok) {
    setMessage(res.error);
    return;
  }
  
  navigate("/dashboard");
};



  return (
    
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl px-8 py-10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        <div className="flex justify-center mb-6 space-x-2">
          <button
            className={`px-4 py-2 text-sm rounded-lg ${
              mode === "password"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setMode("password")}
          >
            Password
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-lg ${
              mode === "magic"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setMode("magic")}
          >
            Magic Link
          </button>
        </div>

        {message && (
          <p className="text-sm mb-3 text-center text-red-500 dark:text-red-400">
            {message}
          </p>
        )}

        <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicRequest}>
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              className="mt-1 w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 focus:ring-2 ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {mode === "password" && (
            <label className="block text-sm font-medium mt-4">
              Password
              <input
                type="password"
                className="mt-1 w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 focus:ring-2 ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "password" ? "Login" : "Send Magic Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

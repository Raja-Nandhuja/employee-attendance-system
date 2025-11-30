import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function MagicLogin() {
  const query = useQuery();
  const { verifyMagicLink } = useAuth();
  const [message, setMessage] = useState("Verifying magic link...");
  const navigate = useNavigate();

  useEffect(() => {
    const email = query.get("email");
    const token = query.get("token");
    if (!email || !token) {
      setMessage("Invalid magic link");
      return;
    }

    (async () => {
      const res = await verifyMagicLink(email, token);
      if (!res.ok) {
        setMessage(res.error || "Magic link verification failed");
      } else {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    })();
  }, [query, verifyMagicLink, navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow text-center">
      <p>{message}</p>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { login as apiLogin, apiError } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await apiLogin(form);
      loginUser(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setMessage(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl items-center justify-center px-5 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-orange-200/90">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Sign in</h1>
          <p className="mt-2 text-sm text-white/55">Access your projects, credits, and saved workflows.</p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm text-white/70">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-[#111316] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orange-400/50"
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm text-white/70">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-[#111316] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orange-400/50"
                required
              />
            </div>

            {message && <p className="text-sm text-red-300">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/55">
            Don’t have an account?{" "}
            <Link to="/register" className="font-medium text-orange-300 hover:text-orange-200">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

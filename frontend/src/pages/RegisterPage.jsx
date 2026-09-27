import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { register as apiRegister, registerVerify, apiError } from "../utils/api";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await apiRegister(form);
      setEmailSent(true);
      setMessage(`Verification email sent to ${data.email}. Enter the 6-digit code below.`);
    } catch (err) {
      setMessage(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await registerVerify(form.email, code);
      navigate("/login");
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
          <p className="text-[11px] uppercase tracking-[0.22em] text-orange-200/90">Get started</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Create account</h1>
          <p className="mt-2 text-sm text-white/55">Start building your next website in minutes.</p>

          {!emailSent ? (
            <form className="mt-7 space-y-4" onSubmit={handleRegister}>
              <div>
                <label htmlFor="register-name" className="mb-2 block text-sm text-white/70">Full name</label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-[#111316] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orange-400/50"
                  required
                />
              </div>

              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm text-white/70">Email</label>
                <input
                  id="register-email"
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
                <label htmlFor="register-password" className="mb-2 block text-sm text-white/70">Password</label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
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
                {loading ? "Creating..." : "Create account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          ) : (
            <form className="mt-7 space-y-4" onSubmit={handleVerify}>
              <div>
                <label htmlFor="register-code" className="mb-2 block text-sm text-white/70">Verification code</label>
                <input
                  id="register-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
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
                {loading ? "Verifying..." : "Verify account"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-white/55">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-orange-300 hover:text-orange-200">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;

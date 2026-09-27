import React, { useEffect, useState } from "react";
import { UserCircle2, Bell, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword, apiError } from "../utils/api";

const SettingsPage = () => {
  const { user, loading, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [current, setCurrent] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) setName(user.name || "");
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const data = await updateProfile({ name });
      updateUser(data.user);
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(apiError(err));
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    try {
      await changePassword({ current, nextPw });
      setMessage("Password changed successfully.");
      setCurrent("");
      setNextPw("");
    } catch (err) {
      setMessage(apiError(err));
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-[#08090a] text-white" />;
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">Account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">Settings</h1>
        </div>

        {message && <p className="mb-6 text-sm text-orange-200">{message}</p>}

        <div className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-[#0d0f12] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-orange-300 ring-1 ring-white/8">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Profile</h2>
                <p className="text-sm text-white/55">Manage your display name.</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleProfileSave}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#111316] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-400/50"
                placeholder="Your name"
              />
              <button type="submit" className="rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-4 py-2.5 text-sm font-semibold text-zinc-950">
                Save profile
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0d0f12] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-orange-300 ring-1 ring-white/8">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Password</h2>
                <p className="text-sm text-white/55">Update your account password.</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handlePasswordSave}>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-xl border border-white/10 bg-[#111316] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-400/50"
              />
              <input
                type="password"
                value={nextPw}
                onChange={(e) => setNextPw(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border border-white/10 bg-[#111316] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-400/50"
              />
              <button type="submit" className="rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.08]">
                Change password
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0d0f12] p-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-orange-300 ring-1 ring-white/8">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                <p className="text-sm text-white/55">Alerts are enabled for project updates.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;

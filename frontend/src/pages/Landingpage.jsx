import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles, Zap, ShieldCheck, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import hero from "../assets/hero.png";

const features = [
  {
    title: "AI website generation",
    description: "Describe your idea once and generate a branded product site with the right sections, tone, and flow.",
    icon: Sparkles,
  },
  {
    title: "Launch-ready builds",
    description: "Ship polished landing pages with modern sections, CTA blocks, pricing layouts, and responsive styling.",
    icon: Zap,
  },
  {
    title: "Trusted workflow",
    description: "Keep your projects organized, review previews, and move straight from concept to deployment.",
    icon: ShieldCheck,
  },
];

const stats = [
  { value: "2x", label: "faster launches" },
  { value: "24/7", label: "AI-powered creation" },
  { value: "99%", label: "design polish" },
];

const Landingpage = () => {
  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.15),_transparent_28%)]" />

        <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-400 backdrop-blur-md shadow-sm">
                <Sparkles className="h-0 w-0" />
                AI website builder
              </div>

              <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Build websites from a single idea.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
                Turn rough prompts into polished, production-ready web experiences with branding, sections, previews, and deployment-ready layouts.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-[0_18px_36px_-12px_rgba(249,115,22,0.85)] transition hover:-translate-y-0.5"
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  to="/community"
                  className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/3 px-5 py-3 text-sm font-medium text-white/85 transition hover:border-white/20 hover:bg-white/5"
                >
                  Explore examples
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/55">
                {[
                  "No-code prompt flow",
                  "Responsive pages",
                  "Quick deployment",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-orange-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute inset-10 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="relative w-full max-w-[540px] rounded-[30px] border border-white/10 bg-white/[0.03] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#101214]">
                  <img
                    src={hero}
                    alt="WebBuilder hero illustration"
                    className="mx-auto block w-full max-w-[500px] object-contain select-none"
                    style={{ filter: "drop-shadow(0 24px 30px rgba(255,102,0,0.16))" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 text-center">
                <div className="text-2xl font-semibold tracking-[-0.04em] text-white">{stat.value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-5 pb-24 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">Why teams use it</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                Everything needed to ship a standout site
              </h2>
            </div>
            <div className="hidden items-center gap-1 text-amber-300 sm:flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/8 bg-[#0d0f12] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 hover:border-orange-400/30"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-violet-500/10 text-orange-300 ring-1 ring-white/10">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landingpage;
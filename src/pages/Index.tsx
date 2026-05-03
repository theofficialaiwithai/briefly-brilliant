import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ClipboardList,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  ThumbsUp,
  ArrowUpRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const steps = [
  {
    icon: ClipboardList,
    title: "Take the quiz",
    body: "Tell us your current score, your weak section, your timeline, and your budget. Takes under 5 minutes.",
    bg: "#7C6FF7",
  },
  {
    icon: Sparkles,
    title: "Get matched",
    body: "Our community-powered AI surfaces the exact resources that moved the needle for students at your plateau.",
    bg: "#4ADE80",
  },
  {
    icon: TrendingUp,
    title: "Track your breakthrough",
    body: "Log a score after completing a resource. Every data point — including skips — makes the matching smarter for everyone.",
    bg: "#FB923C",
  },
];

const features = [
  {
    emoji: "🎯",
    title: "Resource matching",
    body: "Every recommendation calibrated to your exact score and section — not generic advice built for everyone.",
  },
  {
    emoji: "⭐",
    title: "Score Journey Stories",
    body: "Browse real student breakthroughs by score range. Every story is a roadmap for the next person.",
  },
  {
    emoji: "👍",
    title: "Worth It? ratings",
    body: "Community ratings on every resource — free and paid — from students who completed them at your score range.",
  },
  {
    emoji: "👥",
    title: "Community Study Groups",
    body: "Find students at your plateau, study together, and hold each other accountable.",
    comingSoon: true,
  },
  {
    emoji: "🎓",
    title: "LSAT tutor discovery",
    body: "Get matched to tutors rated by students who broke through your exact plateau.",
    comingSoon: true,
  },
  {
    emoji: "📅",
    title: "Personalized study sequence",
    body: "A week-by-week study plan built from your quiz results, updated as your scores improve.",
    comingSoon: true,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link
            to="/auth"
            className="text-[0.9rem] font-medium px-4 py-2"
            style={{ color: "#1A1A2E" }}
          >
            Log in
          </Link>
          <Link
            to="/auth?mode=signup"
            className="text-[0.9rem] font-medium text-white"
            style={{
              backgroundColor: "#0D9488",
              borderRadius: 99,
              padding: "8px 20px",
            }}
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-24 text-center md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            For LSAT self-studiers
          </span>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-foreground md:text-6xl md:leading-[1.05]">
            Your plateau-to-breakthrough study guide.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Score-matched resources, powered by students who broke through the same wall.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/quiz");
            }}
            className="mx-auto mt-10 flex w-full max-w-md items-center bg-white"
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 99,
              padding: "6px 6px 6px 20px",
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent outline-none border-0"
              style={{ fontSize: "0.95rem" }}
            />
            <button
              type="submit"
              className="text-white font-medium"
              style={{
                backgroundColor: "#0D9488",
                borderRadius: 99,
                padding: "10px 24px",
                fontSize: "0.9rem",
              }}
            >
              Get Matched →
            </button>
          </form>
          <p
            className="mt-3 text-center"
            style={{ color: "#9CA3AF", fontSize: "0.8rem" }}
          >
            Free for 14 days. No credit card required.
          </p>
        </section>

        {/* Section A — How It Works (dark) */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div
            className="rounded-[20px] p-10 text-white md:p-16"
            style={{ backgroundColor: "#0F0F0F" }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "#0D9488" }}
            >
              How it works
            </span>
            <h2 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-white md:text-5xl">
              Three steps from plateau to breakthrough.
            </h2>

            <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((s) => (
                <div key={s.title}>
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: s.bg }}
                  >
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section B — Features */}
        <section className="px-6 pb-24">
          <div
            className="mx-auto overflow-hidden my-12"
            style={{
              maxWidth: 900,
              borderRadius: 20,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                backgroundColor: "#0D9488",
                padding: "20px 32px",
              }}
              className="text-center"
            >
              <h2 className="font-bold text-white" style={{ fontSize: "1.5rem" }}>
                App Features
              </h2>
            </div>
            <div
              style={{ backgroundColor: "#FFFFFF", padding: "48px 40px" }}
            >
              <div className="text-center">
                <h3
                  className="font-bold"
                  style={{ color: "#1A1A2E", fontSize: "1.4rem" }}
                >
                  Why students choose Briefly Brilliant
                </h3>
                <p
                  className="mt-2 mx-auto max-w-xl"
                  style={{ color: "#6B7280", fontSize: "0.9rem" }}
                >
                  Score-matched resources, community signals, and a study system that gets smarter with every use.
                </p>
              </div>
              <div
                className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                style={{ columnGap: 32, rowGap: 40 }}
              >
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="flex flex-col items-center text-center"
                    style={{ opacity: f.comingSoon ? 0.5 : 1 }}
                  >
                    <f.icon size={28} style={{ color: "#0D9488" }} />
                    <h4
                      style={{
                        color: "#1A1A2E",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        marginTop: 10,
                      }}
                    >
                      {f.title}
                    </h4>
                    {f.comingSoon && (
                      <span
                        className="mt-1 inline-block"
                        style={{
                          backgroundColor: "#F3F4F6",
                          color: "#6B7280",
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 99,
                        }}
                      >
                        Coming Soon
                      </span>
                    )}
                    <p
                      className="mt-2"
                      style={{
                        color: "#6B7280",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {f.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Community section */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div
            className="rounded-[20px] p-10 text-white md:p-16"
            style={{ backgroundColor: "#0F0F0F" }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "#0D9488" }}
            >
              Community
            </span>
            <h2 className="mt-4 max-w-3xl text-[2.5rem] font-bold leading-tight text-white">
              Built by students. Made smarter by every score.
            </h2>
            <p className="mt-4 text-base text-white/60">
              Three features no LSAT platform has ever combined.
            </p>

            <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {[
                {
                  icon: Star,
                  bg: "#7C6FF7",
                  title: "Score Journey Stories",
                  body: "Real students share what broke their plateau. Every story is a roadmap for the next person.",
                  link: "/stories",
                  cta: "Browse stories →",
                },
                {
                  icon: ThumbsUp,
                  bg: "#4ADE80",
                  title: "Worth It? ratings",
                  body: "Every resource rated by students at your score range. Know what's worth your time before you start.",
                  link: "/feed",
                  cta: "See rated resources →",
                },
                {
                  icon: Users,
                  bg: "#FB923C",
                  title: "Community Study Groups",
                  body: "Find students at your exact plateau. Study together and hold each other accountable.",
                  link: "/groups",
                  cta: "Find a group →",
                },
              ].map((c) => (
                <div key={c.title}>
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: c.bg }}
                  >
                    <c.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 text-lg font-bold text-white">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{c.body}</p>
                  <Link
                    to={c.link}
                    className="mt-4 inline-block text-sm font-semibold"
                    style={{ color: "#0D9488" }}
                  >
                    {c.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          style={{
            background: "linear-gradient(to bottom, #EAF6F3, #FAF7F2)",
            padding: "80px 0",
          }}
        >
          <div className="mx-auto px-6 text-center" style={{ maxWidth: 720 }}>
            <h2 style={{ fontSize: "1.8rem", color: "#1A1A2E" }} className="font-bold">
              Simple, honest pricing
            </h2>
            <p style={{ color: "#6B7280", fontSize: "0.9rem" }} className="mt-3">
              Start free. Upgrade when you're ready. Own it forever.
            </p>
          </div>
          <div
            className="mx-auto mt-10 grid gap-5 px-6 md:grid-cols-2"
            style={{ maxWidth: 680 }}
          >
            {/* Free */}
            <div
              className="bg-white flex flex-col"
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                padding: 32,
              }}
            >
              <span
                className="uppercase"
                style={{ fontSize: "0.75rem", color: "#9CA3AF", letterSpacing: "0.08em" }}
              >
                Standard
              </span>
              <h3 className="mt-2 font-bold" style={{ color: "#1A1A2E", fontSize: "2rem" }}>
                Free
              </h3>
              <p style={{ color: "#6B7280", fontSize: "0.85rem" }} className="mt-1">
                Full access for 14 days, no card needed.
              </p>
              <hr className="my-5" style={{ borderColor: "#E5E7EB" }} />
              <p style={{ color: "#1A1A2E", fontSize: "0.85rem", fontWeight: 600 }}>
                What's included:
              </p>
              <ul className="mt-3 space-y-1" style={{ lineHeight: 1.8 }}>
                {["Resource matching", "Score Journey Stories", "Worth It? ratings"].map((i) => (
                  <li key={i} className="flex items-center gap-2" style={{ color: "#6B7280", fontSize: "0.875rem" }}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#0D9488" }} />
                    {i}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className="mt-6 block text-center font-semibold"
                style={{
                  border: "1.5px solid #0D9488",
                  color: "#0D9488",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                Start Free Trial
              </Link>
            </div>

            {/* Lifetime */}
            <div
              className="bg-white flex flex-col relative"
              style={{
                border: "2px solid #0D9488",
                borderRadius: 16,
                padding: 32,
              }}
            >
              <span
                className="absolute text-white"
                style={{
                  top: 16,
                  right: 16,
                  backgroundColor: "#0D9488",
                  fontSize: 10,
                  padding: "4px 10px",
                  borderRadius: 99,
                }}
              >
                Best Value
              </span>
              <span
                className="uppercase"
                style={{ fontSize: "0.75rem", color: "#9CA3AF", letterSpacing: "0.08em" }}
              >
                Premium
              </span>
              <h3 className="mt-2 font-bold" style={{ color: "#1A1A2E", fontSize: "2rem" }}>
                $49
                <span style={{ color: "#9CA3AF", fontSize: "0.9rem", fontWeight: 400 }}>
                  {" "}/lifetime
                </span>
              </h3>
              <p style={{ color: "#6B7280", fontSize: "0.85rem" }} className="mt-1">
                One payment. Every feature. Forever.
              </p>
              <hr className="my-5" style={{ borderColor: "#E5E7EB" }} />
              <p style={{ color: "#1A1A2E", fontSize: "0.85rem", fontWeight: 600 }}>
                What's included:
              </p>
              <ul className="mt-3 space-y-1" style={{ lineHeight: 1.8 }}>
                {[
                  "Everything in Free",
                  "Community Study Groups",
                  "LSAT tutor discovery",
                  "Personalized study sequence",
                  "All future features included",
                ].map((i) => (
                  <li key={i} className="flex items-center gap-2" style={{ color: "#6B7280", fontSize: "0.875rem" }}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#0D9488" }} />
                    {i}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth?plan=lifetime"
                className="mt-6 block text-center text-white font-semibold"
                style={{
                  backgroundColor: "#0D9488",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                Get Lifetime Access
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-6 py-8 md:flex-row md:items-center">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Your plateau-to-breakthrough study guide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

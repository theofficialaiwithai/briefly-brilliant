import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Sparkles,
  TrendingUp,
  Target,
  Users,
  Tag,
  RefreshCw,
  Star,
  ThumbsUp,
  Crosshair,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    icon: Crosshair,
    title: "Resource matching",
    body: "Every recommendation calibrated to your exact score and section — not generic advice that fits everyone and no one.",
  },
  {
    icon: Star,
    title: "Score Journey Stories",
    body: "Browse real student breakthroughs tagged by score range. Every story is a roadmap for the next person.",
  },
  {
    icon: ThumbsUp,
    title: "Worth It? ratings",
    body: "Community ratings on every resource from students who completed them at your exact score range.",
  },
  {
    icon: Users,
    title: "Community Study Groups",
    body: "Find students at your plateau, study together, and hold each other accountable.",
    comingSoon: true,
  },
  {
    icon: GraduationCap,
    title: "LSAT tutor discovery",
    body: "Get matched to tutors rated by students who broke through your exact plateau.",
    comingSoon: true,
  },
  {
    icon: CalendarDays,
    title: "Personalized study sequence",
    body: "A week-by-week study plan built from your quiz results, updated as your scores move.",
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

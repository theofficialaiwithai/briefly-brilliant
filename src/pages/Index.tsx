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
    title: "Resource Matching",
    body: "Every recommendation calibrated to your exact score and section — not generic advice built for everyone.",
  },
  {
    emoji: "⭐",
    title: "Score Journey Stories",
    body: "Browse real student breakthroughs by score range. Every story is a roadmap for the next person.",
  },
  {
    emoji: "👍",
    title: "Worth It? Meter",
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
    title: "Personalized Study Sequence",
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
        <section className="mx-auto max-w-6xl px-6 pt-8 pb-20">
          <div
            className="relative overflow-hidden rounded-[20px]"
            style={{ minHeight: 860 }}
          >
            <img
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=85&auto=format&fit=crop"
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(to bottom, rgba(15,15,15,0.65) 0%, rgba(15,15,15,0.45) 50%, rgba(15,15,15,0.7) 100%)",
              }}
            />
            <div
              className="relative mx-auto flex max-w-3xl flex-col items-center justify-center px-6 text-center"
              style={{ zIndex: 10, minHeight: 860 }}
            >
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", backdropFilter: "blur(4px)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#5EEAD4" }} />
            For LSAT self-studiers
          </span>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white md:text-6xl md:leading-[1.05]">
            Your plateau-to-breakthrough study guide.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg" style={{ color: "rgba(255,255,255,0.85)" }}>
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
              className="flex-1 bg-transparent outline-none border-0 text-center"
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
            style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem" }}
          >
            Free for 14 days. No credit card required.
          </p>
            </div>
          </div>
        </section>

        {/* Section A — How It Works (dark) */}
        {/* Section B — Features (open layout) */}
        <section style={{ backgroundColor: "#FAF7F2", padding: "80px 24px" }}>
          <div className="text-center">
            <h2 style={{ color: "#1A1A2E", fontSize: "2.25rem" }} className="font-bold">
              Not your average study tool
            </h2>
            <p
              className="mx-auto mt-4"
              style={{ color: "#6B7280", fontSize: "1rem", maxWidth: 560 }}
            >
              Carefully built for LSAT self-studiers who are done with generic advice and want resources that actually match where they are.
            </p>
          </div>
          <div
            className="mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            style={{ maxWidth: 860, columnGap: 48, rowGap: 56 }}
          >
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center">
                <span style={{ fontSize: 52, display: "block", marginBottom: 14, lineHeight: 1 }}>
                  {f.emoji}
                </span>
                <h3
                  style={{
                    color: "#1A1A2E",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    marginBottom: 8,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {f.title}
                </h3>
                {f.comingSoon && (
                  <span
                    style={{
                      backgroundColor: "#F3F4F6",
                      color: "#9CA3AF",
                      fontSize: 10,
                      padding: "3px 10px",
                      borderRadius: 99,
                      marginBottom: 8,
                    }}
                  >
                    Coming Soon
                  </span>
                )}
                <p
                  style={{
                    color: "#6B7280",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    maxWidth: 220,
                  }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
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

        {/* Why we built this */}
        <section style={{ backgroundColor: "#FAF7F2", padding: "80px 24px" }}>
          <div className="mx-auto text-center" style={{ maxWidth: 560 }}>
            <span
              style={{
                color: "#0D9488",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                fontWeight: 600,
              }}
            >
              OUR STORY
            </span>
            <h2
              className="mx-auto font-bold"
              style={{ color: "#1A1A2E", fontSize: "2.25rem", maxWidth: 560, marginTop: 16 }}
            >
              The best LSAT resources are free. The problem is finding the right one.
            </h2>
          </div>
          <div
            className="mx-auto mt-8 text-center"
            style={{ maxWidth: 560, color: "#4B5563", fontSize: "1rem", lineHeight: 1.8 }}
          >
            <p>
              7Sage walkthroughs. Khan Academy modules. Reddit strategy threads. YouTube breakdowns. The resources that have helped students go from 152 to 176 are out there — and they're completely free.
            </p>
            <p className="mt-5">
              The problem is that there are thousands of them and no system matching the right resource to the right student at the right plateau. A student stuck at 158 on Logic Games needs different material than a student stuck at 168. Both end up searching the same forums and getting the same generic advice.
            </p>
            <p className="mt-5" style={{ color: "#0D9488", fontStyle: "italic" }}>
              Briefly Brilliant was built to fix that. Every score movement reported back to the platform makes the matching smarter. The students who come after you benefit from every resource you complete — and every one you skip.
            </p>
          </div>
          <div className="mx-auto mt-10 flex items-center justify-center gap-6 text-center">
            {[
              { n: "6 min", l: "avg. quiz time" },
              { n: "300+", l: "curated sources" },
              { n: "Free", l: "to get started" },
            ].map((s, i) => (
              <div key={s.l} className="flex items-center gap-6">
                {i > 0 && <span style={{ color: "#D1D5DB" }}>|</span>}
                <div>
                  <div
                    style={{
                      color: "#1A1A2E",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ color: "#6B7280", fontSize: "0.8rem" }}>{s.l}</div>
                </div>
              </div>
            ))}
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
                  title: "Worth It? Meter",
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
                Full access for 30 days
              </p>
              <hr className="my-5" style={{ borderColor: "#E5E7EB" }} />
              <p style={{ color: "#1A1A2E", fontSize: "0.85rem", fontWeight: 600 }}>
                What's included:
              </p>
              <ul className="mt-3 space-y-1" style={{ lineHeight: 1.8 }}>
                {["Resource Matching", "Score Journey Stories", "Worth It? Meter"].map((i) => (
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
                $249
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
                  "Personalized Study Sequence",
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

      {/* Resource Library */}
      <section style={{ backgroundColor: "#FAF7F2", padding: "72px 24px" }}>
        <div className="text-center">
          <h2
            className="font-bold"
            style={{ color: "#1A1A2E", fontSize: "1.75rem" }}
          >
            300+ resources. All in one place.
          </h2>
          <p
            className="mx-auto mt-3"
            style={{ color: "#6B7280", fontSize: "0.9rem", maxWidth: 600 }}
          >
            We've curated the highest-rated free and paid LSAT study sources — scored and ranked by students who used them to break through.
          </p>
        </div>
        <div className="text-center mt-10">
          <div
            style={{
              color: "#1A1A2E",
              fontSize: "5rem",
              fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              lineHeight: 1,
            }}
          >
            300+
          </div>
          <div className="mt-2" style={{ color: "#6B7280", fontSize: "0.85rem" }}>
            curated sources, growing every month
          </div>
        </div>
        <style>{`
          @keyframes marquee-left {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            from { transform: translateX(-50%); }
            to   { transform: translateX(0); }
          }
          .marquee-track {
            overflow: hidden;
            mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 8%, rgb(0,0,0) 92%, rgba(0,0,0,0) 100%);
            -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 8%, rgb(0,0,0) 92%, rgba(0,0,0,0) 100%);
          }
          .marquee-inner { display: flex; width: max-content; will-change: transform; }
          .marquee-inner-left  { animation: marquee-left  linear infinite; }
          .marquee-inner-right { animation: marquee-right linear infinite; }
          .marquee-track:hover .marquee-inner { animation-play-state: paused; }
          .marquee-pill {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 99px;
            padding: 8px 18px;
            font-size: 0.875rem;
            color: #1A1A2E;
            white-space: nowrap;
            margin: 0 8px;
          }
        `}</style>
        <div className="flex flex-col" style={{ gap: 16, margin: "32px 0" }}>
          {[
            {
              dir: "left" as const,
              duration: 35,
              items: ["LSAT Demon","7Sage","Blueprint LSAT","PowerScore","Manhattan Prep","Kaplan Test Prep","Magoosh","LSATMax","TestMasters","Princeton Review","PrepScholar","Target Test Prep","Law School Admission Council (LSAC)","LawHub","Khan Academy LSAT"],
            },
            {
              dir: "right" as const,
              duration: 50,
              items: ["The LSAT Trainer","The Loophole in LSAT Logical Reasoning","PowerScore LSAT Bible Series","LSAT Lab","LSAT Unplugged","LSAT Blog","Varsity Tutors","Wyzant","JD Advising","7Sage YouTube","LSAT Demon YouTube","Blueprint LSAT YouTube","7Sage Podcast","LSAT Demon Daily Podcast","LSAT Unplugged Podcast"],
            },
            {
              dir: "left" as const,
              duration: 40,
              items: ["7Sage Analytics System","Blueprint Live Classes","Manhattan Prep LSAT Curriculum","Kaplan LSAT Course","Princeton Review LSAT Course","Magoosh LSAT Course","LSATMax Mobile App","TestMasters Advanced Course","PrepScholar Adaptive LSAT","Target Test Prep LSAT","LSAC Official PrepTests","LSAT Section Drills (LawHub)","7Sage PrepTests Explanations","PowerScore Forums","Reddit r/LSAT"],
            },
          ].map((row, i) => (
            <div key={i} className="marquee-track">
              <div
                className={`marquee-inner marquee-inner-${row.dir}`}
                style={{ animationDuration: `${row.duration}s` }}
              >
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex" aria-hidden={copy === 1}>
                    {row.items.map((p, idx) => (
                      <span key={`${copy}-${idx}`} className="marquee-pill">{p}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center mt-8" style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>
          New sources added as the community validates them.
        </p>
      </section>

      {/* Final CTA */}
      <section style={{ backgroundColor: "#FAF7F2", padding: "64px 24px" }}>
        <div
          className="mx-auto relative overflow-hidden"
          style={{
            maxWidth: 900,
            borderRadius: 24,
            padding: "72px 48px",
            background:
              "linear-gradient(160deg, #A8D8EA 0%, #C8E6C9 20%, #F9E4B7 45%, #FFCCBC 65%, #B2EBF2 85%, #A5D6A7 100%)",
          }}
        >
          <div className="text-center">
            <h2
              className="font-bold mx-auto"
              style={{ color: "#1A1A2E", fontSize: "2.75rem", lineHeight: 1.2, maxWidth: 720 }}
            >
              Your breakthrough resource is already out there.
            </h2>
            <p
              className="mx-auto"
              style={{ color: "#374151", fontSize: "1rem", marginTop: 12, maxWidth: 420 }}
            >
              Take the 5-minute quiz. Get matched to what actually worked for students at your plateau. Free to start.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/quiz");
              }}
              className="mx-auto mt-8 flex items-center bg-white"
              style={{
                maxWidth: 420,
                borderRadius: 99,
                padding: "6px 6px 6px 20px",
              }}
            >
              <input
                type="email"
                required
                placeholder="your_email@gmail.com"
                className="flex-1 bg-transparent outline-none border-0"
                style={{ fontSize: "0.95rem" }}
              />
              <button
                type="submit"
                className="flex items-center justify-center"
                style={{
                  backgroundColor: "#1A1A2E",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                }}
                aria-label="Submit"
              >
                <ArrowUpRight className="h-5 w-5 text-white" />
              </button>
            </form>
          </div>
        </div>
        <div
          className="mx-auto mt-10 flex items-center justify-between px-2"
          style={{ maxWidth: 900 }}
        >
          <span
            style={{
              color: "#1A1A2E",
              fontSize: "1rem",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Briefly Brilliant
          </span>
          <span style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>
            © 2026 Briefly Brilliant. All rights reserved.
          </span>
        </div>
      </section>
    </div>
  );
};

export default Index;

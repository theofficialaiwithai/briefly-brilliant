import { Link } from "react-router-dom";
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
    icon: Target,
    title: "Score-matched resources",
    body: "Every recommendation is calibrated to where you actually are — not where you want to be.",
  },
  {
    icon: Users,
    title: "Community-powered rankings",
    body: "Resources rise to the top based on what students at your score range report actually working.",
  },
  {
    icon: Tag,
    title: "Free and paid, all in one place",
    body: "Filter by budget. From free Reddit threads to full prep courses — ranked by what gets results.",
  },
  {
    icon: RefreshCw,
    title: "Skips teach the algorithm too",
    body: "Resources students skip are as informative as ones they complete. The matching gets smarter with every interaction.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link
          to="/quiz"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Get started
        </Link>
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
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base shadow-card">
              <Link to="/quiz">
                Find My Resources
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
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

        {/* Section B — Features */}
        <section
          className="px-6 pb-24"
          style={{ backgroundColor: "#FAFAF8" }}
        >
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: "#0D9488" }}
              >
                Features
              </span>
              <h2
                className="mt-4 text-3xl font-bold leading-tight md:text-4xl"
                style={{ color: "#1A1A2E" }}
              >
                Everything you need to find your breakthrough resource.
              </h2>
              <p className="mt-5 text-base text-muted-foreground">
                The best LSAT study content already exists. Briefly Brilliant is the
                layer that finally makes it findable.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border bg-white p-6 shadow-card"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#EDE9FE" }}
                  >
                    <f.icon className="h-5 w-5" style={{ color: "#7C6FF7" }} />
                  </span>
                  <h3
                    className="mt-5 text-base font-bold"
                    style={{ color: "#1A1A2E" }}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              ))}
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

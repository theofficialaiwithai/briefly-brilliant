import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const steps = [
  {
    icon: ClipboardList,
    title: "Tell us your score",
    body: "Enter your current practice score and where you're stuck.",
  },
  {
    icon: Sparkles,
    title: "Get matched",
    body: "We surface the resources that worked for students at your exact plateau.",
  },
  {
    icon: TrendingUp,
    title: "Report your progress",
    body: "Every score movement makes the recommendations smarter for everyone.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link
          to="/onboarding"
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
              <Link to="/onboarding">
                Find My Resources
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="group rounded-2xl border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
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

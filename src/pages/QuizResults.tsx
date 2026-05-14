import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

type Recommendation = {
  rank: number;
  resource_name: string;
  category: string;
  url: string;
  price_range: string;
  section_focus: string;
  why_this_fits_you: string;
};

type SectionFilter = "All" | "LR" | "RC";
type CostFilter = "All" | "Free" | "Paid";

const isFree = (priceRange: string) => /free/i.test(priceRange) || /^\$?0\b/.test(priceRange);

const matchesSection = (sectionFocus: string, filter: SectionFilter) => {
  if (filter === "All") return true;
  const s = sectionFocus.toLowerCase();
  if (filter === "LR") return s.includes("lr") || s.includes("logical reasoning") || s === "all";
  if (filter === "RC") return s.includes("rc") || s.includes("reading") || s === "all";
  return true;
};

const QuizResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { recommendations?: Recommendation[]; error?: string }
    | null;
  const recommendations = state?.recommendations ?? [];
  const hadError = Boolean(state?.error);

  const [sectionF, setSectionF] = useState<SectionFilter>("All");
  const [costF, setCostF] = useState<CostFilter>("All");

  const filtered = useMemo(
    () =>
      recommendations.filter((r) => {
        if (!matchesSection(r.section_focus, sectionF)) return false;
        if (costF === "Free" && !isFree(r.price_range)) return false;
        if (costF === "Paid" && isFree(r.price_range)) return false;
        return true;
      }),
    [recommendations, sectionF, costF]
  );

  if (hadError || recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO
          title="Your matched LSAT resources — Briefly Brilliant"
          description="Personalized LSAT resource recommendations based on your score, target, and study style."
          path="/quiz/results"
        />
        <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Logo />
        </header>
        <main className="mx-auto max-w-2xl px-6 pt-24 pb-24 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            We had trouble loading your results
          </h1>
          <p className="mt-3 text-muted-foreground">Please retake the quiz.</p>
          <Button
            size="lg"
            onClick={() => navigate("/quiz")}
            className="mt-8 h-12 rounded-xl px-6"
          >
            Retake the quiz
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </main>
      </div>
    );
  }

  const FilterPill = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Your matched LSAT resources — Briefly Brilliant"
        description="Personalized LSAT resource recommendations based on your score, target, and study style."
        path="/quiz/results"
      />
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <Link to="/quiz" className="text-sm text-muted-foreground hover:text-foreground">
            Retake quiz
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Your top matched resources
        </h1>
        <p className="mt-2 text-muted-foreground">
          Personalized based on your score, timeline, budget, and learning style.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
          <aside className="md:sticky md:top-6 md:self-start">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Section
              </h2>
              <div className="mt-2 grid gap-2">
                <FilterPill active={sectionF === "All"} onClick={() => setSectionF("All")}>
                  All
                </FilterPill>
                <FilterPill active={sectionF === "LR"} onClick={() => setSectionF("LR")}>
                  LR
                </FilterPill>
                <FilterPill active={sectionF === "RC"} onClick={() => setSectionF("RC")}>
                  RC
                </FilterPill>
              </div>
              <h2 className="mt-6 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cost
              </h2>
              <div className="mt-2 grid gap-2">
                <FilterPill active={costF === "All"} onClick={() => setCostF("All")}>
                  All
                </FilterPill>
                <FilterPill active={costF === "Free"} onClick={() => setCostF("Free")}>
                  Free
                </FilterPill>
                <FilterPill active={costF === "Paid"} onClick={() => setCostF("Paid")}>
                  Paid
                </FilterPill>
              </div>
            </div>
          </aside>

          <ol className="grid gap-4">
            {filtered.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
                No recommendations match these filters.
              </li>
            )}
            {filtered.map((r) => {
              const free = isFree(r.price_range);
              return (
                <li
                  key={r.rank}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                        #{r.rank}
                      </span>
                      <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                        {r.resource_name}
                      </h2>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                        free
                          ? "bg-[hsl(140_50%_94%)] text-[hsl(140_55%_28%)]"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {r.price_range}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-primary-soft px-3 py-1 font-medium text-primary">
                      {r.category}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
                      {r.section_focus}
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl bg-muted/40 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Why this fits you
                    </div>
                    <p className="mt-1.5 text-sm italic leading-relaxed text-foreground/80">
                      {r.why_this_fits_you}
                    </p>
                  </div>

                  <div className="mt-5">
                    <Button asChild className="h-11 rounded-xl px-5">
                      <a href={r.url} target="_blank" rel="noreferrer">
                        Visit Resource
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </main>
    </div>
  );
};

export default QuizResults;
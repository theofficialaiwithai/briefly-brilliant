import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

type Recommendation = {
  rank: number;
  resource_name: string;
  category: string;
  url: string;
  price_range: string;
  section_focus: string;
  why_this_fits_you: string;
};

const QuizResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const recommendations =
    (location.state as { recommendations?: Recommendation[] } | null)?.recommendations ?? [];

  if (recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Logo />
        </header>
        <main className="mx-auto max-w-2xl px-6 pt-24 pb-24 text-center">
          <h1 className="text-3xl font-bold tracking-tight">No recommendations yet</h1>
          <p className="mt-3 text-muted-foreground">
            Take the quiz to get personalized resources.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/quiz")}
            className="mt-8 h-12 rounded-xl px-6"
          >
            Start the quiz
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          Home
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Your top {recommendations.length} matched resources
        </h1>
        <p className="mt-3 text-muted-foreground">
          Personalized based on your score, timeline, budget, and learning style.
        </p>

        <ol className="mt-8 grid gap-4">
          {recommendations.map((r) => (
            <li
              key={r.rank}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {r.rank}
                  </span>
                  <h2 className="text-xl font-semibold">{r.resource_name}</h2>
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Visit
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                  {r.category}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                  {r.section_focus}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                  {r.price_range}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                {r.why_this_fits_you}
              </p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
};

export default QuizResults;
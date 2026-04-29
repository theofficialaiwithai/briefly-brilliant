import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Check, Clock, SkipForward, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { SEED_RESOURCES, Resource, loadStudyState, sourceClasses } from "@/lib/study";
import { cn } from "@/lib/utils";

type CardStatus = "idle" | "completed" | "skipped" | "saved";
type MoveAnswer = "yes" | "little" | "not-yet";

const ResourceCard = ({ r }: { r: Resource }) => {
  const [status, setStatus] = useState<CardStatus>("idle");
  const [move, setMove] = useState<MoveAnswer | null>(null);

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-card transition-all",
        status !== "idle" && "opacity-95"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            sourceClasses(r.source)
          )}
        >
          {r.source}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {r.time}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">{r.title}</h3>
      <p className="mt-2 text-sm italic text-primary">{r.reason}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant={status === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatus("completed")}
          className="rounded-lg"
        >
          <Check className="mr-1 h-4 w-4" />
          Completed
        </Button>
        <Button
          variant={status === "skipped" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatus("skipped")}
          className="rounded-lg"
        >
          <SkipForward className="mr-1 h-4 w-4" />
          Skip
        </Button>
        <Button
          variant={status === "saved" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatus("saved")}
          className="rounded-lg"
        >
          <Bookmark className="mr-1 h-4 w-4" />
          Save
        </Button>
      </div>

      {status === "completed" && (
        <div className="mt-5 rounded-xl border border-border bg-primary-soft/60 p-4">
          {move === null ? (
            <>
              <p className="text-sm font-medium text-foreground">Did your score move?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    { v: "yes", label: "Yes" },
                    { v: "little", label: "A little" },
                    { v: "not-yet", label: "Not yet" },
                  ] as { v: MoveAnswer; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setMove(opt.v)}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Thanks — that signal helps the next student.
            </p>
          )}
        </div>
      )}
    </article>
  );
};

const Feed = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<ReturnType<typeof loadStudyState>>(null);

  useEffect(() => {
    const s = loadStudyState();
    if (!s) {
      navigate("/onboarding", { replace: true });
      return;
    }
    setState(s);
  }, [navigate]);

  if (!state) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Logo />
        <Link
          to="/onboarding"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Edit answers
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <section className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Your Score-Matched Resources
          </h1>
          <p className="mt-3 text-muted-foreground">
            Curated for students at{" "}
            <span className="font-semibold text-foreground">{state.score}</span> working on{" "}
            <span className="font-semibold text-foreground">{state.section}</span>
            {state.subtype && (
              <>
                {" "}
                — <span className="text-primary">{state.subtype}</span>
              </>
            )}
            .
          </p>
        </section>

        <div className="grid gap-4">
          {SEED_RESOURCES.map((r) => (
            <ResourceCard key={r.id} r={r} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Feed;
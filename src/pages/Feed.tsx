import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Check,
  ChevronUp,
  Clock,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  SEED_RESOURCES,
  Resource,
  Section,
  ResourceType,
  Source,
  ScoreBand,
  loadQuizState,
  scoreToBand,
  sourceClasses,
} from "@/lib/study";
import { cn } from "@/lib/utils";

type CardStatus = "idle" | "completed" | "skipped" | "saved";
type MoveAnswer = "yes" | "little" | "not-yet";

type SectionFilter = "All" | Section;
type TypeFilter = "All" | ResourceType;
type SourceFilter = "All" | Source;
type BandFilter = "All" | ScoreBand;
type Sort = "upvotes" | "newest" | "beginner";

const SECTION_FILTERS: SectionFilter[] = [
  "All",
  "Logical Reasoning",
  "Logic Games",
  "Reading Comprehension",
];
const TYPE_FILTERS: TypeFilter[] = ["All", "Free", "Paid"];
const SOURCE_FILTERS: SourceFilter[] = [
  "All",
  "7Sage",
  "Khan Academy",
  "LSAT Demon",
  "YouTube",
  "Reddit",
  "PowerScore",
  "Blueprint",
];
const BAND_FILTERS: BandFilter[] = [
  "All",
  "120-149",
  "150-159",
  "160-169",
  "170-180",
];

const bandLabel = (b: BandFilter) => (b === "All" ? "All" : b.replace("-", "–"));

function resourceBand(r: Resource): ScoreBand[] {
  const bands: ScoreBand[] = [];
  if (r.scoreMin <= 149) bands.push("120-149");
  if (r.scoreMax >= 150 && r.scoreMin <= 159) bands.push("150-159");
  if (r.scoreMax >= 160 && r.scoreMin <= 169) bands.push("160-169");
  if (r.scoreMax >= 170) bands.push("170-180");
  return bands;
}

const FilterGroup = ({
  label,
  options,
  value,
  onChange,
  format,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  format?: (v: string) => string;
}) => (
  <div>
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </h3>
    <div className="flex flex-col gap-1">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
              active
                ? "bg-primary-soft font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {format ? format(o) : o}
          </button>
        );
      })}
    </div>
  </div>
);

const ResourceRow = ({ r }: { r: Resource }) => {
  const [upvoted, setUpvoted] = useState(false);
  const [status, setStatus] = useState<CardStatus>("idle");
  const [move, setMove] = useState<MoveAnswer | null>(null);

  const bandText = `${r.scoreMin}–${r.scoreMax}`;

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover">
      <div className="flex gap-4">
        {/* Upvote */}
        <button
          onClick={() => setUpvoted((u) => !u)}
          className={cn(
            "flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border transition-all",
            upvoted
              ? "border-primary bg-primary-soft text-primary"
              : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
          )}
          aria-label="Upvote"
        >
          <ChevronUp className={cn("h-5 w-5", upvoted && "fill-current")} />
          <span className="text-sm font-semibold tabular-nums">
            {r.upvotes + (upvoted ? 1 : 0)}
          </span>
        </button>

        {/* Middle */}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-foreground">
            {r.title}
          </h3>
          <p className="mt-1 text-sm italic text-primary">{r.reason}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                sourceClasses(r.source)
              )}
            >
              {r.source}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                r.type === "Free"
                  ? "bg-[hsl(140_50%_94%)] text-[hsl(140_55%_28%)]"
                  : "bg-muted text-foreground"
              )}
            >
              {r.type}
              {r.type === "Paid" && r.price ? ` · $${r.price}` : ""}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {bandText}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {r.section}
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {r.time}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            onClick={() => setStatus("completed")}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
              status === "completed"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
            title="Completed"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => setStatus("skipped")}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
              status === "skipped"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
            title="Skip"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            onClick={() => setStatus("saved")}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
              status === "saved"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
            title="Save"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>

      {status === "completed" && (
        <div className="mt-4 rounded-xl border border-border bg-primary-soft/60 p-3">
          {move === null ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-foreground">
                Did your score move?
              </p>
              <div className="flex flex-wrap gap-2">
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
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
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
  const quiz = useMemo(() => loadQuizState(), []);

  // Pre-apply filters from quiz state
  const initialSection: SectionFilter = quiz?.section ?? "All";
  const initialBand: BandFilter = quiz ? scoreToBand(quiz.currentScore) : "All";
  const initialType: TypeFilter =
    quiz?.budget === "free" ? "Free" : "All";

  const [sectionF, setSectionF] = useState<SectionFilter>(initialSection);
  const [typeF, setTypeF] = useState<TypeFilter>(initialType);
  const [sourceF, setSourceF] = useState<SourceFilter>("All");
  const [bandF, setBandF] = useState<BandFilter>(initialBand);
  const [sort, setSort] = useState<Sort>("upvotes");

  useEffect(() => {
    if (!quiz) {
      navigate("/quiz", { replace: true });
    }
  }, [quiz, navigate]);

  const filtered = useMemo(() => {
    let list = SEED_RESOURCES.filter((r) => {
      if (sectionF !== "All" && r.section !== sectionF && r.section !== "All")
        return false;
      if (typeF !== "All" && r.type !== typeF) return false;
      // Budget cap from quiz
      if (quiz && r.type === "Paid") {
        if (quiz.budget === "free") return false;
        if (quiz.budget === "50" && (r.price ?? 0) > 50) return false;
        if (quiz.budget === "200" && (r.price ?? 0) > 200) return false;
      }
      if (sourceF !== "All" && r.source !== sourceF) return false;
      if (bandF !== "All" && !resourceBand(r).includes(bandF)) return false;
      return true;
    });

    if (sort === "upvotes") list = [...list].sort((a, b) => b.upvotes - a.upvotes);
    if (sort === "newest") list = [...list].sort((a, b) => Number(b.id) - Number(a.id));
    if (sort === "beginner")
      list = [...list].sort((a, b) => a.scoreMin - b.scoreMin);

    return list;
  }, [sectionF, typeF, sourceF, bandF, sort, quiz]);

  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <Link
            to="/quiz"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Retake quiz
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Your Score-Matched Resources
          </h1>
          <p className="mt-2 text-muted-foreground">
            Curated for{" "}
            <span className="font-semibold text-foreground">{quiz.currentScore}</span>{" "}
            → <span className="font-semibold text-foreground">{quiz.targetScore}</span>{" "}
            on <span className="font-semibold text-foreground">{quiz.section}</span>.
          </p>
        </section>

        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6 md:sticky md:top-6 md:self-start">
            <FilterGroup
              label="Section"
              options={SECTION_FILTERS}
              value={sectionF}
              onChange={(v) => setSectionF(v as SectionFilter)}
            />
            <FilterGroup
              label="Resource Type"
              options={TYPE_FILTERS}
              value={typeF}
              onChange={(v) => setTypeF(v as TypeFilter)}
            />
            <FilterGroup
              label="Source"
              options={SOURCE_FILTERS}
              value={sourceF}
              onChange={(v) => setSourceF(v as SourceFilter)}
            />
            <FilterGroup
              label="Score Range"
              options={BAND_FILTERS}
              value={bandF}
              onChange={(v) => setBandF(v as BandFilter)}
              format={bandLabel}
            />
          </aside>

          {/* Main */}
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {filtered.length}
                </span>{" "}
                resource{filtered.length === 1 ? "" : "s"} matched
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="mr-1 text-muted-foreground">Sort by:</span>
                {(
                  [
                    { v: "upvotes", label: "Most Upvoted" },
                    { v: "newest", label: "Newest" },
                    { v: "beginner", label: "Best for Beginners" },
                  ] as { v: Sort; label: string }[]
                ).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setSort(o.v)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      sort === o.v
                        ? "bg-primary-soft text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No resources match these filters. Try widening your search.
                  </p>
                </div>
              ) : (
                filtered.map((r) => <ResourceRow key={r.id} r={r} />)
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feed;

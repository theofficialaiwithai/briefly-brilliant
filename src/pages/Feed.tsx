import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Check,
  ChevronUp,
  Clock,
  Loader2,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";
import {
  Resource,
  Section,
  ResourceType,
  Source,
  ScoreBand,
  loadQuizState,
  scoreToBand,
  sourceClasses,
} from "@/lib/study";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// ── DB → Resource mapping ────────────────────────────────────────────────────

type DbRow = {
  id: string;
  resource_name: string | null;
  category: string | null;
  section_focus: string | null;
  cost_type: string | null;
  price_range: string | null;
  best_score_range: string | null;
  weekly_hours: string | null;
  description: string | null;
};

function mapSection(sf: string | null): Section | "All" {
  switch (sf) {
    case "LR": return "Logical Reasoning";
    case "RC": return "Reading Comprehension";
    case "LG (Legacy)": return "Logic Games";
    default: return "All";
  }
}

function parseScoreRange(range: string | null): { min: number; max: number } {
  const nums = (range ?? "").match(/\d+/g);
  if (!nums || nums.length < 2) return { min: 120, max: 180 };
  return { min: parseInt(nums[0]), max: parseInt(nums[1]) };
}

function parsePrice(priceRange: string | null): number {
  const match = (priceRange ?? "").match(/\$?([\d,]+)/);
  return match ? parseInt(match[1].replace(",", "")) : 0;
}

function mapRow(row: DbRow): Resource {
  const { min, max } = parseScoreRange(row.best_score_range);
  return {
    id: row.id,
    title: row.resource_name ?? "Untitled",
    source: (row.category ?? "Other") as Source,
    reason: row.description ?? "",
    time: row.weekly_hours ?? "Varies",
    type: row.cost_type === "Paid" ? "Paid" : "Free",
    price: parsePrice(row.price_range),
    scoreMin: min,
    scoreMax: max,
    section: mapSection(row.section_focus),
    upvotes: 0,
  };
}

type CardStatus = "idle" | "completed" | "skipped" | "saved";
type MoveAnswer = "yes" | "little" | "not-yet";

type SectionFilter = "All" | Section;
type TypeFilter = "All" | ResourceType;
type SourceFilter = "All" | Source;
type BandFilter = "All" | ScoreBand;
type Sort = "upvotes" | "newest" | "beginner";

const WORTH_IT: Record<string, { pct: number; count: number }> = {
  "1": { pct: 91, count: 214 },
  "2": { pct: 88, count: 189 },
  "3": { pct: 85, count: 163 },
  "4": { pct: 79, count: 301 },
  "5": { pct: 83, count: 147 },
  "6": { pct: 87, count: 412 },
  "7": { pct: 82, count: 276 },
  "8": { pct: 90, count: 534 },
};

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
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </h2>
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
          <h2 className="text-base font-semibold leading-snug text-foreground">
            {r.title}
          </h2>
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
            aria-label="Mark as completed"
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
            aria-label="Skip resource"
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
            aria-label="Save resource"
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

      {WORTH_IT[r.id] && (
        <div className="mt-4 border-t border-[#E5E7EB] pt-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Worth it?</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${WORTH_IT[r.id].pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {WORTH_IT[r.id].pct}%
            </span>
            <span className="text-xs text-muted-foreground/80 tabular-nums">
              ({WORTH_IT[r.id].count} students)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            Rated by students at this score range
          </p>
        </div>
      )}
    </article>
  );
};

const Feed = () => {
  const quiz = useMemo(() => loadQuizState(), []);

  // Pre-apply filters from quiz state if available
  const KNOWN_SECTIONS: Section[] = [
    "Logical Reasoning",
    "Logic Games",
    "Reading Comprehension",
  ];
  const initialSection: SectionFilter =
    quiz && KNOWN_SECTIONS.includes(quiz.section as Section)
      ? (quiz.section as Section)
      : "All";
  const initialBand: BandFilter =
    quiz && typeof quiz.currentScore === "number"
      ? scoreToBand(quiz.currentScore)
      : "All";
  const initialType: TypeFilter =
    quiz?.budget === "free" ? "Free" : "All";

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [sectionF, setSectionF] = useState<SectionFilter>(initialSection);
  const [typeF, setTypeF] = useState<TypeFilter>(initialType);
  const [sourceF, setSourceF] = useState<SourceFilter>("All");
  const [bandF, setBandF] = useState<BandFilter>(initialBand);
  const [sort, setSort] = useState<Sort>("upvotes");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("lsat_resources")
      .select("id, resource_name, category, section_focus, cost_type, price_range, best_score_range, weekly_hours, description")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setFetchError(true);
        } else {
          setResources(data.map(mapRow));
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = resources.filter((r) => {
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
    if (sort === "newest") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "beginner")
      list = [...list].sort((a, b) => a.scoreMin - b.scoreMin);

    return list;
  }, [resources, sectionF, typeF, sourceF, bandF, sort, quiz]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Your score-matched LSAT resources — Briefly Brilliant"
        description="Curated LSAT study resources tailored to your current score, target, and weakest section."
        path="/feed"
      />
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/feed" className="hover:text-foreground">Feed</Link>
            <Link to="/stories" className="hover:text-foreground">Stories</Link>
            <Link to="/groups" className="hover:text-foreground">Study Groups</Link>
            <Link to="/quiz" className="hover:text-foreground">Retake quiz</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Your Score-Matched Resources
          </h1>
          <p className="mt-2 text-muted-foreground">
            {quiz ? (
              <>
                Curated for{" "}
                <span className="font-semibold text-foreground">{quiz.currentScore}</span>{" "}
                →{" "}
                <span className="font-semibold text-foreground">{quiz.targetScore}</span>{" "}
                on{" "}
                <span className="font-semibold text-foreground">{quiz.section}</span>.
              </>
            ) : (
              <>
                All LSAT resources —{" "}
                <Link to="/quiz" className="font-semibold text-primary underline-offset-2 hover:underline">
                  take the quiz
                </Link>{" "}
                to get personalized recommendations.
              </>
            )}
          </p>
          {fetchError && (
            <p className="mt-2 text-sm text-destructive">
              Some resources couldn't be loaded. Showing what we have.
            </p>
          )}
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

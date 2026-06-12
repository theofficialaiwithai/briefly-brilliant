import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Check,
  ChevronUp,
  Clock,
  Loader2,
  SlidersHorizontal,
  SkipForward,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";
import { Resource, Section, Source, loadQuizState, sourceClasses } from "@/lib/study";
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

// ── Types ────────────────────────────────────────────────────────────────────

type CardStatus = "idle" | "completed" | "skipped" | "saved";
type MoveAnswer = "yes" | "little" | "not-yet";
type Sort = "best" | "upvotes" | "beginner";

type Filters = {
  sort: Sort;
  scoreMin: number;
  scoreMax: number;
  categories: string[];
  maxBudget: number;   // 0 = free only, 200 = any
  sections: string[]; // "Logical Reasoning" | "Logic Games" | "Reading Comprehension" | "General"
};

// ── Constants ────────────────────────────────────────────────────────────────

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

const CATEGORY_CHIPS = [
  "Platform", "Book", "YouTube", "App",
  "Podcast", "Blog", "Strategy", "Official",
];

const SECTION_CHIPS = [
  "Logical Reasoning",
  "Logic Games",
  "Reading Comprehension",
  "General",
];

const SORT_OPTIONS: { v: Sort; label: string }[] = [
  { v: "best", label: "Best Match" },
  { v: "upvotes", label: "Most Popular" },
  { v: "beginner", label: "Best for Beginners" },
];

// ── Scoring ──────────────────────────────────────────────────────────────────

function bestMatchScore(r: Resource, quiz: ReturnType<typeof loadQuizState>): number {
  if (!quiz) return 0;
  let score = 0;

  const rs = r.section;
  const qs = quiz.section;
  if (rs === "All") score += 1;
  else if (qs.toLowerCase() === rs.toLowerCase()) score += 2;

  if (typeof quiz.currentScore === "number") {
    const s = quiz.currentScore;
    if (s >= r.scoreMin && s <= r.scoreMax) {
      score += 2;
    } else {
      const gap = Math.min(Math.abs(s - r.scoreMin), Math.abs(s - r.scoreMax));
      if (gap <= 10) score += 1;
    }
  }

  if (quiz.budget === "free" && r.type === "Free") score += 1;

  return score;
}

// ── Dual Range Slider ────────────────────────────────────────────────────────

const DualRangeSlider = ({
  min, max, valueMin, valueMax, onChange,
}: {
  min: number; max: number;
  valueMin: number; valueMax: number;
  onChange: (min: number, max: number) => void;
}) => {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const minPct = pct(valueMin);
  const maxPct = pct(valueMax);

  return (
    <div className="relative py-4">
      {/* Track */}
      <div className="relative h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="absolute h-full rounded-full"
          style={{ background: "#0D9488", left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
      </div>
      {/* Invisible inputs for interaction */}
      <input
        type="range" min={min} max={max} value={valueMin}
        onChange={(e) => onChange(Math.min(+e.target.value, valueMax - 1), valueMax)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        style={{ zIndex: valueMin > max * 0.6 ? 5 : 3 }}
      />
      <input
        type="range" min={min} max={max} value={valueMax}
        onChange={(e) => onChange(valueMin, Math.max(+e.target.value, valueMin + 1))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        style={{ zIndex: 4 }}
      />
      {/* Visual thumbs */}
      <div
        className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow"
        style={{ borderColor: "#0D9488", left: `${minPct}%` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow"
        style={{ borderColor: "#0D9488", left: `${maxPct}%` }}
      />
    </div>
  );
};

// ── Single Range Slider ──────────────────────────────────────────────────────

const SingleRangeSlider = ({
  min, max, value, onChange,
}: {
  min: number; max: number; value: number;
  onChange: (v: number) => void;
}) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative py-4">
      <div className="relative h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="absolute left-0 h-full rounded-full"
          style={{ background: "#0D9488", width: `${pct}%` }}
        />
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        style={{ zIndex: 3 }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow"
        style={{ borderColor: "#0D9488", left: `${pct}%` }}
      />
    </div>
  );
};

// ── Filter Modal ─────────────────────────────────────────────────────────────

const FilterModal = ({
  open,
  initial,
  defaultSort,
  onApply,
  onClose,
}: {
  open: boolean;
  initial: Filters;
  defaultSort: Sort;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) => {
  const [f, setF] = useState<Filters>(initial);

  // Sync pending state when modal opens
  useState(() => { if (open) setF(initial); });
  useEffect(() => { if (open) setF(initial); }, [open]);

  if (!open) return null;

  const update = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }));

  const toggleChip = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const budgetLabel = (v: number) => {
    if (v === 0) return "Free only";
    if (v >= 200) return "Any budget";
    return `Up to $${v}`;
  };

  const clearAll = () =>
    setF({ sort: defaultSort, scoreMin: 120, scoreMax: 180, categories: [], maxBudget: 200, sections: [] });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex w-full max-w-[540px] flex-col overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="w-8" />
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto">
          <div className="space-y-0 divide-y divide-gray-100">

            {/* Sort */}
            <div className="px-6 py-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Sort by</h3>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.v}
                    onClick={() => update({ sort: o.v })}
                    className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                    style={
                      f.sort === o.v
                        ? { background: "#1A1A2E", color: "#fff" }
                        : { background: "#fff", color: "#4B5563", border: "1px solid #E5E7EB" }
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Range */}
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900">Your Score Range</h3>
              <p className="mt-0.5 text-xs text-gray-400">Show resources designed for this bracket</p>
              <div className="mt-3">
                <DualRangeSlider
                  min={120} max={180}
                  valueMin={f.scoreMin} valueMax={f.scoreMax}
                  onChange={(min, max) => update({ scoreMin: min, scoreMax: max })}
                />
                <p className="mt-1 text-center text-sm font-semibold" style={{ color: "#0D9488" }}>
                  {f.scoreMin} – {f.scoreMax}
                </p>
              </div>
            </div>

            {/* Resource Type */}
            <div className="px-6 py-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Type</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_CHIPS.map((c) => {
                  const active = f.categories.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => update({ categories: toggleChip(f.categories, c) })}
                      className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
                      style={
                        active
                          ? { background: "#0D9488", color: "#fff" }
                          : { background: "#fff", color: "#374151", border: "1px solid #E5E7EB" }
                      }
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900">Budget</h3>
              <p className="mt-0.5 text-xs text-gray-400">Maximum estimated cost</p>
              <div className="mt-3">
                <SingleRangeSlider
                  min={0} max={200}
                  value={f.maxBudget}
                  onChange={(v) => update({ maxBudget: v })}
                />
                <p className="mt-1 text-center text-sm font-semibold" style={{ color: "#0D9488" }}>
                  {budgetLabel(f.maxBudget)}
                </p>
              </div>
            </div>

            {/* Section Focus */}
            <div className="px-6 py-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Section Focus</h3>
              <div className="flex flex-wrap gap-2">
                {SECTION_CHIPS.map((s) => {
                  const active = f.sections.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => update({ sections: toggleChip(f.sections, s) })}
                      className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
                      style={
                        active
                          ? { background: "#0D9488", color: "#fff" }
                          : { background: "#fff", color: "#374151", border: "1px solid #E5E7EB" }
                      }
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            onClick={clearAll}
            className="text-sm font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
          >
            Clear all
          </button>
          <button
            onClick={() => { onApply(f); onClose(); }}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0D9488" }}
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
};

// ── ResourceRow ──────────────────────────────────────────────────────────────

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

// ── Feed ─────────────────────────────────────────────────────────────────────

const Feed = () => {
  const quiz = useMemo(() => loadQuizState(), []);
  const defaultSort: Sort = quiz ? "best" : "upvotes";

  const makeDefault = (): Filters => ({
    sort: defaultSort,
    scoreMin: 120,
    scoreMax: 180,
    categories: [],
    maxBudget: 200,
    sections: [],
  });

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [applied, setApplied] = useState<Filters>(makeDefault);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("lsat_resources")
      .select("id, resource_name, category, section_focus, cost_type, price_range, best_score_range, weekly_hours, description")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) setFetchError(true);
        else setResources(data.map(mapRow));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = resources.filter((r) => {
      // Score range: resource range must overlap selected range
      if (applied.scoreMin > 120 || applied.scoreMax < 180) {
        if (r.scoreMax < applied.scoreMin || r.scoreMin > applied.scoreMax) return false;
      }

      // Resource type (category)
      if (applied.categories.length > 0 && !applied.categories.includes(r.source as string)) return false;

      // Budget
      if (applied.maxBudget === 0 && r.type !== "Free") return false;
      if (applied.maxBudget > 0 && applied.maxBudget < 200 && r.type === "Paid") {
        if ((r.price ?? 0) > applied.maxBudget) return false;
      }

      // Section focus
      if (applied.sections.length > 0) {
        const specificSections = applied.sections.filter((s) => s !== "General");
        const matchesSpecific = specificSections.includes(r.section as string);
        const isAll = r.section === "All";
        // "All" section resources pass when any specific section is selected (they're universal)
        // "General"-only selection shows only "All" section resources
        if (!matchesSpecific && !isAll) return false;
        if (isAll && specificSections.length === 0 && !applied.sections.includes("General")) return false;
      }

      return true;
    });

    if (applied.sort === "best") {
      if (!quiz) {
        list = [...list].sort((a, b) => b.upvotes - a.upvotes);
      } else {
        list = [...list].sort((a, b) => bestMatchScore(b, quiz) - bestMatchScore(a, quiz));
      }
    } else if (applied.sort === "upvotes") {
      list = [...list].sort((a, b) => b.upvotes - a.upvotes);
    } else if (applied.sort === "beginner") {
      list = [...list].sort((a, b) => {
        if (a.scoreMin !== b.scoreMin) return a.scoreMin - b.scoreMin;
        // Free resources first as tiebreaker
        return (a.type === "Free" ? 0 : 1) - (b.type === "Free" ? 0 : 1);
      });
    }

    return list;
  }, [resources, applied, quiz]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (applied.sort !== defaultSort) n++;
    if (applied.scoreMin > 120 || applied.scoreMax < 180) n++;
    if (applied.categories.length > 0) n++;
    if (applied.maxBudget < 200) n++;
    if (applied.sections.length > 0) n++;
    return n;
  }, [applied, defaultSort]);

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

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10">
        {/* Page heading */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Your Score-Matched Resources
          </h1>
          <p className="mt-2 text-muted-foreground">
            {quiz ? (
              <>
                Curated for{" "}
                <span className="font-semibold text-foreground">{quiz.currentScore}</span>
                {" → "}
                <span className="font-semibold text-foreground">{quiz.targetScore}</span>
                {" on "}
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

        {/* Toolbar */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: "#0D9488" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            resource{filtered.length === 1 ? "" : "s"} matched
          </p>
        </div>

        {/* Resource list */}
        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No resources match these filters. Try widening your search.
              </p>
              <button
                onClick={() => setApplied(makeDefault())}
                className="mt-3 text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filtered.map((r) => <ResourceRow key={r.id} r={r} />)
          )}
        </div>
      </main>

      <FilterModal
        open={modalOpen}
        initial={applied}
        defaultSort={defaultSort}
        onApply={setApplied}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Feed;

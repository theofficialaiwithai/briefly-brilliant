import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";
import { Section } from "@/lib/study";
import { cn } from "@/lib/utils";

type FocusSection = Section | "All Sections";
type Schedule = "Weekdays" | "Weekends" | "Flexible";
type Filter = "All" | Section;

const FILTERS: Filter[] = ["All", "Logical Reasoning", "Logic Games", "Reading Comprehension"];

type Group = {
  id: string;
  name: string;
  members: number;
  focus: FocusSection;
  scoreMin: number;
  scoreMax: number;
  schedule: string;
  description: string;
  avatars: string[];
};

const SEED: Group[] = [
  {
    id: "g1",
    name: "Logic Games Grinders",
    members: 6,
    focus: "Logic Games",
    scoreMin: 152,
    scoreMax: 162,
    schedule: "Weekdays · 1 hr/session",
    description:
      "Working through 7Sage and LSAT Demon drills together. PT every Sunday, debrief on Monday.",
    avatars: ["JL", "MR", "SK", "TP"],
  },
  {
    id: "g2",
    name: "LR Breakthrough Squad",
    members: 4,
    focus: "Logical Reasoning",
    scoreMin: 158,
    scoreMax: 168,
    schedule: "Weekends · 2 hrs/session",
    description:
      "Focused on assumption and weaken questions. Using Khan Academy + Blueprint. Looking for 1–2 more serious students.",
    avatars: ["AR", "BK", "CE", "DW"],
  },
  {
    id: "g3",
    name: "170+ Push Group",
    members: 5,
    focus: "All Sections",
    scoreMin: 165,
    scoreMax: 175,
    schedule: "Flexible · async in Slack",
    description:
      "High-scorers pushing for 170+. Weekly PT breakdowns and accountability check-ins.",
    avatars: ["HN", "JS", "KL", "OT"],
  },
];

const NavBar = () => (
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
);

const GroupCard = ({ g }: { g: Group }) => {
  const [requested, setRequested] = useState(false);
  return (
    <article className="rounded-xl border border-[#E5E7EB] bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-foreground">{g.name}</h3>
        <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
          {g.members} members
        </span>
      </div>
      <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {g.focus}
      </span>
      <p className="mt-2 text-xs text-muted-foreground">
        Score range: {g.scoreMin}–{g.scoreMax}
      </p>
      <p className="text-xs text-muted-foreground">Meets: {g.schedule}</p>
      <p className="mt-3 text-sm text-muted-foreground">{g.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex -space-x-2">
          {g.avatars.slice(0, 4).map((a) => (
            <span
              key={a}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-[#E5E7EB] text-[12px] font-semibold text-foreground"
            >
              {a}
            </span>
          ))}
        </div>
        <button
          onClick={() => setRequested(true)}
          disabled={requested}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
            requested
              ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
              : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          )}
        >
          {requested ? "Requested ✓" : "Request to Join"}
        </button>
      </div>
    </article>
  );
};

const Groups = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const [groups, setGroups] = useState<Group[]>(SEED);

  const [name, setName] = useState("");
  const [min, setMin] = useState(150);
  const [max, setMax] = useState(165);
  const [focus, setFocus] = useState<FocusSection>("Logical Reasoning");
  const [schedule, setSchedule] = useState<Schedule>("Weekdays");
  const [desc, setDesc] = useState("");

  const filtered = useMemo(
    () =>
      filter === "All"
        ? groups
        : groups.filter((g) => g.focus === filter || g.focus === "All Sections"),
    [filter, groups]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setGroups((prev) => [
      {
        id: `u-${Date.now()}`,
        name: name.trim(),
        members: 1,
        focus,
        scoreMin: min,
        scoreMax: max,
        schedule,
        description: desc.trim(),
        avatars: ["YO"],
      },
      ...prev,
    ]);
    setName("");
    setDesc("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Community Study Groups — Briefly Brilliant"
        description="Find LSAT students at your score plateau. Join a study group, share resources, and break through together."
        path="/groups"
      />
      <NavBar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10">
        <h1 className="text-[2rem] font-bold tracking-tight text-foreground">
          Community Study Groups
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find students at your plateau. Study together. Break through together.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((g) => <GroupCard key={g.id} g={g} />)}
        </div>

        <form onSubmit={submit} className="mt-10 rounded-xl bg-[#F3F4F6] p-5">
          <h2 className="text-base font-bold text-foreground">Start a Group</h2>
          <div className="mt-4 grid gap-3">
            <input
              placeholder="Group name"
              aria-label="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-muted-foreground">
                Min score
                <input
                  type="number"
                  min={120}
                  max={180}
                  value={min}
                  onChange={(e) => setMin(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Max score
                <input
                  type="number"
                  min={120}
                  max={180}
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-muted-foreground">
                Focus section
                <select
                  value={focus}
                  onChange={(e) => setFocus(e.target.value as FocusSection)}
                  className="mt-1 block w-full rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
                >
                  <option>Logical Reasoning</option>
                  <option>Logic Games</option>
                  <option>Reading Comprehension</option>
                  <option>All Sections</option>
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Study schedule
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value as Schedule)}
                  className="mt-1 block w-full rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
                >
                  <option>Weekdays</option>
                  <option>Weekends</option>
                  <option>Flexible</option>
                </select>
              </label>
            </div>
            <label className="text-xs font-medium text-muted-foreground">
              Describe your group
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 200))}
                rows={3}
                className="mt-1 block w-full resize-none rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
              />
              <span className="mt-1 block text-right text-[11px] text-muted-foreground">
                {desc.length}/200
              </span>
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Create Group
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Groups;
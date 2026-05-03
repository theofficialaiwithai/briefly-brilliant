import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Section } from "@/lib/study";
import { cn } from "@/lib/utils";

type Filter = "All" | Section;
const FILTERS: Filter[] = ["All", "Logical Reasoning", "Logic Games", "Reading Comprehension"];

type Story = {
  id: string;
  start: number;
  end: number;
  section: Section;
  quote: string;
  resources: string[];
  helpful: number;
};

const SEED: Story[] = [
  {
    id: "s1",
    start: 154,
    end: 167,
    section: "Logic Games",
    quote:
      "I was completely lost on grouping games for months. The 7Sage walkthrough series was the first thing that made the rules feel visual. After two weeks of that and LSAT Demon drills, I hit 167 on my next PT.",
    resources: ["7Sage LG Walkthrough", "LSAT Demon Drills"],
    helpful: 89,
  },
  {
    id: "s2",
    start: 161,
    end: 172,
    section: "Logical Reasoning",
    quote:
      "Khan Academy's assumption module rewired how I read arguments. I went back to it twice. Between that and LSAT Demon, LR stopped being my weakness.",
    resources: ["Khan Academy LR", "LSAT Demon"],
    helpful: 74,
  },
  {
    id: "s3",
    start: 157,
    end: 169,
    section: "Logical Reasoning",
    quote:
      "I plateaued at 157 for three months. Blueprint's LR course broke it — not because the content was new, but because the sequencing helped me see patterns I'd been missing.",
    resources: ["Blueprint LR Course", "Khan Academy"],
    helpful: 48,
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

const StoryCard = ({ s }: { s: Story }) => (
  <article className="rounded-xl border border-[#E5E7EB] bg-card p-5 shadow-card">
    <div className="flex items-center justify-between gap-3">
      <span className="rounded-full bg-[#E1F5EE] px-3 py-1 text-sm font-bold text-primary">
        {s.start} → {s.end}
      </span>
      <span className="rounded-full bg-foreground/90 px-3 py-1 text-xs font-semibold text-background">
        {s.section}
      </span>
    </div>
    <p className="mt-4 text-sm italic leading-relaxed text-muted-foreground">
      "{s.quote}"
    </p>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1.5">
        {s.resources.map((r) => (
          <span key={r} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {r}
          </span>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">↑ {s.helpful} helpful</span>
    </div>
  </article>
);

const Stories = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const [stories, setStories] = useState<Story[]>(SEED);

  const [start, setStart] = useState<number>(150);
  const [end, setEnd] = useState<number>(165);
  const [section, setSection] = useState<Section>("Logical Reasoning");
  const [text, setText] = useState("");

  const filtered = useMemo(
    () => (filter === "All" ? stories : stories.filter((s) => s.section === filter)),
    [filter, stories]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setStories((prev) => [
      {
        id: `u-${Date.now()}`,
        start,
        end,
        section,
        quote: text.trim(),
        resources: [],
        helpful: 0,
      },
      ...prev,
    ]);
    setText("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10">
        <h1 className="text-[2rem] font-bold tracking-tight text-foreground">
          Score Journey Stories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Real students. Real plateaus. Real breakthroughs.
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

        <div className="mt-6 grid gap-3">
          {filtered.map((s) => <StoryCard key={s.id} s={s} />)}
        </div>

        <form
          onSubmit={submit}
          className="mt-10 rounded-xl bg-[#F3F4F6] p-5"
        >
          <h2 className="text-base font-bold text-foreground">Share Your Story</h2>
          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-muted-foreground">
                Starting score
                <input
                  type="number"
                  min={120}
                  max={180}
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Ending score
                <input
                  type="number"
                  min={120}
                  max={180}
                  value={end}
                  onChange={(e) => setEnd(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
            <label className="text-xs font-medium text-muted-foreground">
              Section improved
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as Section)}
                className="mt-1 block w-full rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
              >
                <option>Logical Reasoning</option>
                <option>Logic Games</option>
                <option>Reading Comprehension</option>
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground">
              What worked for you?
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 280))}
                rows={3}
                className="mt-1 block w-full resize-none rounded-lg border border-[#E5E7EB] bg-card px-3 py-2 text-sm text-foreground"
              />
              <span className="mt-1 block text-right text-[11px] text-muted-foreground">
                {text.length}/280
              </span>
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Add My Story
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Stories;
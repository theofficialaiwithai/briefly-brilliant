import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Brain, BookOpenText, Check, Sparkles, Timer, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  WeeklyHours,
  TestDate,
  Budget,
  SectionObstacle,
  LearningFormat,
  Experience,
  QuizState,
  saveQuizState,
  scoreBandLabel,
} from "@/lib/study";
import { cn } from "@/lib/utils";

const SECTION_OPTIONS: {
  value: SectionObstacle;
  icon: React.ComponentType<{ className?: string }>;
  blurb: string;
}[] = [
  { value: "Logical Reasoning", icon: Brain, blurb: "Arguments, assumptions, and flaws" },
  { value: "Reading Comprehension", icon: BookOpenText, blurb: "Dense passages and tricky questions" },
  { value: "Pacing & time management", icon: Timer, blurb: "Running out of time on sections" },
  { value: "I struggle with everything equally", icon: Layers, blurb: "No single section stands out" },
];

const HOURS_OPTIONS: { value: WeeklyHours; label: string }[] = [
  { value: "<5", label: "Under 5 hours" },
  { value: "5-10", label: "5–10 hours" },
  { value: "10-20", label: "10–20 hours" },
  { value: "20+", label: "20+ hours" },
];

const DATE_OPTIONS: { value: TestDate; label: string; sub: string }[] = [
  { value: "<4w", label: "Within 4 weeks", sub: "I need the fastest path" },
  { value: "1-3m", label: "1–3 months", sub: "I have some runway" },
  { value: "3-6m", label: "3–6 months", sub: "I can go deep" },
  { value: "none", label: "Not scheduled yet", sub: "I'm still exploring" },
];

const BUDGET_OPTIONS: { value: Budget; label: string; sub: string }[] = [
  { value: "free", label: "Free only", sub: "I want the best free resources" },
  { value: "50", label: "Up to $50", sub: "Open to affordable tools" },
  { value: "200", label: "Up to $200", sub: "Willing to invest in a course" },
  { value: "any", label: "Whatever it takes", sub: "Show me the best, paid or free" },
];

const LEARNING_FORMAT_OPTIONS: { value: LearningFormat; sub: string }[] = [
  { value: "Video lessons", sub: "Watch and learn at your pace" },
  { value: "Books & reading", sub: "Self-study with written material" },
  { value: "Live instruction with a teacher", sub: "Real-time classes with an expert" },
  { value: "Drilling with lots of practice", sub: "Learn by doing problems" },
  { value: "A mix of everything", sub: "Whatever works best, mix it up" },
];

const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: "first_time", label: "No, this is my first time" },
  { value: "retaker", label: "Yes, I am retaking it" },
];

const TOTAL_STEPS = 8;

const ScoreSlider = ({
  value,
  onChange,
  min = 120,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) => (
  <div className="mt-8">
    <div className="text-center">
      <div className="text-6xl font-bold tabular-nums text-foreground">{value}</div>
      <div className="mt-2 text-sm font-medium text-primary">{scoreBandLabel(value)}</div>
    </div>
    <input
      type="range"
      min={min}
      max={180}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-8 w-full accent-primary"
    />
    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
      <span>{min}</span>
      <span>180</span>
    </div>
  </div>
);

const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [currentScore, setCurrentScore] = useState<number | "no_score">(155);
  const [targetScore, setTargetScore] = useState(165);
  const [section, setSection] = useState<SectionObstacle | null>(null);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours | null>(null);
  const [testDate, setTestDate] = useState<TestDate | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [learningFormat, setLearningFormat] = useState<LearningFormat | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [done, setDone] = useState(false);

  const canNext = useMemo(() => {
    switch (step) {
      case 1:
        return currentScore === "no_score" || (currentScore >= 120 && currentScore <= 180);
      case 2:
        return currentScore === "no_score" ? targetScore >= 120 : targetScore >= currentScore;
      case 3:
        return section !== null;
      case 4:
        return weeklyHours !== null;
      case 5:
        return testDate !== null;
      case 6:
        return budget !== null;
      case 7:
        return learningFormat !== null;
      case 8:
        return experience !== null;
      default:
        return false;
    }
  }, [step, currentScore, targetScore, section, weeklyHours, testDate, budget, learningFormat, experience]);

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      const state: QuizState = {
        currentScore,
        targetScore,
        section: section!,
        weeklyHours: weeklyHours!,
        testDate: testDate!,
        budget: budget!,
        learningFormat: learningFormat!,
        experience: experience!,
      };
      saveQuizState(state);
      setDone(true);
    }
  };

  const budgetLabel = BUDGET_OPTIONS.find((o) => o.value === budget)?.label ?? "";

  if (done) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Logo />
        </header>
        <main className="mx-auto max-w-2xl px-6 pt-12 pb-24 text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            All set
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Your study profile is ready.
          </h1>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-card border border-border px-4 py-2 text-sm font-medium text-foreground shadow-card">
              Score: {currentScore === "no_score" ? "—" : currentScore} → {targetScore}
            </span>
            <span className="rounded-full bg-card border border-border px-4 py-2 text-sm font-medium text-foreground shadow-card">
              Focus: {section}
            </span>
            <span className="rounded-full bg-card border border-border px-4 py-2 text-sm font-medium text-foreground shadow-card">
              Budget: {budgetLabel}
            </span>
          </div>
          <Button
            size="lg"
            onClick={() => navigate("/quiz/results")}
            className="mt-10 h-12 rounded-xl px-6 text-base shadow-card"
          >
            See My Matched Resources
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
          Cancel
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        {/* Progress */}
        <div className="mb-10">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <section
          key={step}
          className="rounded-2xl border border-border bg-card p-8 shadow-card md:p-10 animate-fade-in"
        >
          {step === 1 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                What's your current practice test score?
              </h1>
              <p className="mt-3 text-muted-foreground">Drag to set your most recent score.</p>
              <ScoreSlider
                value={typeof currentScore === "number" ? currentScore : 155}
                onChange={setCurrentScore}
              />
              <button
                type="button"
                onClick={() =>
                  setCurrentScore(currentScore === "no_score" ? 155 : "no_score")
                }
                className={cn(
                  "mt-6 w-full rounded-xl border p-4 text-left transition-all",
                  currentScore === "no_score"
                    ? "border-primary bg-primary-soft shadow-card"
                    : "border-border bg-background hover:border-foreground/20 hover:bg-muted/40"
                )}
              >
                <div className="font-semibold text-foreground">
                  I haven't taken a practice test yet
                </div>
                <div className="text-sm text-muted-foreground">
                  We'll treat you as a complete beginner.
                </div>
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                What's your target score?
              </h1>
              <p className="mt-3 text-muted-foreground">Where do you want to land?</p>
              <ScoreSlider value={targetScore} onChange={setTargetScore} min={120} />
              {typeof currentScore === "number" && targetScore === currentScore && (
                <p className="mt-4 text-center text-sm text-amber-700">
                  Same as your current score — set a higher target to find growth resources.
                </p>
              )}
              {typeof currentScore === "number" && targetScore < currentScore && (
                <p className="mt-4 text-center text-sm text-destructive">
                  Target must be at least your current score.
                </p>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Which section is your biggest obstacle right now?
              </h1>
              <div className="mt-8 grid gap-3">
                {SECTION_OPTIONS.map((opt) => {
                  const active = section === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSection(opt.value)}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border bg-background p-5 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border hover:border-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        )}
                      >
                        <opt.icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-semibold text-foreground">{opt.value}</span>
                        <span className="block text-sm text-muted-foreground">{opt.blurb}</span>
                      </span>
                      {active && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                How much time can you dedicate to studying each week?
              </h1>
              <div className="mt-8 flex flex-wrap gap-2">
                {HOURS_OPTIONS.map((o) => {
                  const active = weeklyHours === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setWeeklyHours(o.value)}
                      className={cn(
                        "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                When is your target test date?
              </h1>
              <div className="mt-8 grid gap-3">
                {DATE_OPTIONS.map((o) => {
                  const active = testDate === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setTestDate(o.value)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border bg-background hover:border-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      <div className="font-semibold text-foreground">{o.label}</div>
                      <div className="text-sm text-muted-foreground">{o.sub}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Do you have a budget for study materials?
              </h1>
              <div className="mt-8 grid gap-3">
                {BUDGET_OPTIONS.map((o) => {
                  const active = budget === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setBudget(o.value)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border bg-background hover:border-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      <div className="font-semibold text-foreground">{o.label}</div>
                      <div className="text-sm text-muted-foreground">{o.sub}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-10 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="h-11 rounded-xl px-3 text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              disabled={!canNext}
              onClick={handleNext}
              className="h-11 rounded-xl px-5"
            >
              {step === TOTAL_STEPS ? "Finish" : "Continue"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Quiz;
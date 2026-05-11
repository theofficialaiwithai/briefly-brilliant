import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Brain, BookOpenText, Check, Timer, Layers, Loader2 } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
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
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch(
        "https://puivlxldzeinfpljixme.supabase.co/functions/v1/recommend-resources",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentScore,
            targetScore,
            sectionObstacle: section,
            weeklyHours,
            testTimeline: testDate,
            budget,
            learningFormat,
            experience,
          }),
        }
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      navigate("/quiz/results", {
        state: { recommendations: data.recommendations ?? [] },
      });
    } catch (err) {
      setSubmitting(false);
      navigate("/quiz/results", {
        state: {
          error: err instanceof Error ? err.message : "Request failed",
        },
      });
    }
  };

  if (submitting) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Logo />
        </header>
        <main className="mx-auto flex max-w-2xl flex-col items-center px-6 pt-24 pb-24 text-center animate-fade-in">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h1 className="mt-8 text-3xl font-bold tracking-tight md:text-4xl">
            Analyzing your profile...
          </h1>
          <p className="mt-3 text-muted-foreground">
            Matching you with the resources that fit your goals.
          </p>
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

          {step === 7 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                How do you prefer to learn?
              </h1>
              <div className="mt-8 grid gap-3">
                {LEARNING_FORMAT_OPTIONS.map((o) => {
                  const active = learningFormat === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setLearningFormat(o.value)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border bg-background hover:border-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      <div className="font-semibold text-foreground">{o.value}</div>
                      <div className="text-sm text-muted-foreground">{o.sub}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 8 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Have you taken the LSAT before?
              </h1>
              <div className="mt-8 grid gap-3">
                {EXPERIENCE_OPTIONS.map((o) => {
                  const active = experience === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setExperience(o.value)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border bg-background hover:border-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      <div className="font-semibold text-foreground">{o.label}</div>
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
          {submitError && (
            <p className="mt-4 text-center text-sm text-destructive">{submitError}</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Quiz;
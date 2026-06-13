import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, ArrowRight, Brain, BookOpenText, Check, Timer, Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";
import { useSupabaseClient } from "@/lib/supabaseClient";
import { syncUser } from "@/lib/syncUser";
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
  { value: "specific_date", label: "I have a specific date", sub: "Set your exact target date" },
];

const BUDGET_OPTIONS: { value: Budget; label: string; sub: string }[] = [
  { value: "free", label: "Free only", sub: "I'll stick to free resources" },
  { value: "under_200", label: "Under $200", sub: "Books, free tiers, and low-cost prep" },
  { value: "200_500", label: "$200 – $500", sub: "Self-paced online courses" },
  { value: "500_1500", label: "$500 – $1,500", sub: "Live online courses" },
  { value: "1500_plus", label: "$1,500+", sub: "Private tutoring or premium programs" },
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

const TODAY = new Date().toISOString().split("T")[0];

function getHoursTip(testDate: TestDate | null, specificDate: string): string | null {
  if (!testDate) return null;
  if (testDate === "specific_date") {
    if (!specificDate) return null;
    const weeks = Math.round(
      (new Date(specificDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)
    );
    if (weeks < 4) return "⭐ Based on your timeline, we recommend 25+ hrs/week. This is an intensive schedule — consider whether your timeline allows for meaningful prep.";
    if (weeks < 9) return "⭐ Based on your timeline, we recommend 20–25 hrs/week to hit ~150 total study hours.";
    if (weeks < 17) return "⭐ Based on your timeline, we recommend 15–20 hrs/week — the most common path to a meaningful score improvement.";
    if (weeks < 26) return "⭐ Based on your timeline, we recommend 12–15 hrs/week to reach 250–300 total hours.";
    if (weeks < 52) return "⭐ Based on your timeline, we recommend 8–12 hrs/week. A steady pace builds deep skills.";
    return "⭐ Based on your timeline, 5–8 hrs/week is sustainable. You have time to build a strong foundation.";
  }
  if (testDate === "<4w") return "⭐ Based on your timeline, we recommend 25+ hrs/week. This is an intensive schedule — consider whether your timeline allows for meaningful prep.";
  if (testDate === "1-3m") return "⭐ Based on your timeline, we recommend 20–25 hrs/week to hit ~150 total study hours.";
  if (testDate === "3-6m") return "⭐ Based on your timeline, we recommend 15–20 hrs/week — the most common path to a meaningful score improvement.";
  return null;
}

const TOTAL_STEPS = 8;

const ScoreSlider = ({
  value,
  onChange,
  min = 120,
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  ariaLabel: string;
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
      aria-label={ariaLabel}
    />
    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
      <span>{min}</span>
      <span>180</span>
    </div>
  </div>
);

const Quiz = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const supabase = useSupabaseClient();
  const [step, setStep] = useState(1);
  const [currentScore, setCurrentScore] = useState<number | "no_score">(155);
  const [targetScore, setTargetScore] = useState(165);
  const [sections, setSections] = useState<SectionObstacle[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours | null>(null);
  const [testDate, setTestDate] = useState<TestDate | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [learningFormats, setLearningFormats] = useState<LearningFormat[]>([]);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [specificDate, setSpecificDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn && sessionStorage.getItem("quizAnswers")) {
      navigate("/feed");
    }
  }, [isSignedIn, navigate]);

  useEffect(() => {
    if (isSignedIn && user) {
      syncUser(supabase, user.id, user.primaryEmailAddress?.emailAddress);
    }
  }, [isSignedIn, user, supabase]);

  const canNext = useMemo(() => {
    switch (step) {
      case 1:
        return currentScore === "no_score" || (currentScore >= 120 && currentScore <= 180);
      case 2:
        return currentScore === "no_score" ? targetScore >= 120 : targetScore >= currentScore;
      case 3:
        return sections.length > 0;
      case 4:
        return testDate !== null && (testDate !== "specific_date" || specificDate !== "");
      case 5:
        return weeklyHours !== null;
      case 6:
        return budget !== null;
      case 7:
        return learningFormats.length > 0;
      case 8:
        return experience !== null;
      default:
        return false;
    }
  }, [step, currentScore, targetScore, sections, weeklyHours, testDate, specificDate, budget, learningFormats, experience]);

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    const state: QuizState = {
      currentScore,
      targetScore,
      section: sections,
      weeklyHours: weeklyHours!,
      testDate: testDate!,
      budget: budget!,
      learningFormat: learningFormats,
      experience: experience!,
    };
    saveQuizState(state);
    setSubmitError(null);
    setSubmitting(true);
    // Collapse multi-selections to a string the AI edge function can process
    const sectionForApi =
      sections.length === 1 ? sections[0] : sections.join(", ");
    const formatForApi =
      learningFormats.length === 1 ? learningFormats[0] : learningFormats.join(", ");
    try {
      const res = await fetch(
        "https://kmgndbewlfshtedavebd.supabase.co/functions/v1/recommend-resources",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentScore,
            targetScore,
            sectionObstacle: sectionForApi,
            weeklyHours,
            testTimeline: testDate,
            budget,
            learningFormat: formatForApi,
            experience,
          }),
        }
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      sessionStorage.setItem("quizAnswers", JSON.stringify({
        targetTestDate: testDate,
        ...(testDate === "specific_date" && specificDate ? { targetDate: specificDate } : {}),
        weeklyHours,
      }));
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
      <SEO
        title="Take the LSAT match quiz — Briefly Brilliant"
        description="Answer 8 quick questions about your score, timeline, and study style to get a personalized LSAT resource plan."
        path="/quiz"
      />
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
                ariaLabel="Current LSAT practice test score"
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
              <ScoreSlider
                value={targetScore}
                onChange={setTargetScore}
                min={120}
                ariaLabel="Target LSAT score"
              />
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
              <p className="mt-2 text-sm text-muted-foreground">Select all that apply.</p>
              <div className="mt-6 grid gap-3">
                {SECTION_OPTIONS.filter((o) => o.value !== "I struggle with everything equally").map((opt) => {
                  const active = sections.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSections((prev) => {
                          const without = prev.filter((s) => s !== "I struggle with everything equally");
                          const next = without.includes(opt.value)
                            ? without.filter((s) => s !== opt.value)
                            : [...without, opt.value];
                          const specific: SectionObstacle[] = ["Logical Reasoning", "Reading Comprehension", "Pacing & time management"];
                          if (specific.every((s) => next.includes(s))) return ["I struggle with everything equally"];
                          return next;
                        });
                      }}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border bg-background p-5 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border hover:border-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg transition-colors", active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
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
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {(() => {
                  const opt = SECTION_OPTIONS.find((o) => o.value === "I struggle with everything equally")!;
                  const active = sections.includes("I struggle with everything equally");
                  return (
                    <button
                      type="button"
                      onClick={() => setSections(active ? [] : ["I struggle with everything equally"])}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border bg-background p-5 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border hover:border-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg transition-colors", active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                        <opt.icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-semibold text-foreground">{opt.value}</span>
                        <span className="block text-sm text-muted-foreground">{opt.blurb}</span>
                      </span>
                      {active && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  );
                })()}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                When is your target test date?
              </h1>
              <div className="mt-8 grid gap-3">
                {DATE_OPTIONS.filter((o) => o.value !== "specific_date").map((o) => {
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
                {(() => {
                  const o = DATE_OPTIONS.find((o) => o.value === "specific_date")!;
                  const active = testDate === "specific_date";
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setTestDate("specific_date")}
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
                      {active && (
                        <input
                          type="date"
                          min={TODAY}
                          value={specificDate}
                          onChange={(e) => setSpecificDate(e.target.value)}
                          style={{
                            background: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            width: "100%",
                            marginTop: "8px",
                          }}
                        />
                      )}
                    </>
                  );
                })()}
              </div>
              <p style={{ color: "#6B7280", fontSize: "0.8rem", lineHeight: "1.5", fontStyle: "italic", marginTop: "16px" }}>
                * Most students study 250–300 total hours. The 3–4 month timeline at 15–20 hrs/week is the most common path to a meaningful score improvement. If you're aiming for a 10+ point jump, plan for at least 4 months.
              </p>
            </>
          )}

          {step === 5 && (() => {
            const tip = getHoursTip(testDate, specificDate);
            return (
              <>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  How much time can you dedicate to studying each week?
                </h1>
                {tip && (
                  <div
                    style={{
                      background: "#F0FDFA",
                      border: "1px solid #0D9488",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      marginTop: "16px",
                      marginBottom: "12px",
                      fontSize: "0.85rem",
                    }}
                  >
                    {tip}
                  </div>
                )}
                <div className={cn("flex flex-wrap gap-2", !tip ? "mt-8" : "")}>
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
            );
          })()}

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
              <p className="mt-2 text-sm text-muted-foreground">Select all styles that work for you.</p>
              <div className="mt-6 grid gap-3">
                {LEARNING_FORMAT_OPTIONS.filter((o) => o.value !== "A mix of everything").map((o) => {
                  const active = learningFormats.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        setLearningFormats((prev) => {
                          const without = prev.filter((f) => f !== "A mix of everything");
                          const next = without.includes(o.value)
                            ? without.filter((f) => f !== o.value)
                            : [...without, o.value];
                          const specific: LearningFormat[] = ["Video lessons", "Books & reading", "Live instruction with a teacher", "Drilling with lots of practice"];
                          if (specific.every((f) => next.includes(f))) return ["A mix of everything"];
                          return next;
                        });
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border bg-background hover:border-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      <div>
                        <div className="font-semibold text-foreground">{o.value}</div>
                        <div className="text-sm text-muted-foreground">{o.sub}</div>
                      </div>
                      {active && <Check className="h-5 w-5 shrink-0 text-primary" />}
                    </button>
                  );
                })}
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {(() => {
                  const o = LEARNING_FORMAT_OPTIONS.find((f) => f.value === "A mix of everything")!;
                  const active = learningFormats.includes("A mix of everything");
                  return (
                    <button
                      type="button"
                      onClick={() => setLearningFormats(active ? [] : ["A mix of everything"])}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft shadow-card"
                          : "border-border bg-background hover:border-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      <div>
                        <div className="font-semibold text-foreground">{o.value}</div>
                        <div className="text-sm text-muted-foreground">{o.sub}</div>
                      </div>
                      {active && <Check className="h-5 w-5 shrink-0 text-primary" />}
                    </button>
                  );
                })()}
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
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Brain, Puzzle, BookOpenText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { SUBTYPES, Section, saveStudyState } from "@/lib/study";
import { cn } from "@/lib/utils";

const SECTION_OPTIONS: { value: Section; icon: React.ComponentType<{ className?: string }>; blurb: string }[] = [
  { value: "Logical Reasoning", icon: Brain, blurb: "Arguments, assumptions, flaws" },
  { value: "Logic Games", icon: Puzzle, blurb: "Sequencing, grouping, hybrids" },
  { value: "Reading Comprehension", icon: BookOpenText, blurb: "Passages, structure, pacing" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [score, setScore] = useState<number>(155);
  const [section, setSection] = useState<Section | null>(null);
  const [subtype, setSubtype] = useState<string | null>(null);

  const subOptions = useMemo(() => (section ? SUBTYPES[section] : []), [section]);

  const canContinueStep1 = score >= 120 && score <= 180;
  const canSubmit = section !== null && subtype !== null;

  const handleSubmit = () => {
    if (!section || !subtype) return;
    saveStudyState({ score, section, subtype });
    navigate("/feed");
  };

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
            <span>Step {step} of 2</span>
            <span>{step === 1 ? "Score" : "Section"}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {step === 1 && (
          <section className="rounded-2xl border border-border bg-card p-8 shadow-card md:p-10">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Where are you right now?
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your most recent practice score gets us started.
            </p>

            <label className="mt-8 block">
              <span className="text-sm font-medium text-foreground">My current practice score</span>
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="number"
                  min={120}
                  max={180}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-32 rounded-xl border border-input bg-background px-4 py-3 text-2xl font-semibold tabular-nums text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm text-muted-foreground">Range: 120 – 180</span>
              </div>
              <input
                type="range"
                min={120}
                max={180}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="mt-6 w-full accent-primary"
              />
            </label>

            <div className="mt-10 flex justify-end">
              <Button
                size="lg"
                disabled={!canContinueStep1}
                onClick={() => setStep(2)}
                className="h-11 rounded-xl px-5"
              >
                Continue
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-2xl border border-border bg-card p-8 shadow-card md:p-10">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              What's holding you back?
            </h1>
            <p className="mt-3 text-muted-foreground">Pick the section you're stuck on.</p>

            <div className="mt-8 grid gap-3">
              {SECTION_OPTIONS.map((opt) => {
                const active = section === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSection(opt.value);
                      setSubtype(null);
                    }}
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

            {section && (
              <div className="mt-8">
                <p className="text-sm font-medium text-foreground">
                  Which question type trips you up?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {subOptions.map((s) => {
                    const active = subtype === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubtype(s)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="h-11 rounded-xl px-3 text-muted-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button
                size="lg"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="h-11 rounded-xl px-5"
              >
                Show My Resources
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Onboarding;
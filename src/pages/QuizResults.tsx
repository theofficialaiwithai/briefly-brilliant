import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type Recommendation = {
  rank: number;
  resource_name: string;
  category: string;
  url: string;
  price_range: string;
  section_focus: string;
  why_this_fits_you: string;
};

type SectionFilter = "All" | "LR" | "RC" | "LG";
type CostFilter = "All" | "Free" | "Paid";

// ── Helpers ──────────────────────────────────────────────────────────────────

const isFree = (p: string) => /free/i.test(p) || /^\$?0\b/.test(p);
const isFreemium = (p: string) => /freemium/i.test(p);

function costLabel(p: string) {
  if (isFree(p)) return "Free";
  if (isFreemium(p)) return "Freemium";
  return p;
}

function costStyle(p: string): { background: string; color: string } {
  if (isFree(p)) return { background: "#F0FDF4", color: "#16A34A" };
  return { background: "#FFF7ED", color: "#D97706" };
}

const matchesSection = (sectionFocus: string, filter: SectionFilter) => {
  if (filter === "All") return true;
  const s = sectionFocus.toLowerCase();
  if (filter === "LR") return s.includes("lr") || s.includes("logical reasoning") || s === "all";
  if (filter === "RC") return s.includes("rc") || s.includes("reading") || s === "all";
  if (filter === "LG") return s.includes("lg") || s.includes("logic games") || s === "all";
  return true;
};

// ── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div
    className="animate-pulse rounded-2xl border bg-white p-7"
    style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-gray-200" />
        <div className="h-5 w-48 rounded bg-gray-200" />
      </div>
      <div className="h-6 w-16 rounded-full bg-gray-100" />
    </div>
    <div className="flex gap-2 mb-5">
      <div className="h-5 w-20 rounded-full bg-gray-100" />
      <div className="h-5 w-16 rounded-full bg-gray-100" />
    </div>
    <div className="rounded-lg bg-gray-50 p-4 space-y-2">
      <div className="h-3 w-32 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-100" />
      <div className="h-4 w-4/5 rounded bg-gray-100" />
    </div>
    <div className="mt-5 h-10 w-36 rounded-lg bg-gray-200" />
  </div>
);

// ── Resource Card ─────────────────────────────────────────────────────────────

const ResourceCard = ({ r }: { r: Recommendation }) => (
  <li
    key={r.rank}
    className="rounded-2xl border bg-white"
    style={{
      borderColor: "#E5E7EB",
      borderRadius: 16,
      padding: "28px 32px",
      boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
    }}
  >
    {/* Title row */}
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {/* Rank badge */}
        <span
          className="flex shrink-0 items-center justify-center rounded-full text-white"
          style={{
            background: "#0D9488",
            width: 28,
            height: 28,
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          #{r.rank}
        </span>
        <h2
          className="font-bold leading-snug"
          style={{ fontSize: "1.25rem", color: "#1A1A2E" }}
        >
          {r.resource_name}
        </h2>
      </div>
      {/* Cost badge */}
      <span
        className="shrink-0 rounded-full px-3 py-1 text-sm font-medium"
        style={{ ...costStyle(r.price_range), fontSize: "0.8rem", borderRadius: 99 }}
      >
        {costLabel(r.price_range)}
      </span>
    </div>

    {/* Tags */}
    <div className="mt-3 flex flex-wrap gap-2">
      <span
        className="rounded-full px-2.5 py-0.5 font-medium"
        style={{ background: "#F3F4F6", color: "#6B7280", fontSize: "0.75rem", borderRadius: 99 }}
      >
        {r.category}
      </span>
      <span
        className="rounded-full px-2.5 py-0.5 font-medium"
        style={{ background: "#F3F4F6", color: "#6B7280", fontSize: "0.75rem", borderRadius: 99 }}
      >
        {r.section_focus}
      </span>
    </div>

    {/* Why this fits you */}
    <div className="mt-4">
      <div
        className="mb-2 font-semibold uppercase tracking-wider"
        style={{ fontSize: "0.75rem", letterSpacing: "0.06em", color: "#9CA3AF" }}
      >
        Why this fits you
      </div>
      <div
        className="rounded-lg p-3"
        style={{ background: "#F0FDFA", borderRadius: 8, padding: "12px 16px" }}
      >
        <p
          className="italic leading-relaxed"
          style={{ fontSize: "0.9rem", color: "#4B5563", lineHeight: 1.6 }}
        >
          {r.why_this_fits_you}
        </p>
      </div>
    </div>

    {/* Visit button */}
    <div className="mt-4">
      <a
        href={r.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-white transition-opacity hover:opacity-90"
        style={{
          background: "#0D9488",
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: "0.9rem",
        }}
      >
        Visit Resource
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  </li>
);

// ── Filter Pill ───────────────────────────────────────────────────────────────

const FilterPill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left font-medium transition-all"
    style={
      active
        ? {
            background: "#0D9488",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: "0.9rem",
          }
        : {
            background: "white",
            color: "#1A1A2E",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: "0.9rem",
          }
    }
  >
    {children}
  </button>
);

// ── CTA Section ───────────────────────────────────────────────────────────────

const TealDot = () => (
  <span
    className="mr-2 mt-1.5 inline-block shrink-0 rounded-full"
    style={{ width: 7, height: 7, background: "#0D9488" }}
  />
);

const FeatureItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start">
    <TealDot />
    <span style={{ fontSize: "0.875rem", color: "#4B5563", lineHeight: 1.8 }}>{children}</span>
  </li>
);

const CTASection = () => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <div
        className="border-t text-center"
        style={{ borderColor: "#E5E7EB", padding: "48px 24px" }}
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="inline-flex items-center gap-2" style={{ color: "#4B5563", fontSize: "0.95rem" }}>
            <CheckCircle2 style={{ color: "#0D9488", width: 20, height: 20 }} />
            Your results have been applied to your Feed.
          </span>
          <button
            onClick={() => navigate("/feed")}
            className="font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "#0D9488",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: "1rem",
            }}
          >
            Go to Your Feed →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t" style={{ borderColor: "#E5E7EB", padding: "48px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 680 }}>
        {/* Heading */}
        <div className="mb-2 text-center">
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1A1A2E",
            }}
          >
            Save your matches. Start studying.
          </h2>
          <p className="mt-2" style={{ fontSize: "0.9rem", color: "#6B7280" }}>
            Create an account to access your personalized Feed and track your progress.
          </p>
        </div>

        {/* Plan cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {/* Free card */}
          <div
            className="flex flex-col"
            style={{
              background: "white",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              padding: "28px 24px",
            }}
          >
            <div
              className="mb-2 font-semibold uppercase tracking-wider"
              style={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: "#9CA3AF" }}
            >
              Free Forever
            </div>
            <h3
              className="mb-4 font-bold"
              style={{ fontSize: "1.1rem", color: "#1A1A2E" }}
            >
              Free Account
            </h3>
            <ul className="mb-6 flex-1 space-y-1">
              <FeatureItem>Access your matched resources</FeatureItem>
              <FeatureItem>Community Study Groups</FeatureItem>
            </ul>
            <button
              onClick={() => navigate("/auth")}
              className="w-full font-semibold transition-colors hover:bg-teal-50"
              style={{
                background: "white",
                border: "1.5px solid #0D9488",
                color: "#0D9488",
                borderRadius: 8,
                padding: 11,
                fontSize: "0.95rem",
              }}
            >
              Continue for Free
            </button>
          </div>

          {/* Full access card */}
          <div
            className="relative flex flex-col"
            style={{
              background: "white",
              border: "2px solid #0D9488",
              borderRadius: 16,
              padding: "28px 24px",
            }}
          >
            {/* Trial badge */}
            <span
              className="absolute right-4 top-4 font-semibold text-white"
              style={{
                background: "#0D9488",
                borderRadius: 99,
                padding: "3px 10px",
                fontSize: "0.7rem",
              }}
            >
              14-DAY TRIAL
            </span>
            <div
              className="mb-2 font-semibold uppercase tracking-wider"
              style={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: "#9CA3AF" }}
            >
              &nbsp;
            </div>
            <h3
              className="mb-4 font-bold"
              style={{ fontSize: "1.1rem", color: "#1A1A2E" }}
            >
              Full Access
            </h3>
            <ul className="mb-6 flex-1 space-y-1">
              <FeatureItem>Everything in Free</FeatureItem>
              <FeatureItem>Full resource library</FeatureItem>
              <FeatureItem>Score progress dashboard</FeatureItem>
              <FeatureItem>Feedback &amp; completion tracking</FeatureItem>
              <FeatureItem>All future features</FeatureItem>
            </ul>
            <button
              onClick={() => navigate("/auth")}
              className="w-full font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: "#0D9488",
                borderRadius: 8,
                padding: 12,
                fontSize: "0.95rem",
              }}
            >
              Start Free Trial
            </button>
            <p
              className="mt-2 text-center"
              style={{ fontSize: "0.75rem", color: "#9CA3AF" }}
            >
              No credit card required.
            </p>
          </div>
        </div>

        {/* Sign in link */}
        <p className="mt-6 text-center" style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>
          Already have an account?{" "}
          <Link to="/auth" className="hover:underline" style={{ color: "#9CA3AF" }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const QuizResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { recommendations?: Recommendation[]; error?: string }
    | null;

  const recommendations = state?.recommendations ?? [];
  const hadError = Boolean(state?.error);
  const loading = !state;

  const [sectionF, setSectionF] = useState<SectionFilter>("All");
  const [costF, setCostF] = useState<CostFilter>("All");

  const filtered = useMemo(
    () =>
      recommendations.filter((r) => {
        if (!matchesSection(r.section_focus, sectionF)) return false;
        if (costF === "Free" && !isFree(r.price_range)) return false;
        if (costF === "Paid" && isFree(r.price_range)) return false;
        return true;
      }),
    [recommendations, sectionF, costF]
  );

  const dataReady = !loading && !hadError && recommendations.length > 0;

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <SEO
        title="Your matched LSAT resources — Briefly Brilliant"
        description="Personalized LSAT resource recommendations based on your score, target, and study style."
        path="/quiz/results"
      />

      {/* Nav */}
      <header className="border-b bg-white" style={{ borderColor: "#E5E7EB" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <Link
            to="/quiz"
            className="text-sm transition-colors hover:text-foreground"
            style={{ color: "#6B7280" }}
          >
            Retake quiz
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-0">
        {/* Page header */}
        <div className="py-12 text-center">
          <h1
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1A1A2E",
              lineHeight: 1.2,
            }}
          >
            Your top matched resources
          </h1>
          <p className="mt-3" style={{ fontSize: "1rem", color: "#6B7280" }}>
            Personalized based on your score, timeline, budget, and learning style.
          </p>
        </div>

        {/* Error state */}
        {hadError && (
          <div className="pb-24 text-center">
            <p
              className="mb-6 font-semibold"
              style={{ fontSize: "1.1rem", color: "#1A1A2E" }}
            >
              We had trouble loading your results.
            </p>
            <button
              onClick={() => navigate("/quiz")}
              className="font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: "#0D9488",
                borderRadius: 8,
                padding: "12px 28px",
                fontSize: "1rem",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading + results grid */}
        {!hadError && (
          <div className="grid gap-8 pb-0 md:grid-cols-[200px_1fr]">
            {/* Sidebar */}
            <aside className="md:sticky md:top-6 md:self-start">
              <div
                className="mb-1"
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Filter by Section
              </div>
              <div className="flex flex-col gap-2">
                {(["All", "LR", "RC", "LG"] as SectionFilter[]).map((f) => (
                  <FilterPill key={f} active={sectionF === f} onClick={() => setSectionF(f)}>
                    {f === "All"
                      ? "All Sections"
                      : f === "LR"
                      ? "Logical Reasoning"
                      : f === "RC"
                      ? "Reading Comprehension"
                      : "Logic Games"}
                  </FilterPill>
                ))}
              </div>

              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  marginTop: 24,
                  marginBottom: 8,
                }}
              >
                Filter by Cost
              </div>
              <div className="flex flex-col gap-2">
                {(["All", "Free", "Paid"] as CostFilter[]).map((f) => (
                  <FilterPill key={f} active={costF === f} onClick={() => setCostF(f)}>
                    {f === "All" ? "All" : f}
                  </FilterPill>
                ))}
              </div>
            </aside>

            {/* Cards */}
            <div className="pb-16">
              {loading ? (
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className="rounded-2xl border bg-white p-10 text-center"
                  style={{ borderColor: "#E5E7EB", color: "#6B7280", fontSize: "0.9rem" }}
                >
                  No recommendations match these filters.
                </div>
              ) : (
                <ol className="space-y-4">
                  {filtered.map((r) => (
                    <ResourceCard key={r.rank} r={r} />
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </main>

      {/* CTA section — only after results are visible */}
      {dataReady && (
        <div className="mx-auto max-w-6xl px-6">
          <CTASection />
        </div>
      )}

      {/* Bottom padding */}
      <div style={{ height: 48 }} />
    </div>
  );
};

export default QuizResults;

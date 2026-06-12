import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { SEO } from "@/components/SEO";

type Mode = "signup" | "login";

const clerkAppearance = {
  variables: {
    colorPrimary: "#0D9488",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorText: "#1A1A2E",
    colorTextSecondary: "#6B7280",
    borderRadius: "8px",
    fontFamily: "Inter, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-none border border-[#E5E7EB] rounded-2xl",
    headerTitle: "font-semibold text-[#1A1A2E]",
    formButtonPrimary: "bg-[#0D9488] hover:bg-[#0B7B71]",
    footerActionLink: "text-[#0D9488]",
  },
};

const Auth = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Initialise mode from URL param so direct links like /auth?mode=login work
  const [mode, setMode] = useState<Mode>(
    params.get("mode") === "login" ? "login" : "signup"
  );

  // Sync mode when the URL param changes (e.g. navigating between pages)
  useEffect(() => {
    const m = params.get("mode");
    if (m === "login") setMode("login");
    else if (m === "signup") setMode("signup");
  }, [params]);

  // Redirect signed-in users away from /auth — returning users go to feed.
  useEffect(() => {
    if (isSignedIn) {
      navigate("/feed", { replace: true });
    }
  }, [isSignedIn, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#FAF7F2" }}
    >
      <SEO
        title={
          mode === "signup"
            ? "Sign up — Briefly Brilliant"
            : "Log in — Briefly Brilliant"
        }
        description={
          mode === "signup"
            ? "Create your Briefly Brilliant account to get score-matched LSAT resources tailored to your plateau."
            : "Log in to Briefly Brilliant to continue your personalized LSAT study plan."
        }
        path="/auth"
      />

      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.3rem",
          color: "#1A1A2E",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Briefly Brilliant
      </p>

      <div
        className="bg-white w-full"
        style={{
          maxWidth: 420,
          borderRadius: 16,
          padding: 40,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Title */}
        <h1
          className="text-center"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.25rem",
            color: "#1A1A2E",
            fontWeight: 700,
          }}
        >
          {mode === "signup"
            ? "Sign up to Briefly Brilliant"
            : "Log in to Briefly Brilliant"}
        </h1>

        {/* Tab toggle — Sign up | Log in */}
        <div
          className="mt-6 flex p-1"
          style={{ backgroundColor: "#F3F4F6", borderRadius: 99 }}
        >
          {(["signup", "login"] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1"
                style={{
                  padding: "8px 12px",
                  borderRadius: 99,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor: active ? "#0D9488" : "transparent",
                  color: active ? "#fff" : "#6B7280",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s, color 0.15s",
                }}
              >
                {m === "signup" ? "Sign up" : "Log in"}
              </button>
            );
          })}
        </div>

        {/* Clerk embedded component — swaps when the tab changes */}
        <div className="mt-6">
          {mode === "signup" ? (
            <SignUp appearance={clerkAppearance} afterSignUpUrl="/quiz" />
          ) : (
            <SignIn appearance={clerkAppearance} afterSignInUrl="/feed" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

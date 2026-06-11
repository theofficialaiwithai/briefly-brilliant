import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { SEO } from "@/components/SEO";

type Mode = "signup" | "login";

// Clerk appearance tuned to match the existing Briefly Brilliant design system:
// teal #0D9488 primary, Inter body, 8px radii on inputs/buttons, no Clerk chrome
const clerkAppearance = {
  variables: {
    colorPrimary: "#0D9488",
    colorText: "#1A1A2E",
    colorTextSecondary: "#6B7280",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#1A1A2E",
    borderRadius: "8px",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSize: "14.4px",
  },
  elements: {
    // Our own card wrapper handles the container — make Clerk's invisible
    rootBox: { width: "100%" },
    card: {
      boxShadow: "none",
      padding: 0,
      margin: 0,
      border: "none",
      backgroundColor: "transparent",
    },
    // Hide Clerk's own title/subtitle — we render our own above the component
    header: { display: "none" },
    headerTitle: { display: "none" },
    headerSubtitle: { display: "none" },
    // Hide Clerk's footer "Don't have an account?" — our tab toggle handles this
    footer: { display: "none" },
    footerAction: { display: "none" },
    // Inputs
    formFieldInput: {
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "10px 12px",
      fontSize: "0.9rem",
    },
    formFieldLabel: {
      fontSize: "0.85rem",
      color: "#374151",
      fontWeight: "500",
    },
    formFieldErrorText: {
      fontSize: "0.8rem",
      color: "#DC2626",
    },
    // Primary submit button — teal fill, no uppercase
    formButtonPrimary: {
      backgroundColor: "#0D9488",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "0.95rem",
      fontWeight: "600",
      textTransform: "none" as const,
    },
    // "or" divider
    dividerLine: { backgroundColor: "#E5E7EB" },
    dividerText: { color: "#9CA3AF", fontSize: "0.8rem" },
    // Social buttons (Google, etc.)
    socialButtonsBlockButton: {
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "11px",
      color: "#1A1A2E",
      fontSize: "0.9rem",
      fontWeight: "500",
      backgroundColor: "#ffffff",
    },
    socialButtonsBlockButtonText: {
      color: "#1A1A2E",
      fontWeight: "500",
    },
    // Inline links Clerk renders mid-flow (e.g. "Back", "Try another method")
    footerActionLink: { color: "#0D9488", fontWeight: "500" },
    identityPreviewText: { color: "#1A1A2E" },
    identityPreviewEditButtonIcon: { color: "#0D9488" },
    // OTP / verification inputs
    otpCodeFieldInput: {
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
    },
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

  // Redirect to /quiz as soon as Clerk reports the user is signed in.
  // This fires both after a fresh sign-in/sign-up and if the user visits
  // /auth while already authenticated.
  useEffect(() => {
    if (isSignedIn) {
      navigate("/quiz", { replace: true });
    }
  }, [isSignedIn, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
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
            <SignIn appearance={clerkAppearance} afterSignInUrl="/quiz" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

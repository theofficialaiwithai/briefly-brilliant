import { useSearchParams } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";

const appearance = {
  variables: {
    colorPrimary: "#0D9488",
    colorBackground: "#ffffff",
    colorText: "#1A1A2E",
    colorTextSecondary: "#6B7280",
    borderRadius: "8px",
    fontFamily: "Inter, sans-serif",
  },
  elements: {
    card: "shadow-none border border-[#E5E7EB] rounded-2xl",
    formButtonPrimary: "bg-[#0D9488] hover:bg-[#0B7B71]",
    footerActionLink: "text-[#0D9488]",
  },
};

const Auth = () => {
  const [params] = useSearchParams();
  const mode = params.get("mode") === "login" ? "login" : "signup";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAF7F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 480, width: "100%", padding: 24 }}>
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

        {mode === "signup" ? (
          <SignUp appearance={appearance} afterSignUpUrl="/quiz" />
        ) : (
          <SignIn appearance={appearance} afterSignInUrl="/feed" />
        )}
      </div>
    </div>
  );
};

export default Auth;

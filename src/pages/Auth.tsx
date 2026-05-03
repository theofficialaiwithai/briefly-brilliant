import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

type Mode = "signup" | "login";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>("signup");
  const [showPwd, setShowPwd] = useState(false);
  const [googleNote, setGoogleNote] = useState(false);

  useEffect(() => {
    if (params.get("mode") === "login") setMode("login");
    if (params.get("mode") === "signup") setMode("signup");
  }, [params]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/quiz");
  };

  const tealBtn: React.CSSProperties = {
    backgroundColor: "#0D9488",
    color: "#fff",
    borderRadius: 8,
    padding: "12px",
    width: "100%",
    fontWeight: 600,
    fontSize: "0.95rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: "0.9rem",
    outline: "none",
    backgroundColor: "#fff",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#FAF7F2" }}
    >
      <div
        className="bg-white w-full"
        style={{
          maxWidth: 420,
          borderRadius: 16,
          padding: 40,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          className="text-center"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.25rem",
            color: "#1A1A2E",
            fontWeight: 700,
          }}
        >
          Briefly Brilliant
        </h1>

        {/* Tabs */}
        <div
          className="mt-6 flex p-1"
          style={{
            backgroundColor: "#F3F4F6",
            borderRadius: 99,
          }}
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
                }}
              >
                {m === "signup" ? "Sign up" : "Log in"}
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input style={inputStyle} type="text" placeholder="Full name" required />
          )}
          <input style={inputStyle} type="email" placeholder="Email" required />
          <div style={{ position: "relative" }}>
            <input
              style={{ ...inputStyle, paddingRight: 40 }}
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9CA3AF",
              }}
              aria-label="Toggle password visibility"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === "login" && (
            <div className="text-right">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ color: "#9CA3AF", fontSize: "0.8rem" }}
              >
                Forgot password?
              </a>
            </div>
          )}

          <button type="submit" style={tealBtn}>
            {mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p
          className="mt-3 text-center"
          style={{ color: "#9CA3AF", fontSize: "0.8rem" }}
        >
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                style={{ color: "#0D9488", fontWeight: 600 }}
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                style={{ color: "#0D9488", fontWeight: 600 }}
              >
                Sign up
              </button>
            </>
          )}
        </p>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1" style={{ height: 1, backgroundColor: "#E5E7EB" }} />
          <span style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>or</span>
          <div className="flex-1" style={{ height: 1, backgroundColor: "#E5E7EB" }} />
        </div>

        <button
          type="button"
          onClick={() => setGoogleNote(true)}
          className="flex items-center justify-center gap-2"
          style={{
            width: "100%",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: 11,
            color: "#1A1A2E",
            fontSize: "0.9rem",
            fontWeight: 500,
            backgroundColor: "#fff",
          }}
        >
          <span
            className="flex items-center justify-center"
            style={{
              width: 18,
              height: 18,
              borderRadius: 99,
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              fontSize: 11,
              fontWeight: 700,
              color: "#4285F4",
            }}
          >
            G
          </span>
          Continue with Google
        </button>
        {googleNote && (
          <p className="mt-2 text-center" style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>
            Google auth coming soon
          </p>
        )}

        <p
          className="mt-6 text-center"
          style={{ color: "#9CA3AF", fontSize: "0.75rem" }}
        >
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;
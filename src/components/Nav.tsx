import { NavLink, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const SIGNED_IN_LINKS = [
  { label: "Feed", to: "/feed" },
  { label: "Study Groups", to: "/groups" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "My Library", to: "/library" },
];

export const Nav = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const initial =
    user?.firstName?.[0]?.toUpperCase() ??
    user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ??
    "?";

  return (
    <header className="border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-6">
          <SignedIn>
            {SIGNED_IN_LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "text-[0.9rem] transition-colors hover:text-[#1A1A2E]",
                    isActive ? "font-semibold text-[#0D9488]" : "font-normal text-[#4B5563]"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => navigate("/profile")}
              aria-label="Profile settings"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                borderRadius: "50%",
                display: "flex",
              }}
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {initial}
                </div>
              )}
            </button>
          </SignedIn>
          <SignedOut>
            <NavLink
              to="/auth"
              className="text-[0.9rem] font-medium px-4 py-2"
              style={{ color: "#1A1A2E" }}
            >
              Log in
            </NavLink>
            <NavLink
              to="/auth?mode=signup"
              className="text-[0.9rem] font-medium text-white"
              style={{ backgroundColor: "#0D9488", borderRadius: 99, padding: "8px 20px" }}
            >
              Sign up
            </NavLink>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
};

import { NavLink, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import { Settings, Bookmark, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initial =
    user?.firstName?.[0]?.toUpperCase() ??
    user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ??
    "?";

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

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

            {/* Avatar + dropdown */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={open}
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

              {open && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    minWidth: 160,
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    zIndex: 50,
                    overflow: "hidden",
                  }}
                >
                  <DropdownItem icon={<Settings size={14} />} label="Profile & Settings" onClick={() => go("/profile")} />
                  <DropdownItem icon={<Bookmark size={14} />} label="My Library" onClick={() => go("/library")} />
                  <DropdownItem icon={<LayoutDashboard size={14} />} label="Dashboard" onClick={() => go("/dashboard")} />
                  <div style={{ height: 1, backgroundColor: "#E5E7EB", margin: "4px 0" }} />
                  <DropdownItem
                    icon={<LogOut size={14} />}
                    label="Sign out"
                    onClick={() => { setOpen(false); signOut({ redirectUrl: "/" }); }}
                    danger
                  />
                </div>
              )}
            </div>
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

function DropdownItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 14px",
        background: hovered ? "#F9FAFB" : "none",
        border: "none",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontFamily: "Inter, sans-serif",
        color: danger ? "#EF4444" : "#4B5563",
        textAlign: "left",
        transition: "background 0.1s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

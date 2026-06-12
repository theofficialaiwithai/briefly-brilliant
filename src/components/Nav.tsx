import { NavLink } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const SIGNED_IN_LINKS = [
  { label: "Feed", to: "/feed" },
  { label: "Study Groups", to: "/groups" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "My Library", to: "/library" },
];

export const Nav = () => (
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
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              variables: { colorPrimary: "#0D9488" },
              elements: {
                avatarBox: { width: 36, height: 36 },
                userButtonPopoverCard: { borderRadius: 12 },
                userButtonPopoverActionButton: { color: "#1A1A2E" },
                userButtonPopoverActionButtonText: { color: "#1A1A2E" },
              },
            }}
          />
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

import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Clerk Publishable Key — add VITE_CLERK_PUBLISHABLE_KEY to .env.local"
  );
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    signInFallbackRedirectUrl="/quiz"
    signUpFallbackRedirectUrl="/quiz"
  >
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ClerkProvider>
);

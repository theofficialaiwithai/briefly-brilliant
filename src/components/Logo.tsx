import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-card transition-transform group-hover:scale-105">
      <BookOpen className="h-4 w-4" strokeWidth={2.5} />
    </span>
    <span className="font-bold tracking-tight text-foreground">Briefly Brilliant</span>
  </Link>
);
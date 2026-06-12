import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Nav } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";

type LibraryResource = {
  id: string;
  resource_name: string | null;
  category: string | null;
  cost_type: string | null;
  price_range: string | null;
  section_focus: string | null;
  url: string | null;
  action: "saved" | "completed";
};

type Tab = "saved" | "completed";

const Library = () => {
  const { user, isSignedIn } = useUser();
  const [tab, setTab] = useState<Tab>("saved");
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    (supabase as any)
      .from("feedback")
      .select("action, lsat_resources(id, resource_name, category, cost_type, price_range, section_focus, url)")
      .eq("clerk_id", user.id)
      .in("action", ["saved", "completed"])
      .then(
        ({
          data,
        }: {
          data:
            | Array<{
                action: string;
                lsat_resources: Omit<LibraryResource, "action"> | null;
              }>
            | null;
        }) => {
          if (data) {
            setResources(
              data
                .filter((row) => row.lsat_resources)
                .map((row) => ({
                  ...(row.lsat_resources as Omit<LibraryResource, "action">),
                  action: row.action as "saved" | "completed",
                }))
            );
          }
          setLoading(false);
        }
      );
  }, [isSignedIn, user?.id]);

  const filtered = resources.filter((r) => r.action === tab);
  const isFree = (r: LibraryResource) => r.cost_type !== "Paid";

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Nav />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10">
        <h1
          className="mb-1 font-bold"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#1A1A2E" }}
        >
          My Library
        </h1>
        <p className="mb-6 text-sm" style={{ color: "#6B7280" }}>
          Resources you've saved or completed.
        </p>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {(["saved", "completed"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all"
              style={
                tab === t
                  ? { background: "#0D9488", color: "white", border: "2px solid #0D9488" }
                  : { background: "white", color: "#4B5563", border: "2px solid #E5E7EB" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {!isSignedIn ? (
          <div
            className="rounded-2xl border bg-white p-10 text-center"
            style={{ borderColor: "#E5E7EB" }}
          >
            <p className="text-sm" style={{ color: "#4B5563" }}>
              <Link to="/auth" style={{ color: "#0D9488" }}>Sign in</Link> to see your library.
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-2xl border bg-white p-10 text-center"
            style={{ borderColor: "#E5E7EB" }}
          >
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              {tab === "saved" ? "No saved resources yet." : "No completed resources yet."}{" "}
              <Link to="/feed" style={{ color: "#0D9488" }}>
                Browse resources →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border bg-white p-5"
                style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/resources/${r.id}`}
                    className="font-semibold leading-snug hover:underline"
                    style={{ color: "#1A1A2E", fontSize: "0.95rem" }}
                  >
                    {r.resource_name ?? "Untitled"}
                  </Link>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Visit resource"
                      className="shrink-0 transition-colors text-[#6B7280] hover:text-[#0D9488]"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.category && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: "#F3F4F6", color: "#6B7280" }}
                    >
                      {r.category}
                    </span>
                  )}
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={
                      isFree(r)
                        ? { background: "#F0FDF4", color: "#16A34A" }
                        : { background: "#FFF7ED", color: "#D97706" }
                    }
                  >
                    {isFree(r) ? "Free" : r.price_range || "Paid"}
                  </span>
                  {r.section_focus && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: "#F3F4F6", color: "#6B7280" }}
                    >
                      {r.section_focus}
                    </span>
                  )}
                </div>
                {r.url && (
                  <div className="mt-4">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ color: "#0D9488" }}
                    >
                      Visit Resource
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Library;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-react";
import { Nav } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";

type ActivityRow = {
  resource_id: string;
  action: string;
  created_at: string;
  lsat_resources: { resource_name: string | null } | null;
};

type Stats = { completed: number; saved: number; skipped: number };

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  completed: { background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" },
  saved: { background: "#FFF7ED", color: "#D97706", border: "1px solid #FDE68A" },
  skipped: { background: "#F3F4F6", color: "#9CA3AF", border: "1px solid #E5E7EB" },
};

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ completed: 0, saved: 0, skipped: 0 });
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setLoading(false);
      return;
    }

    (supabase as any)
      .from("feedback")
      .select("resource_id, action, created_at, lsat_resources(resource_name)")
      .eq("clerk_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }: { data: ActivityRow[] | null }) => {
        if (data) setActivity(data);

        // Fetch totals separately (not limited to 10)
        (supabase as any)
          .from("feedback")
          .select("action")
          .eq("clerk_id", user.id)
          .then(({ data: allData }: { data: { action: string }[] | null }) => {
            if (allData) {
              const totals = { completed: 0, saved: 0, skipped: 0 };
              for (const r of allData) {
                if (r.action in totals) totals[r.action as keyof Stats]++;
              }
              setStats(totals);
            }
            setLoading(false);
          });
      });
  }, [isSignedIn, user?.id]);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Nav />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10">
        <h1
          className="mb-1 font-bold"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#1A1A2E" }}
        >
          Dashboard
        </h1>
        <p className="mb-8 text-sm" style={{ color: "#6B7280" }}>
          Track your progress across LSAT resources.
        </p>

        {!isSignedIn ? (
          <div
            className="rounded-2xl border bg-white p-10 text-center"
            style={{ borderColor: "#E5E7EB" }}
          >
            <p className="text-sm" style={{ color: "#4B5563" }}>
              <Link to="/auth" style={{ color: "#0D9488" }}>Sign in</Link> to see your progress.
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Chat with Bri card */}
            <div
              className="mb-8 rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, #0D9488 0%, #0F766E 60%, #134E4A 100%)",
                boxShadow: "0 4px 24px rgba(13,148,136,0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      fontFamily: "'Playfair Display', serif",
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    B
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      Chat with Bri
                    </h3>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: "Inter, sans-serif",
                        maxWidth: 380,
                      }}
                    >
                      Your AI LSAT coach — ask questions, get explanations, build your study plan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/chat")}
                  style={{
                    background: "white",
                    color: "#0D9488",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FDFA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  Start Chatting →
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              {(
                [
                  ["Completed", stats.completed, "#16A34A"],
                  ["Saved", stats.saved, "#D97706"],
                  ["Skipped", stats.skipped, "#9CA3AF"],
                ] as [string, number, string][]
              ).map(([label, count, color]) => (
                <div
                  key={label}
                  className="rounded-2xl border bg-white p-5 text-center"
                  style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
                >
                  <p className="text-3xl font-bold" style={{ color }}>{count}</p>
                  <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="mb-8">
              <h2 className="mb-4 text-base font-semibold" style={{ color: "#1A1A2E" }}>
                Recent Activity
              </h2>
              {activity.length === 0 ? (
                <div
                  className="rounded-2xl border bg-white p-8 text-center"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <p className="text-sm" style={{ color: "#9CA3AF" }}>
                    No activity yet.{" "}
                    <Link to="/feed" style={{ color: "#0D9488" }}>
                      Browse resources →
                    </Link>
                  </p>
                </div>
              ) : (
                <div
                  className="divide-y rounded-2xl border bg-white"
                  style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)", divideColor: "#F3F4F6" }}
                >
                  {activity.map((row, i) => (
                    <div
                      key={`${row.resource_id}-${row.action}-${i}`}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/resources/${row.resource_id}`}
                          className="block truncate text-sm font-medium hover:underline"
                          style={{ color: "#1A1A2E" }}
                        >
                          {row.lsat_resources?.resource_name ?? "Unknown resource"}
                        </Link>
                        <p className="mt-0.5 text-xs" style={{ color: "#9CA3AF" }}>
                          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <span
                        className="ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                        style={BADGE_STYLES[row.action] ?? {}}
                      >
                        {row.action}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Score progress placeholder */}
            <div>
              <h2 className="mb-4 text-base font-semibold" style={{ color: "#1A1A2E" }}>
                Score Progress
              </h2>
              <div
                className="rounded-2xl border bg-white p-8 text-center"
                style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
              >
                <p className="text-sm" style={{ color: "#9CA3AF" }}>
                  Score tracking coming soon. Mark resources as Completed to start building your
                  progress log.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, CheckCircle, ExternalLink, Loader2, X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Nav } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";
import { useRedditPosts } from "@/lib/useRedditPosts";

type ResourceData = {
  id: string;
  resource_name: string | null;
  category: string | null;
  format: string | null;
  section_focus: string | null;
  cost_type: string | null;
  price_range: string | null;
  best_score_range: string | null;
  weekly_hours: string | null;
  description: string | null;
  url: string | null;
  tags: string[] | null;
  reddit_search_term: string | null;
};

type FeedbackAction = "completed" | "saved" | "skipped";

const ACTION_CONFIG = [
  {
    id: "completed" as FeedbackAction,
    label: "Completed",
    Icon: CheckCircle,
    activeStyle: { background: "#F0FDF4", border: "1px solid #16A34A", color: "#16A34A" },
    defaultStyle: { background: "white", border: "1px solid #E5E7EB", color: "#1A1A2E" },
  },
  {
    id: "saved" as FeedbackAction,
    label: "Save",
    Icon: Bookmark,
    activeStyle: { background: "#FFF7ED", border: "1px solid #D97706", color: "#D97706" },
    defaultStyle: { background: "white", border: "1px solid #E5E7EB", color: "#1A1A2E" },
  },
  {
    id: "skipped" as FeedbackAction,
    label: "Skip",
    Icon: X,
    activeStyle: { background: "#F3F4F6", border: "1px solid #9CA3AF", color: "#9CA3AF" },
    defaultStyle: { background: "white", border: "1px solid #E5E7EB", color: "#6B7280" },
  },
];

const ResourceProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();

  const [resource, setResource] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAction, setCurrentAction] = useState<FeedbackAction | null>(null);
  const [communityCounts, setCommunityCounts] = useState({ completed: 0, saved: 0, skipped: 0 });
  const [whyText, setWhyText] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (supabase as any)
      .from("lsat_resources")
      .select("id, resource_name, category, format, section_focus, cost_type, price_range, best_score_range, weekly_hours, description, url, tags, reddit_search_term")
      .eq("id", id)
      .single()
      .then(({ data, error }: { data: ResourceData | null; error: unknown }) => {
        if (!error && data) setResource(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    try {
      const map = JSON.parse(sessionStorage.getItem("matchExplanations") ?? "{}");
      setWhyText(map[id] ?? null);
    } catch {
      // ignore
    }
  }, [id]);

  useEffect(() => {
    if (!isSignedIn || !user || !id) return;
    (supabase as any)
      .from("feedback")
      .select("action")
      .eq("clerk_id", user.id)
      .eq("resource_id", id)
      .then(({ data }: { data: { action: string }[] | null }) => {
        if (data && data.length > 0) setCurrentAction(data[0].action as FeedbackAction);
      });
  }, [isSignedIn, user?.id, id]);

  useEffect(() => {
    if (!id) return;
    (supabase as any)
      .from("feedback")
      .select("action")
      .eq("resource_id", id)
      .then(({ data }: { data: { action: string }[] | null }) => {
        if (!data) return;
        const counts = { completed: 0, saved: 0, skipped: 0 };
        for (const row of data) {
          if (row.action in counts) counts[row.action as FeedbackAction]++;
        }
        setCommunityCounts(counts);
      });
  }, [id]);

  const handleAction = async (action: FeedbackAction) => {
    if (!isSignedIn || !user || !id) return;
    const toggling = currentAction === action;
    const prevAction = currentAction;
    setCurrentAction(toggling ? null : action);

    await (supabase as any).from("feedback").delete()
      .eq("clerk_id", user.id).eq("resource_id", id);

    if (!toggling) {
      const { error } = await (supabase as any).from("feedback").insert({
        clerk_id: user.id,
        resource_id: id,
        action,
      });
      if (error) setCurrentAction(prevAction);
    }
  };

  const redditQuery = resource?.reddit_search_term ?? (resource ? `${resource.resource_name} LSAT` : "");
  const { posts, loading: redditLoading } = useRedditPosts(redditQuery);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#FAF7F2" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#0D9488" }} />
      </div>
    );
  }

  if (!resource) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
        <Nav />
        <div className="mx-auto max-w-4xl px-6 pt-20 text-center">
          <p className="mb-4 text-sm" style={{ color: "#4B5563" }}>Resource not found.</p>
          <Link to="/feed" style={{ color: "#0D9488" }}>← Back to Feed</Link>
        </div>
      </div>
    );
  }

  const scoreRange = resource.best_score_range || "120–180";
  const tags = Array.isArray(resource.tags) ? resource.tags : [];
  const sectionLabel = resource.section_focus || "All Sections";
  const costLabel =
    resource.cost_type === "Paid"
      ? resource.price_range || "Paid"
      : resource.cost_type || "Free";

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Nav />

      {/* Sticky subheader */}
      <div className="sticky top-0 z-10 border-b bg-white" style={{ borderColor: "#E5E7EB" }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-[#1A1A2E]"
            style={{ color: "#6B7280" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#0D9488", borderRadius: 8, padding: "8px 16px" }}
            >
              Visit Resource
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: "#0D9488" }}
            >
              Resource
            </span>
            {resource.category && (
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: "#F3F4F6", color: "#6B7280" }}
              >
                {resource.category}
              </span>
            )}
          </div>
          <h1
            className="font-bold leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#1A1A2E" }}
          >
            {resource.resource_name ?? "Untitled"}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: "#F3F4F6", color: "#4B5563" }}
              >
                {tag}
              </span>
            ))}
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: "#E1F5EE", color: "#0D9488" }}
            >
              Score: {scoreRange}
            </span>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* LEFT */}
          <div className="space-y-5">
            {/* About */}
            <div
              className="rounded-2xl border bg-white p-6"
              style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
            >
              <h2 className="mb-3 text-base font-semibold" style={{ color: "#1A1A2E" }}>About</h2>
              <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                {resource.description || "No description available."}
              </p>
              {whyText && (
                <div className="mt-4 rounded-lg p-4" style={{ background: "#F0FDFA" }}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                    Why this fits you
                  </p>
                  <p className="text-sm italic leading-relaxed" style={{ color: "#4B5563" }}>
                    {whyText}
                  </p>
                </div>
              )}
            </div>

            {/* Reddit */}
            <div
              className="rounded-2xl border bg-white p-6"
              style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
            >
              <h2 className="mb-3 text-base font-semibold" style={{ color: "#1A1A2E" }}>From r/LSAT</h2>
              {redditLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm" style={{ color: "#6B7280" }}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading discussions…
                </div>
              ) : posts.length === 0 ? (
                <p className="text-sm" style={{ color: "#9CA3AF" }}>No discussions found.</p>
              ) : (
                <ul className="space-y-3">
                  {posts.slice(0, 5).map((post) => (
                    <li
                      key={post.permalink}
                      className="border-b pb-3 last:border-none last:pb-0"
                      style={{ borderColor: "#F3F4F6" }}
                    >
                      <a
                        href={`https://reddit.com${post.permalink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm font-medium leading-snug hover:underline"
                        style={{ color: "#1A1A2E" }}
                      >
                        {post.title}
                      </a>
                      <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: "#9CA3AF" }}>
                        <span>↑ {post.score}</span>
                        <span>{post.num_comments} comments</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* Your Status */}
            <div
              className="rounded-2xl border bg-white p-6"
              style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
            >
              <h2 className="mb-3 text-base font-semibold" style={{ color: "#1A1A2E" }}>Your Status</h2>
              {!isSignedIn ? (
                <p className="text-sm" style={{ color: "#9CA3AF" }}>
                  <Link to="/auth" style={{ color: "#0D9488" }}>Sign in</Link> to track your progress.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {ACTION_CONFIG.map(({ id: actionId, label, Icon, activeStyle, defaultStyle }) => {
                    const isActive = currentAction === actionId;
                    return (
                      <button
                        key={actionId}
                        onClick={() => handleAction(actionId)}
                        style={{
                          ...(isActive ? activeStyle : defaultStyle),
                          borderRadius: 8,
                          padding: "9px 14px",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "all 0.15s",
                          cursor: "pointer",
                          width: "100%",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Community */}
            <div
              className="rounded-2xl border bg-white p-6"
              style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
            >
              <h2 className="mb-3 text-base font-semibold" style={{ color: "#1A1A2E" }}>Community</h2>
              <div className="space-y-2">
                {(
                  [
                    ["Completed", communityCounts.completed],
                    ["Saved", communityCounts.saved],
                    ["Skipped", communityCounts.skipped],
                  ] as [string, number][]
                ).map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span style={{ color: "#4B5563" }}>{label}</span>
                    <span className="font-semibold" style={{ color: "#1A1A2E" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div
              className="rounded-2xl border bg-white p-6"
              style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
            >
              <h2 className="mb-3 text-base font-semibold" style={{ color: "#1A1A2E" }}>Details</h2>
              <div className="space-y-2">
                {(
                  [
                    ["Section", sectionLabel],
                    ["Cost", costLabel],
                    ["Weekly Hours", resource.weekly_hours || "Varies"],
                    ["Score Range", scoreRange],
                    ...(resource.format ? [["Format", resource.format]] : []),
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-2 text-sm">
                    <span style={{ color: "#6B7280" }}>{label}</span>
                    <span className="text-right font-medium" style={{ color: "#1A1A2E" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {resource.url && (
          <div className="mt-10 text-center">
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#0D9488", borderRadius: 99, padding: "14px 36px", fontSize: "1rem" }}
            >
              Visit Resource
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResourceProfile;

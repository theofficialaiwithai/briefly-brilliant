import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookPlus, Bookmark, Check, CheckCircle, ExternalLink, Loader2, X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Nav } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";

const getYouTubeInfo = (url: string) => {
  try {
    const u = new URL(url);
    const playlistId = u.searchParams.get("list");
    const videoId = u.hostname.includes("youtu.be")
      ? u.pathname.slice(1)
      : u.searchParams.get("v");
    return { videoId, playlistId, isPlaylist: !!playlistId };
  } catch {
    return { videoId: null, playlistId: null, isPlaylist: false };
  }
};

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

type PlaylistVideo = {
  videoId: string;
  title: string;
  thumbnail?: string;
  description: string;
  position: number;
};

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

  // ── Existing state ────────────────────────────────────────────────────────
  const [resource, setResource] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAction, setCurrentAction] = useState<FeedbackAction | null>(null);
  const [communityCounts, setCommunityCounts] = useState({ completed: 0, saved: 0, skipped: 0 });
  const [whyText, setWhyText] = useState<string | null>(null);
  const [redditPosts, setRedditPosts] = useState<any[]>([]);
  const [redditLoading, setRedditLoading] = useState(true);
  const [inCurriculum, setInCurriculum] = useState(false);
  const [curriculumNote, setCurriculumNote] = useState<string | null>(null);

  // ── Video series state ────────────────────────────────────────────────────
  const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [watchedVideoIds, setWatchedVideoIds] = useState<Set<string>>(new Set());
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  // ── YT player refs ────────────────────────────────────────────────────────
  const playerIdRef = useRef(`yt-player-${Math.random().toString(36).slice(2)}`);
  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);
  const autoAdvanceRef = useRef(true);
  const currentIdxRef = useRef(0);
  const playlistLenRef = useRef(0);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived values ────────────────────────────────────────────────────────
  const ytInfo = resource?.url ? getYouTubeInfo(resource.url) : { videoId: null, playlistId: null, isPlaylist: false };
  const { videoId: ytVideoId, playlistId: ytPlaylistId, isPlaylist } = ytInfo;
  const currentVideo = playlistVideos[currentVideoIndex] ?? null;
  const watchedCount = playlistVideos.filter(v => watchedVideoIds.has(v.videoId)).length;

  // keep refs in sync with state
  useEffect(() => { autoAdvanceRef.current = autoAdvance; }, [autoAdvance]);
  useEffect(() => { playlistLenRef.current = playlistVideos.length; }, [playlistVideos.length]);

  // ── Fetch resource ────────────────────────────────────────────────────────
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

  // ── Why-text from session ─────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    try {
      const map = JSON.parse(sessionStorage.getItem("matchExplanations") ?? "{}");
      setWhyText(map[id] ?? null);
    } catch { /* ignore */ }
  }, [id]);

  // ── User's feedback action ────────────────────────────────────────────────
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

  // ── Community counts ──────────────────────────────────────────────────────
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

  // ── Curriculum membership ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isSignedIn || !user || !id) return;
    (supabase as any)
      .from("curriculum_items")
      .select("id")
      .eq("clerk_id", user.id)
      .eq("resource_id", id)
      .then(({ data }: { data: { id: string }[] | null }) => {
        if (data && data.length > 0) setInCurriculum(true);
      });
  }, [isSignedIn, user?.id, id]);

  // ── Reddit posts ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchReddit = async () => {
      const searchTerm = resource!.reddit_search_term || `${resource!.resource_name} LSAT`;
      const url = `https://www.reddit.com/r/LSAT/search.json?q=${encodeURIComponent(searchTerm)}&sort=top&t=all&limit=5&restrict_sr=1`;
      try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        const json = await res.json();
        const posts = json?.data?.children?.map((child: any) => child.data) ?? [];
        setRedditPosts(posts.slice(0, 3));
      } catch (err) {
        console.error("[Reddit fetch error]", err);
        setRedditPosts([]);
      } finally {
        setRedditLoading(false);
      }
    };
    if (resource) fetchReddit();
  }, [resource]);

  // ── Auto-advance setting ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from("users")
      .select("auto_advance_videos")
      .eq("clerk_id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data?.auto_advance_videos !== undefined) setAutoAdvance(data.auto_advance_videos);
      });
  }, [user?.id]);

  // ── Fetch playlist videos + watched progress ──────────────────────────────
  useEffect(() => {
    if (!isPlaylist || !ytPlaylistId || !resource) return;

    const fetchPlaylist = async () => {
      setPlaylistLoading(true);
      try {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        if (!apiKey) throw new Error("No API key");
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${ytPlaylistId}&maxResults=50&key=${apiKey}`;
        const res = await fetch(apiUrl);
        const json = await res.json();
        if (json.error) throw new Error(json.error.message);

        const videos: PlaylistVideo[] = (json.items ?? []).map((item: any) => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails?.default?.url,
          description: item.snippet.description ?? "",
          position: item.snippet.position,
        }));

        let watchedSet = new Set<string>();
        if (user && id) {
          const { data: progressData } = await (supabase as any)
            .from("video_progress")
            .select("youtube_video_id")
            .eq("clerk_id", user.id)
            .eq("resource_id", id);
          watchedSet = new Set((progressData ?? []).map((r: any) => r.youtube_video_id as string));
        }

        setPlaylistVideos(videos);
        setWatchedVideoIds(watchedSet);
        const firstUnwatched = videos.findIndex(v => !watchedSet.has(v.videoId));
        setCurrentVideoIndex(firstUnwatched >= 0 ? firstUnwatched : 0);
      } catch (err) {
        console.error("[Playlist fetch error]", err);
        setPlaylistVideos([]);
      } finally {
        setPlaylistLoading(false);
      }
    };

    fetchPlaylist();
  }, [isPlaylist, ytPlaylistId, resource?.id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Init YT IFrame API player ─────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaylist || playlistVideos.length === 0) return;

    let cancelled = false;
    const playerId = playerIdRef.current;
    const firstVideoId = playlistVideos[currentVideoIndex]?.videoId ?? playlistVideos[0].videoId;

    const createPlayer = () => {
      if (cancelled || playerRef.current || !document.getElementById(playerId)) return;
      playerRef.current = new (window as any).YT.Player(playerId, {
        height: "100%",
        width: "100%",
        videoId: firstVideoId,
        playerVars: { enablejsapi: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            playerReadyRef.current = true;
          },
          onStateChange: (event: any) => {
            if (event.data === 0) {
              // video ended
              if (autoAdvanceRef.current && currentIdxRef.current < playlistLenRef.current - 1) {
                setCountdown(2);
                countdownTimerRef.current = window.setTimeout(() => {
                  setCurrentVideoIndex(i => i + 1);
                  setCountdown(null);
                }, 2000);
              }
            }
          },
        },
      });
    };

    if ((window as any).YT?.Player) {
      createPlayer();
    } else {
      if (!document.getElementById("yt-api-script")) {
        const script = document.createElement("script");
        script.id = "yt-api-script";
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
      const prev = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        prev?.();
        createPlayer();
      };
    }

    return () => {
      cancelled = true;
      playerReadyRef.current = false;
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
    };
  }, [isPlaylist, playlistVideos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle video index changes ────────────────────────────────────────────
  useEffect(() => {
    // cancel any in-flight countdown
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    currentIdxRef.current = currentVideoIndex;

    if (playerRef.current && playerReadyRef.current && playlistVideos.length > 0) {
      const video = playlistVideos[currentVideoIndex];
      if (video) {
        try { playerRef.current.loadVideoById(video.videoId); } catch {}
      }
    }

    // scroll sidebar to active item
    document.getElementById(`playlist-item-${currentVideoIndex}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentVideoIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddToCurriculum = async () => {
    if (!isSignedIn || !user || !resource) {
      setCurriculumNote("Sign in to save to your curriculum");
      setTimeout(() => setCurriculumNote(null), 2000);
      return;
    }
    setInCurriculum(true);
    const { error } = await (supabase as any).from("curriculum_items").insert({
      clerk_id: user.id,
      resource_id: id,
      title: resource.resource_name,
      description: resource.description,
      url: resource.url,
      type: "resource",
    });
    if (error) {
      setInCurriculum(false);
      setCurriculumNote("Couldn't add. Try again.");
      setTimeout(() => setCurriculumNote(null), 3000);
    }
  };

  const handleAction = async (action: FeedbackAction) => {
    if (!isSignedIn || !user || !id) return;
    const toggling = currentAction === action;
    const prevAction = currentAction;
    setCurrentAction(toggling ? null : action);

    await (supabase as any).from("feedback").delete()
      .eq("clerk_id", user.id).eq("resource_id", id);

    if (!toggling) {
      const { error } = await (supabase as any).from("feedback").insert({
        clerk_id: user.id, resource_id: id, action,
      });
      if (error) setCurrentAction(prevAction);
    }
  };

  const handleMarkWatched = async () => {
    if (!user || !currentVideo || watchedVideoIds.has(currentVideo.videoId)) return;
    const videoId = currentVideo.videoId;
    setWatchedVideoIds(prev => { const n = new Set(prev); n.add(videoId); return n; });
    await (supabase as any).from("video_progress").upsert(
      {
        clerk_id: user.id,
        resource_id: id,
        youtube_video_id: videoId,
        watched: true,
        watched_at: new Date().toISOString(),
      },
      { onConflict: "clerk_id,resource_id,youtube_video_id" }
    );
  };

  const handleAddSeriesToCurriculum = async () => {
    if (!user || !resource || playlistVideos.length === 0) return;
    const { data: existing } = await (supabase as any)
      .from("curriculum_items").select("url").eq("clerk_id", user.id);
    const existingUrls = new Set((existing ?? []).map((r: any) => r.url as string));
    const toAdd = playlistVideos
      .filter(v => !existingUrls.has(`https://youtube.com/watch?v=${v.videoId}`))
      .map(v => ({
        clerk_id: user.id,
        resource_id: id,
        title: v.title,
        url: `https://youtube.com/watch?v=${v.videoId}`,
        type: "video",
        position: v.position,
      }));
    if (toAdd.length > 0) {
      await (supabase as any).from("curriculum_items").insert(toAdd);
      toast.success(`Added ${toAdd.length} videos to your Study Curriculum ✓`);
    } else {
      toast("All videos already in your curriculum");
    }
  };

  const cancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  };

  // ── Loading / not-found guards ────────────────────────────────────────────
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
  const isLastVideo = currentVideoIndex >= playlistVideos.length - 1;

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
            <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: "#0D9488" }}>
              Resource
            </span>
            {resource.category && (
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "#F3F4F6", color: "#6B7280" }}>
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
            {tags.map(tag => (
              <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "#F3F4F6", color: "#4B5563" }}>
                {tag}
              </span>
            ))}
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "#E1F5EE", color: "#0D9488" }}>
              Score: {scoreRange}
            </span>
          </div>
        </div>

        {/* ── YouTube / Playlist player ───────────────────────────────────── */}
        {resource.url && (
          <>
            {/* ── SERIES PLAYER ── */}
            {isPlaylist && (
              <>
                {playlistLoading && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "32px 0 20px", color: "#6B7280" }}>
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#0D9488" }} />
                    <span style={{ fontSize: "0.875rem" }}>Loading playlist…</span>
                  </div>
                )}

                {!playlistLoading && playlistVideos.length > 0 && currentVideo && (
                  <div style={{ maxWidth: 960, margin: "0 auto 32px" }}>
                    {/* Progress bar row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: "0.85rem", color: "#6B7280" }}>
                        {watchedCount} of {playlistVideos.length} videos watched
                      </span>
                      <div style={{ width: 140, height: 6, borderRadius: 99, backgroundColor: "#E5E7EB", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 99,
                            backgroundColor: "#0D9488",
                            width: `${playlistVideos.length > 0 ? (watchedCount / playlistVideos.length) * 100 : 0}%`,
                            transition: "width 0.4s",
                          }}
                        />
                      </div>
                    </div>

                    {/* Two-column layout */}
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

                      {/* LEFT: main player */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* 16:9 iframe */}
                        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
                          <div
                            id={playerIdRef.current}
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                          />
                          {/* Auto-advance countdown overlay */}
                          {countdown !== null && (
                            <div
                              style={{
                                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: "rgba(0,0,0,0.72)",
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                gap: 14, zIndex: 10, borderRadius: 12,
                              }}
                            >
                              <p style={{ color: "white", fontSize: "1rem", fontWeight: 500, margin: 0 }}>
                                Next video in {countdown}…
                              </p>
                              <button
                                onClick={cancelCountdown}
                                style={{
                                  background: "white", border: "none", borderRadius: 6,
                                  padding: "7px 20px", fontSize: "0.875rem", fontWeight: 500,
                                  cursor: "pointer", color: "#1A1A2E",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Current video title */}
                        <p style={{ marginTop: 12, fontWeight: 600, fontSize: "1rem", color: "#1A1A2E", fontFamily: "Inter, sans-serif", lineHeight: 1.4 }}>
                          {currentVideo.title}
                        </p>

                        {/* Button row */}
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                          {watchedVideoIds.has(currentVideo.videoId) ? (
                            <button
                              disabled
                              style={{
                                background: "#F0FDF4", border: "1px solid #16A34A", color: "#16A34A",
                                borderRadius: 8, padding: "8px 14px", fontSize: "0.875rem", fontWeight: 500,
                                cursor: "default", display: "inline-flex", alignItems: "center", gap: 6,
                              }}
                            >
                              ✓ Watched
                            </button>
                          ) : (
                            <button
                              onClick={handleMarkWatched}
                              style={{
                                background: "white", border: "1px solid #E5E7EB", color: "#1A1A2E",
                                borderRadius: 8, padding: "8px 14px", fontSize: "0.875rem", fontWeight: 500,
                                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                              }}
                            >
                              <Check size={14} />
                              Mark as Watched
                            </button>
                          )}

                          <button
                            onClick={() => setCurrentVideoIndex(i => i + 1)}
                            disabled={isLastVideo}
                            style={{
                              background: "white",
                              border: `1.5px solid ${isLastVideo ? "#D1D5DB" : "#0D9488"}`,
                              color: isLastVideo ? "#9CA3AF" : "#0D9488",
                              borderRadius: 8, padding: "8px 16px", fontSize: "0.875rem", fontWeight: 500,
                              cursor: isLastVideo ? "not-allowed" : "pointer",
                              display: "inline-flex", alignItems: "center", gap: 4,
                            }}
                          >
                            Next →
                          </button>
                        </div>
                      </div>

                      {/* RIGHT: playlist sidebar */}
                      <div style={{ width: 280, flexShrink: 0 }}>
                        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                          <div style={{ padding: "14px 16px", borderBottom: "1px solid #E5E7EB" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1A1A2E" }}>Up next</span>
                          </div>
                          <div style={{ maxHeight: 380, overflowY: "auto" }}>
                            {playlistVideos.map((video, idx) => {
                              const isActive = idx === currentVideoIndex;
                              const isWatched = watchedVideoIds.has(video.videoId);
                              return (
                                <div
                                  key={video.videoId}
                                  id={`playlist-item-${idx}`}
                                  onClick={() => setCurrentVideoIndex(idx)}
                                  style={{
                                    padding: "10px 12px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #F3F4F6",
                                    borderLeft: isActive ? "3px solid #0D9488" : "3px solid transparent",
                                    backgroundColor: isActive ? "#F0FDFA" : "transparent",
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "flex-start",
                                  }}
                                >
                                  {/* Thumbnail */}
                                  <div style={{ position: "relative", flexShrink: 0 }}>
                                    {video.thumbnail ? (
                                      <img
                                        src={video.thumbnail}
                                        alt=""
                                        style={{ width: 40, height: 28, borderRadius: 4, objectFit: "cover", display: "block" }}
                                      />
                                    ) : (
                                      <div style={{ width: 40, height: 28, borderRadius: 4, backgroundColor: "#E5E7EB" }} />
                                    )}
                                    {isWatched && (
                                      <div
                                        style={{
                                          position: "absolute", bottom: -3, right: -3,
                                          width: 14, height: 14, borderRadius: "50%",
                                          backgroundColor: "#0D9488",
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                          border: "1.5px solid white",
                                        }}
                                      >
                                        <span style={{ color: "white", fontSize: 8, fontWeight: 700, lineHeight: 1 }}>✓</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: "0.8rem",
                                      color: "#1A1A2E",
                                      lineHeight: 1.35,
                                      overflow: "hidden",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      textOverflow: "ellipsis",
                                    } as React.CSSProperties}
                                  >
                                    {video.title}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Series action buttons */}
                    <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                      <button
                        onClick={handleAddSeriesToCurriculum}
                        style={{
                          background: "white", border: "1.5px solid #0D9488", color: "#0D9488",
                          borderRadius: 8, padding: "10px 18px", fontSize: "0.875rem", fontWeight: 500,
                          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                        }}
                      >
                        <BookPlus size={14} />
                        Add Series to Study Curriculum
                      </button>
                      <button
                        onClick={() => toast("Learning Hub coming soon — finish setting up your hub first!")}
                        style={{
                          background: "white", border: "1.5px solid #0D9488", color: "#0D9488",
                          borderRadius: 8, padding: "10px 18px", fontSize: "0.875rem", fontWeight: 500,
                          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                        }}
                      >
                        <BookPlus size={14} />
                        Add Series to Learning Hub
                      </button>
                    </div>
                  </div>
                )}

                {/* Fallback: playlist embed when API fails */}
                {!playlistLoading && playlistVideos.length === 0 && ytPlaylistId && (
                  <div style={{ maxWidth: 960, margin: "0 auto 32px" }}>
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
                      <iframe
                        src={`https://www.youtube.com/embed/videoseries?list=${ytPlaylistId}`}
                        title={resource.resource_name ?? ""}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── SINGLE VIDEO EMBED (unchanged) ── */}
            {!isPlaylist && ytVideoId && (
              <div style={{ maxWidth: 960, margin: "0 auto 32px" }}>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytVideoId}`}
                    title={resource.resource_name ?? ""}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Two-column grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* LEFT */}
          <div className="space-y-5">
            {/* About */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
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
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ color: "#FF4500", fontSize: 18 }}>●</span>
                <span style={{ fontWeight: 600, color: "#1A1A2E", fontSize: "0.95rem" }}>What Reddit says</span>
              </div>

              {redditLoading && (
                <div>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: 60, background: "#F3F4F6", borderRadius: 8, marginBottom: 10 }} />
                  ))}
                </div>
              )}

              {!redditLoading && redditPosts.length === 0 && (
                <p style={{ color: "#6B7280", fontSize: "0.875rem", fontStyle: "italic" }}>
                  No Reddit discussions found for this resource. Try searching{" "}
                  <a
                    href={`https://www.reddit.com/r/LSAT/search/?q=${encodeURIComponent(resource.reddit_search_term || resource.resource_name || "")}&sort=top`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#0D9488" }}
                  >
                    r/LSAT directly →
                  </a>
                </p>
              )}

              {!redditLoading && redditPosts.length > 0 && (
                <div>
                  {redditPosts.map((post, i) => (
                    <a
                      key={i}
                      href={`https://reddit.com${post.permalink}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "block", padding: "10px 12px", borderRadius: 8, marginBottom: 8, textDecoration: "none", background: "#FAFAFA", border: "1px solid #F3F4F6" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F0FDFA")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#FAFAFA")}
                    >
                      <p style={{ margin: "0 0 4px", fontSize: "0.875rem", fontWeight: 500, color: "#1A1A2E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {post.title}
                      </p>
                      {post.selftext && (
                        <p style={{ margin: "0 0 6px", fontSize: "0.8rem", color: "#6B7280", fontStyle: "italic" }}>
                          {post.selftext.slice(0, 120)}{post.selftext.length > 120 ? "..." : ""}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 12, fontSize: "0.75rem" }}>
                        <span style={{ color: "#0D9488" }}>▲ {post.score}</span>
                        <span style={{ color: "#6B7280" }}>{post.num_comments} comments</span>
                        <span style={{ color: "#9CA3AF" }}>r/{post.subreddit}</span>
                      </div>
                    </a>
                  ))}
                  <a
                    href={`https://www.reddit.com/r/LSAT/search/?q=${encodeURIComponent(resource.reddit_search_term || resource.resource_name || "")}&sort=top`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "block", marginTop: 8, fontSize: "0.8rem", color: "#0D9488", fontWeight: 500 }}
                  >
                    See all Reddit discussions →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* Your Status */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
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
                          borderRadius: 8, padding: "9px 14px", fontSize: "0.85rem", fontWeight: 500,
                          display: "inline-flex", alignItems: "center", gap: 6,
                          transition: "all 0.15s", cursor: "pointer", width: "100%", justifyContent: "flex-start",
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    );
                  })}
                  <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 4, paddingTop: 8 }}>
                    <button
                      onClick={handleAddToCurriculum}
                      disabled={inCurriculum}
                      style={inCurriculum
                        ? { background: "#F0FDF4", border: "1.5px solid #16A34A", color: "#16A34A", borderRadius: 8, padding: "10px", fontSize: "0.875rem", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center", cursor: "default" }
                        : { background: "white", border: "1.5px solid #0D9488", color: "#0D9488", borderRadius: 8, padding: "10px", fontSize: "0.875rem", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center", cursor: "pointer" }
                      }
                    >
                      <BookPlus className="h-4 w-4" />
                      {inCurriculum ? "✓ Added to Curriculum" : "Add to Study Curriculum"}
                    </button>
                    {curriculumNote && (
                      <p style={{ marginTop: 6, fontSize: "0.8rem", color: curriculumNote.startsWith("Sign") ? "#6B7280" : "#DC2626", textAlign: "center" }}>
                        {curriculumNote}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Community */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
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
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
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

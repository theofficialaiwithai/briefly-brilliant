import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Globe, MapPin, Users, X } from "lucide-react";
import { Nav } from "@/components/Nav";
import { SEO } from "@/components/SEO";
import { useSupabaseClient } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

// ── Types ────────────────────────────────────────────────────────────────────

type DbGroup = {
  id: string;
  name: string;
  description: string | null;
  type: "in-person" | "online";
  location: string | null;
  city: string | null;
  state: string | null;
  meeting_frequency: string | null;
  max_members: number;
  member_count: number;
  tags: string[] | null;
  created_by: string;
  is_featured: boolean;
  external_url: string | null;
  created_at: string;
};

// groups/group_members are new tables not yet in generated Database types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}k`;
  return `${n}`;
}

// ── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div
    className="animate-pulse rounded-lg border bg-white p-5"
    style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-3/4 rounded bg-gray-100" />
        <div className="mt-2 flex gap-2">
          <div className="h-5 w-16 rounded-full bg-gray-100" />
          <div className="h-5 w-20 rounded-full bg-gray-100" />
        </div>
      </div>
      <div className="h-9 w-28 shrink-0 rounded-lg bg-gray-200" />
    </div>
  </div>
);

// ── Group Card ───────────────────────────────────────────────────────────────

type CardContext = "discover" | "mine";

type GroupCardProps = {
  group: DbGroup;
  context: CardContext;
  isMember: boolean;
  isOwner: boolean;
  isSignedIn: boolean;
  joiningId: string | null;
  leavingId: string | null;
  onJoin: (group: DbGroup) => void;
  onLeavePrompt: (id: string) => void;
  onLeaveCancel: () => void;
  onLeaveConfirm: (group: DbGroup) => void;
};

const GroupCard = ({
  group,
  context,
  isMember,
  isOwner,
  isSignedIn,
  joiningId,
  leavingId,
  onJoin,
  onLeavePrompt,
  onLeaveCancel,
  onLeaveConfirm,
}: GroupCardProps) => {
  const joining = joiningId === group.id;
  const confirming = leavingId === group.id;

  const typeBadge = (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
      style={
        group.type === "online"
          ? { background: "#EFF6FF", color: "#3B82F6" }
          : { background: "#FEF3C7", color: "#D97706" }
      }
    >
      {group.type === "online" ? "Online" : "In-Person"}
    </span>
  );

  let actionNode: React.ReactNode;

  if (group.is_featured) {
    actionNode = (
      <a
        href={group.external_url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-teal-50"
        style={{ border: "1.5px solid #0D9488", color: "#0D9488" }}
      >
        Join Community →
      </a>
    );
  } else if (context === "mine") {
    if (isOwner) {
      actionNode = (
        <button
          className="rounded-lg border px-4 py-2 text-sm font-medium"
          style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
          title="Coming soon"
        >
          Manage
        </button>
      );
    } else if (confirming) {
      actionNode = (
        <div className="text-right">
          <p className="mb-1.5 text-xs" style={{ color: "#4B5563" }}>
            Leave <span className="font-medium">{group.name}</span>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onLeaveConfirm(group)}
              className="rounded px-2.5 py-1 text-xs font-medium"
              style={{ background: "#FEE2E2", color: "#DC2626" }}
            >
              Yes
            </button>
            <button
              onClick={onLeaveCancel}
              className="rounded px-2.5 py-1 text-xs font-medium"
              style={{ background: "#F3F4F6", color: "#6B7280" }}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    } else {
      actionNode = (
        <button
          onClick={() => onLeavePrompt(group.id)}
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={{ color: "#6B7280" }}
        >
          Leave Group
        </button>
      );
    }
  } else {
    if (!isSignedIn) {
      actionNode = (
        <Link
          to="/auth"
          className="block text-center text-xs font-medium"
          style={{ color: "#0D9488" }}
        >
          Sign in to join
        </Link>
      );
    } else if (isMember) {
      actionNode = (
        <span
          className="rounded-lg px-4 py-2 text-sm font-medium cursor-default select-none"
          style={{ background: "#F0FDF4", color: "#16A34A" }}
        >
          Joined ✓
        </span>
      );
    } else {
      actionNode = (
        <button
          onClick={() => onJoin(group)}
          disabled={joining}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-teal-50 disabled:opacity-60"
          style={{ border: "1.5px solid #0D9488", color: "#0D9488" }}
        >
          {joining ? "Joining…" : "Join"}
        </button>
      );
    }
  }

  return (
    <div
      className="rounded-lg border bg-white p-5 transition-shadow hover:shadow-md"
      style={{ borderColor: "#E5E7EB", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold leading-snug" style={{ color: "#1A1A2E" }}>
              {group.name}
            </h3>
            {typeBadge}
            {isOwner && context === "mine" && (
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ background: "#F3F4F6", color: "#6B7280" }}
              >
                Created by you
              </span>
            )}
          </div>

          {group.description && (
            <p className="mb-2 line-clamp-2 text-sm" style={{ color: "#4B5563" }}>
              {group.description}
            </p>
          )}

          {(group.tags ?? []).length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {(group.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{ background: "#F3F4F6", color: "#6B7280" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "#6B7280" }}
          >
            <Users className="h-3.5 w-3.5" />
            <span>{fmtCount(group.member_count)} members</span>
            {group.meeting_frequency && context === "mine" && (
              <>
                <span className="mx-1">·</span>
                <span>{group.meeting_frequency}</span>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0">{actionNode}</div>
      </div>
    </div>
  );
};

// ── Create Group Modal ────────────────────────────────────────────────────────

const FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly", "Flexible"];

type CreateGroupModalProps = {
  userId: string;
  supabase: AnyClient;
  onClose: () => void;
  onSuccess: (group: DbGroup) => void;
};

const CreateGroupModal = ({ userId, supabase, onClose, onSuccess }: CreateGroupModalProps) => {
  const [name, setName] = useState("");
  const [groupType, setGroupType] = useState<"online" | "in-person">("online");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [maxMembers, setMaxMembers] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Group name is required.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      const { data: newGroup, error: grpErr } = await supabase
        .from("groups")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          type: groupType,
          city: groupType === "in-person" ? city.trim() || null : null,
          state: groupType === "in-person" ? stateVal.trim() || null : null,
          meeting_frequency: frequency,
          max_members: maxMembers,
          member_count: 1,
          tags: [],
          created_by: userId,
          is_featured: false,
        })
        .select()
        .single();
      if (grpErr) throw grpErr;

      await supabase.from("group_members").insert({
        group_id: newGroup.id,
        clerk_id: userId,
        role: "admin",
      });

      onSuccess(newGroup as DbGroup);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full overflow-y-auto bg-white"
        style={{ maxWidth: 480, borderRadius: 16, padding: 32, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "1.2rem",
            color: "#1A1A2E",
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          Start a Study Group
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1A1A2E" }}>
              Group Name <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicago LSAT Study Circle"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal-500"
              style={{ borderColor: "#E5E7EB", color: "#1A1A2E" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1A1A2E" }}>
              Group Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["online", "in-person"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setGroupType(t)}
                  className="flex flex-col items-center gap-2 rounded-lg p-4 text-sm font-medium transition-all"
                  style={
                    groupType === t
                      ? { border: "2px solid #0D9488", background: "#F0FDFA", color: "#0D9488" }
                      : { border: "1px solid #E5E7EB", background: "white", color: "#4B5563" }
                  }
                >
                  {t === "online" ? (
                    <Globe className="h-5 w-5" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                  {t === "online" ? "Online" : "In-Person"}
                </button>
              ))}
            </div>
          </div>

          {groupType === "in-person" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1A1A2E" }}>
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                  style={{ borderColor: "#E5E7EB", color: "#1A1A2E" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1A1A2E" }}>
                  State
                </label>
                <input
                  type="text"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  placeholder="State"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                  style={{ borderColor: "#E5E7EB", color: "#1A1A2E" }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1A1A2E" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What will your group focus on? Who is it for?"
              className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              style={{ borderColor: "#E5E7EB", color: "#1A1A2E" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1A1A2E" }}>
              Meeting Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              style={{ borderColor: "#E5E7EB", color: "#1A1A2E" }}
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "#1A1A2E" }}>
              Max Members
            </label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) =>
                setMaxMembers(Math.min(100, Math.max(2, parseInt(e.target.value) || 2)))
              }
              min={2}
              max={100}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              style={{ borderColor: "#E5E7EB", color: "#1A1A2E" }}
            />
          </div>

          {formError && (
            <p className="text-sm" style={{ color: "#DC2626" }}>
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#0D9488" }}
          >
            {submitting ? "Creating…" : "Create Group"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ color: "#6B7280" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Groups Page ───────────────────────────────────────────────────────────────

const Groups = () => {
  const supabase = useSupabaseClient() as AnyClient;
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();

  const [tab, setTab] = useState<"discover" | "mygroups">("discover");
  const [typeFilter, setTypeFilter] = useState<"all" | "online" | "in-person">("all");
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<DbGroup[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFetchError(false);
      try {
        const { data: grpData, error: grpErr } = await supabase
          .from("groups")
          .select("*")
          .order("is_featured", { ascending: false })
          .order("member_count", { ascending: false });

        if (grpErr) throw grpErr;
        if (!cancelled) setGroups(grpData ?? []);

        if (isSignedIn && user) {
          const { data: membData } = await supabase
            .from("group_members")
            .select("group_id")
            .eq("clerk_id", user.id);
          if (!cancelled)
            setMyGroupIds(
              new Set((membData ?? []).map((m: { group_id: string }) => m.group_id))
            );
        } else if (!cancelled) {
          setMyGroupIds(new Set());
        }
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, isSignedIn, user?.id]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const featuredGroups = useMemo(() => groups.filter((g) => g.is_featured), [groups]);
  const localGroups = useMemo(() => groups.filter((g) => !g.is_featured), [groups]);
  const myGroups = useMemo(
    () => groups.filter((g) => myGroupIds.has(g.id)),
    [groups, myGroupIds]
  );

  const applyFilters = (list: DbGroup[]) => {
    let out = list;
    if (typeFilter !== "all") out = out.filter((g) => g.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.description ?? "").toLowerCase().includes(q) ||
          (g.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return out;
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleJoin = async (group: DbGroup) => {
    if (!isSignedIn || !user) return;
    setJoiningId(group.id);
    try {
      const { error } = await supabase.from("group_members").insert({
        group_id: group.id,
        clerk_id: user.id,
        role: "member",
      });
      if (error) throw error;

      await supabase
        .from("groups")
        .update({ member_count: group.member_count + 1 })
        .eq("id", group.id);

      setMyGroupIds((prev) => new Set([...prev, group.id]));
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id ? { ...g, member_count: g.member_count + 1 } : g
        )
      );
    } catch {
      toast({ title: "Couldn't join group", variant: "destructive" });
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeaveConfirm = async (group: DbGroup) => {
    if (!user) return;
    try {
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", group.id)
        .eq("clerk_id", user.id);

      await supabase
        .from("groups")
        .update({ member_count: Math.max(1, group.member_count - 1) })
        .eq("id", group.id);

      setMyGroupIds((prev) => {
        const next = new Set(prev);
        next.delete(group.id);
        return next;
      });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id ? { ...g, member_count: Math.max(1, g.member_count - 1) } : g
        )
      );
      setLeavingId(null);
    } catch {
      toast({ title: "Couldn't leave group", variant: "destructive" });
    }
  };

  const handleCreateSuccess = (newGroup: DbGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setMyGroupIds((prev) => new Set([...prev, newGroup.id]));
    setShowModal(false);
    setTab("mygroups");
    toast({
      title: "Group created!",
      description: "Share it with your study partners.",
    });
  };

  const openModal = () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in to create groups",
        description: "Create an account to start your own study group.",
      });
      return;
    }
    setShowModal(true);
  };

  // ── Shared card props ──────────────────────────────────────────────────────

  const makeCardProps = (group: DbGroup, context: CardContext) => ({
    group,
    context,
    isMember: myGroupIds.has(group.id),
    isOwner: !!user && group.created_by === user.id,
    isSignedIn: !!isSignedIn,
    joiningId,
    leavingId,
    onJoin: handleJoin,
    onLeavePrompt: (id: string) => setLeavingId(id),
    onLeaveCancel: () => setLeavingId(null),
    onLeaveConfirm: handleLeaveConfirm,
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <SEO
        title="Study Groups — Briefly Brilliant"
        description="Find or create LSAT study groups and study smarter together."
        path="/groups"
      />

      <Nav />

      {/* Page header */}
      <div style={{ background: "white", borderBottom: "1px solid #E5E7EB" }}>
        <div className="mx-auto max-w-6xl px-6 pt-6 pb-0">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#1A1A2E",
                  lineHeight: 1.2,
                }}
              >
                Study Groups
              </h1>
              <p style={{ fontSize: "0.9rem", color: "#6B7280", marginTop: 4 }}>
                Find your people. Study smarter together.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => setTab("discover")}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                style={
                  tab === "discover"
                    ? { background: "#0D9488", color: "white" }
                    : { background: "white", color: "#4B5563", border: "1px solid #E5E7EB" }
                }
              >
                Find Groups
              </button>
              <button
                onClick={openModal}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#0D9488" }}
              >
                Create a Group
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1">
            {(["discover", "mygroups"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-5 py-3 text-sm font-medium transition-colors border-b-2"
                style={
                  tab === t
                    ? { borderColor: "#0D9488", color: "#0D9488" }
                    : { borderColor: "transparent", color: "#6B7280" }
                }
              >
                {t === "discover" ? "Discover Communities" : "My Groups"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {fetchError && (
          <p className="py-12 text-center text-sm" style={{ color: "#6B7280" }}>
            Couldn't load groups. Try refreshing.
          </p>
        )}

        {/* ── Discover tab ─────────────────────────────────────────────────── */}
        {tab === "discover" && !fetchError && (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {(["all", "online", "in-person"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTypeFilter(f)}
                    className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                    style={
                      typeFilter === f
                        ? { background: "#0D9488", color: "white" }
                        : { background: "white", color: "#4B5563", border: "1px solid #E5E7EB" }
                    }
                  >
                    {f === "all" ? "All" : f === "online" ? "Online" : "In-Person"}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups..."
                className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-teal-500"
                style={{ borderColor: "#E5E7EB", color: "#1A1A2E", minWidth: 220 }}
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <>
                {applyFilters(featuredGroups).length > 0 && (
                  <section className="mb-10">
                    <div className="mb-4 flex items-center gap-2">
                      <h2 className="text-base font-semibold" style={{ color: "#1A1A2E" }}>
                        Featured Communities
                      </h2>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: "#CCFBF1", color: "#0D9488" }}
                      >
                        Official
                      </span>
                    </div>
                    <div className="space-y-3">
                      {applyFilters(featuredGroups).map((g) => (
                        <GroupCard key={g.id} {...makeCardProps(g, "discover")} />
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h2 className="mb-4 text-base font-semibold" style={{ color: "#1A1A2E" }}>
                    Local & Student Groups
                  </h2>
                  {applyFilters(localGroups).length === 0 ? (
                    <div
                      className="rounded-lg border bg-white p-12 text-center"
                      style={{ borderColor: "#E5E7EB" }}
                    >
                      <svg
                        className="mx-auto mb-4"
                        width="72"
                        height="56"
                        viewBox="0 0 72 56"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="24" cy="14" r="10" fill="#E5E7EB" />
                        <ellipse cx="24" cy="38" rx="14" ry="10" fill="#E5E7EB" />
                        <circle cx="48" cy="14" r="10" fill="#D1FAE5" />
                        <ellipse cx="48" cy="38" rx="14" ry="10" fill="#D1FAE5" />
                      </svg>
                      <p className="mb-1 font-semibold" style={{ color: "#1A1A2E" }}>
                        No local groups yet
                      </p>
                      <p className="mb-5 text-sm" style={{ color: "#6B7280" }}>
                        Be the first to start one in your area.
                      </p>
                      <button
                        onClick={openModal}
                        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: "#0D9488" }}
                      >
                        Create a Group
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applyFilters(localGroups).map((g) => (
                        <GroupCard key={g.id} {...makeCardProps(g, "discover")} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}

        {/* ── My Groups tab ─────────────────────────────────────────────────── */}
        {tab === "mygroups" && !fetchError && (
          <>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : !isSignedIn ? (
              <div
                className="rounded-lg border bg-white p-12 text-center"
                style={{ borderColor: "#E5E7EB" }}
              >
                <p className="mb-1 font-semibold" style={{ color: "#1A1A2E" }}>
                  Sign in to see your groups
                </p>
                <p className="mb-5 text-sm" style={{ color: "#6B7280" }}>
                  Create an account to join and manage study groups.
                </p>
                <Link
                  to="/auth"
                  className="inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#0D9488" }}
                >
                  Sign in
                </Link>
              </div>
            ) : myGroups.length === 0 ? (
              <div
                className="rounded-lg border bg-white p-12 text-center"
                style={{ borderColor: "#E5E7EB" }}
              >
                <p className="mb-1 font-semibold" style={{ color: "#1A1A2E" }}>
                  You haven't joined any groups yet
                </p>
                <p className="mb-4 text-sm" style={{ color: "#6B7280" }}>
                  Discover communities below or start your own.
                </p>
                <button
                  onClick={() => setTab("discover")}
                  className="text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: "#0D9488" }}
                >
                  Browse groups →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myGroups.map((g) => (
                  <GroupCard key={g.id} {...makeCardProps(g, "mine")} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && user && (
        <CreateGroupModal
          userId={user.id}
          supabase={supabase}
          onClose={() => setShowModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default Groups;

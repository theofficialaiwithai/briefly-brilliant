import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  ExternalLink,
  FileText,
  GripVertical,
  Link as LinkIcon,
  ListChecks,
  Pencil,
  Plus,
  Timer,
  TrendingUp,
  X,
  Youtube,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Nav } from "@/components/Nav";
import { useSupabaseClient } from "@/lib/supabaseClient";
import { SortableWidget } from "@/components/hub/SortableWidget";
import { AddWidgetModal } from "@/components/hub/AddWidgetModal";
import type { HubWidget, WidgetSize, WidgetType } from "@/components/hub/types";

// ─────────────────────────────────────────────────────────────────────────────
// Config types
// ─────────────────────────────────────────────────────────────────────────────

type YouTubeSource = { id: string; title: string; url: string };
type YouTubeConfig = { sources?: YouTubeSource[]; url?: string }; // url kept for migration detection
type CurriculumItem = { id: string; title: string; url?: string; completed: boolean };
type CurriculumConfig = { items?: CurriculumItem[] };
type ScoreEntry = { date: string; section: string; score: number; notes?: string };
type ScoreConfig = { scores?: ScoreEntry[] };
type NotesConfig = { content?: string };
type LinkItem = { id: string; title: string; url: string; type: "pdf" | "link" };
type PdfLinkConfig = { links?: LinkItem[] };
type CountdownType = "test_date" | "application_deadline" | "registration_deadline" | "study_goal";
type CountdownConfig = { testDate?: string; testName?: string; countdownType?: CountdownType };

const COUNTDOWN_TYPES: { value: CountdownType; label: string }[] = [
  { value: "test_date", label: "LSAT Test Date" },
  { value: "application_deadline", label: "Application Deadline" },
  { value: "registration_deadline", label: "Registration Deadline" },
  { value: "study_goal", label: "Study Goal" },
];
const COUNTDOWN_LABELS: Record<CountdownType, string> = {
  test_date: "days until your LSAT",
  application_deadline: "days until application deadline",
  registration_deadline: "days until registration closes",
  study_goal: "days until study goal",
};
const COUNTDOWN_PLACEHOLDERS: Record<CountdownType, string> = {
  test_date: "e.g. LSAT June 2025",
  application_deadline: "e.g. Harvard Law Application",
  registration_deadline: "e.g. August LSAT Registration",
  study_goal: "e.g. Finish LG Fundamentals",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseYTUrl(url: string): { type: "video" | "playlist" | "channel"; id: string } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("youtube.com") && !u.hostname.includes("youtu.be")) return null;
    const playlistId = u.searchParams.get("list");
    const videoId = u.hostname.includes("youtu.be")
      ? u.pathname.slice(1).split("?")[0]
      : u.searchParams.get("v");
    if (playlistId) return { type: "playlist", id: playlistId };
    if (videoId) return { type: "video", id: videoId };
    const p = u.pathname;
    if (p.startsWith("/@") || p.includes("/channel/") || p.includes("/c/") || p.includes("/user/")) {
      return { type: "channel", id: url };
    }
    return null;
  } catch {
    return null;
  }
}

const INPUT_STYLE: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: "0.8rem",
  fontFamily: "Inter, sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const BTN_PRIMARY: React.CSSProperties = {
  background: "#0D9488",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: "0.8rem",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const BTN_GHOST: React.CSSProperties = {
  background: "none",
  border: "1px solid #E5E7EB",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: "0.8rem",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  color: "#4B5563",
  whiteSpace: "nowrap",
};

// ─────────────────────────────────────────────────────────────────────────────
// SortableCurriculumItem
// ─────────────────────────────────────────────────────────────────────────────

function SortableCurriculumItem({
  item,
  editMode,
  onToggle,
  onDelete,
}: {
  item: CurriculumItem;
  editMode: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 0",
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      {editMode && (
        <button
          {...attributes}
          {...listeners}
          style={{
            background: "none",
            border: "none",
            cursor: "grab",
            color: "#9CA3AF",
            padding: 0,
            display: "flex",
            flexShrink: 0,
            touchAction: "none",
          }}
        >
          <GripVertical size={14} />
        </button>
      )}
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggle(item.id)}
        style={{ accentColor: "#0D9488", width: 15, height: 15, flexShrink: 0, cursor: "pointer" }}
      />
      <span
        style={{
          flex: 1,
          fontSize: "0.875rem",
          color: item.completed ? "#9CA3AF" : "#1A1A2E",
          textDecoration: item.completed ? "line-through" : "none",
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {item.title}
      </span>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", flexShrink: 0, color: "#9CA3AF" }}
        >
          <ExternalLink size={12} />
        </a>
      )}
      {editMode && (
        <button
          onClick={() => onDelete(item.id)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, display: "flex", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Score Tracker tooltip
// ─────────────────────────────────────────────────────────────────────────────

function ScoreTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ScoreEntry & { dateLabel: string } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 6, padding: "6px 10px", fontSize: "0.78rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontFamily: "Inter, sans-serif" }}>
      <p style={{ margin: 0, fontWeight: 600, color: "#1A1A2E" }}>Score: {d.score}</p>
      <p style={{ margin: "2px 0 0", color: "#6B7280" }}>{d.section}</p>
      <p style={{ margin: "2px 0 0", color: "#9CA3AF" }}>{d.dateLabel}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget content components
// ─────────────────────────────────────────────────────────────────────────────

type ContentProps = {
  widget: HubWidget;
  editMode: boolean;
  onConfigUpdate: (config: Record<string, unknown>) => Promise<void>;
};

// ── YouTube ──────────────────────────────────────────────────────────────────

function YouTubeEmbed({ source }: { source: YouTubeSource }) {
  const parsed = parseYTUrl(source.url);
  if (parsed?.type === "video") {
    return (
      <iframe src={`https://www.youtube.com/embed/${parsed.id}`} title={source.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen style={{ width: "100%", aspectRatio: "16/9", borderRadius: 8, border: "none", display: "block" }} />
    );
  }
  if (parsed?.type === "playlist") {
    return (
      <iframe src={`https://www.youtube.com/embed/videoseries?list=${parsed.id}`} title={source.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen style={{ width: "100%", aspectRatio: "16/9", borderRadius: 8, border: "none", display: "block" }} />
    );
  }
  if (parsed?.type === "channel") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 24, background: "#F9FAFB", borderRadius: 8, aspectRatio: "16/9", justifyContent: "center" }}>
        <Youtube size={28} color="#FF0000" />
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#4B5563", fontFamily: "Inter, sans-serif", textAlign: "center" }}>Channels can't be embedded directly.</p>
        <a href={source.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "#0D9488", fontFamily: "Inter, sans-serif", textDecoration: "none" }}>
          Open in YouTube <ExternalLink size={12} />
        </a>
      </div>
    );
  }
  return <p style={{ fontSize: "0.85rem", color: "#EF4444", fontFamily: "Inter, sans-serif", margin: 0 }}>Invalid YouTube URL</p>;
}

function YouTubeWidgetContent({ widget, editMode, onConfigUpdate }: ContentProps) {
  const cfg = widget.config as YouTubeConfig;
  const sources = cfg.sources ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [addingManual, setAddingManual] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // Clamp when sources shrink (e.g. after removal)
  useEffect(() => {
    if (activeIdx >= sources.length && sources.length > 0) {
      setActiveIdx(sources.length - 1);
    }
  }, [sources.length]);

  const clampedIdx = Math.min(activeIdx, Math.max(0, sources.length - 1));
  const activeSource = sources[clampedIdx] ?? null;

  const handleRemoveSource = async (srcId: string) => {
    const removedIdx = sources.findIndex((s) => s.id === srcId);
    const updated = sources.filter((s) => s.id !== srcId);
    if (removedIdx <= clampedIdx && clampedIdx > 0) setActiveIdx(clampedIdx - 1);
    await onConfigUpdate({ sources: updated });
  };

  const handleAddManual = async () => {
    if (!manualUrl.trim()) return;
    setSaving(true);
    const newSrc: YouTubeSource = {
      id: crypto.randomUUID(),
      title: manualTitle.trim() || manualUrl.trim(),
      url: manualUrl.trim(),
    };
    await onConfigUpdate({ sources: [...sources, newSrc] });
    setSaving(false);
    setManualUrl("");
    setManualTitle("");
    setAddingManual(false);
  };

  const ManualAddForm = (
    <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      <input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddManual()} placeholder="https://youtube.com/..." style={INPUT_STYLE} />
      <input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Title (optional)" style={INPUT_STYLE} />
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={handleAddManual} disabled={saving || !manualUrl.trim()} style={{ ...BTN_PRIMARY, opacity: saving || !manualUrl.trim() ? 0.6 : 1 }}>
          {saving ? "…" : "Add"}
        </button>
        <button onClick={() => { setAddingManual(false); setManualUrl(""); setManualTitle(""); }} style={BTN_GHOST}>Cancel</button>
      </div>
    </div>
  );

  // ── Empty state ──
  if (sources.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10, minHeight: 180, textAlign: "center" }}>
        <Youtube size={32} color="#9CA3AF" />
        <p style={{ fontSize: "0.875rem", color: "#9CA3AF", margin: 0, fontFamily: "Inter, sans-serif" }}>No videos added yet</p>
        <p style={{ fontSize: "0.8rem", color: "#C4C4C4", margin: 0, fontFamily: "Inter, sans-serif", maxWidth: 260 }}>
          Add a YouTube series from any resource page, or add a URL below
        </p>
        {editMode && (
          addingManual ? ManualAddForm : (
            <button onClick={() => setAddingManual(true)} style={{ ...BTN_GHOST, borderStyle: "dashed", color: "#9CA3AF" }}>
              + Add URL manually
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Tab bar */}
      <div className="yt-tabs" style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2 }}>
        {sources.map((src, idx) => {
          const isActive = idx === clampedIdx;
          return (
            <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
              <button
                onClick={() => setActiveIdx(idx)}
                title={src.title}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  border: isActive ? "none" : "1px solid #E5E7EB",
                  background: isActive ? "#0D9488" : "#F9FAFB",
                  color: isActive ? "white" : "#6B7280",
                  fontSize: "0.78rem",
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  transition: "background 0.1s, color 0.1s",
                }}
              >
                {src.title}
              </button>
              {editMode && (
                <button
                  onClick={() => handleRemoveSource(src.id)}
                  title="Remove"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, display: "flex", lineHeight: 1, flexShrink: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Active embed */}
      {activeSource && <YouTubeEmbed source={activeSource} />}
      {activeSource && (
        <p style={{ margin: 0, fontSize: "0.73rem", color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}>
          {activeSource.title}
        </p>
      )}

      {/* Edit mode: add manually */}
      {editMode && (
        addingManual ? ManualAddForm : (
          <button
            onClick={() => setAddingManual(true)}
            style={{ alignSelf: "flex-start", ...BTN_GHOST, borderStyle: "dashed", padding: "5px 12px", color: "#9CA3AF", fontSize: "0.78rem" }}
          >
            + Add manually
          </button>
        )
      )}
    </div>
  );
}

// ── Curriculum ───────────────────────────────────────────────────────────────

function CurriculumWidgetContent({ widget, editMode, onConfigUpdate }: ContentProps) {
  const cfg = widget.config as CurriculumConfig;
  const [items, setItems] = useState<CurriculumItem[]>(cfg.items ?? []);
  const [addingItem, setAddingItem] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    setItems((widget.config as CurriculumConfig).items ?? []);
  }, [widget.config]);

  const curriculumSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const saveItems = async (updated: CurriculumItem[]) => {
    setItems(updated);
    await onConfigUpdate({ items: updated });
  };

  const handleToggle = (id: string) => saveItems(items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));
  const handleDeleteItem = (id: string) => saveItems(items.filter((i) => i.id !== id));

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newItem: CurriculumItem = { id: crypto.randomUUID(), title: newTitle.trim(), url: newUrl.trim() || undefined, completed: false };
    saveItems([...items, newItem]);
    setNewTitle("");
    setNewUrl("");
    setAddingItem(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    saveItems(arrayMove(items, oldIdx, newIdx));
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.length > 0 && (
        <p style={{ margin: 0, fontSize: "0.78rem", color: "#9CA3AF", textAlign: "right", fontFamily: "Inter, sans-serif" }}>
          {completedCount} of {items.length} completed
        </p>
      )}

      {items.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 100, textAlign: "center" }}>
          <ListChecks size={32} color="#9CA3AF" />
          <p style={{ fontSize: "0.85rem", color: "#9CA3AF", margin: 0, fontFamily: "Inter, sans-serif" }}>
            No items yet. Add resources to track your curriculum.
          </p>
        </div>
      ) : (
        <DndContext sensors={curriculumSensors} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableCurriculumItem key={item.id} item={item} editMode={editMode} onToggle={handleToggle} onDelete={handleDeleteItem} />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {editMode && (
        addingItem ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4, padding: 10, background: "#F9FAFB", borderRadius: 8 }}>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Item title" autoFocus style={INPUT_STYLE} />
            <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL (optional)" style={INPUT_STYLE} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleAdd} style={BTN_PRIMARY}>Add</button>
              <button onClick={() => { setAddingItem(false); setNewTitle(""); setNewUrl(""); }} style={BTN_GHOST}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingItem(true)} style={{ alignSelf: "flex-start", background: "none", border: "1px dashed #D1D5DB", borderRadius: 6, padding: "5px 12px", fontSize: "0.8rem", color: "#9CA3AF", cursor: "pointer", fontFamily: "Inter, sans-serif", marginTop: 4 }}>
            + Add Item
          </button>
        )
      )}
    </div>
  );
}

// ── Score Tracker ─────────────────────────────────────────────────────────────

const SCORE_SECTIONS = ["Overall", "Logical Reasoning", "Analytical Reasoning", "Reading Comprehension"];

function ScoreTrackerWidgetContent({ widget, editMode, onConfigUpdate }: ContentProps) {
  const cfg = widget.config as ScoreConfig;
  const scores = cfg.scores ?? [];
  const todayStr = new Date().toISOString().split("T")[0];

  const [addingScore, setAddingScore] = useState(false);
  const [newDate, setNewDate] = useState(todayStr);
  const [newSection, setNewSection] = useState("Overall");
  const [newScore, setNewScore] = useState(150);
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddScore = async () => {
    setSaving(true);
    const entry: ScoreEntry = { date: newDate, section: newSection, score: newScore };
    if (newNotes.trim()) entry.notes = newNotes.trim();
    const updated = [...scores, entry].sort((a, b) => a.date.localeCompare(b.date));
    await onConfigUpdate({ scores: updated });
    setSaving(false);
    setAddingScore(false);
    setNewNotes("");
    setNewDate(todayStr);
    setNewSection("Overall");
    setNewScore(150);
  };

  const handleDeleteScore = async (idx: number) => {
    await onConfigUpdate({ scores: scores.filter((_, i) => i !== idx) });
  };

  const chartData = [...scores]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => {
      const parts = s.date.split("-");
      return { ...s, dateLabel: `${parts[1]}/${parts[2]}` };
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {scores.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 100, textAlign: "center" }}>
          <TrendingUp size={32} color="#9CA3AF" />
          <p style={{ fontSize: "0.85rem", color: "#9CA3AF", margin: 0, fontFamily: "Inter, sans-serif" }}>
            Log your first practice score to see your progress
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <YAxis domain={[120, 180]} ticks={[120, 140, 160, 180]} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <Tooltip content={<ScoreTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#0D9488" strokeWidth={2} dot={{ r: 3, fill: "#0D9488", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>

          {editMode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {scores.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid #F3F4F6", fontSize: "0.78rem", color: "#6B7280", fontFamily: "Inter, sans-serif" }}>
                  <span style={{ flex: 1 }}>{s.date} — {s.section}: <strong style={{ color: "#0D9488" }}>{s.score}</strong></span>
                  <button onClick={() => handleDeleteScore(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, display: "flex" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {addingScore ? (
        <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ ...INPUT_STYLE, flex: 1 }} />
            <input
              type="number"
              value={newScore}
              onChange={(e) => setNewScore(Math.min(180, Math.max(120, parseInt(e.target.value) || 120)))}
              min={120}
              max={180}
              style={{ ...INPUT_STYLE, width: 72, flex: "none" }}
            />
          </div>
          <select value={newSection} onChange={(e) => setNewSection(e.target.value)} style={{ ...INPUT_STYLE, background: "white" }}>
            {SCORE_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Notes (optional)" rows={2} style={{ ...INPUT_STYLE, resize: "none" }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handleAddScore} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving…" : "Save Score"}</button>
            <button onClick={() => setAddingScore(false)} style={BTN_GHOST}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingScore(true)}
          style={{ alignSelf: "flex-start", background: "none", border: "1px solid #E5E7EB", borderRadius: 6, padding: "6px 12px", fontSize: "0.8rem", color: "#4B5563", cursor: "pointer", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 4 }}
        >
          <Plus size={13} /> Add Score
        </button>
      )}
    </div>
  );
}

// ── Notes ─────────────────────────────────────────────────────────────────────

function NotesWidgetContent({ widget, onConfigUpdate }: { widget: HubWidget; onConfigUpdate: (config: Record<string, unknown>) => Promise<void> }) {
  const [content, setContent] = useState((widget.config as NotesConfig).content ?? "");
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onConfigUpdate);

  useEffect(() => { callbackRef.current = onConfigUpdate; }, [onConfigUpdate]);

  useEffect(() => {
    setContent((widget.config as NotesConfig).content ?? "");
  }, [widget.id]);

  const handleChange = (value: string) => {
    setContent(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await callbackRef.current({ content: value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 140, position: "relative" }}>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Your private study notes…"
        style={{ flex: 1, minHeight: 140, border: "none", background: "transparent", resize: "none", fontFamily: "Inter, sans-serif", fontSize: 14, color: "#4B5563", lineHeight: 1.6, outline: "none", padding: 0, width: "100%" }}
      />
      {saved && (
        <span style={{ position: "absolute", bottom: 2, right: 2, fontSize: "0.72rem", color: "#0D9488", fontFamily: "Inter, sans-serif", background: "white", padding: "2px 6px", borderRadius: 4 }}>
          Saved ✓
        </span>
      )}
    </div>
  );
}

// ── PDF / Link ────────────────────────────────────────────────────────────────

function PdfLinkWidgetContent({ widget, editMode, onConfigUpdate }: ContentProps) {
  const cfg = widget.config as PdfLinkConfig;
  const links = cfg.links ?? [];
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"pdf" | "link">("link");
  const [saving, setSaving] = useState(false);

  const handleUrlChange = (url: string) => {
    setNewUrl(url);
    setNewType(url.toLowerCase().includes(".pdf") ? "pdf" : "link");
  };

  const handleAdd = async () => {
    if (!newUrl.trim() || !newTitle.trim()) return;
    setSaving(true);
    const item: LinkItem = { id: crypto.randomUUID(), title: newTitle.trim(), url: newUrl.trim(), type: newType };
    await onConfigUpdate({ links: [...links, item] });
    setSaving(false);
    setNewUrl("");
    setNewTitle("");
    setNewType("link");
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await onConfigUpdate({ links: links.filter((l) => l.id !== id) });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {links.length === 0 && !adding ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 100 }}>
          <LinkIcon size={32} color="#9CA3AF" />
          <p style={{ fontSize: "0.85rem", color: "#9CA3AF", margin: 0, fontFamily: "Inter, sans-serif", textAlign: "center" }}>
            Save PDFs and useful links here
          </p>
        </div>
      ) : (
        <div>
          {links.map((link) => (
            <div
              key={link.id}
              onClick={() => window.open(link.url, "_blank", "noreferrer")}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #F3F4F6", cursor: "pointer" }}
            >
              {link.type === "pdf" ? (
                <FileText size={15} color="#EF4444" style={{ flexShrink: 0 }} />
              ) : (
                <ExternalLink size={15} color="#3B82F6" style={{ flexShrink: 0 }} />
              )}
              <span style={{ flex: 1, fontSize: "0.875rem", color: "#1A1A2E", fontFamily: "Inter, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                {link.title}
              </span>
              <ExternalLink size={12} color="#9CA3AF" style={{ flexShrink: 0 }} />
              {editMode && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(link.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, display: "flex", flexShrink: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {editMode && (
        adding ? (
          <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <input value={newUrl} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://…" style={INPUT_STYLE} />
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Title" style={INPUT_STYLE} />
            <div style={{ display: "flex", gap: 4 }}>
              {(["link", "pdf"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  style={{
                    flex: 1,
                    padding: "5px 8px",
                    fontSize: "0.78rem",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: newType === t ? 600 : 400,
                    border: newType === t ? "none" : "1px solid #E5E7EB",
                    background: newType === t ? "#0D9488" : "#F3F4F6",
                    color: newType === t ? "white" : "#6B7280",
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleAdd} disabled={saving || !newUrl.trim() || !newTitle.trim()} style={{ ...BTN_PRIMARY, opacity: saving || !newUrl.trim() || !newTitle.trim() ? 0.6 : 1 }}>
                {saving ? "…" : "Add"}
              </button>
              <button onClick={() => { setAdding(false); setNewUrl(""); setNewTitle(""); }} style={BTN_GHOST}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{ alignSelf: "flex-start", background: "none", border: "1px dashed #D1D5DB", borderRadius: 6, padding: "5px 12px", fontSize: "0.8rem", color: "#9CA3AF", cursor: "pointer", fontFamily: "Inter, sans-serif", marginTop: 4 }}>
            + Add Link
          </button>
        )
      )}
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────────

function CountdownWidgetContent({ widget, editMode, onConfigUpdate }: ContentProps) {
  const cfg = widget.config as CountdownConfig;
  const [changingDate, setChangingDate] = useState(false);
  const [dateInput, setDateInput] = useState(cfg.testDate ?? "");
  const [nameInput, setNameInput] = useState(cfg.testName ?? "");
  const [countdownType, setCountdownType] = useState<CountdownType>(cfg.countdownType ?? "test_date");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const c = widget.config as CountdownConfig;
    setDateInput(c.testDate ?? "");
    setNameInput(c.testName ?? "");
    setCountdownType(c.countdownType ?? "test_date");
  }, [widget.config]);

  const handleSave = async () => {
    if (!dateInput) return;
    setSaving(true);
    await onConfigUpdate({ testDate: dateInput, testName: nameInput.trim() || undefined, countdownType });
    setSaving(false);
    setChangingDate(false);
  };

  const getDaysUntil = (dateStr: string) => {
    const parts = dateStr.split("-");
    const testDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  if (!cfg.testDate || changingDate) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 160 }}>
        {!changingDate && (
          <>
            <Timer size={32} color="#9CA3AF" />
            <p style={{ fontSize: "0.85rem", color: "#9CA3AF", margin: 0, fontFamily: "Inter, sans-serif", textAlign: "center" }}>
              Set your test date to see the countdown
            </p>
          </>
        )}
        {(editMode || !cfg.testDate) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 280 }}>
            {editMode && (
              <>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#6B7280", fontFamily: "Inter, sans-serif", textAlign: "center" }}>
                  What are you counting down to?
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                  {COUNTDOWN_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setCountdownType(value)}
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: countdownType === value ? 600 : 400,
                        border: countdownType === value ? "none" : "1px solid #E5E7EB",
                        background: countdownType === value ? "#0D9488" : "#F3F4F6",
                        color: countdownType === value ? "white" : "#6B7280",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} style={INPUT_STYLE} />
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={COUNTDOWN_PLACEHOLDERS[countdownType]}
              style={INPUT_STYLE}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleSave} disabled={!dateInput || saving} style={{ ...BTN_PRIMARY, flex: 1, opacity: !dateInput ? 0.5 : 1 }}>
                {saving ? "Saving…" : "Set Date"}
              </button>
              {changingDate && (
                <button onClick={() => { setChangingDate(false); setDateInput(cfg.testDate ?? ""); setNameInput(cfg.testName ?? ""); setCountdownType(cfg.countdownType ?? "test_date"); }} style={BTN_GHOST}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const daysUntil = getDaysUntil(cfg.testDate);
  const activeType = cfg.countdownType ?? "test_date";

  if (daysUntil < 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 160, textAlign: "center" }}>
        <p style={{ fontSize: "1.4rem", margin: 0 }}>🎉</p>
        <p style={{ fontSize: "1rem", fontWeight: 600, color: "#1A1A2E", margin: 0, fontFamily: "Inter, sans-serif" }}>Test day has passed!</p>
        {cfg.testName && <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: 0, fontFamily: "Inter, sans-serif" }}>{cfg.testName}</p>}
        {editMode && (
          <button onClick={() => { setDateInput(""); setNameInput(cfg.testName ?? ""); setCountdownType(activeType); setChangingDate(true); }} style={{ ...BTN_GHOST, borderColor: "#0D9488", color: "#0D9488", marginTop: 4 }}>
            Set new date
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 160, textAlign: "center" }}>
      <span style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", fontWeight: 700, color: "#0D9488", lineHeight: 1 }}>
        {daysUntil}
      </span>
      <span style={{ fontSize: "0.875rem", color: "#6B7280", fontFamily: "Inter, sans-serif" }}>{COUNTDOWN_LABELS[activeType]}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A1A2E", fontFamily: "Inter, sans-serif" }}>{formatDate(cfg.testDate)}</span>
      {cfg.testName && <span style={{ fontSize: "0.8rem", color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}>{cfg.testName}</span>}
      {editMode && (
        <button onClick={() => { setDateInput(cfg.testDate ?? ""); setNameInput(cfg.testName ?? ""); setCountdownType(activeType); setChangingDate(true); }} style={{ marginTop: 8, background: "none", border: "none", fontSize: "0.8rem", color: "#0D9488", cursor: "pointer", fontFamily: "Inter, sans-serif", textDecoration: "underline" }}>
          Change date
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main LearningHub page
// ─────────────────────────────────────────────────────────────────────────────

export default function LearningHub() {
  const { user, isSignedIn, isLoaded } = useUser();
  const supabase = useSupabaseClient();

  const [widgets, setWidgets] = useState<HubWidget[]>([]);
  const [pendingOrder, setPendingOrder] = useState<HubWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (!isSignedIn || !user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await (supabase as any)
        .from("hub_widgets")
        .select("*")
        .eq("clerk_id", user.id)
        .order("position", { ascending: true });
      const list = (data ?? []) as HubWidget[];

      // Migrate old single-URL YouTube config → sources array
      for (const w of list) {
        const cfg = w.config as YouTubeConfig;
        if (w.type === "youtube" && cfg.url && !cfg.sources) {
          const migrated: YouTubeConfig = {
            sources: [{ id: crypto.randomUUID(), title: "My Video", url: cfg.url }],
          };
          await (supabase as any).from("hub_widgets").update({ config: migrated }).eq("id", w.id);
          w.config = migrated as Record<string, unknown>;
        }
      }

      setWidgets(list);
      setPendingOrder(list);
      setLoading(false);
    })();
  }, [isSignedIn, user?.id]);

  const handleConfigUpdate = useCallback(
    async (id: string, config: Record<string, unknown>) => {
      const updater = (list: HubWidget[]) => list.map((w) => (w.id === id ? { ...w, config } : w));
      setWidgets(updater);
      setPendingOrder(updater);
      await (supabase as any).from("hub_widgets").update({ config }).eq("id", id);
    },
    [supabase]
  );

  const handleEnterEdit = () => {
    setPendingOrder([...widgets]);
    setEditMode(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const updated = pendingOrder.map((w, i) => ({ ...w, position: i }));
    for (const w of updated) {
      await (supabase as any)
        .from("hub_widgets")
        .update({ position: w.position, size: w.size })
        .eq("id", w.id);
    }
    setWidgets(updated);
    setPendingOrder(updated);
    setSaving(false);
    setEditMode(false);
  };

  const handleCancel = () => {
    setPendingOrder([...widgets]);
    setEditMode(false);
  };

  const handleResize = (id: string, size: WidgetSize) => {
    setPendingOrder((items) => items.map((w) => (w.id === id ? { ...w, size } : w)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPendingOrder((items) => {
      const oldIdx = items.findIndex((w) => w.id === active.id);
      const newIdx = items.findIndex((w) => w.id === over.id);
      return arrayMove(items, oldIdx, newIdx);
    });
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("hub_widgets").delete().eq("id", id);
    const updated = widgets.filter((w) => w.id !== id);
    setWidgets(updated);
    setPendingOrder((prev) => prev.filter((w) => w.id !== id));
  };

  const DEFAULT_SIZES: Record<WidgetType, WidgetSize> = {
    youtube: "full",
    curriculum: "two-thirds",
    score_tracker: "two-thirds",
    notes: "half",
    pdf_link: "half",
    countdown: "third",
  };

  const handleAddWidget = async (type: WidgetType, title: string) => {
    if (!user) return;
    const position = widgets.length;
    const size = DEFAULT_SIZES[type];
    const { data } = await (supabase as any)
      .from("hub_widgets")
      .insert({ clerk_id: user.id, type, title, position, size, config: {} })
      .select()
      .single();
    if (data) {
      const newWidget = data as HubWidget;
      setWidgets((prev) => [...prev, newWidget]);
      setPendingOrder((prev) => [...prev, newWidget]);
    }
    setAddModalOpen(false);
  };

  const renderWidgetContent = (widget: HubWidget) => {
    const onConfigUpdate = (config: Record<string, unknown>) => handleConfigUpdate(widget.id, config);
    switch (widget.type) {
      case "youtube":
        return <YouTubeWidgetContent widget={widget} editMode={editMode} onConfigUpdate={onConfigUpdate} />;
      case "curriculum":
        return <CurriculumWidgetContent widget={widget} editMode={editMode} onConfigUpdate={onConfigUpdate} />;
      case "score_tracker":
        return <ScoreTrackerWidgetContent widget={widget} editMode={editMode} onConfigUpdate={onConfigUpdate} />;
      case "notes":
        return <NotesWidgetContent widget={widget} onConfigUpdate={onConfigUpdate} />;
      case "pdf_link":
        return <PdfLinkWidgetContent widget={widget} editMode={editMode} onConfigUpdate={onConfigUpdate} />;
      case "countdown":
        return <CountdownWidgetContent widget={widget} editMode={editMode} onConfigUpdate={onConfigUpdate} />;
      default:
        return null;
    }
  };

  const displayWidgets = editMode ? pendingOrder : widgets;

  if (isLoaded && !isSignedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
        <Nav />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, padding: 24 }}>
          <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "#1A1A2E", margin: 0 }}>
            Sign in to access your Learning Hub
          </p>
          <Link to="/auth" style={{ background: "#0D9488", color: "white", borderRadius: 8, padding: "10px 24px", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
        <Nav />
        <main style={{ maxWidth: 1152, margin: "0 auto", padding: "40px 24px 96px" }}>
          <div style={{ width: 220, height: 36, background: "#E5E7EB", borderRadius: 6, marginBottom: 8 }} className="animate-pulse" />
          <div style={{ width: 280, height: 18, background: "#F3F4F6", borderRadius: 4, marginBottom: 32 }} className="animate-pulse" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: 200, background: "#E5E7EB", borderRadius: 12 }} className="animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Nav />
      <main style={{ maxWidth: 1152, margin: "0 auto", padding: "40px 24px 96px" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 24, gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", fontWeight: 700, color: "#1A1A2E", margin: 0, marginBottom: 6 }}>
              My Learning Hub
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#6B7280", margin: 0, fontFamily: "Inter, sans-serif" }}>
              Your personalized LSAT study workspace.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {editMode ? (
              <>
                <button onClick={handleCancel} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 16px", fontSize: "0.875rem", color: "#4B5563", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{ background: "#0D9488", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: "0.875rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "Inter, sans-serif" }}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <button onClick={handleEnterEdit} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 16px", fontSize: "0.875rem", color: "#1A1A2E", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter, sans-serif" }}>
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        {widgets.length >= 4 && (
          <p style={{ fontSize: "0.8rem", color: "#9CA3AF", textAlign: "right", marginTop: -12, marginBottom: 20, fontFamily: "Inter, sans-serif" }}>
            You're using {widgets.length}/6 widget slots.
          </p>
        )}

        {displayWidgets.length === 0 && !editMode && (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}>
            <p style={{ fontSize: "1rem", marginBottom: 8 }}>Your hub is empty.</p>
            <p style={{ fontSize: "0.875rem" }}>Click Edit to add your first widget.</p>
          </div>
        )}

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={displayWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20, alignItems: "stretch" }} className="hub-grid">
              {displayWidgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  editMode={editMode}
                  onDelete={handleDelete}
                  onResize={handleResize}
                >
                  {renderWidgetContent(widget)}
                </SortableWidget>
              ))}

              {editMode && (
                <button
                  onClick={() => setAddModalOpen(true)}
                  style={{ gridColumn: "1 / -1", border: "2px dashed #E5E7EB", borderRadius: 12, minHeight: 80, background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transition: "border-color 0.15s, background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0D9488"; e.currentTarget.style.background = "#F0FDFA"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "none"; }}
                >
                  <Plus size={24} color="#9CA3AF" />
                  <span style={{ fontSize: "0.85rem", color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}>Add Widget</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>

        <style>{`
          @media (max-width: 767px) {
            .hub-grid { grid-template-columns: 1fr !important; }
            .hub-grid > * { grid-column: 1 / -1 !important; }
          }
          .yt-tabs::-webkit-scrollbar { display: none; }
          .yt-tabs { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </main>

      {addModalOpen && (
        <AddWidgetModal
          widgetCount={widgets.length}
          onAdd={handleAddWidget}
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </div>
  );
}

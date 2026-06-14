import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Pencil, Plus } from "lucide-react";
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
} from "@dnd-kit/sortable";
import { Nav } from "@/components/Nav";
import { useSupabaseClient } from "@/lib/supabaseClient";
import { SortableWidget } from "@/components/hub/SortableWidget";
import { AddWidgetModal } from "@/components/hub/AddWidgetModal";
import type { HubWidget, WidgetType } from "@/components/hub/types";

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

  // Fetch widgets on sign-in
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
      setWidgets(list);
      setPendingOrder(list);
      setLoading(false);
    })();
  }, [isSignedIn, user?.id]);

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

  const handleResize = (id: string) => {
    setPendingOrder((items) =>
      items.map((w) =>
        w.id === id ? { ...w, size: w.size === "full" ? "half" : "full" } as typeof w : w
      )
    );
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

  const FULL_BY_DEFAULT: WidgetType[] = ["youtube", "curriculum", "score_tracker"];

  const handleAddWidget = async (type: WidgetType, title: string) => {
    if (!user) return;
    const position = widgets.length;
    const size = FULL_BY_DEFAULT.includes(type) ? "full" : "half";
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

  const displayWidgets = editMode ? pendingOrder : widgets;

  // ── Not signed in ─────────────────────────────────────────────────────────
  if (isLoaded && !isSignedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
        <Nav />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: 16,
            padding: 24,
          }}
        >
          <p
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "1.2rem",
              color: "#1A1A2E",
              margin: 0,
            }}
          >
            Sign in to access your Learning Hub
          </p>
          <Link
            to="/auth"
            style={{
              background: "#0D9488",
              color: "white",
              borderRadius: 8,
              padding: "10px 24px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            paddingBottom: 24,
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#1A1A2E",
                margin: 0,
                marginBottom: 6,
              }}
            >
              My Learning Hub
            </h1>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#6B7280",
                margin: 0,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Your personalized LSAT study workspace.
            </p>
          </div>

          {/* Edit / Save / Cancel buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {editMode ? (
              <>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "none",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    color: "#4B5563",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: "#0D9488",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={handleEnterEdit}
                style={{
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: "0.875rem",
                  color: "#1A1A2E",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Free tier badge */}
        {widgets.length >= 4 && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "#9CA3AF",
              textAlign: "right",
              marginTop: -12,
              marginBottom: 20,
              fontFamily: "Inter, sans-serif",
            }}
          >
            You're using {widgets.length}/6 widget slots. Upgrade for unlimited widgets.
          </p>
        )}

        {/* Empty state */}
        {displayWidgets.length === 0 && !editMode && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              color: "#9CA3AF",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <p style={{ fontSize: "1rem", marginBottom: 8 }}>Your hub is empty.</p>
            <p style={{ fontSize: "0.875rem" }}>Click Edit to add your first widget.</p>
          </div>
        )}

        {/* Widget grid */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={displayWidgets.map((w) => w.id)}
            strategy={rectSortingStrategy}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 20,
              }}
              className="hub-grid"
            >
              {displayWidgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  editMode={editMode}
                  onDelete={handleDelete}
                  onResize={handleResize}
                />
              ))}

              {/* Add Widget card — only in edit mode */}
              {editMode && (
                <button
                  onClick={() => setAddModalOpen(true)}
                  style={{
                    border: "2px dashed #E5E7EB",
                    borderRadius: 12,
                    minHeight: 200,
                    background: "none",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0D9488";
                    e.currentTarget.style.background = "#F0FDFA";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <Plus size={24} color="#9CA3AF" />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "#9CA3AF",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Add Widget
                  </span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>

        <style>{`
          @media (max-width: 640px) {
            .hub-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>

      {/* Add Widget Modal */}
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

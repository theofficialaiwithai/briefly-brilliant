import { useState } from "react";
import { Youtube, ListChecks, TrendingUp, FileText, Link, Timer, X } from "lucide-react";
import type { WidgetType } from "./types";

const WIDGET_OPTIONS: {
  type: WidgetType;
  label: string;
  description: string;
  Icon: React.FC<{ size?: number; color?: string }>;
  iconColor: string;
}[] = [
  {
    type: "youtube",
    label: "YouTube Video",
    description: "Embed a YouTube video or playlist",
    Icon: Youtube,
    iconColor: "#FF0000",
  },
  {
    type: "curriculum",
    label: "Study Curriculum",
    description: "Track your study checklist",
    Icon: ListChecks,
    iconColor: "#0D9488",
  },
  {
    type: "score_tracker",
    label: "Score Tracker",
    description: "Log and chart your practice scores",
    Icon: TrendingUp,
    iconColor: "#0D9488",
  },
  {
    type: "notes",
    label: "Notes",
    description: "Free-form study notes",
    Icon: FileText,
    iconColor: "#0D9488",
  },
  {
    type: "pdf_link",
    label: "PDF / Link",
    description: "Save resources and PDFs",
    Icon: Link,
    iconColor: "#0D9488",
  },
  {
    type: "countdown",
    label: "Test Countdown",
    description: "Days until your test",
    Icon: Timer,
    iconColor: "#0D9488",
  },
];

type Props = {
  widgetCount: number;
  onAdd: (type: WidgetType, title: string) => Promise<void>;
  onClose: () => void;
};

export function AddWidgetModal({ widgetCount, onAdd, onClose }: Props) {
  const [screen, setScreen] = useState<"select" | "configure">("select");
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const atLimit = widgetCount >= 6;

  const handleSelectType = (type: WidgetType) => {
    if (atLimit) return;
    const option = WIDGET_OPTIONS.find((o) => o.type === type)!;
    setSelectedType(type);
    setTitle(option.label);
    setScreen("configure");
  };

  const handleAdd = async () => {
    if (!selectedType || !title.trim()) return;
    setSubmitting(true);
    await onAdd(selectedType, title.trim());
    setSubmitting(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#1A1A2E",
              margin: 0,
              flex: 1,
            }}
          >
            {screen === "select" ? "Add a Widget" : "Configure Widget"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              display: "flex",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {screen === "select" ? (
          <>
            {atLimit && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#9CA3AF",
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                You've reached the 6-widget limit. Remove a widget to add a new one.
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {WIDGET_OPTIONS.map(({ type, label, description, Icon, iconColor }) => (
                <button
                  key={type}
                  onClick={() => handleSelectType(type)}
                  disabled={atLimit}
                  style={{
                    border: `1px solid #E5E7EB`,
                    borderRadius: 8,
                    padding: 16,
                    cursor: atLimit ? "not-allowed" : "pointer",
                    background: atLimit ? "#F9FAFB" : "white",
                    textAlign: "left",
                    opacity: atLimit ? 0.5 : 1,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!atLimit) {
                      e.currentTarget.style.borderColor = "#0D9488";
                      e.currentTarget.style.background = "#F0FDFA";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!atLimit) {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.background = "white";
                    }
                  }}
                >
                  <Icon size={22} color={iconColor} />
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#1A1A2E",
                      marginTop: 10,
                      marginBottom: 4,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#6B7280",
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.4,
                    }}
                  >
                    {description}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#1A1A2E",
                  marginBottom: 8,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Widget Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
                style={{
                  width: "100%",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: "0.9rem",
                  color: "#1A1A2E",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0D9488")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setScreen("select")}
                style={{
                  flex: 1,
                  background: "none",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: "0.875rem",
                  color: "#4B5563",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Back
              </button>
              <button
                onClick={handleAdd}
                disabled={!title.trim() || submitting}
                style={{
                  flex: 2,
                  background: "#0D9488",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: !title.trim() || submitting ? "not-allowed" : "pointer",
                  opacity: !title.trim() || submitting ? 0.7 : 1,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {submitting ? "Adding…" : "Add to Hub"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

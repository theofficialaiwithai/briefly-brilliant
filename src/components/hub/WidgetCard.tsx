import { useState } from "react";
import { GripVertical, X } from "lucide-react";
import type { HubWidget } from "./types";

type Props = {
  widget: HubWidget;
  editMode: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  onDelete: (id: string) => void;
};

export function WidgetCard({ widget, editMode, dragHandleProps, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {editMode && (
          <button
            {...dragHandleProps}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "grab",
              color: "#9CA3AF",
              display: "flex",
              flexShrink: 0,
              touchAction: "none",
            }}
            aria-label="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
        )}
        <span
          style={{
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "#1A1A2E",
            flex: 1,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {widget.title}
        </span>
        {editMode && (
          <button
            onClick={() => setConfirming(true)}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              padding: 2,
              display: "flex",
              transition: "color 0.15s",
            }}
            aria-label="Delete widget"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        {confirming ? (
          <div
            style={{
              background: "#FEF2F2",
              borderRadius: 8,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: 16,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "#1A1A2E",
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Remove this widget?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => onDelete(widget.id)}
                style={{
                  background: "#EF4444",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 16px",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirming(false)}
                style={{
                  background: "none",
                  color: "#4B5563",
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                  padding: "6px 16px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#F9FAFB",
              borderRadius: 8,
              flex: 1,
              minHeight: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "#9CA3AF",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Widget content coming soon
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

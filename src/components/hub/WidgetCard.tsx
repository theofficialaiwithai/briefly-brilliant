import { useState } from "react";
import { GripVertical, X } from "lucide-react";
import type { HubWidget, WidgetSize } from "./types";

const SIZE_PILLS: { size: WidgetSize; label: string }[] = [
  { size: "quarter", label: "¼" },
  { size: "third", label: "⅓" },
  { size: "half", label: "½" },
  { size: "two-thirds", label: "⅔" },
  { size: "three-quarters", label: "¾" },
  { size: "full", label: "↔" },
];

type Props = {
  widget: HubWidget;
  editMode: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  onDelete: (id: string) => void;
  onResize: (size: WidgetSize) => void;
  children?: React.ReactNode;
};

export function WidgetCard({ widget, editMode, dragHandleProps, onDelete, onResize, children }: Props) {
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
          padding: "10px 12px",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          gap: 6,
          minWidth: 0,
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
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {widget.title}
        </span>

        {/* Size pills — only in edit mode */}
        {editMode && (
          <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
            {SIZE_PILLS.map(({ size, label }) => {
              const active = widget.size === size;
              return (
                <button
                  key={size}
                  onClick={() => onResize(size)}
                  title={size.replace("-", " ")}
                  style={{
                    width: 28,
                    height: 22,
                    borderRadius: 4,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: active ? "none" : "1px solid #E5E7EB",
                    background: active ? "#0D9488" : "#F3F4F6",
                    color: active ? "white" : "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    fontFamily: "Inter, sans-serif",
                    transition: "background 0.1s, color 0.1s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

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
              flexShrink: 0,
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
          children ?? (
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
          )
        )}
      </div>
    </div>
  );
}

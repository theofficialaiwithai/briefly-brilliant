import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { WidgetCard } from "./WidgetCard";
import type { HubWidget } from "./types";

type Props = {
  widget: HubWidget;
  editMode: boolean;
  onDelete: (id: string) => void;
  onResize: (id: string) => void;
};

export function SortableWidget({ widget, editMode, onDelete, onResize }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
    gridColumn: widget.size === "full" ? "span 2" : "span 1",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <WidgetCard
        widget={widget}
        editMode={editMode}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
        onDelete={onDelete}
        onResize={() => onResize(widget.id)}
      />
    </div>
  );
}

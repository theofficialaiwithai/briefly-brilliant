import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { WidgetCard } from "./WidgetCard";
import type { HubWidget, WidgetSize } from "./types";

const SIZE_SPANS: Record<WidgetSize, number> = {
  quarter: 3,
  third: 4,
  half: 6,
  "two-thirds": 8,
  "three-quarters": 9,
  full: 12,
};

type Props = {
  widget: HubWidget;
  editMode: boolean;
  onDelete: (id: string) => void;
  onResize: (id: string, size: WidgetSize) => void;
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
    gridColumn: `span ${SIZE_SPANS[widget.size ?? "half"]}`,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <WidgetCard
        widget={widget}
        editMode={editMode}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
        onDelete={onDelete}
        onResize={(size) => onResize(widget.id, size)}
      />
    </div>
  );
}

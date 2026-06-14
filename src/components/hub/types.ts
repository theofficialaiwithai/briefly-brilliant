export type WidgetType =
  | "youtube"
  | "curriculum"
  | "score_tracker"
  | "notes"
  | "pdf_link"
  | "countdown";

export type WidgetSize =
  | "quarter"
  | "third"
  | "half"
  | "two-thirds"
  | "three-quarters"
  | "full";

export type HubWidget = {
  id: string;
  clerk_id: string;
  type: WidgetType;
  title: string;
  position: number;
  size: WidgetSize;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

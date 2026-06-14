export type WidgetType =
  | "youtube"
  | "curriculum"
  | "score_tracker"
  | "notes"
  | "pdf_link"
  | "countdown";

export type HubWidget = {
  id: string;
  clerk_id: string;
  type: WidgetType;
  title: string;
  position: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

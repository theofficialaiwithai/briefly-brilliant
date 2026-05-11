CREATE TABLE public.lsat_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_name TEXT,
  category TEXT,
  format TEXT,
  section_focus TEXT,
  cost_type TEXT,
  price_range TEXT,
  best_score_range TEXT,
  best_for_timeline TEXT,
  weekly_hours TEXT,
  experience_level TEXT,
  description TEXT,
  url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
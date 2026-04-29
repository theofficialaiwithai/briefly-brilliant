export type Section = "Logical Reasoning" | "Logic Games" | "Reading Comprehension";

export const SUBTYPES: Record<Section, string[]> = {
  "Logical Reasoning": ["Assumption", "Strengthen/Weaken", "Inference", "Paradox"],
  "Logic Games": ["Sequencing", "Grouping", "Matching", "Hybrid"],
  "Reading Comprehension": ["Main Point", "Inference", "Author's Perspective", "Structure"],
};

export type StudyState = {
  score: number;
  section: Section;
  subtype: string;
};

const KEY = "testbriefs:onboarding";
const QUIZ_KEY = "testbriefs:quiz";

export type ResourceType = "Free" | "Paid";
export type Source =
  | "7Sage"
  | "Khan Academy"
  | "LSAT Demon"
  | "YouTube"
  | "Reddit"
  | "PowerScore"
  | "Blueprint";

export type ScoreBand = "120-149" | "150-159" | "160-169" | "170-180";

export type WeeklyHours = "<5" | "5-10" | "10-20" | "20+";
export type TestDate = "<4w" | "1-3m" | "3-6m" | "none";
export type Budget = "free" | "50" | "200" | "any";

export type QuizState = {
  currentScore: number;
  targetScore: number;
  section: Section;
  weeklyHours: WeeklyHours;
  testDate: TestDate;
  budget: Budget;
};

export function saveQuizState(state: QuizState) {
  try {
    sessionStorage.setItem(QUIZ_KEY, JSON.stringify(state));
  } catch {
    /* no-op */
  }
}

export function loadQuizState(): QuizState | null {
  try {
    const raw = sessionStorage.getItem(QUIZ_KEY);
    return raw ? (JSON.parse(raw) as QuizState) : null;
  } catch {
    return null;
  }
}

export function scoreBandLabel(score: number): string {
  if (score <= 149) return "Foundations stage";
  if (score <= 159) return "Building stage";
  if (score <= 169) return "Competitive stage";
  return "Elite stage";
}

export function scoreToBand(score: number): ScoreBand {
  if (score <= 149) return "120-149";
  if (score <= 159) return "150-159";
  if (score <= 169) return "160-169";
  return "170-180";
}

export function saveStudyState(state: StudyState) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* no-op */
  }
}

export function loadStudyState(): StudyState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StudyState) : null;
  } catch {
    return null;
  }
}

export type Resource = {
  id: string;
  title: string;
  source: Source;
  reason: string;
  time: string;
  type: ResourceType;
  price?: number; // 0 if free; for budget filtering
  scoreMin: number;
  scoreMax: number;
  section: Section | "All";
  upvotes: number;
};

export const SEED_RESOURCES: Resource[] = [
  {
    id: "1",
    title: "7Sage Logic Games Walkthrough — Grouping Games",
    source: "7Sage",
    reason:
      "Students who broke 158→163 on Logic Games flagged this as the resource that clicked.",
    time: "~40 min",
    type: "Free",
    price: 0,
    scoreMin: 150,
    scoreMax: 162,
    section: "Logic Games",
    upvotes: 84,
  },
  {
    id: "2",
    title: "Khan Academy — Logical Reasoning: Assumption Questions",
    source: "Khan Academy",
    reason: "170+ scorers listed this as the module they wish they'd found earlier.",
    time: "~30 min",
    type: "Free",
    price: 0,
    scoreMin: 150,
    scoreMax: 165,
    section: "Logical Reasoning",
    upvotes: 71,
  },
  {
    id: "3",
    title: "LSAT Demon — Sequencing Games Drill Set",
    source: "LSAT Demon",
    reason: "High completion rate among students plateaued in the 155–162 range.",
    time: "~25 min",
    type: "Free",
    price: 0,
    scoreMin: 155,
    scoreMax: 165,
    section: "Logic Games",
    upvotes: 63,
  },
  {
    id: "4",
    title: "Reddit: r/LSAT — The Ultimate LR Strategy Thread",
    source: "Reddit",
    reason: "One of the most-saved threads by students plateaued between 158–165.",
    time: "~20 min",
    type: "Free",
    price: 0,
    scoreMin: 150,
    scoreMax: 170,
    section: "Logical Reasoning",
    upvotes: 57,
  },
  {
    id: "5",
    title: "Nathan Fox — RC Passage Breakdown (YouTube)",
    source: "YouTube",
    reason:
      "Students who completed this reported the clearest improvement in RC pacing.",
    time: "~35 min",
    type: "Free",
    price: 0,
    scoreMin: 150,
    scoreMax: 168,
    section: "Reading Comprehension",
    upvotes: 49,
  },
  {
    id: "6",
    title: "PowerScore Logic Games Bible",
    source: "PowerScore",
    reason:
      "The most-recommended paid resource for students building LG fundamentals from scratch.",
    time: "~8 hrs (book)",
    type: "Paid",
    price: 29,
    scoreMin: 140,
    scoreMax: 162,
    section: "Logic Games",
    upvotes: 112,
  },
  {
    id: "7",
    title: "Blueprint LSAT — Logical Reasoning Course",
    source: "Blueprint",
    reason:
      "Students who completed this course saw the highest average score gains of any single resource.",
    time: "~20 hrs (course)",
    type: "Paid",
    price: 199,
    scoreMin: 150,
    scoreMax: 172,
    section: "Logical Reasoning",
    upvotes: 98,
  },
  {
    id: "8",
    title: "LSAT Demon — Full Subscription",
    source: "LSAT Demon",
    reason:
      "Highest-rated adaptive drilling platform by students in the 160–175 range.",
    time: "Ongoing",
    type: "Paid",
    price: 49,
    scoreMin: 155,
    scoreMax: 180,
    section: "All",
    upvotes: 134,
  },
];

export function sourceClasses(source: string): string {
  switch (source) {
    case "7Sage":
      return "bg-primary-soft text-primary";
    case "Khan Academy":
      return "bg-[hsl(140_50%_94%)] text-[hsl(140_55%_28%)]";
    case "LSAT Demon":
      return "bg-[hsl(28_85%_94%)] text-[hsl(28_75%_36%)]";
    case "Reddit":
      return "bg-[hsl(14_85%_94%)] text-[hsl(14_75%_42%)]";
    case "YouTube":
      return "bg-[hsl(0_75%_95%)] text-[hsl(0_65%_45%)]";
    case "PowerScore":
      return "bg-[hsl(220_70%_94%)] text-[hsl(220_65%_38%)]";
    case "Blueprint":
      return "bg-[hsl(265_60%_94%)] text-[hsl(265_55%_42%)]";
    default:
      return "bg-muted text-muted-foreground";
  }
}
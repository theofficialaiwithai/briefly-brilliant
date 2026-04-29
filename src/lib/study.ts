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
  source: string;
  reason: string;
  time: string;
};

export const SEED_RESOURCES: Resource[] = [
  {
    id: "1",
    title: "7Sage Logic Games Walkthrough — Grouping Games",
    source: "7Sage",
    reason:
      "Students who broke 158→163 on Logic Games flagged this as the resource that clicked.",
    time: "~40 min",
  },
  {
    id: "2",
    title: "Khan Academy — Logical Reasoning: Assumption Questions",
    source: "Khan Academy",
    reason: "170+ scorers listed this as the module they wish they'd found earlier.",
    time: "~30 min",
  },
  {
    id: "3",
    title: "LSAT Demon — Sequencing Games Drill Set",
    source: "LSAT Demon",
    reason: "High completion rate among students in the 155–162 range.",
    time: "~25 min",
  },
  {
    id: "4",
    title: "Reddit: r/LSAT — The Ultimate LR Strategy Thread",
    source: "Reddit",
    reason:
      "One of the most-saved threads by students who plateaued between 158–165.",
    time: "~20 min",
  },
  {
    id: "5",
    title: "YouTube: Nathan Fox — Reading Comprehension Passage Breakdown",
    source: "YouTube",
    reason:
      "Students who completed this reported the clearest improvement in RC pacing.",
    time: "~35 min",
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
    default:
      return "bg-muted text-muted-foreground";
  }
}
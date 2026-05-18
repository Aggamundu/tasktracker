import { getPlanningMonths, type PlanningMonth } from "@/app/lib/sprints";

export type RoadmapAccent = "primary" | "secondary" | "outline";

export type RoadmapMonthEntry = PlanningMonth & {
  goal: string;
  accent: RoadmapAccent;
};

/** One row per month in the May→May planning window (aligned to `getPlanningMonths`). */
const ROADMAP_GOALS: { goal: string; accent: RoadmapAccent }[] = [
  { goal: "Kickoff & roadmap lock-in", accent: "primary" },
  { goal: "Core scope & milestones", accent: "primary" },
  { goal: "Build velocity & integrations", accent: "primary" },
  { goal: "Performance & reliability pass", accent: "secondary" },
  { goal: "Security audit & compliance", accent: "secondary" },
  { goal: "API polish & partner pilots", accent: "secondary" },
  { goal: "Mobile & expansion slice", accent: "outline" },
  { goal: "Analytics & insights layer", accent: "outline" },
  { goal: "Enterprise onboarding flow", accent: "outline" },
  { goal: "Scalability infrastructure", accent: "outline" },
  { goal: "Partner ecosystem launch", accent: "outline" },
  { goal: "Quality hardening & docs", accent: "outline" },
  { goal: "Year-end vision & next cycle prep", accent: "outline" },
];

export function getRoadmapMonths(referenceDate: Date = new Date()): RoadmapMonthEntry[] {
  const months = getPlanningMonths(referenceDate);
  return months.map((m, i) => ({
    ...m,
    ...ROADMAP_GOALS[i]!,
  }));
}

const accentBarClass: Record<RoadmapAccent, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary-container",
  outline: "bg-outline-variant",
};

export function roadmapAccentBarClass(accent: RoadmapAccent): string {
  return accentBarClass[accent];
}

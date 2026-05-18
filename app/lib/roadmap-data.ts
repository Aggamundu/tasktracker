import { getPlanningMonths, type PlanningMonth } from "@/app/lib/sprints";

export type RoadmapAccent = "primary" | "secondary" | "outline";

export type RoadmapMonthEntry = PlanningMonth & {
  goal: string;
  accent: RoadmapAccent;
};

/** One row per month in the May→May planning window (aligned to `getPlanningMonths`). */
const ROADMAP_GOALS: { goal: string; accent: RoadmapAccent }[] = [
  { goal: "Define the vision", accent: "primary" },
  { goal: "Core mechanics prototype", accent: "primary" },
  { goal: "Multiplayer prototype", accent: "primary" },
  { goal: "Basic progression", accent: "secondary" },
  { goal: "Complete core features", accent: "secondary" },
  { goal: "Complete core features", accent: "secondary" },
  { goal: "Complete core features", accent: "outline" },
  { goal: "Complete core features", accent: "outline" },
  { goal: "Complete core features", accent: "outline" },
  { goal: "Polish gameplay", accent: "outline" },
  { goal: "Finalize", accent: "outline" },
  { goal: "Finalize", accent: "outline" },
  { goal: "Finalize", accent: "outline" },
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

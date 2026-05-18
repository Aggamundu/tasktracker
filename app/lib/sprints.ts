export const MONTH_SLUGS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export type MonthSlug = (typeof MONTH_SLUGS)[number];

/** May → … → April → May (next year), 13 months inclusive. */
const PLANNING_SEQUENCE: MonthSlug[] = [
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "january",
  "february",
  "march",
  "april",
  "may",
];

export type PlanningMonth = { slug: MonthSlug; year: number };

const LABELS: Record<MonthSlug, string> = {
  january: "January",
  february: "February",
  march: "March",
  april: "April",
  may: "May",
  june: "June",
  july: "July",
  august: "August",
  september: "September",
  october: "October",
  november: "November",
  december: "December",
};

export function isMonthSlug(value: string): value is MonthSlug {
  return (MONTH_SLUGS as readonly string[]).includes(value);
}

/** Calendar year of the May that starts the May→May window containing `d`. */
export function planningWindowStartYear(d: Date = new Date()): number {
  const y = d.getFullYear();
  return d.getMonth() >= 4 ? y : y - 1;
}

/** Thirteen months: May (startYear) through May (startYear + 1). */
export function getPlanningMonths(referenceDate: Date = new Date()): PlanningMonth[] {
  const startYear = planningWindowStartYear(referenceDate);
  return PLANNING_SEQUENCE.map((slug, index) => ({
    slug,
    year: index <= 7 ? startYear : startYear + 1,
  }));
}

export function planningMonthToId(pm: PlanningMonth): string {
  return `${pm.slug}-${pm.year}`;
}

export function parsePlanningMonthId(id: string): PlanningMonth | null {
  const match = /^([a-z]+)-(\d{4})$/.exec(id);
  if (!match) return null;
  const slug = match[1];
  const year = parseInt(match[2], 10);
  if (!isMonthSlug(slug) || !Number.isInteger(year) || year < 1900 || year > 3000) {
    return null;
  }
  return { slug, year };
}

const planningIdSet = (d: Date) => new Set(getPlanningMonths(d).map(planningMonthToId));

export function isPlanningMonthInCurrentWindow(
  id: string,
  referenceDate: Date = new Date(),
): boolean {
  return planningIdSet(referenceDate).has(id);
}

export function monthTitle(slug: MonthSlug): string {
  return `${LABELS[slug]} Sprint`;
}

export function planningMonthTitle(pm: PlanningMonth): string {
  return `${LABELS[pm.slug]} ${pm.year} Sprint`;
}

export function monthNavLabel(slug: MonthSlug): string {
  return monthTitle(slug);
}

export function planningMonthNavLabel(pm: PlanningMonth): string {
  return planningMonthTitle(pm);
}

export function monthCalendarName(slug: MonthSlug): string {
  return LABELS[slug];
}

export function planningMonthCalendarLabel(pm: PlanningMonth): string {
  return `${LABELS[pm.slug]} ${pm.year}`;
}

/**
 * True when the real-world calendar month for this planning month has begun
 * (current month inclusive): we are on or after the first day of that month.
 */
export function isPlanningMonthCalendarStarted(
  pm: PlanningMonth,
  referenceDate: Date = new Date(),
): boolean {
  const monthIndex = MONTH_SLUGS.indexOf(pm.slug);
  if (monthIndex < 0) return false;
  const startOfThisCalendarMonth = new Date(pm.year, monthIndex, 1, 0, 0, 0, 0);
  return referenceDate.getTime() >= startOfThisCalendarMonth.getTime();
}

/** Default `/sprint/:id` for the app root: this calendar month if it is in the window, else the first month (May). */
export function defaultPlanningMonthId(referenceDate: Date = new Date()): string {
  const windowMonths = getPlanningMonths(referenceDate);
  const y = referenceDate.getFullYear();
  const slug = MONTH_SLUGS[referenceDate.getMonth()];
  const match = windowMonths.find((pm) => pm.slug === slug && pm.year === y);
  return planningMonthToId(match ?? windowMonths[0]);
}

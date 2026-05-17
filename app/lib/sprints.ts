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

export function monthTitle(slug: MonthSlug): string {
  return `${LABELS[slug]} Sprint`;
}

export function monthNavLabel(slug: MonthSlug): string {
  return monthTitle(slug);
}

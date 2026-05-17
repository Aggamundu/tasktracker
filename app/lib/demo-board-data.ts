export type PostItVariant = "yellow" | "blue" | "pink";

export type PostItAppearance = "default" | "done-muted" | "done-strike";

export type PostItNote = {
  title: string;
  description: string;
  variant: PostItVariant;
  appearance?: PostItAppearance;
};

export type BoardCell =
  | { kind: "notes"; notes: PostItNote[] }
  | { kind: "draft" };

export type BoardRowData = {
  story: BoardCell;
  todo: BoardCell;
  review: BoardCell;
  done: BoardCell;
};

export const BOARD_COLUMNS = [
  { key: "story" as const, label: "Story" },
  { key: "todo" as const, label: "Todo" },
  { key: "review" as const, label: "Review" },
  { key: "done" as const, label: "Done" },
] as const;

export type BoardColumnKey = (typeof BOARD_COLUMNS)[number]["key"];

/** Shared demo board used on every month sprint page. */
export const DEMO_BOARD_ROWS: BoardRowData[] = [
  {
    story: {
      kind: "notes",
      notes: [
        {
          title: "User Authentication",
          description: "Implement OAuth2 flow with Google provider.",
          variant: "yellow",
        },
      ],
    },
    todo: {
      kind: "notes",
      notes: [
        {
          title: "Login UI",
          description: "Pixel perfect forms for all screen sizes.",
          variant: "blue",
        },
        {
          title: "Password Hash",
          description: "Argon2id implementation for backend.",
          variant: "pink",
        },
      ],
    },
    review: {
      kind: "notes",
      notes: [
        {
          title: "MFA Integration",
          description: "Final code review on 2FA logic.",
          variant: "yellow",
        },
      ],
    },
    done: {
      kind: "notes",
      notes: [
        {
          title: "Session Management",
          description: "Redis store for session persistence.",
          variant: "blue",
          appearance: "done-strike",
        },
      ],
    },
  },
  {
    story: {
      kind: "notes",
      notes: [
        {
          title: "Data Dashboard",
          description: "Visualize project metrics in real-time.",
          variant: "pink",
        },
      ],
    },
    todo: {
      kind: "notes",
      notes: [
        {
          title: "Chart.js Config",
          description: "Set up global chart themes.",
          variant: "yellow",
        },
      ],
    },
    review: { kind: "draft" },
    done: {
      kind: "notes",
      notes: [
        {
          title: "API Endpoints",
          description: "All core metrics exposed via REST.",
          variant: "blue",
          appearance: "done-muted",
        },
      ],
    },
  },
  {
    story: {
      kind: "notes",
      notes: [
        {
          title: "Settings Module",
          description: "Global preferences and user profiles.",
          variant: "blue",
        },
      ],
    },
    todo: {
      kind: "notes",
      notes: [
        {
          title: "Dark Mode",
          description: "Tailwind config dark mode support.",
          variant: "pink",
        },
      ],
    },
    review: {
      kind: "notes",
      notes: [
        {
          title: "Profile Upload",
          description: "S3 integration for avatar storage.",
          variant: "yellow",
        },
      ],
    },
    done: {
      kind: "notes",
      notes: [
        {
          title: "Localization",
          description: "i18next framework setup.",
          variant: "pink",
          appearance: "done-muted",
        },
      ],
    },
  },
];

export function columnCounts(rows: BoardRowData[]) {
  const init = { story: 0, todo: 0, review: 0, done: 0 };
  for (const row of rows) {
    for (const col of BOARD_COLUMNS) {
      const cell = row[col.key];
      if (cell.kind === "notes") {
        init[col.key] += cell.notes.length;
      }
    }
  }
  return init;
}

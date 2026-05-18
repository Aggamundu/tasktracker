import type { BoardColumnKey, BoardRowData, PostItAppearance, PostItNote, PostItVariant } from "@/app/lib/demo-board-data";
import { BOARD_COLUMNS } from "@/app/lib/demo-board-data";

export type PostItNoteRow = {
  id: string;
  sprint_id: string;
  row_index: number;
  column_key: BoardColumnKey;
  position: number;
  title: string;
  description: string;
  variant: string;
  appearance: string | null;
};

const COLUMN_ORDER: Record<BoardColumnKey, number> = {
  story: 0,
  todo: 1,
  review: 2,
  done: 3,
};

/** Default story rows when a sprint has no notes in the database yet. */
export const DEFAULT_SPRINT_STORY_ROW_COUNT = 1;

export function createEmptyBoardRows(rowCount = DEFAULT_SPRINT_STORY_ROW_COUNT): BoardRowData[] {
  return Array.from({ length: rowCount }, () => emptyStoryRow());
}

/** One kanban story row with empty note columns. */
export function emptyStoryRow(): BoardRowData {
  return {
    story: { kind: "notes" as const, notes: [] },
    todo: { kind: "notes" as const, notes: [] },
    review: { kind: "notes" as const, notes: [] },
    done: { kind: "notes" as const, notes: [] },
  };
}

export function boardRowsFromDatabaseRows(rows: PostItNoteRow[]): BoardRowData[] {
  if (rows.length === 0) {
    return createEmptyBoardRows(DEFAULT_SPRINT_STORY_ROW_COUNT);
  }

  const maxRow = Math.max(...rows.map((r) => r.row_index), 0);
  const rowCount = Math.max(DEFAULT_SPRINT_STORY_ROW_COUNT, maxRow + 1);
  const board = createEmptyBoardRows(rowCount);

  const sorted = [...rows].sort((a, b) => {
    if (a.row_index !== b.row_index) return a.row_index - b.row_index;
    if (a.column_key !== b.column_key) {
      return COLUMN_ORDER[a.column_key] - COLUMN_ORDER[b.column_key];
    }
    return a.position - b.position;
  });

  for (const r of sorted) {
    const row = board[r.row_index];
    if (!row) continue;
    const cell = row[r.column_key];
    if (cell.kind !== "notes") continue;

    const appearance = (r.appearance ?? undefined) as PostItAppearance | undefined;
    const note: PostItNote = {
      id: r.id,
      title: r.title,
      description: r.description,
      variant: r.variant as PostItVariant,
      ...(appearance ? { appearance } : {}),
    };
    cell.notes.push(note);
  }

  return board;
}

export function columnKeyFromString(value: string): BoardColumnKey | null {
  return BOARD_COLUMNS.some((c) => c.key === value) ? (value as BoardColumnKey) : null;
}

export type PostItNoteMoveCoords = {
  row: number;
  col: BoardColumnKey;
  index: number;
};

/** Optimistically move one note; returns null if source is invalid. */
export function applyPostItNoteMove(
  rows: BoardRowData[],
  from: PostItNoteMoveCoords,
  to: PostItNoteMoveCoords,
): BoardRowData[] | null {
  const src = rows[from.row]?.[from.col];
  if (!src || src.kind !== "notes") return null;
  const note = src.notes[from.index];
  if (!note) return null;

  const next = structuredClone(rows) as BoardRowData[];
  const fromCell = next[from.row][from.col];
  if (fromCell.kind !== "notes") return null;
  const [removed] = fromCell.notes.splice(from.index, 1);
  if (!removed) return null;

  const toCell = next[to.row][to.col];
  if (toCell.kind !== "notes") return null;

  let insertAt = to.index;
  if (from.row === to.row && from.col === to.col && from.index < to.index) {
    insertAt = to.index - 1;
  }
  if (insertAt < 0) insertAt = 0;
  if (insertAt > toCell.notes.length) insertAt = toCell.notes.length;
  toCell.notes.splice(insertAt, 0, removed);
  return next;
}

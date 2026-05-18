import type { DragEvent } from "react";
import type { BoardColumnKey } from "@/app/lib/demo-board-data";
import { BOARD_COLUMNS } from "@/app/lib/demo-board-data";

export type NoteDragSource = {
  noteId: string;
  fromRow: number;
  fromCol: BoardColumnKey;
  fromIndex: number;
};

const MIME = "application/x-tasktracker-note+json";

export function setNoteDragData(e: DragEvent<HTMLElement>, source: NoteDragSource) {
  const dt = e.dataTransfer;
  if (!dt) return;
  const json = JSON.stringify(source);
  dt.setData(MIME, json);
  dt.setData("text/plain", source.noteId);
  dt.effectAllowed = "move";
}

export function readNoteDragPayload(e: DragEvent<HTMLElement>): NoteDragSource | null {
  const dt = e.dataTransfer;
  if (!dt) return null;
  let raw = dt.getData(MIME);
  if (!raw) raw = dt.getData("application/json");
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const noteId = typeof o.noteId === "string" ? o.noteId : "";
    const fromRow = Number(o.fromRow);
    const fromCol = typeof o.fromCol === "string" ? o.fromCol : "";
    const fromIndex = Number(o.fromIndex);
    const colOk = BOARD_COLUMNS.some((c) => c.key === fromCol);
    if (
      !noteId ||
      !Number.isInteger(fromRow) ||
      fromRow < 0 ||
      !colOk ||
      !Number.isInteger(fromIndex) ||
      fromIndex < 0
    ) {
      return null;
    }
    return {
      noteId,
      fromRow,
      fromCol: fromCol as BoardColumnKey,
      fromIndex,
    };
  } catch {
    return null;
  }
}

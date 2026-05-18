"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddPostItDialog } from "@/app/components/taskflow/AddPostItDialog";
import { DeleteRowButton } from "@/app/components/taskflow/DeleteRowButton";
import { KanbanCell, type SelectedNoteKey } from "@/app/components/taskflow/KanbanCell";
import { KanbanColumnHeader } from "@/app/components/taskflow/KanbanColumnHeader";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import {
  BOARD_COLUMNS,
  columnCounts,
  type BoardColumnKey,
  type BoardRowData,
  type PostItAppearance,
  type PostItNote,
} from "@/app/lib/demo-board-data";
import { applyPostItNoteMove, emptyStoryRow } from "@/app/lib/board-from-db";
import type { NoteDragSource } from "@/app/components/taskflow/note-drag";

const SIDEBAR_WIDTH_PX = 240;

type AddDialogContext = {
  mode: "add";
  rowIndex: number;
  columnKey: BoardColumnKey;
  afterIndex: number;
  defaultVariant: PostItNote["variant"];
};

type EditDialogContext = {
  mode: "edit";
  rowIndex: number;
  columnKey: BoardColumnKey;
  noteIndex: number;
  note: PostItNote;
};

type BoardDialogState = AddDialogContext | EditDialogContext;

type SelectedNoteWithPayload = SelectedNoteKey & { note: PostItNote };

export function KanbanBoardTable({
  planningMonthId,
  initialRows,
}: {
  planningMonthId: string;
  initialRows: BoardRowData[];
}) {
  const [rows, setRows] = useState(() => structuredClone(initialRows));
  const rowsRef = useRef(rows);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);
  const [dialog, setDialog] = useState<BoardDialogState | null>(null);
  const [dialogNonce, setDialogNonce] = useState(0);
  const [selectedNote, setSelectedNote] = useState<SelectedNoteKey | null>(null);
  const [dropHighlightKey, setDropHighlightKey] = useState<string | null>(null);

  const counts = useMemo(() => columnCounts(rows), [rows]);

  useEffect(() => {
    const clear = () => setDropHighlightKey(null);
    document.addEventListener("dragend", clear);
    return () => document.removeEventListener("dragend", clear);
  }, []);

  const selectedWithNote = useMemo((): SelectedNoteWithPayload | null => {
    if (!selectedNote) return null;
    const row = rows[selectedNote.rowIndex];
    if (!row) return null;
    const cell = row[selectedNote.columnKey];
    if (cell.kind !== "notes") return null;
    const note = cell.notes[selectedNote.noteIndex];
    if (!note) return null;
    return { ...selectedNote, note };
  }, [rows, selectedNote]);

  const clearSelection = useCallback(() => setSelectedNote(null), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector("dialog:modal")) return;
      clearSelection();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection]);

  const openAddDialog = useCallback((ctx: Omit<AddDialogContext, "mode">) => {
    clearSelection();
    setDialogNonce((n) => n + 1);
    setDialog({ mode: "add", ...ctx });
  }, [clearSelection]);

  const openEditDialog = useCallback(
    (ctx: Omit<EditDialogContext, "mode">) => {
      clearSelection();
      setDialogNonce((n) => n + 1);
      setDialog({ mode: "edit", ...ctx });
    },
    [clearSelection],
  );

  const deleteNote = useCallback(
    (ctx: {
      rowIndex: number;
      columnKey: BoardColumnKey;
      noteIndex: number;
      noteId?: string;
    }) => {
      const { rowIndex, columnKey, noteIndex, noteId: passedId } = ctx;
      const prev = rowsRef.current;
      const snapshot = structuredClone(prev);
      const cell = prev[rowIndex]?.[columnKey];
      const id =
        passedId ?? (cell?.kind === "notes" ? cell.notes[noteIndex]?.id : undefined);

      setSelectedNote(null);
      setRows((p) =>
        p.map((row, i) => {
          if (i !== rowIndex) return row;
          const c = row[columnKey];
          if (c.kind !== "notes") return row;
          return {
            ...row,
            [columnKey]: { kind: "notes" as const, notes: c.notes.filter((_, j) => j !== noteIndex) },
          };
        }),
      );

      if (!id || id.startsWith("local-")) return;

      queueMicrotask(() => {
        void (async () => {
          const res = await fetch(
            `/api/sprints/${encodeURIComponent(planningMonthId)}/notes/${encodeURIComponent(id)}`,
            { method: "DELETE", credentials: "include" },
          );
          if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            window.alert(
              (payload as { error?: string }).error ??
                `Delete failed (${res.status}). The note was restored.`,
            );
            setRows(snapshot);
          }
        })();
      });
    },
    [planningMonthId],
  );

  const moveNote = useCallback(
    (source: NoteDragSource, toRow: number, toCol: BoardColumnKey, insertIndex: number) => {
      if (source.fromRow === toRow && source.fromCol === toCol && source.fromIndex === insertIndex) {
        return;
      }
      const prev = rowsRef.current;
      const fromCell = prev[source.fromRow]?.[source.fromCol];
      if (!fromCell || fromCell.kind !== "notes") return;
      const { noteId: id } = source;
      if (!id || id.startsWith("local-")) return;

      const next = applyPostItNoteMove(
        prev,
        { row: source.fromRow, col: source.fromCol, index: source.fromIndex },
        { row: toRow, col: toCol, index: insertIndex },
      );
      if (!next) return;

      const dest = next[toRow][toCol];
      if (dest.kind !== "notes") return;
      const newPos = dest.notes.findIndex((n) => n.id === id);
      if (newPos < 0) return;

      if (
        toRow === source.fromRow &&
        toCol === source.fromCol &&
        newPos === source.fromIndex
      ) {
        return;
      }

      const snapshot = structuredClone(prev);
      setSelectedNote(null);
      setDropHighlightKey(null);
      setRows(next);

      queueMicrotask(() => {
        void (async () => {
          const res = await fetch(
            `/api/sprints/${encodeURIComponent(planningMonthId)}/notes/${encodeURIComponent(id)}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                row_index: toRow,
                column_key: toCol,
                position: newPos,
              }),
            },
          );
          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            window.alert(
              (payload as { error?: string }).error ?? `Move failed (${res.status}). Changes were reverted.`,
            );
            setRows(snapshot);
          }
        })();
      });
    },
    [planningMonthId],
  );

  const deleteBoardRow = useCallback(
    (rowIndex: number) => {
      const snapshot = structuredClone(rowsRef.current);
      setRows((p) => p.filter((_, i) => i !== rowIndex));
      queueMicrotask(() => {
        void (async () => {
          const res = await fetch(
            `/api/sprints/${encodeURIComponent(planningMonthId)}/rows/${rowIndex}`,
            { method: "DELETE", credentials: "include" },
          );
          if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            window.alert(
              (payload as { error?: string }).error ??
                `Could not delete row (${res.status}). Restored.`,
            );
            setRows(snapshot);
          }
        })();
      });
    },
    [planningMonthId],
  );

  const addStoryRow = useCallback(() => {
    setSelectedNote(null);
    setRows((prev) => [...prev, emptyStoryRow()]);
    queueMicrotask(() => {
      tbodyRef.current?.lastElementChild?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, []);

  const handleConfirm = useCallback(
    (note: Pick<PostItNote, "title" | "description" | "variant">) => {
      const current = dialog;
      if (!current) return;

      if (current.mode === "add") {
        const { rowIndex, columnKey, afterIndex } = current;
        const insertIdx = afterIndex < 0 ? 0 : afterIndex + 1;
        const tempId = `local-${crypto.randomUUID()}`;
        let snapshot: BoardRowData[] | null = null;

        setRows((prev) => {
          snapshot = structuredClone(prev);
          const optimistic: PostItNote = {
            id: tempId,
            title: note.title,
            description: note.description,
            variant: note.variant,
          };
          return prev.map((row, i) => {
            if (i !== rowIndex) return row;
            const cell = row[columnKey];
            if (cell.kind !== "notes") return row;
            const nextNotes = [...cell.notes];
            nextNotes.splice(insertIdx, 0, optimistic);
            return {
              ...row,
              [columnKey]: { kind: "notes" as const, notes: nextNotes },
            };
          });
        });
        setDialog(null);

        queueMicrotask(() => {
          void (async () => {
            const res = await fetch(`/api/sprints/${encodeURIComponent(planningMonthId)}/notes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                row_index: rowIndex,
                column_key: columnKey,
                position: insertIdx,
                title: note.title,
                description: note.description,
                variant: note.variant,
              }),
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
              window.alert(
                (payload as { error?: string }).error ?? `Save failed (${res.status}). Changes were reverted.`,
              );
              if (snapshot) setRows(snapshot);
              return;
            }
            const raw = (payload as { note?: Record<string, unknown> }).note;
            if (!raw?.id) {
              window.alert("Save did not return a note id. Changes were reverted.");
              if (snapshot) setRows(snapshot);
              return;
            }
            const mapped: PostItNote = {
              id: String(raw.id),
              title: String(raw.title ?? ""),
              description: String(raw.description ?? ""),
              variant: note.variant,
              ...(raw.appearance && typeof raw.appearance === "string"
                ? { appearance: raw.appearance as PostItAppearance }
                : {}),
            };
            setRows((prev) =>
              prev.map((row, i) => {
                if (i !== rowIndex) return row;
                const cell = row[columnKey];
                if (cell.kind !== "notes") return row;
                const nextNotes = cell.notes.map((n) => (n.id === tempId ? mapped : n));
                return {
                  ...row,
                  [columnKey]: { kind: "notes" as const, notes: nextNotes },
                };
              }),
            );
          })();
        });
        return;
      }

      const { rowIndex, columnKey, noteIndex, note: previous } = current;
      let snapshot: BoardRowData[] | null = null;

      setRows((prev) => {
        snapshot = structuredClone(prev);
        return prev.map((row, i) => {
          if (i !== rowIndex) return row;
          const cell = row[columnKey];
          if (cell.kind !== "notes") return row;
          const nextNotes = cell.notes.map((n, j) =>
            j === noteIndex
              ? {
                  ...n,
                  title: note.title,
                  description: note.description,
                  variant: note.variant,
                  appearance: previous.appearance,
                }
              : n,
          );
          return {
            ...row,
            [columnKey]: { kind: "notes" as const, notes: nextNotes },
          };
        });
      });
      setDialog(null);

      const persistId = previous.id;
      if (!persistId) return;

      queueMicrotask(() => {
        void (async () => {
          const res = await fetch(
            `/api/sprints/${encodeURIComponent(planningMonthId)}/notes/${encodeURIComponent(persistId)}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                title: note.title,
                description: note.description,
                variant: note.variant,
                appearance: previous.appearance ?? null,
              }),
            },
          );
          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            window.alert(
              (payload as { error?: string }).error ?? `Update failed (${res.status}). Changes were reverted.`,
            );
            if (snapshot) setRows(snapshot);
            return;
          }
          const raw = (payload as { note?: Record<string, unknown> }).note;
          if (!raw?.id) return;
          const mapped: PostItNote = {
            id: String(raw.id),
            title: String(raw.title ?? note.title),
            description: String(raw.description ?? note.description),
            variant: (typeof raw.variant === "string" ? raw.variant : note.variant) as PostItNote["variant"],
            ...(raw.appearance && typeof raw.appearance === "string"
              ? { appearance: raw.appearance as PostItAppearance }
              : {}),
          };
          setRows((prev) =>
            prev.map((row, i) => {
              if (i !== rowIndex) return row;
              const cell = row[columnKey];
              if (cell.kind !== "notes") return row;
              const nextNotes = cell.notes.map((n, j) => (j === noteIndex ? mapped : n));
              return {
                ...row,
                [columnKey]: { kind: "notes" as const, notes: nextNotes },
              };
            }),
          );
        })();
      });
    },
    [dialog, planningMonthId],
  );

  const dialogMode = dialog?.mode ?? "add";
  const defaultVariant =
    dialog?.mode === "edit" ? dialog.note.variant : (dialog?.defaultVariant ?? "yellow");
  const initialNote =
    dialog?.mode === "edit"
      ? {
          title: dialog.note.title,
          description: dialog.note.description,
          variant: dialog.note.variant,
        }
      : null;

  const toolbarInset = { left: `${SIDEBAR_WIDTH_PX}px`, right: 0 } as const;

  return (
    <>
      {selectedWithNote ? (
        <div
          data-postit-selection-toolbar
          className="pointer-events-none fixed top-4 z-[200] flex justify-end px-4"
          style={toolbarInset}
        >
          <div className="border-outline-variant bg-surface-container-lowest pointer-events-auto flex items-center gap-1 rounded-xl border px-2 py-2 shadow-lg">
            <button
              type="button"
              onClick={() =>
                openEditDialog({
                  rowIndex: selectedWithNote.rowIndex,
                  columnKey: selectedWithNote.columnKey,
                  noteIndex: selectedWithNote.noteIndex,
                  note: selectedWithNote.note,
                })
              }
              className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-body-md font-semibold"
            >
              <Edit sx={{ fontSize: 20, color: "currentColor" }} />
              Edit
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() =>
                deleteNote({
                  rowIndex: selectedWithNote.rowIndex,
                  columnKey: selectedWithNote.columnKey,
                  noteIndex: selectedWithNote.noteIndex,
                  noteId: selectedWithNote.note.id,
                })
              }
              className="text-on-surface-variant hover:bg-error-container/30 hover:text-error flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-body-md font-semibold"
            >
              <Delete sx={{ fontSize: 20, color: "currentColor" }} />
              Delete
            </button>
          </div>
        </div>
      ) : null}

      <div
        className="w-full overflow-x-auto"
        onMouseDown={(e) => {
          const t = e.target as Element | null;
          if (
            t?.closest?.("[data-postit-card]") ||
            t?.closest?.("[data-postit-note-draggable]") ||
            t?.closest?.("[data-postit-selection-toolbar]") ||
            t?.closest?.("[data-cell-add-note]") ||
            t?.closest?.("[data-delete-story-row]")
          ) {
            return;
          }
          clearSelection();
        }}
      >
        <table className="border-outline-variant w-full border-collapse border">
          <thead>
            <tr className="text-left">
              {BOARD_COLUMNS.map((col) => (
                <KanbanColumnHeader
                  key={col.key}
                  label={col.label}
                  count={counts[col.key]}
                />
              ))}
              <th className="bg-surface-container-low border-outline-variant sticky top-0 z-10 w-12 border-b border-r-0 p-4" />
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="group hover:bg-surface-container-lowest"
              >
                {BOARD_COLUMNS.map((col) => (
                  <KanbanCell
                    key={col.key}
                    cell={row[col.key]}
                    columnKey={col.key}
                    rowIndex={rowIndex}
                    selectedNote={selectedNote}
                    onSelectNote={setSelectedNote}
                    onRequestAddNote={openAddDialog}
                    dropHighlightKey={dropHighlightKey}
                    cellDropKey={`${rowIndex}:${col.key}`}
                    onCellDragOver={setDropHighlightKey}
                    onNoteDragStart={() => setDropHighlightKey(null)}
                    onNoteDragEnd={() => setDropHighlightKey(null)}
                    onNoteDropped={moveNote}
                  />
                ))}
                <td className="border-outline-variant border-b p-4 align-middle text-center">
                  <DeleteRowButton onDelete={() => deleteBoardRow(rowIndex)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewStoryRowButton onClick={addStoryRow} />

      <AddPostItDialog
        key={dialog !== null ? String(dialogNonce) : "closed"}
        open={dialog !== null}
        mode={dialogMode}
        defaultVariant={defaultVariant}
        initialNote={initialNote}
        onCancel={() => setDialog(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export function NewStoryRowButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-base flex justify-center pb-12">
      <button
        type="button"
        onClick={onClick}
        className="text-primary border-outline-variant bg-surface-container hover:bg-primary-container/10 hover:border-primary flex cursor-pointer items-center gap-2 rounded-full border-2 border-dashed px-12 py-4 font-headline-sm"
      >
        <Add sx={{ fontSize: 22, color: "currentColor" }} />
        <span>New Story Row</span>
      </button>
    </div>
  );
}

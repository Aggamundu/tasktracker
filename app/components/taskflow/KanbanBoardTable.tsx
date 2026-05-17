"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  type PostItNote,
} from "@/app/lib/demo-board-data";

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

export function KanbanBoardTable({ initialRows }: { initialRows: BoardRowData[] }) {
  const [rows, setRows] = useState(() => structuredClone(initialRows));
  const [dialog, setDialog] = useState<BoardDialogState | null>(null);
  const [dialogNonce, setDialogNonce] = useState(0);
  const [selectedNote, setSelectedNote] = useState<SelectedNoteKey | null>(null);

  const counts = useMemo(() => columnCounts(rows), [rows]);

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
    (ctx: { rowIndex: number; columnKey: BoardColumnKey; noteIndex: number }) => {
      const { rowIndex, columnKey, noteIndex } = ctx;
      setSelectedNote(null);
      setRows((prev) =>
        prev.map((row, i) => {
          if (i !== rowIndex) return row;
          const cell = row[columnKey];
          if (cell.kind !== "notes") return row;
          const nextNotes = cell.notes.filter((_, j) => j !== noteIndex);
          return {
            ...row,
            [columnKey]: { kind: "notes" as const, notes: nextNotes },
          };
        }),
      );
    },
    [],
  );

  const handleConfirm = useCallback(
    (note: Pick<PostItNote, "title" | "description" | "variant">) => {
      if (!dialog) return;
      if (dialog.mode === "add") {
        const { rowIndex, columnKey, afterIndex } = dialog;
        setRows((prev) =>
          prev.map((row, i) => {
            if (i !== rowIndex) return row;
            const cell = row[columnKey];
            if (cell.kind !== "notes") return row;
            const nextNotes = [...cell.notes];
            const insertAt = afterIndex < 0 ? 0 : afterIndex + 1;
            nextNotes.splice(insertAt, 0, {
              title: note.title,
              description: note.description,
              variant: note.variant,
            });
            return {
              ...row,
              [columnKey]: { kind: "notes" as const, notes: nextNotes },
            };
          }),
        );
      } else {
        const { rowIndex, columnKey, noteIndex, note: previous } = dialog;
        setRows((prev) =>
          prev.map((row, i) => {
            if (i !== rowIndex) return row;
            const cell = row[columnKey];
            if (cell.kind !== "notes") return row;
            const nextNotes = cell.notes.map((n, j) =>
              j === noteIndex
                ? {
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
          }),
        );
      }
      setDialog(null);
    },
    [dialog],
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
              className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-body-md font-semibold transition-colors"
            >
              <Edit sx={{ fontSize: 20, color: "currentColor" }} />
              Edit
            </button>
            <button
              type="button"
              onClick={() =>
                deleteNote({
                  rowIndex: selectedWithNote.rowIndex,
                  columnKey: selectedWithNote.columnKey,
                  noteIndex: selectedWithNote.noteIndex,
                })
              }
              className="text-on-surface-variant hover:bg-error-container/30 hover:text-error flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-body-md font-semibold transition-colors"
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
            t?.closest?.("[data-postit-selection-toolbar]") ||
            t?.closest?.("[data-cell-add-note]")
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
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="group hover:bg-surface-container-lowest transition-colors"
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
                  />
                ))}
                <td className="border-outline-variant border-b p-4 align-middle text-center">
                  <DeleteRowButton />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export function NewStoryRowButton() {
  return (
    <div className="mt-base flex justify-center pb-12">
      <button
        type="button"
        className="text-primary border-outline-variant bg-surface-container hover:bg-primary-container/10 hover:border-primary flex cursor-pointer items-center gap-2 rounded-full border-2 border-dashed px-12 py-4 font-headline-sm transition-all active:scale-[0.98]"
      >
        <Add sx={{ fontSize: 22, color: "currentColor" }} />
        <span>New Story Row</span>
      </button>
    </div>
  );
}

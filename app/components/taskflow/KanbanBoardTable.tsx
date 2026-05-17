"use client";

import { useCallback, useMemo, useState } from "react";
import { AddPostItDialog } from "@/app/components/taskflow/AddPostItDialog";
import { DeleteRowButton } from "@/app/components/taskflow/DeleteRowButton";
import { KanbanCell } from "@/app/components/taskflow/KanbanCell";
import { KanbanColumnHeader } from "@/app/components/taskflow/KanbanColumnHeader";
import { MaterialIcon } from "@/app/components/taskflow/MaterialIcon";
import {
  BOARD_COLUMNS,
  columnCounts,
  type BoardColumnKey,
  type BoardRowData,
  type PostItNote,
} from "@/app/lib/demo-board-data";

type DialogContext = {
  rowIndex: number;
  columnKey: BoardColumnKey;
  afterIndex: number;
  defaultVariant: PostItNote["variant"];
};

export function KanbanBoardTable({ initialRows }: { initialRows: BoardRowData[] }) {
  const [rows, setRows] = useState(() => structuredClone(initialRows));
  const [dialog, setDialog] = useState<DialogContext | null>(null);
  const [dialogNonce, setDialogNonce] = useState(0);

  const counts = useMemo(() => columnCounts(rows), [rows]);

  const openDialog = useCallback((ctx: DialogContext) => {
    setDialogNonce((n) => n + 1);
    setDialog(ctx);
  }, []);

  const handleConfirm = useCallback(
    (note: Pick<PostItNote, "title" | "description" | "variant">) => {
      if (!dialog) return;
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
      setDialog(null);
    },
    [dialog],
  );

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left">
              {BOARD_COLUMNS.map((col) => (
                <KanbanColumnHeader
                  key={col.key}
                  label={col.label}
                  count={counts[col.key]}
                />
              ))}
              <th className="bg-surface-container-low border-outline-variant sticky top-0 z-10 w-12 border-b p-4" />
            </tr>
          </thead>
          <tbody className="divide-outline-variant/30 divide-y">
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
                    onRequestAddNote={openDialog}
                  />
                ))}
                <td className="p-4 align-middle text-center">
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
        defaultVariant={dialog?.defaultVariant ?? "yellow"}
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
        <MaterialIcon name="add_circle" />
        <span>New Story Row</span>
      </button>
    </div>
  );
}

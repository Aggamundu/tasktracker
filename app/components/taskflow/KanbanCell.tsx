import type { DragEvent } from "react";
import { DraftTaskCell } from "@/app/components/taskflow/DraftTaskCell";
import Add from "@mui/icons-material/Add";
import { PostItCard } from "@/app/components/taskflow/PostItCard";
import { readNoteDragPayload, setNoteDragData, type NoteDragSource } from "@/app/components/taskflow/note-drag";
import type { BoardCell, BoardColumnKey, PostItVariant } from "@/app/lib/demo-board-data";

const ADD_NOTE_BTN =
  "text-primary border-outline-variant/60 hover:border-primary hover:bg-surface-container-low flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed py-2.5 text-label-md font-semibold";

export type SelectedNoteKey = {
  rowIndex: number;
  columnKey: BoardColumnKey;
  noteIndex: number;
};

type KanbanCellProps = {
  cell: BoardCell;
  columnKey: BoardColumnKey;
  rowIndex: number;
  selectedNote: SelectedNoteKey | null;
  onSelectNote: (key: SelectedNoteKey | null) => void;
  onRequestAddNote: (ctx: {
    rowIndex: number;
    columnKey: BoardColumnKey;
    afterIndex: number;
    defaultVariant: PostItVariant;
  }) => void;
  dropHighlightKey: string | null;
  cellDropKey: string;
  onCellDragOver: (key: string) => void;
  onNoteDragStart: () => void;
  onNoteDragEnd: () => void;
  onNoteDropped: (source: NoteDragSource, toRow: number, toCol: BoardColumnKey, insertIndex: number) => void;
};

function allowDrop(e: DragEvent<HTMLElement>) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function cellDragLeave(e: DragEvent<HTMLDivElement>, onExit: () => void) {
  const next = e.relatedTarget;
  if (next instanceof Node && e.currentTarget.contains(next)) return;
  onExit();
}

export function KanbanCell({
  cell,
  columnKey,
  rowIndex,
  selectedNote,
  onSelectNote,
  onRequestAddNote,
  dropHighlightKey,
  cellDropKey,
  onCellDragOver,
  onNoteDragStart,
  onNoteDragEnd,
  onNoteDropped,
}: KanbanCellProps) {
  if (cell.kind === "draft") {
    return (
      <td className="group/cell border-outline-variant relative border-b border-r p-4 align-top">
        <DraftTaskCell />
      </td>
    );
  }

  const requestAdd = (afterIndex: number, defaultVariant: PostItVariant) =>
    onRequestAddNote({ rowIndex, columnKey, afterIndex, defaultVariant });

  const isNoteSelected = (noteIndex: number) =>
    selectedNote !== null &&
    selectedNote.rowIndex === rowIndex &&
    selectedNote.columnKey === columnKey &&
    selectedNote.noteIndex === noteIndex;

  const toggleSelect = (noteIndex: number) => {
    if (isNoteSelected(noteIndex)) {
      onSelectNote(null);
    } else {
      onSelectNote({ rowIndex, columnKey, noteIndex });
    }
  };

  const lastVariant = cell.notes.at(-1)?.variant ?? "yellow";
  const highlight = dropHighlightKey === cellDropKey;

  const runDrop = (e: DragEvent<HTMLElement>, insertIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const payload = readNoteDragPayload(e);
    if (!payload) return;
    onNoteDropped(payload, rowIndex, columnKey, insertIndex);
  };

  const onInnerDragOver = (e: DragEvent<HTMLElement>) => {
    allowDrop(e);
    onCellDragOver(cellDropKey);
  };

  return (
    <td
      className={`group/cell border-outline-variant relative border-b border-r p-4 align-top ${highlight ? "ring-2 ring-inset ring-primary/50" : ""}`}
    >
      <div
        className="flex min-h-0 flex-col gap-card-gap"
        onDragOver={onInnerDragOver}
        onDragLeave={(e) => cellDragLeave(e, onNoteDragEnd)}
      >
        {cell.notes.length === 0 ? (
          <div onDragOver={onInnerDragOver} onDrop={(e) => runDrop(e, 0)}>
            <button
              type="button"
              data-cell-add-note
              onClick={() => requestAdd(-1, "yellow")}
              className={ADD_NOTE_BTN}
            >
              <Add sx={{ fontSize: 18, color: "currentColor" }} />
              Add note
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-card-gap">
              {cell.notes.map((note, index) => {
                const canDrag = Boolean(note.id && !note.id.startsWith("local-"));
                return (
                  <div
                    key={note.id ?? `${columnKey}-${rowIndex}-${index}`}
                    onDragOver={onInnerDragOver}
                    onDrop={(e) => runDrop(e, index)}
                  >
                    <PostItCard
                      title={note.title}
                      description={note.description}
                      variant={note.variant}
                      appearance={note.appearance}
                      isSelected={isNoteSelected(index)}
                      onSelect={() => toggleSelect(index)}
                      draggable={canDrag}
                      onDragStart={(e) => {
                        if (!note.id || !canDrag) return;
                        setNoteDragData(e, {
                          noteId: note.id,
                          fromRow: rowIndex,
                          fromCol: columnKey,
                          fromIndex: index,
                        });
                        onNoteDragStart();
                      }}
                      onDragEnd={onNoteDragEnd}
                    />
                  </div>
                );
              })}
            </div>
            <div
              className="mt-1 min-h-3"
              onDragOver={onInnerDragOver}
              onDrop={(e) => runDrop(e, cell.notes.length)}
            >
              <button
                type="button"
                data-cell-add-note
                onClick={() => requestAdd(cell.notes.length - 1, lastVariant)}
                className={ADD_NOTE_BTN}
              >
                <Add sx={{ fontSize: 18, color: "currentColor" }} />
                Add note
              </button>
            </div>
          </>
        )}
      </div>
    </td>
  );
}

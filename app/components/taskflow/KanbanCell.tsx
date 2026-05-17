import { DraftTaskCell } from "@/app/components/taskflow/DraftTaskCell";
import Add from "@mui/icons-material/Add";
import { PostItCard } from "@/app/components/taskflow/PostItCard";
import type { BoardCell, BoardColumnKey, PostItVariant } from "@/app/lib/demo-board-data";

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
};

export function KanbanCell({
  cell,
  columnKey,
  rowIndex,
  selectedNote,
  onSelectNote,
  onRequestAddNote,
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

  return (
    <td className="group/cell border-outline-variant relative border-b border-r p-4 align-top">
      <div className="flex min-h-0 flex-col gap-card-gap">
        {cell.notes.length === 0 ? (
          <button
            type="button"
            onClick={() => requestAdd(-1, "yellow")}
            className="text-primary border-outline-variant hover:border-primary hover:bg-surface-container-low flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 transition-colors"
          >
            <Add sx={{ fontSize: 28, color: "currentColor" }} />
            <span className="text-label-md font-semibold">Add note</span>
          </button>
        ) : (
          <>
            <div className="flex flex-col gap-card-gap">
              {cell.notes.map((note, index) => (
                <PostItCard
                  key={`${columnKey}-${rowIndex}-${index}`}
                  title={note.title}
                  description={note.description}
                  variant={note.variant}
                  appearance={note.appearance}
                  isSelected={isNoteSelected(index)}
                  onSelect={() => toggleSelect(index)}
                />
              ))}
            </div>
            <button
              type="button"
              data-cell-add-note
              onClick={() => requestAdd(cell.notes.length - 1, lastVariant)}
              className="text-primary border-outline-variant/60 hover:border-primary hover:bg-surface-container-low mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed py-2.5 text-label-md font-semibold transition-colors"
            >
              <Add sx={{ fontSize: 18, color: "currentColor" }} />
              Add note
            </button>
          </>
        )}
      </div>
    </td>
  );
}

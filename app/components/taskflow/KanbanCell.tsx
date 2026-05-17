import { DraftTaskCell } from "@/app/components/taskflow/DraftTaskCell";
import { MaterialIcon } from "@/app/components/taskflow/MaterialIcon";
import { PostItCard } from "@/app/components/taskflow/PostItCard";
import type { BoardCell, BoardColumnKey, PostItVariant } from "@/app/lib/demo-board-data";

type KanbanCellProps = {
  cell: BoardCell;
  columnKey: BoardColumnKey;
  rowIndex: number;
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
  onRequestAddNote,
}: KanbanCellProps) {
  if (cell.kind === "draft") {
    return (
      <td className="group/cell border-outline-variant/30 relative border-r p-4 align-top">
        <DraftTaskCell />
      </td>
    );
  }

  const request = (afterIndex: number, defaultVariant: PostItVariant) =>
    onRequestAddNote({ rowIndex, columnKey, afterIndex, defaultVariant });

  return (
    <td className="group/cell border-outline-variant/30 relative border-r p-4 align-top">
      <div className="space-y-card-gap">
        {cell.notes.length === 0 ? (
          <button
            type="button"
            onClick={() => request(-1, "yellow")}
            className="text-primary border-outline-variant/50 hover:border-primary hover:bg-surface-container-low flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 transition-colors"
          >
            <MaterialIcon name="add_circle" />
            <span className="text-label-md font-semibold">Add note</span>
          </button>
        ) : (
          cell.notes.map((note, index) => (
            <PostItCard
              key={`${note.title}-${index}`}
              title={note.title}
              description={note.description}
              variant={note.variant}
              appearance={note.appearance}
              onAddNote={() => request(index, note.variant)}
            />
          ))
        )}
      </div>
    </td>
  );
}

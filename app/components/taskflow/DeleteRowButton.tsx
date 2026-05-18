import Delete from "@mui/icons-material/Delete";

type DeleteRowButtonProps = {
  onDelete: () => void;
};

export function DeleteRowButton({ onDelete }: DeleteRowButtonProps) {
  return (
    <button
      type="button"
      data-delete-story-row
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
      }}
      className="text-on-surface-variant hover:text-error hover:bg-error-container/20 cursor-pointer rounded-full p-2 opacity-0 group-hover:opacity-100"
      aria-label="Delete story row"
    >
      <Delete sx={{ fontSize: 22, color: "currentColor" }} />
    </button>
  );
}

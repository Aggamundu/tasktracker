import Delete from "@mui/icons-material/Delete";

export function DeleteRowButton() {
  return (
    <button
      type="button"
      className="text-on-surface-variant hover:text-error hover:bg-error-container/20 cursor-pointer rounded-full p-2 opacity-0 transition-colors group-hover:opacity-100"
      aria-label="Delete row"
    >
      <Delete sx={{ fontSize: 22, color: "currentColor" }} />
    </button>
  );
}

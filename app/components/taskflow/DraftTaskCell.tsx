import { MaterialIcon } from "@/app/components/taskflow/MaterialIcon";

export function DraftTaskCell() {
  return (
    <button
      type="button"
      className="text-on-surface-variant hover:border-primary hover:text-primary group-hover/cell:bg-surface-container-low flex h-full min-h-[100px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant/50 transition-all"
    >
      <MaterialIcon name="add_circle" />
      <span className="text-label-md">Draft Task</span>
    </button>
  );
}

import { MaterialIcon } from "@/app/components/taskflow/MaterialIcon";
import type { PostItAppearance, PostItVariant } from "@/app/lib/demo-board-data";

const variantClass: Record<PostItVariant, string> = {
  yellow: "post-it-yellow",
  blue: "post-it-blue",
  pink: "post-it-pink",
};

const appearanceClass: Record<PostItAppearance, string> = {
  default: "",
  "done-muted": "opacity-60",
  "done-strike": "opacity-60 grayscale-[0.2] line-through",
};

type PostItCardProps = {
  title: string;
  description: string;
  variant: PostItVariant;
  appearance?: PostItAppearance;
  onAddNote: () => void;
};

export function PostItCard({
  title,
  description,
  variant,
  appearance = "default",
  onAddNote,
}: PostItCardProps) {
  return (
    <div className="space-y-1">
      <div
        className={`post-it-card ${variantClass[variant]} rounded-lg p-3 text-on-surface-variant min-h-[80px] ${appearanceClass[appearance]}`}
      >
        <p className="font-body-md mb-1 font-semibold">{title}</p>
        <p className="text-body-sm">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAddNote}
        className="text-primary hover:bg-surface-container-high flex cursor-pointer items-center gap-1 rounded-md px-1 py-1 text-left text-label-md font-semibold transition-colors"
      >
        <MaterialIcon name="add" className="text-[18px]" />
        Add note
      </button>
    </div>
  );
}

import type { DragEventHandler } from "react";
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
  isSelected: boolean;
  onSelect: () => void;
  draggable?: boolean;
  onDragStart?: DragEventHandler<HTMLDivElement>;
  onDragEnd?: DragEventHandler<HTMLDivElement>;
};

export function PostItCard({
  title,
  description,
  variant,
  appearance = "default",
  isSelected,
  onSelect,
  draggable = false,
  onDragStart,
  onDragEnd,
}: PostItCardProps) {
  return (
    <div
      data-postit-card
      {...(draggable ? { "data-postit-note-draggable": "" as const } : {})}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`post-it-card ${variantClass[variant]} relative rounded-lg p-3 text-on-surface-variant outline-none min-h-[80px] ${appearanceClass[appearance]} ${isSelected ? "brightness-[0.88] ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md hover:brightness-[0.8]" : "hover:brightness-[0.92]"} ${draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
    >
      <p className="font-body-md mb-1 font-semibold">{title}</p>
      <p className="text-body-sm">{description}</p>
    </div>
  );
}

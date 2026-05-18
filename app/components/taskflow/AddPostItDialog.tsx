"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PostItNote, PostItVariant } from "@/app/lib/demo-board-data";

const variantClass: Record<PostItVariant, string> = {
  yellow: "post-it-yellow",
  blue: "post-it-blue",
  pink: "post-it-pink",
};

type AddPostItDialogProps = {
  open: boolean;
  mode: "add" | "edit";
  /** Used when `mode === "add"` and no `initialNote`. */
  defaultVariant: PostItVariant;
  /** When `mode === "edit"`, pre-fills the form. */
  initialNote?: Pick<PostItNote, "title" | "description" | "variant"> | null;
  onCancel: () => void;
  onConfirm: (note: {
    title: string;
    description: string;
    variant: PostItVariant;
  }) => void | Promise<void>;
};

export function AddPostItDialog({
  open,
  mode,
  defaultVariant,
  initialNote,
  onCancel,
  onConfirm,
}: AddPostItDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const [title, setTitle] = useState(() => initialNote?.title ?? "");
  const [description, setDescription] = useState(() => initialNote?.description ?? "");
  const [variant, setVariant] = useState<PostItVariant>(
    () => initialNote?.variant ?? defaultVariant,
  );

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  const panelClass = `post-it-card ${variantClass[variant]} rounded-lg p-4 text-on-surface-variant min-w-[min(100vw-2rem,360px)] max-w-md shadow-lg`;
  const heading = mode === "edit" ? "Edit note" : "New note";
  const submitLabel = mode === "edit" ? "Save changes" : "Add note";

  return (
    <dialog
      ref={dialogRef}
      className="m-0 max-h-none min-h-dvh w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-on-surface/35"
      onClose={onCancel}
    >
      <div
        className="flex min-h-dvh w-full cursor-pointer items-center justify-center p-4"
        onClick={onCancel}
        role="presentation"
      >
        <form
          className={panelClass}
          onClick={(e) => e.stopPropagation()}
          onSubmit={async (e) => {
            e.preventDefault();
            const t = title.trim();
            if (!t) return;
            await Promise.resolve(
              onConfirm({
                title: t,
                description: description.trim(),
                variant,
              }),
            );
          }}
        >
          <p className="font-headline-sm text-headline-sm mb-3 font-bold text-on-surface">
            {heading}
          </p>

          <div className="mb-3 flex gap-2" role="group" aria-label="Note color">
            {(["yellow", "blue", "pink"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={variant === v}
                onClick={() => setVariant(v)}
                className={`flex flex-1 cursor-pointer rounded-md border-2 px-4 py-3 text-label-md font-semibold capitalize ${
                  variant === v
                    ? "border-primary text-primary"
                    : "border-outline-variant/40 text-on-surface-variant hover:border-outline"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <label className="mb-2 block" htmlFor={titleId}>
            <span className="text-label-md text-on-surface-variant font-semibold tracking-[0.05em]">
              Title
            </span>
            <input
              id={titleId}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-outline-variant/50 focus:border-primary mt-1 w-full rounded-md border bg-white/80 px-2 py-1.5 font-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary"
              placeholder="Short title"
              autoComplete="off"
              required
            />
          </label>

          <label className="mb-4 block" htmlFor={descId}>
            <span className="text-label-md text-on-surface-variant font-semibold tracking-[0.05em]">
              Details
            </span>
            <textarea
              id={descId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-outline-variant/50 focus:border-primary mt-1 w-full resize-y rounded-md border bg-white/80 px-2 py-1.5 font-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary"
              placeholder="What needs doing?"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-on-surface-variant hover:bg-surface-container-high cursor-pointer rounded-lg px-3 py-2 text-body-md font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-container hover:bg-primary cursor-pointer rounded-lg px-4 py-2 text-body-md font-semibold text-on-primary"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

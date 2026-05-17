export function SprintBoardHeader({ title }: { title: string }) {
  return (
    <div className="border-outline-variant/30 bg-surface-bright flex items-center justify-between border-b px-container-padding py-6">
      <div className="flex items-center gap-3">
        <h2 className="text-on-surface font-headline-md text-headline-md">{title}</h2>
      </div>
    </div>
  );
}

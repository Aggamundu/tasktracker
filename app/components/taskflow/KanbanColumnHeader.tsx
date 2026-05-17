export function KanbanColumnHeader({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <th className="text-on-surface-variant bg-surface-container-low border-outline-variant sticky top-0 z-10 w-1/4 border-b border-r p-4 text-left font-headline-sm text-headline-sm">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <span className="text-on-surface bg-surface-container-highest text-label-md flex h-6 w-6 items-center justify-center rounded-full">
          {count}
        </span>
      </div>
    </th>
  );
}

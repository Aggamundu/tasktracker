import Link from "next/link";
import { MaterialIcon } from "@/app/components/taskflow/MaterialIcon";
import { MONTH_SLUGS, monthNavLabel, type MonthSlug } from "@/app/lib/sprints";

export function SprintSideNav({ activeMonth }: { activeMonth: MonthSlug }) {
  return (
    <aside className="border-outline-variant bg-surface-container-lowest dark:bg-surface-container-low dark:border-outline fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col gap-card-gap border-r px-gutter py-base">
      <div className="mb-section-margin">
        <h1 className="text-primary dark:text-primary-fixed font-headline-sm text-headline-sm font-bold">
          Game Tasks
        </h1>
      </div>
      <div className="text-primary mb-2 flex items-center gap-2 px-3">
        <MaterialIcon name="calendar_today" className="text-[20px]" />
        <span className="font-body-md font-semibold">Timeline</span>
      </div>
      <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {MONTH_SLUGS.map((slug) => {
          const active = slug === activeMonth;
          return (
            <Link
              key={slug}
              href={`/sprint/${slug}`}
              className={
                active
                  ? "bg-secondary-container text-on-secondary-container rounded-lg px-3 py-2 font-semibold active:translate-x-1 flex cursor-pointer items-center gap-3 transition-transform"
                  : "text-on-surface-variant hover:bg-surface-container-high px-3 py-2 flex cursor-pointer items-center gap-3 transition-all active:translate-x-1"
              }
            >
              <span className="font-body-md">{monthNavLabel(slug)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

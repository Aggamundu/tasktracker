"use client";

import Link from "next/link";
import Timeline from "@mui/icons-material/Timeline";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, type MouseEvent } from "react";
import {
  getPlanningMonths,
  planningMonthNavLabel,
  planningMonthToId,
} from "@/app/lib/sprints";

const navActiveClass =
  "bg-secondary-container text-on-secondary-container rounded-lg px-3 py-2 font-semibold active:translate-x-1 flex cursor-pointer items-center gap-3 transition-transform";

const navInactiveClass =
  "text-on-surface-variant hover:bg-surface-container-high px-3 py-2 flex cursor-pointer items-center gap-3 transition-all active:translate-x-1";

/** Logical selection derived from URL (`/timeline` or `/sprint/:id`). */
export type SprintNavSelection = "timeline" | string;

function navLinkClick(
  e: MouseEvent<HTMLAnchorElement>,
  href: string,
  router: ReturnType<typeof useRouter>,
  startTransition: (fn: () => void) => void,
) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  startTransition(() => {
    router.push(href);
  });
}

export function SprintSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const timelineActive = pathname === "/timeline" || pathname.startsWith("/timeline/");
  const sprintMatch = /^\/sprint\/([^/]+)/.exec(pathname);
  const activeSprintId = sprintMatch?.[1] ?? null;

  return (
    <>
      {isPending ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100000] h-[3px] overflow-hidden bg-primary/15"
          aria-hidden
        >
          <div className="tasktracker-nav-loading-bar h-full w-1/3 rounded-e-full bg-primary shadow-sm" />
        </div>
      ) : null}
      <aside className="border-outline-variant bg-surface-container-lowest dark:bg-surface-container-low dark:border-outline fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col gap-card-gap border-r px-gutter py-base">
        <div className="mb-section-margin" />
        <Link
          href="/timeline"
          prefetch
          onClick={(e) => navLinkClick(e, "/timeline", router, startTransition)}
          className={`mb-2 flex items-center gap-2 rounded-lg ${timelineActive ? navActiveClass : navInactiveClass}`}
        >
          <Timeline sx={{ fontSize: 20, color: "currentColor" }} />
          <span className="font-body-md font-semibold">Timeline</span>
        </Link>
        <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {getPlanningMonths().map((pm) => {
            const id = planningMonthToId(pm);
            const href = `/sprint/${id}`;
            const active = id === activeSprintId;
            return (
              <Link
                key={id}
                href={href}
                prefetch
                onClick={(e) => navLinkClick(e, href, router, startTransition)}
                className={active ? navActiveClass : navInactiveClass}
              >
                <span className="font-body-md">{planningMonthNavLabel(pm)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

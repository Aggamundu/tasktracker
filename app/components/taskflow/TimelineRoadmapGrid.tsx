import Link from "next/link";
import ArrowForward from "@mui/icons-material/ArrowForward";
import {
  getRoadmapMonths,
  roadmapAccentBarClass,
  type RoadmapAccent,
} from "@/app/lib/roadmap-data";
import {
  isPlanningMonthCalendarStarted,
  planningMonthCalendarLabel,
  planningMonthToId,
} from "@/app/lib/sprints";

function topBarAccentForMonth(
  accent: RoadmapAccent,
  calendarMonthStarted: boolean,
): RoadmapAccent {
  if (accent === "primary" && !calendarMonthStarted) {
    return "outline";
  }
  return accent;
}

export function TimelineMonthCard({
  href,
  monthLabel,
  goal,
  accent,
}: {
  href: string;
  monthLabel: string;
  goal: string;
  accent: RoadmapAccent;
}) {
  return (
    <Link
      href={href}
      className="border-outline-variant bg-surface-container-lowest group relative cursor-pointer overflow-hidden rounded-xl border p-gutter transition-all hover:shadow-md"
    >
      <div
        className={`absolute left-0 right-0 top-0 h-1 ${roadmapAccentBarClass(accent)}`}
      />
      <div className="mb-4 flex items-start justify-between">
        <span className="text-on-surface font-headline-sm text-headline-sm">
          {monthLabel}
        </span>
        <ArrowForward
          className="text-primary transition-transform group-hover:translate-x-1"
          sx={{ fontSize: 22 }}
        />
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-on-surface-variant font-label-md text-label-md mb-1 uppercase tracking-wider">
            Monthly Goal
          </p>
          <p className="text-on-surface font-body-md text-body-md font-semibold">{goal}</p>
        </div>
      </div>
    </Link>
  );
}

export function TimelineRoadmapGrid() {
  const referenceDate = new Date();
  const roadmapMonths = getRoadmapMonths(referenceDate);

  return (
    <div className="gap-card-gap grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roadmapMonths.map((m) => {
        const monthStarted = isPlanningMonthCalendarStarted(m, referenceDate);
        const barAccent = topBarAccentForMonth(m.accent, monthStarted);
        return (
          <TimelineMonthCard
            key={planningMonthToId(m)}
            href={`/sprint/${planningMonthToId(m)}`}
            monthLabel={planningMonthCalendarLabel(m)}
            goal={m.goal}
            accent={barAccent}
          />
        );
      })}
    </div>
  );
}

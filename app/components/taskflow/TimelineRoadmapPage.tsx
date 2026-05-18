import { SprintBoardHeader } from "@/app/components/taskflow/SprintBoardHeader";
import { SprintSideNav } from "@/app/components/taskflow/SprintSideNav";
import { TimelineRoadmapGrid } from "@/app/components/taskflow/TimelineRoadmapGrid";

export function TimelineRoadmapPage() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      <SprintSideNav />
      <main className="ml-[240px] flex min-h-screen flex-col">
        <SprintBoardHeader title="1 Year Roadmap" />
        <section className="p-container-padding flex-1">
          <TimelineRoadmapGrid />
        </section>
      </main>
    </div>
  );
}

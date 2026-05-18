import { KanbanBoardTable } from "@/app/components/taskflow/KanbanBoardTable";
import { SprintBoardHeader } from "@/app/components/taskflow/SprintBoardHeader";
import { SprintSideNav } from "@/app/components/taskflow/SprintSideNav";
import { loadBoardRowsForSprint } from "@/app/lib/post-it-notes-server";
import { parsePlanningMonthId, planningMonthTitle } from "@/app/lib/sprints";

export async function SprintBoardPage({ planningMonthId }: { planningMonthId: string }) {
  const pm = parsePlanningMonthId(planningMonthId);
  if (!pm) {
    throw new Error(`Invalid planning month id: ${planningMonthId}`);
  }

  const initialRows = await loadBoardRowsForSprint(planningMonthId);

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      <SprintSideNav />
      <main className="ml-[240px] flex min-h-screen flex-col">
        <SprintBoardHeader title={planningMonthTitle(pm)} />
        <section className="p-container-padding flex-1">
          <KanbanBoardTable key={planningMonthId} planningMonthId={planningMonthId} initialRows={initialRows} />
        </section>
      </main>
    </div>
  );
}

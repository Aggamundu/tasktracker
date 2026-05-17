import {
  KanbanBoardTable,
  NewStoryRowButton,
} from "@/app/components/taskflow/KanbanBoardTable";
import { SprintBoardHeader } from "@/app/components/taskflow/SprintBoardHeader";
import { SprintSideNav } from "@/app/components/taskflow/SprintSideNav";
import { DEMO_BOARD_ROWS } from "@/app/lib/demo-board-data";
import { monthTitle, type MonthSlug } from "@/app/lib/sprints";

export function SprintBoardPage({ monthSlug }: { monthSlug: MonthSlug }) {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      <SprintSideNav activeMonth={monthSlug} />
      <main className="ml-[240px] flex min-h-screen flex-col">
        <SprintBoardHeader title={monthTitle(monthSlug)} />
        <section className="p-container-padding flex-1">
          <KanbanBoardTable key={monthSlug} initialRows={DEMO_BOARD_ROWS} />
          <NewStoryRowButton />
        </section>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SprintBoardPage } from "@/app/components/taskflow/SprintBoardPage";
import {
  getPlanningMonths,
  isPlanningMonthInCurrentWindow,
  parsePlanningMonthId,
  planningMonthTitle,
} from "@/app/lib/sprints";

export function generateStaticParams() {
  return getPlanningMonths(new Date()).map((pm) => ({
    id: `${pm.slug}-${pm.year}`,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pm = parsePlanningMonthId(id);
  if (!pm || !isPlanningMonthInCurrentWindow(id)) {
    return { title: "Sprint" };
  }
  return {
    title: planningMonthTitle(pm),
  };
}

export default async function SprintPlanningMonthPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!parsePlanningMonthId(id) || !isPlanningMonthInCurrentWindow(id)) {
    notFound();
  }

  return <SprintBoardPage planningMonthId={id} />;
}

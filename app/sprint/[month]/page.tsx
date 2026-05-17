import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SprintBoardPage } from "@/app/components/taskflow/SprintBoardPage";
import { isMonthSlug, monthTitle, MONTH_SLUGS } from "@/app/lib/sprints";

export function generateStaticParams() {
  return MONTH_SLUGS.map((month) => ({ month }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}): Promise<Metadata> {
  const { month } = await params;
  if (!isMonthSlug(month)) {
    return { title: "Sprint" };
  }
  return {
    title: monthTitle(month),
  };
}

export default async function SprintMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  if (!isMonthSlug(month)) {
    notFound();
  }

  return <SprintBoardPage monthSlug={month} />;
}

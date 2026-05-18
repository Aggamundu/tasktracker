import { redirect } from "next/navigation";
import { defaultPlanningMonthId } from "@/app/lib/sprints";

export default function Home() {
  redirect(`/sprint/${defaultPlanningMonthId()}`);
}

import type { Metadata } from "next";
import { TimelineRoadmapPage } from "@/app/components/taskflow/TimelineRoadmapPage";

export const metadata: Metadata = {
  title: "Project Timeline",
};

export default function TimelinePage() {
  return <TimelineRoadmapPage />;
}

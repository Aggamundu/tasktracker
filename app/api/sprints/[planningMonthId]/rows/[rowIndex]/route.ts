import { parsePlanningMonthId } from "@/app/lib/sprints";
import { createRouteHandlerSupabase } from "@/utils/supabase/route-handler";
import { NextResponse } from "next/server";

function badSprint(planningMonthId: string) {
  if (!parsePlanningMonthId(planningMonthId)) {
    return NextResponse.json({ error: "Invalid sprint id" }, { status: 400 });
  }
  return null;
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ planningMonthId: string; rowIndex: string }> },
) {
  const { planningMonthId, rowIndex: rowIndexParam } = await context.params;
  const sprintErr = badSprint(planningMonthId);
  if (sprintErr) return sprintErr;

  const rowIndex = Number.parseInt(rowIndexParam, 10);
  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return NextResponse.json({ error: "Invalid row index" }, { status: 400 });
  }

  const supabase = createRouteHandlerSupabase();
  const { error } = await supabase.rpc("post_it_sprint_row_delete", {
    p_sprint_id: planningMonthId,
    p_row_index: rowIndex,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

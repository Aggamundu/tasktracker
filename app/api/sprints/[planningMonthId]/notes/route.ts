import { columnKeyFromString } from "@/app/lib/board-from-db";
import { parsePlanningMonthId } from "@/app/lib/sprints";
import { createRouteHandlerSupabase } from "@/utils/supabase/route-handler";
import { NextResponse } from "next/server";

const VARIANTS = new Set(["yellow", "blue", "pink"]);

function badSprint(planningMonthId: string) {
  if (!parsePlanningMonthId(planningMonthId)) {
    return NextResponse.json({ error: "Invalid sprint id" }, { status: 400 });
  }
  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ planningMonthId: string }> },
) {
  const { planningMonthId } = await context.params;
  const sprintErr = badSprint(planningMonthId);
  if (sprintErr) return sprintErr;

  const supabase = createRouteHandlerSupabase();
  const { data, error } = await supabase.from("post_it_notes").select("*").eq("sprint_id", planningMonthId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ planningMonthId: string }> },
) {
  const { planningMonthId } = await context.params;
  const sprintErr = badSprint(planningMonthId);
  if (sprintErr) return sprintErr;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const rowIndex = Number(b.row_index);
  const position = Number(b.position);
  const columnKey = typeof b.column_key === "string" ? columnKeyFromString(b.column_key) : null;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const variant = typeof b.variant === "string" ? b.variant : "";
  const appearanceRaw = b.appearance;
  const appearance =
    appearanceRaw === null || appearanceRaw === undefined
      ? null
      : typeof appearanceRaw === "string"
        ? appearanceRaw.trim() || null
        : null;

  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    return NextResponse.json({ error: "row_index must be a non-negative integer" }, { status: 400 });
  }
  if (!Number.isInteger(position) || position < 0) {
    return NextResponse.json({ error: "position must be a non-negative integer" }, { status: 400 });
  }
  if (!columnKey) {
    return NextResponse.json({ error: "column_key must be story, todo, review, or done" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!VARIANTS.has(variant)) {
    return NextResponse.json({ error: "variant must be yellow, blue, or pink" }, { status: 400 });
  }

  const supabase = createRouteHandlerSupabase();

  const { data: newId, error: rpcError } = await supabase.rpc("post_it_note_insert", {
    p_sprint_id: planningMonthId,
    p_row_index: rowIndex,
    p_column_key: columnKey,
    p_position: position,
    p_title: title,
    p_description: description,
    p_variant: variant,
    p_appearance: appearance,
  });

  if (rpcError || !newId) {
    return NextResponse.json({ error: rpcError?.message ?? "Insert failed" }, { status: 500 });
  }

  const { data: note, error: fetchError } = await supabase
    .from("post_it_notes")
    .select("*")
    .eq("id", newId)
    .single();

  if (fetchError || !note) {
    return NextResponse.json({ error: fetchError?.message ?? "Note created but could not be loaded" }, { status: 500 });
  }

  return NextResponse.json({ note });
}

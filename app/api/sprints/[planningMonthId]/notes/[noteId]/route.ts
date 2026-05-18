import { columnKeyFromString } from "@/app/lib/board-from-db";
import { parsePlanningMonthId } from "@/app/lib/sprints";
import type { Database } from "@/utils/supabase/database.types";
import { createRouteHandlerSupabase } from "@/utils/supabase/route-handler";
import { NextResponse } from "next/server";

const VARIANTS = new Set(["yellow", "blue", "pink"]);
const APPEARANCES = new Set(["default", "done-muted", "done-strike"]);

function badSprint(planningMonthId: string) {
  if (!parsePlanningMonthId(planningMonthId)) {
    return NextResponse.json({ error: "Invalid sprint id" }, { status: 400 });
  }
  return null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ planningMonthId: string; noteId: string }> },
) {
  const { planningMonthId, noteId } = await context.params;
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
  const bodyKeys = Object.keys(b);
  const hasFullMove = "row_index" in b && "column_key" in b && "position" in b;
  const hasPartialMove =
    ("row_index" in b || "column_key" in b || "position" in b) && !hasFullMove;

  if (hasPartialMove) {
    return NextResponse.json(
      { error: "row_index, column_key, and position are required together for a move" },
      { status: 400 },
    );
  }

  if (hasFullMove) {
    const allowedMove = new Set(["row_index", "column_key", "position"]);
    if (bodyKeys.length !== 3 || bodyKeys.some((k) => !allowedMove.has(k))) {
      return NextResponse.json(
        { error: "Move request must include only row_index, column_key, and position" },
        { status: 400 },
      );
    }
  }

  const updates: Database["public"]["Tables"]["post_it_notes"]["Update"] = {};

  if ("title" in b) {
    if (typeof b.title !== "string" || !b.title.trim()) {
      return NextResponse.json({ error: "title must be a non-empty string" }, { status: 400 });
    }
    updates.title = b.title.trim();
  }
  if ("description" in b) {
    if (typeof b.description !== "string") {
      return NextResponse.json({ error: "description must be a string" }, { status: 400 });
    }
    updates.description = b.description.trim();
  }
  if ("variant" in b) {
    if (typeof b.variant !== "string" || !VARIANTS.has(b.variant)) {
      return NextResponse.json({ error: "variant must be yellow, blue, or pink" }, { status: 400 });
    }
    updates.variant = b.variant;
  }
  if ("appearance" in b) {
    if (b.appearance === null) {
      updates.appearance = null;
    } else if (typeof b.appearance === "string") {
      if (!APPEARANCES.has(b.appearance)) {
        return NextResponse.json({ error: "Invalid appearance" }, { status: 400 });
      }
      updates.appearance = b.appearance === "default" ? null : b.appearance;
    } else {
      return NextResponse.json({ error: "appearance must be string or null" }, { status: 400 });
    }
  }

  if (!hasFullMove && Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createRouteHandlerSupabase();

  const { data: existing, error: findError } = await supabase
    .from("post_it_notes")
    .select("id")
    .eq("id", noteId)
    .eq("sprint_id", planningMonthId)
    .maybeSingle();

  if (findError || !existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (hasFullMove) {
    const rowIndex = Number(b.row_index);
    const position = Number(b.position);
    const columnKey = typeof b.column_key === "string" ? columnKeyFromString(b.column_key) : null;

    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      return NextResponse.json({ error: "row_index must be a non-negative integer" }, { status: 400 });
    }
    if (!Number.isInteger(position) || position < 0) {
      return NextResponse.json({ error: "position must be a non-negative integer" }, { status: 400 });
    }
    if (!columnKey) {
      return NextResponse.json({ error: "column_key must be story, todo, review, or done" }, { status: 400 });
    }

    const { error: rpcError } = await supabase.rpc("post_it_note_move", {
      p_id: noteId,
      p_row_index: rowIndex,
      p_column_key: columnKey,
      p_position: position,
    });

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    const { data: note, error: fetchError } = await supabase
      .from("post_it_notes")
      .select("*")
      .eq("id", noteId)
      .eq("sprint_id", planningMonthId)
      .single();

    if (fetchError || !note) {
      return NextResponse.json({ error: fetchError?.message ?? "Note not found after move" }, { status: 500 });
    }

    return NextResponse.json({ note });
  }

  updates.updated_at = new Date().toISOString();

  const { data: note, error: updateError } = await supabase
    .from("post_it_notes")
    .update(updates)
    .eq("id", noteId)
    .eq("sprint_id", planningMonthId)
    .select("*")
    .single();

  if (updateError || !note) {
    return NextResponse.json({ error: updateError?.message ?? "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ note });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ planningMonthId: string; noteId: string }> },
) {
  const { planningMonthId, noteId } = await context.params;
  const sprintErr = badSprint(planningMonthId);
  if (sprintErr) return sprintErr;

  const supabase = createRouteHandlerSupabase();

  const { data: existing, error: findError } = await supabase
    .from("post_it_notes")
    .select("id")
    .eq("id", noteId)
    .eq("sprint_id", planningMonthId)
    .maybeSingle();

  if (findError || !existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const { error: rpcError } = await supabase.rpc("post_it_note_delete", { p_id: noteId });

  if (!rpcError) {
    return new NextResponse(null, { status: 204 });
  }

  // If the RPC is missing or fails, still remove the row so the DB matches the UI.
  const { error: deleteError } = await supabase
    .from("post_it_notes")
    .delete()
    .eq("id", noteId)
    .eq("sprint_id", planningMonthId);

  if (deleteError) {
    return NextResponse.json(
      { error: `${rpcError.message} (and fallback delete failed: ${deleteError.message})` },
      { status: 500 },
    );
  }

  return new NextResponse(null, { status: 204 });
}

import { boardRowsFromDatabaseRows, type PostItNoteRow } from "@/app/lib/board-from-db";
import type { BoardRowData } from "@/app/lib/demo-board-data";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function loadBoardRowsForSprint(planningMonthId: string): Promise<BoardRowData[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("post_it_notes")
    .select("*")
    .eq("sprint_id", planningMonthId)
    .order("row_index", { ascending: true })
    .order("column_key", { ascending: true })
    .order("position", { ascending: true });

  if (error) {
    console.error("loadBoardRowsForSprint", error);
    return boardRowsFromDatabaseRows([]);
  }

  return boardRowsFromDatabaseRows((data ?? []) as PostItNoteRow[]);
}

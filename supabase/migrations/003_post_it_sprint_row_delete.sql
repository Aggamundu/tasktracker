-- Run after 002_post_it_notes.sql (or append to setup-all.sql). Deletes one story row and shifts row_index.
create or replace function public.post_it_sprint_row_delete(p_sprint_id text, p_row_index integer) returns void
language plpgsql
as $$
begin
  delete from public.post_it_notes
  where sprint_id = p_sprint_id and row_index = p_row_index;

  update public.post_it_notes
  set
    row_index = row_index - 1,
    updated_at = now()
  where sprint_id = p_sprint_id and row_index > p_row_index;
end;
$$;

grant execute on function public.post_it_sprint_row_delete(text, integer) to anon, authenticated;

-- Fix duplicate (sprint_id, row_index, column_key, position) when moving cross-cell from position 0.
-- Re-run safe: replaces function only.

create or replace function public.post_it_note_move(
  p_id uuid,
  p_row_index integer,
  p_column_key text,
  p_position integer
) returns void
language plpgsql
as $$
declare
  v_sprint text;
  v_old_row integer;
  v_old_col text;
  v_old_pos integer;
  v_temp integer;
begin
  select sprint_id, row_index, column_key, "position"
  into v_sprint, v_old_row, v_old_col, v_old_pos
  from public.post_it_notes
  where id = p_id;

  if not found then
    raise exception 'note not found';
  end if;

  if p_row_index < 0 or p_position < 0 then
    raise exception 'invalid row or position';
  end if;

  if p_column_key not in ('story', 'todo', 'review', 'done') then
    raise exception 'invalid column_key';
  end if;

  if v_old_row = p_row_index and v_old_col = p_column_key then
    if v_old_pos = p_position then
      return;
    end if;

    select coalesce(max(n."position"), 0) + 1000
    into v_temp
    from public.post_it_notes n
    where
      n.sprint_id = v_sprint
      and n.row_index = v_old_row
      and n.column_key = v_old_col
      and n.id <> p_id;

    update public.post_it_notes
    set "position" = v_temp, updated_at = now()
    where id = p_id;

    if v_old_pos < p_position then
      update public.post_it_notes
      set
        "position" = "position" - 1,
        updated_at = now()
      where
        sprint_id = v_sprint
        and row_index = v_old_row
        and column_key = v_old_col
        and id <> p_id
        and "position" > v_old_pos
        and "position" <= p_position;
    else
      update public.post_it_notes
      set
        "position" = "position" + 1,
        updated_at = now()
      where
        sprint_id = v_sprint
        and row_index = v_old_row
        and column_key = v_old_col
        and id <> p_id
        and "position" >= p_position
        and "position" < v_old_pos;
    end if;

    update public.post_it_notes
    set "position" = p_position, updated_at = now()
    where id = p_id;

    return;
  end if;

  select coalesce(max(n."position"), 0) + 1000
  into v_temp
  from public.post_it_notes n
  where
    n.sprint_id = v_sprint
    and n.row_index = v_old_row
    and n.column_key = v_old_col
    and n.id <> p_id;

  update public.post_it_notes
  set "position" = v_temp, updated_at = now()
  where id = p_id;

  update public.post_it_notes
  set
    "position" = "position" - 1,
    updated_at = now()
  where
    sprint_id = v_sprint
    and row_index = v_old_row
    and column_key = v_old_col
    and id <> p_id
    and "position" > v_old_pos;

  update public.post_it_notes
  set
    "position" = "position" + 1,
    updated_at = now()
  where
    sprint_id = v_sprint
    and row_index = p_row_index
    and column_key = p_column_key
    and id <> p_id
    and "position" >= p_position;

  update public.post_it_notes
  set
    row_index = p_row_index,
    column_key = p_column_key,
    "position" = p_position,
    updated_at = now()
  where id = p_id;
end;
$$;

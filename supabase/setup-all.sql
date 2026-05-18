-- =============================================================================
-- Tasktracker — run once in Supabase → SQL Editor (new project / empty DB)
-- Creates: pgcrypto, todos (optional demo), post_it_notes + RLS + RPC helpers
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- todos (optional; matches app TypeScript types if you use a todos example)
-- ---------------------------------------------------------------------------
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

comment on table public.todos is 'Optional example todos table.';

alter table public.todos enable row level security;

drop policy if exists "todos_select_anon" on public.todos;
drop policy if exists "todos_insert_anon" on public.todos;
drop policy if exists "todos_update_anon" on public.todos;
drop policy if exists "todos_delete_anon" on public.todos;
drop policy if exists "todos_select_authenticated" on public.todos;
drop policy if exists "todos_insert_authenticated" on public.todos;
drop policy if exists "todos_update_authenticated" on public.todos;
drop policy if exists "todos_delete_authenticated" on public.todos;

create policy "todos_select_anon" on public.todos for select to anon using (true);
create policy "todos_insert_anon" on public.todos for insert to anon with check (true);
create policy "todos_update_anon" on public.todos for update to anon using (true) with check (true);
create policy "todos_delete_anon" on public.todos for delete to anon using (true);

create policy "todos_select_authenticated" on public.todos for select to authenticated using (true);
create policy "todos_insert_authenticated" on public.todos for insert to authenticated with check (true);
create policy "todos_update_authenticated" on public.todos for update to authenticated using (true) with check (true);
create policy "todos_delete_authenticated" on public.todos for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- post_it_notes (kanban; required for sprint boards + API routes)
-- ---------------------------------------------------------------------------
create table if not exists public.post_it_notes (
  id uuid primary key default gen_random_uuid(),
  sprint_id text not null,
  row_index integer not null check (row_index >= 0),
  column_key text not null check (column_key in ('story', 'todo', 'review', 'done')),
  position integer not null check ("position" >= 0),
  title text not null default '',
  description text not null default '',
  variant text not null check (variant in ('yellow', 'blue', 'pink')),
  appearance text null check (appearance is null or appearance in ('default', 'done-muted', 'done-strike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sprint_id, row_index, column_key, "position")
);

create index if not exists post_it_notes_sprint_cell_idx
  on public.post_it_notes (sprint_id, row_index, column_key, "position");

comment on table public.post_it_notes is 'Kanban post-it notes; position is 0-based order within a cell.';

alter table public.post_it_notes enable row level security;

drop policy if exists "post_it_notes_select_anon" on public.post_it_notes;
drop policy if exists "post_it_notes_insert_anon" on public.post_it_notes;
drop policy if exists "post_it_notes_update_anon" on public.post_it_notes;
drop policy if exists "post_it_notes_delete_anon" on public.post_it_notes;
drop policy if exists "post_it_notes_select_authenticated" on public.post_it_notes;
drop policy if exists "post_it_notes_insert_authenticated" on public.post_it_notes;
drop policy if exists "post_it_notes_update_authenticated" on public.post_it_notes;
drop policy if exists "post_it_notes_delete_authenticated" on public.post_it_notes;

create policy "post_it_notes_select_anon" on public.post_it_notes for select to anon using (true);
create policy "post_it_notes_insert_anon" on public.post_it_notes for insert to anon with check (true);
create policy "post_it_notes_update_anon" on public.post_it_notes for update to anon using (true) with check (true);
create policy "post_it_notes_delete_anon" on public.post_it_notes for delete to anon using (true);

create policy "post_it_notes_select_authenticated" on public.post_it_notes for select to authenticated using (true);
create policy "post_it_notes_insert_authenticated" on public.post_it_notes for insert to authenticated with check (true);
create policy "post_it_notes_update_authenticated" on public.post_it_notes for update to authenticated using (true) with check (true);
create policy "post_it_notes_delete_authenticated" on public.post_it_notes for delete to authenticated using (true);

-- Ordered insert / delete (used by Next.js API routes)
create or replace function public.post_it_note_insert(
  p_sprint_id text,
  p_row_index integer,
  p_column_key text,
  p_position integer,
  p_title text,
  p_description text,
  p_variant text,
  p_appearance text default null
) returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  update public.post_it_notes
  set
    "position" = "position" + 1,
    updated_at = now()
  where
    sprint_id = p_sprint_id
    and row_index = p_row_index
    and column_key = p_column_key
    and "position" >= p_position;

  insert into public.post_it_notes (
    sprint_id, row_index, column_key, "position", title, description, variant, appearance
  )
  values (
    p_sprint_id,
    p_row_index,
    p_column_key,
    p_position,
    p_title,
    p_description,
    p_variant,
    p_appearance
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.post_it_note_delete(p_id uuid) returns void
language plpgsql
as $$
declare
  r_sprint_id text;
  r_row_index integer;
  r_column_key text;
  r_position integer;
begin
  select sprint_id, row_index, column_key, "position"
  into r_sprint_id, r_row_index, r_column_key, r_position
  from public.post_it_notes
  where id = p_id;

  if not found then
    return;
  end if;

  delete from public.post_it_notes where id = p_id;

  update public.post_it_notes
  set
    "position" = "position" - 1,
    updated_at = now()
  where
    sprint_id = r_sprint_id
    and row_index = r_row_index
    and column_key = r_column_key
    and "position" > r_position;
end;
$$;

-- Move / reorder within sprint (preserves unique cell positions).
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

grant execute on function public.post_it_note_insert(text, integer, text, integer, text, text, text, text) to anon, authenticated;
grant execute on function public.post_it_note_delete(uuid) to anon, authenticated;
grant execute on function public.post_it_note_move(uuid, integer, text, integer) to anon, authenticated;

-- Remove an entire story row: delete all notes in that row, then shift row_index down for lower stories.
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

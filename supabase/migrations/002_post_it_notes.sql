-- Post-it notes per planning sprint (e.g. may-2026). Run in Supabase SQL Editor or via CLI.

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

-- Bump positions then insert (atomic).
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

-- Delete one note and close the position gap.
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

grant execute on function public.post_it_note_insert(text, integer, text, integer, text, text, text, text) to anon, authenticated;
grant execute on function public.post_it_note_delete(uuid) to anon, authenticated;

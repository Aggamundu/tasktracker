-- Run in Supabase SQL Editor, or via `supabase db push` if you use the Supabase CLI.
create extension if not exists "pgcrypto";

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

comment on table public.todos is 'Example table for Next.js + Supabase SSR smoke test.';

alter table public.todos enable row level security;

-- Adjust policies for your app (auth, service role, etc.).
-- Permissive demo policies so the publishable key can read/write without auth:
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

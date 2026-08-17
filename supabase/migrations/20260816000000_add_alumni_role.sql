-- Add "alumni" as a valid profiles.role, and create the alumni linked table.
--
-- NOTE: this repo has no prior tracked migrations, so the live schema could
-- not be inspected before writing this file. Verify the following against
-- the live project before/while applying:
--   1. Whether profiles.role is enforced by a CHECK constraint or a Postgres
--      enum type -- this file assumes a CHECK constraint. If it's an enum,
--      use `alter type <enum_name> add value if not exists 'alumni';` instead
--      of the drop/add constraint statements below.
--   2. The exact RLS policies on `family_friends` / `high_school_athletes`,
--      which the alumni policies below are modeled on but not copied from
--      verbatim (no migration history exists to copy from).

-- 1. Widen profiles.role to allow 'alumni'.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'athlete', 'high_school_athlete', 'family_friend', 'brand', 'alumni'));

-- 2. New alumni table, mirroring the family_friends/high_school_athletes shape.
create table public.alumni (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade unique,
  name text not null,
  hometown text,
  age integer,
  instagram_handle text,
  cultural_roots text[],
  photo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.alumni enable row level security;

create policy "Alumni can view own row" on public.alumni
  for select using (profile_id = auth.uid());

create policy "Alumni can update own row" on public.alumni
  for update using (profile_id = auth.uid());

create policy "Alumni can insert own row" on public.alumni
  for insert with check (profile_id = auth.uid());

create policy "Admins can view all alumni" on public.alumni
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

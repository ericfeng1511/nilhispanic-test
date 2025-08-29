-- Non-destructive SQL to add Group Chats alongside existing 1-1 chat tables
-- Safe to run multiple times (where possible) and does NOT modify existing 1-1 schema

-- Requirements: Supabase/Postgres
-- Uses gen_random_uuid(); ensure pgcrypto is enabled
create extension if not exists pgcrypto;

-- 1) Core tables --------------------------------------------------------------

-- Groups metadata
create table if not exists public.group_conversations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

-- Ensure created_by is always the current auth.uid() on insert
create or replace function public.set_group_creator()
returns trigger
language plpgsql
as $$
begin
  new.created_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_group_convos_set_creator on public.group_conversations;
create trigger trg_group_convos_set_creator
before insert on public.group_conversations
for each row execute procedure public.set_group_creator();

-- Participants in a group
create table if not exists public.group_participants (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz
);
create unique index if not exists idx_group_participants_unique on public.group_participants(group_id, user_id);
create index if not exists idx_group_participants_user on public.group_participants(user_id);
create index if not exists idx_group_participants_group on public.group_participants(group_id);

-- Group messages
create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  content text,
  created_at timestamptz not null default now()
);
create index if not exists idx_group_messages_group on public.group_messages(group_id, created_at desc);

-- Attachments for group messages (parallel to message_attachments)
create table if not exists public.group_message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.group_messages(id) on delete cascade,
  storage_path text not null,
  file_name text,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);
create index if not exists idx_group_message_attachments_msg on public.group_message_attachments(message_id);

-- Per-user read receipts (so unread counts are per participant)
create table if not exists public.group_message_reads (
  message_id uuid not null references public.group_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, user_id)
);
create index if not exists idx_group_message_reads_user on public.group_message_reads(user_id, read_at desc);

-- 2) Helper functions for RLS -------------------------------------------------

-- Checks if the current user is a participant of a given group
create or replace function public.is_group_participant(g_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.group_participants gp
    where gp.group_id = g_id and gp.user_id = auth.uid()
  );
$$;

-- Checks if the current user is an admin/owner in a given group
create or replace function public.is_group_admin(g_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.group_participants gp
    where gp.group_id = g_id and gp.user_id = auth.uid() and gp.role in ('owner','admin')
  );
$$;

-- 3) Triggers -----------------------------------------------------------------

-- Keep group_conversations.last_message_at in sync
create or replace function public.set_group_last_message_at()
returns trigger
language plpgsql
as $$
begin
  update public.group_conversations
    set last_message_at = NEW.created_at
    where id = NEW.group_id;
  return NEW;
end;
$$;

drop trigger if exists trg_group_messages_last_ts on public.group_messages;
create trigger trg_group_messages_last_ts
after insert on public.group_messages
for each row execute procedure public.set_group_last_message_at();

-- 4) RLS Policies -------------------------------------------------------------

alter table public.group_conversations enable row level security;
alter table public.group_participants enable row level security;
alter table public.group_messages enable row level security;
alter table public.group_message_attachments enable row level security;
alter table public.group_message_reads enable row level security;

-- group_conversations: creator can insert; participants can select
drop policy if exists p_group_convos_select on public.group_conversations;
create policy p_group_convos_select on public.group_conversations
for select using (
  public.is_group_participant(id) or created_by = auth.uid()
);

drop policy if exists p_group_convos_insert on public.group_conversations;
create policy p_group_convos_insert on public.group_conversations
for insert with check (
  auth.role() = 'authenticated' and created_by = auth.uid()
);

-- group_participants: members can see membership of groups they are in; admins/owners can add/remove
drop policy if exists p_group_parts_select on public.group_participants;
create policy p_group_parts_select on public.group_participants
for select using (
  -- A user can view their own membership rows, and the creator can view all rows for their groups
  user_id = auth.uid() or exists (
    select 1 from public.group_conversations gc
    where gc.id = group_id and gc.created_by = auth.uid()
  )
);

drop policy if exists p_group_parts_insert on public.group_participants;
create policy p_group_parts_insert on public.group_participants
for insert with check (
  -- Only the group creator can add participants (avoids recursive lookups on this table)
  exists (
    select 1 from public.group_conversations gc
    where gc.id = group_id and gc.created_by = auth.uid()
  )
);

drop policy if exists p_group_parts_delete on public.group_participants;
create policy p_group_parts_delete on public.group_participants
for delete using (
  -- The group creator can remove anyone; users can remove themselves
  user_id = auth.uid() or exists (
    select 1 from public.group_conversations gc
    where gc.id = group_id and gc.created_by = auth.uid()
  )
);

-- group_messages: only participants can read; only participants can send (as themselves)
drop policy if exists p_group_msgs_select on public.group_messages;
create policy p_group_msgs_select on public.group_messages
for select using (
  public.is_group_participant(group_id)
);

drop policy if exists p_group_msgs_insert on public.group_messages;
create policy p_group_msgs_insert on public.group_messages
for insert with check (
  public.is_group_participant(group_id) and sender_id = auth.uid()
);

-- group_message_attachments: visibility bound to the message's group
-- SELECT allowed if participant in the parent message's group; INSERT allowed by message sender
-- These use subqueries; keep them simple and index-backed

drop policy if exists p_group_atts_select on public.group_message_attachments;
create policy p_group_atts_select on public.group_message_attachments
for select using (
  exists (
    select 1 from public.group_messages gm
    where gm.id = message_id and public.is_group_participant(gm.group_id)
  )
);

drop policy if exists p_group_atts_insert on public.group_message_attachments;
create policy p_group_atts_insert on public.group_message_attachments
for insert with check (
  exists (
    select 1 from public.group_messages gm
    where gm.id = message_id and public.is_group_participant(gm.group_id)
  )
);

-- group_message_reads: users can manage their own read receipts; participants can view reads

drop policy if exists p_group_reads_select on public.group_message_reads;
create policy p_group_reads_select on public.group_message_reads
for select using (
  exists (
    select 1 from public.group_messages gm
    join public.group_conversations gc on gc.id = gm.group_id
    where gm.id = message_id and public.is_group_participant(gc.id)
  )
);

drop policy if exists p_group_reads_upsert on public.group_message_reads;
create policy p_group_reads_upsert on public.group_message_reads
for insert with check (
  user_id = auth.uid() and exists (
    select 1 from public.group_messages gm
    where gm.id = message_id and public.is_group_participant(gm.group_id)
  )
);

drop policy if exists p_group_reads_update on public.group_message_reads;
create policy p_group_reads_update on public.group_message_reads
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 5) (Optional) Realtime configuration ---------------------------------------
-- Supabase Realtime follows RLS; ensure the tables are in the publication
-- Uncomment if needed (some projects already include all tables by default):
-- alter publication supabase_realtime add table public.group_conversations;
-- alter publication supabase_realtime add table public.group_participants;
-- alter publication supabase_realtime add table public.group_messages;
-- alter publication supabase_realtime add table public.group_message_attachments;
-- alter publication supabase_realtime add table public.group_message_reads;

-- Ensure profiles table is in realtime publication for avatar updates (idempotent)
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.profiles';
  exception when duplicate_object then
    -- already added
    null;
  end;
end $$;

-- 6) Grants (ensure the 'authenticated' role has required privileges)
grant select, insert, update, delete on public.group_conversations to authenticated;
grant select, insert, update, delete on public.group_participants to authenticated;
grant select, insert, update, delete on public.group_messages to authenticated;
grant select, insert, update, delete on public.group_message_attachments to authenticated;
grant select, insert, update, delete on public.group_message_reads to authenticated;

-- 7) Avatar sync (ongoing) ----------------------------------------------------
-- Keep profiles.avatar_url updated when student_athletes.photo changes
-- so that all participants (who can SELECT profiles) see fresh avatars.

create or replace function public.sync_profile_avatar_from_athlete()
returns trigger
language plpgsql
as $$
begin
  -- Only update when photo is provided and different from current avatar_url
  if coalesce(new.photo, '') <> '' then
    update public.profiles p
      set avatar_url = new.photo
      where p.id = new.profile_id
        and coalesce(p.avatar_url, '') <> coalesce(new.photo, '');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_avatar_from_athlete on public.student_athletes;
create trigger trg_sync_avatar_from_athlete
after insert or update of photo on public.student_athletes
for each row execute procedure public.sync_profile_avatar_from_athlete();

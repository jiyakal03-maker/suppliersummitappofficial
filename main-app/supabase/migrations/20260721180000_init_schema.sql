-- Supplier Summit schema, captured from the live "Supplier Summit" project
-- (ndnjshkfgvspztisfipa) via direct introspection on 2026-07-21, replacing
-- the stale 20260714120000 migration (moved to supabase/migrations_old/)
-- which described an earlier user_info/agenda schema that was never
-- actually applied here.
--
-- Known naming quirks preserved as-is from the live DB (not bugs, just
-- inconsistent with docs/supplier-summit-erd.mermaid):
--   * transcript.event_uid / growth_machine_votes.event_uid /
--     growth_machine_entries.uid use a "_uid"/"uid" suffix where the ERD
--     names the same column event_id/entry_id.
--   * question_type enum uses 'mcq' where the ERD says 'multiple_choice'.
--   * An orphaned enum `board_status` ('submitted', 'compleunsubmitted')
--     exists with no column using it and an apparent typo in the second
--     value — left untouched here since dropping it wasn't confirmed.

create extension if not exists pgcrypto;

-- ── Enums ────────────────────────────────────────────────────────────────

create type public.user_role as enum ('attendee', 'speaker', 'analytics', 'admin');
create type public.agenda_status as enum ('upcoming', 'live', 'completed');
create type public.poll_status as enum ('locked', 'live', 'unlocked');
create type public.question_type as enum ('mcq', 'text', 'rating');
create type public.machine_part as enum ('engine', 'fuel', 'gears', 'brakes', 'turbo_boost');
-- Orphaned — no column references this type on the live DB.
create type public.board_status as enum ('submitted', 'compleunsubmitted');

-- ── USER ─────────────────────────────────────────────────────────────────

create table public."user" (
  user_id uuid primary key default gen_random_uuid(),
  first_name varchar(100),
  last_name varchar(100),
  phone varchar(30),
  email varchar(255) unique,
  company varchar(150),
  role public.user_role,
  pin text
);

-- ── EVENT (speaker_id FK added after speakers exists — circular ref) ────

create table public.event (
  event_id uuid primary key default gen_random_uuid(),
  event_name timestamptz not null default now(),
  duration varchar(50) not null,
  topic varchar(200) not null,
  description varchar(1000) not null,
  status public.agenda_status not null default 'upcoming',
  speaker_id uuid,
  start_time timestamptz,
  end_time timestamptz,
  status_override boolean default false
);

-- ── SPEAKERS ──────────────────────────────────────────────────────────────

create table public.speakers (
  speaker_id uuid primary key default gen_random_uuid(),
  user_id uuid references public."user" (user_id) on update cascade on delete set null,
  event_id uuid references public.event (event_id) on update cascade on delete set null,
  bio text,
  unique (user_id, event_id)
);

alter table public.event
  add constraint event_speaker_id_fkey foreign key (speaker_id)
  references public.speakers (speaker_id) on update cascade on delete set null;

-- ── EVENT_TABLES / EVENT_TABLE_MEMBERS ───────────────────────────────────

create table public.event_tables (
  table_id uuid primary key default gen_random_uuid(),
  event_id uuid references public.event (event_id) on update cascade on delete cascade,
  table_name varchar(200)
);

create table public.event_table_members (
  table_id uuid not null references public.event_tables (table_id) on update cascade on delete cascade,
  user_id uuid not null references public."user" (user_id) on update cascade on delete set null,
  is_builder boolean default false,
  primary key (table_id, user_id)
);

-- ── TRANSCRIPT (1:1 with event) ──────────────────────────────────────────

create table public.transcript (
  event_uid uuid primary key references public.event (event_id) on update cascade on delete cascade,
  transcript_text text
);

-- ── QUESTION_GROUPS / QUESTIONS ───────────────────────────────────────────

create table public.question_groups (
  group_id uuid primary key default gen_random_uuid(),
  topic varchar(200),
  composed_question text,
  status varchar(50),
  redirect_to uuid references public."user" (user_id) on update cascade on delete set null,
  speaker_id uuid references public.speakers (speaker_id) on update cascade on delete set null,
  checked boolean default false,
  answer_text text,
  answered_at timestamptz,
  created_at timestamptz default now()
);

create table public.questions (
  question_id uuid primary key default gen_random_uuid(),
  topic varchar(200),
  submission_info text,
  submitter_id uuid references public."user" (user_id) on update cascade on delete set null,
  group_id uuid not null references public.question_groups (group_id) on update cascade on delete cascade,
  status varchar(50),
  checked boolean default false
);

-- ── POLLS / POLL_QUESTIONS / POLL_RESPONSES / POLL_ANSWERS ───────────────

create table public.polls (
  poll_id uuid primary key default gen_random_uuid(),
  poll_name varchar(200),
  description text,
  status public.poll_status default 'locked',
  is_anonymous boolean default false,
  event_id uuid references public.event (event_id) on update cascade on delete set null,
  created_at timestamptz default now()
);

create table public.poll_questions (
  poll_question_id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls (poll_id) on update cascade on delete cascade,
  question_text text not null,
  question_type public.question_type not null,
  options text
);

create table public.poll_responses (
  poll_response_id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls (poll_id) on update cascade on delete cascade,
  respondent_id uuid references public."user" (user_id) on update cascade on delete set null,
  submitted_at timestamptz default now()
);

create table public.poll_answers (
  poll_answer_id uuid primary key default gen_random_uuid(),
  poll_question_id uuid references public.poll_questions (poll_question_id) on update cascade on delete cascade,
  poll_response_id uuid references public.poll_responses (poll_response_id) on update cascade on delete cascade,
  answer_value text
);

create table public.poll_submission_status (
  submission_status_id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls (poll_id) on update cascade on delete cascade,
  user_id uuid references public."user" (user_id) on update cascade on delete cascade,
  submitted boolean default false,
  unique (poll_id, user_id)
);

-- ── GROWTH_MACHINE_ENTRIES / GROWTH_MACHINE_VOTES ────────────────────────

create table public.growth_machine_entries (
  uid uuid primary key default gen_random_uuid(),
  table_id uuid references public.event_tables (table_id) on update cascade on delete cascade,
  part public.machine_part not null,
  content text not null,
  submitted_by uuid references public."user" (user_id) on update cascade on delete set null,
  created_at timestamptz default now()
);

create table public.growth_machine_votes (
  voter_uid uuid not null references public."user" (user_id) on update cascade on delete cascade,
  event_uid uuid not null references public.event (event_id) on update cascade on delete cascade,
  table_id uuid references public.event_tables (table_id) on update cascade on delete cascade,
  voted_at timestamptz default now(),
  primary key (voter_uid, event_uid)
);

-- ── Role-check helpers (SECURITY DEFINER, used throughout RLS policies) ──

create or replace function public.current_role_name()
returns varchar
language sql
stable security definer
as $$
  select role::text from "user" where user_id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable security definer
as $$
  select current_role_name() = 'admin';
$$;

create or replace function public.is_analytics()
returns boolean
language sql
stable security definer
as $$
  select current_role_name() = 'analytics';
$$;

create or replace function public.is_speaker()
returns boolean
language sql
stable security definer
as $$
  select current_role_name() = 'speaker';
$$;

-- ── Triggers & their functions ───────────────────────────────────────────

create or replace function public.hash_pin()
returns trigger
language plpgsql
as $$
begin
  new.pin = crypt(new.pin, gen_salt('bf'));
  return new;
end;
$$;

create trigger hash_pin_trigger
  before insert or update on public."user"
  for each row when (new.pin is not null)
  execute function public.hash_pin();

create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Only admin can change a user''s role';
  end if;
  return new;
end;
$$;

create trigger prevent_self_role_change_trigger
  before update on public."user"
  for each row
  execute function public.prevent_self_role_change();

create or replace function public.mark_status_override()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status is distinct from old.status and auth.uid() is not null then
    new.status_override = true;
  end if;
  return new;
end;
$$;

create trigger mark_status_override_trigger
  before update on public.event
  for each row
  execute function public.mark_status_override();

create or replace function public.auto_update_event_status()
returns void
language plpgsql
security definer
as $$
begin
  update "event"
  set status = 'live'
  where start_time <= now() and end_time > now() and status != 'live' and not status_override;

  update "event"
  set status = 'completed'
  where end_time <= now() and status != 'completed' and not status_override;

  update "event"
  set status = 'upcoming'
  where start_time > now() and status != 'upcoming' and not status_override;
end;
$$;

create or replace function public.propagate_group_changes()
returns trigger
language plpgsql
as $$
begin
  if new.checked is distinct from old.checked or new.status is distinct from old.status then
    update questions
    set checked = new.checked,
        status = new.status
    where group_id = new.group_id;
  end if;
  return new;
end;
$$;

create trigger propagate_group_changes_trigger
  after update on public.question_groups
  for each row
  execute function public.propagate_group_changes();

create or replace function public.set_answered_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'answered' and old.status is distinct from new.status then
    new.answered_at = now();
  end if;
  return new;
end;
$$;

create trigger set_answered_at_trigger
  before update on public.question_groups
  for each row
  execute function public.set_answered_at();

-- ── Row Level Security ────────────────────────────────────────────────────

alter table public."user" enable row level security;
alter table public.event enable row level security;
alter table public.speakers enable row level security;
alter table public.event_tables enable row level security;
alter table public.event_table_members enable row level security;
alter table public.transcript enable row level security;
alter table public.question_groups enable row level security;
alter table public.questions enable row level security;
alter table public.polls enable row level security;
alter table public.poll_questions enable row level security;
alter table public.poll_responses enable row level security;
alter table public.poll_answers enable row level security;
alter table public.poll_submission_status enable row level security;
alter table public.growth_machine_entries enable row level security;
alter table public.growth_machine_votes enable row level security;

-- user
create policy "view own user row" on public."user" for select using (user_id = auth.uid());
create policy "update own user row" on public."user" for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin view all users" on public."user" for select using (is_admin());
create policy "admin insert users" on public."user" for insert with check (is_admin());
create policy "admin update all users" on public."user" for update using (is_admin()) with check (is_admin());

-- event
create policy "view all events" on public.event for select using (auth.role() = 'authenticated');
create policy "admin insert events" on public.event for insert with check (is_admin());
create policy "admin update events" on public.event for update using (is_admin()) with check (is_admin());
create policy "admin delete events" on public.event for delete using (is_admin());
create policy "analytics override event status" on public.event for update using (is_analytics()) with check (is_analytics());

-- speakers
create policy "view all speakers" on public.speakers for select using (auth.role() = 'authenticated');
create policy "admin insert speakers" on public.speakers for insert with check (is_admin());
create policy "admin update speakers" on public.speakers for update using (is_admin()) with check (is_admin());
create policy "admin delete speakers" on public.speakers for delete using (is_admin());

-- event_tables
create policy "view all tables" on public.event_tables for select using (auth.role() = 'authenticated');
create policy "admin manage tables" on public.event_tables for insert with check (is_admin());
create policy "admin update tables" on public.event_tables for update using (is_admin()) with check (is_admin());

-- event_table_members
create policy "view table members" on public.event_table_members for select using (auth.role() = 'authenticated');
create policy "admin manage table members" on public.event_table_members for insert with check (is_admin());
create policy "admin update table members" on public.event_table_members for update using (is_admin()) with check (is_admin());

-- transcript
create policy "view all transcripts" on public.transcript for select using (auth.role() = 'authenticated');
create policy "admin insert transcripts" on public.transcript for insert with check (is_admin());
create policy "admin update transcripts" on public.transcript for update using (is_admin()) with check (is_admin());
create policy "admin delete transcripts" on public.transcript for delete using (is_admin());

-- question_groups
create policy "view own question group" on public.question_groups for select
  using (exists (select 1 from questions where questions.group_id = question_groups.group_id and questions.submitter_id = auth.uid()));
create policy "speaker view routed groups" on public.question_groups for select
  using (speaker_id in (select speaker_id from speakers where speakers.user_id = auth.uid()));
create policy "speaker answer routed groups" on public.question_groups for update
  using (speaker_id in (select speaker_id from speakers where speakers.user_id = auth.uid()))
  with check (speaker_id in (select speaker_id from speakers where speakers.user_id = auth.uid()));
create policy "analytics view all groups" on public.question_groups for select using (is_analytics());
create policy "analytics manage all groups" on public.question_groups for update using (is_analytics()) with check (is_analytics());

-- questions
create policy "view own questions" on public.questions for select using (submitter_id = auth.uid());
create policy "submit own questions" on public.questions for insert with check (submitter_id = auth.uid());
create policy "analytics view all questions" on public.questions for select using (is_analytics());

-- polls
create policy "view all polls" on public.polls for select using (auth.role() = 'authenticated');
create policy "admin insert polls" on public.polls for insert with check (is_admin());
create policy "admin update polls" on public.polls for update using (is_admin()) with check (is_admin());
create policy "analytics update poll status" on public.polls for update using (is_analytics()) with check (is_analytics());

-- poll_questions
create policy "view all poll questions" on public.poll_questions for select using (auth.role() = 'authenticated');
create policy "admin manage poll questions" on public.poll_questions for insert with check (is_admin());
create policy "admin update poll questions" on public.poll_questions for update using (is_admin()) with check (is_admin());

-- poll_responses
create policy "view own poll response" on public.poll_responses for select using (respondent_id = auth.uid());
create policy "submit own poll response" on public.poll_responses for insert
  with check (respondent_id = auth.uid() or (respondent_id is null and exists (select 1 from polls where polls.poll_id = poll_responses.poll_id and polls.is_anonymous = true)));
create policy "analytics view all poll responses" on public.poll_responses for select using (is_analytics());

-- poll_answers
create policy "view own poll answers" on public.poll_answers for select
  using (exists (select 1 from poll_responses where poll_responses.poll_response_id = poll_answers.poll_response_id and poll_responses.respondent_id = auth.uid()));
create policy "submit own poll answers" on public.poll_answers for insert
  with check (exists (select 1 from poll_responses where poll_responses.poll_response_id = poll_answers.poll_response_id and (poll_responses.respondent_id = auth.uid() or poll_responses.respondent_id is null)));
create policy "analytics view all poll answers" on public.poll_answers for select using (is_analytics());

-- poll_submission_status
create policy "view own submission status" on public.poll_submission_status for select using (user_id = auth.uid());
create policy "manage own submission status" on public.poll_submission_status for insert with check (user_id = auth.uid());
create policy "update own submission status" on public.poll_submission_status for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "analytics view all submission status" on public.poll_submission_status for select using (is_analytics());

-- growth_machine_entries
create policy "view all gm entries" on public.growth_machine_entries for select using (auth.role() = 'authenticated');
create policy "builder submit entries" on public.growth_machine_entries for insert
  with check (exists (select 1 from event_table_members where event_table_members.table_id = growth_machine_entries.table_id and event_table_members.user_id = auth.uid() and event_table_members.is_builder = true));

-- growth_machine_votes
create policy "view all gm votes" on public.growth_machine_votes for select using (auth.role() = 'authenticated');
create policy "cast own vote" on public.growth_machine_votes for insert with check (voter_uid = auth.uid());

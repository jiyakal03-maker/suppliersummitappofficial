-- Supplier Summit schema, generated from supplier-summit-erd.mermaid.
--
-- Decisions confirmed with the team before writing this:
--   * user_info.uid is a 1:1 FK to auth.users(id) — the app uses Supabase
--     Auth for sessions; PIN is an app-level secondary check, not the login
--     mechanism.
--   * PIN is stored as a bigint digest (see hash_pin()), not the literal
--     "numeric" from the ERD (a real hash doesn't fit an ordinary numeric
--     column) and not text (kept numeric per explicit direction). This is
--     weaker than a proper adaptive hash (bcrypt/argon2) — treat this pin
--     purely as a low-stakes kiosk PIN, never as the sole auth factor for
--     anything sensitive.
--   * role is a single enum column; isSpeaker/isAdmin from the ERD are
--     dropped as redundant with it.
--   * speakers.event_uid references agenda(uid). This creates a circular
--     FK with agenda.speaker_uid -> speakers(uid), so speakers is created
--     first without that constraint, agenda is created referencing
--     speakers, and the speakers -> agenda FK is added afterward.

create extension if not exists pgcrypto;

-- ── Enums ────────────────────────────────────────────────────────────────

create type public.user_role as enum ('attendee', 'speaker', 'analytics', 'admin');
create type public.agenda_status as enum ('upcoming', 'live', 'completed');
create type public.poll_status as enum ('locked', 'live', 'unlocked');
create type public.poll_question_type as enum ('multiple_choice', 'text', 'rating');
create type public.question_redirect as enum ('speaker', 'analytics');

-- ── PIN hashing helper ──────────────────────────────────────────────────
-- Truncates a sha256 digest to a bigint. Deterministic (no salt) since it
-- must be looked up by value at login; only meant to keep raw PINs out of
-- the table, not to resist offline brute force on a 4-6 digit PIN space.

create or replace function public.hash_pin(pin text)
returns bigint
language sql
immutable
as $$
  select ('x' || substr(encode(digest(pin, 'sha256'), 'hex'), 1, 16))::bit(64)::bigint;
$$;

-- ── USER_INFO ────────────────────────────────────────────────────────────

create table public.user_info (
  uid uuid primary key references auth.users (id) on delete cascade,
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  phone varchar(30),
  email varchar(255) not null unique,
  company varchar(150),
  role public.user_role not null default 'attendee',
  pin_hash bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.user_info.pin_hash is 'hash_pin(raw_pin) — never store the raw PIN.';

-- ── SPEAKERS (event_uid FK to agenda added after agenda exists) ─────────

create table public.speakers (
  uid uuid primary key default gen_random_uuid(),
  user_uid uuid not null references public.user_info (uid) on delete cascade,
  event_uid uuid,
  event_name varchar(200),
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_uid, event_uid)
);

-- ── AGENDA ────────────────────────────────────────────────────────────────

create table public.agenda (
  uid uuid primary key default gen_random_uuid(),
  event_name varchar(200) not null,
  duration varchar(50),
  description text,
  status public.agenda_status not null default 'upcoming',
  speaker_uid uuid references public.speakers (uid) on delete set null,
  topics text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.speakers
  add constraint speakers_event_uid_fkey
  foreign key (event_uid) references public.agenda (uid) on delete set null;

-- ── TRANSCRIPT (0..1 per agenda item) ───────────────────────────────────

create table public.transcript (
  uid uuid primary key default gen_random_uuid(),
  agenda_uid uuid not null unique references public.agenda (uid) on delete cascade,
  transcript_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── POLLS ────────────────────────────────────────────────────────────────

create table public.polls (
  uid uuid primary key default gen_random_uuid(),
  poll_name varchar(200) not null,
  description text,
  status public.poll_status not null default 'locked',
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.poll_questions (
  uid uuid primary key default gen_random_uuid(),
  poll_uid uuid not null references public.polls (uid) on delete cascade,
  question_text text not null,
  question_type public.poll_question_type not null,
  -- ERD says "text, nullable, for multiple_choice"; stored as jsonb so the
  -- option list is a real array rather than an ad hoc delimited string.
  options jsonb,
  created_at timestamptz not null default now(),
  constraint poll_questions_options_required_for_mc
    check (question_type <> 'multiple_choice' or options is not null)
);

create table public.poll_responses (
  uid uuid primary key default gen_random_uuid(),
  poll_uid uuid not null references public.polls (uid) on delete cascade,
  respondent_uid uuid references public.user_info (uid) on delete set null,
  submitted_at timestamptz not null default now()
);

create table public.poll_answers (
  uid uuid primary key default gen_random_uuid(),
  poll_question_uid uuid not null references public.poll_questions (uid) on delete cascade,
  poll_response_uid uuid not null references public.poll_responses (uid) on delete cascade,
  answer_value text not null,
  unique (poll_question_uid, poll_response_uid)
);

create table public.poll_submission_status (
  uid uuid primary key default gen_random_uuid(),
  poll_uid uuid not null references public.polls (uid) on delete cascade,
  user_uid uuid not null references public.user_info (uid) on delete cascade,
  submitted boolean not null default false,
  unique (poll_uid, user_uid)
);

-- Enforces "respondent_uid set iff the poll isn't anonymous" — not
-- expressible as a plain column CHECK since it spans two tables.
create or replace function public.enforce_poll_response_anonymity()
returns trigger
language plpgsql
as $$
declare
  poll_is_anonymous boolean;
begin
  select is_anonymous into poll_is_anonymous from public.polls where uid = new.poll_uid;
  if poll_is_anonymous and new.respondent_uid is not null then
    raise exception 'poll % is anonymous; poll_responses.respondent_uid must be null', new.poll_uid;
  end if;
  if not poll_is_anonymous and new.respondent_uid is null then
    raise exception 'poll % is not anonymous; poll_responses.respondent_uid is required', new.poll_uid;
  end if;
  return new;
end;
$$;

create trigger poll_responses_enforce_anonymity
  before insert or update on public.poll_responses
  for each row execute function public.enforce_poll_response_anonymity();

-- ── QUESTIONS ────────────────────────────────────────────────────────────

create table public.questions (
  uid uuid primary key default gen_random_uuid(),
  topic varchar(150),
  submission_info text not null,
  redirect_to public.question_redirect not null,
  -- ERD leaves Status's value set undefined; kept as free text rather than
  -- inventing an enum. Tighten to a CHECK/enum once the real states are known.
  status varchar(50) not null default 'new',
  submitter_uid uuid not null references public.user_info (uid) on delete cascade,
  speaker_uid uuid references public.speakers (uid) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Indexes on FK / lookup columns ──────────────────────────────────────

create index speakers_user_uid_idx on public.speakers (user_uid);
create index speakers_event_uid_idx on public.speakers (event_uid);
create index agenda_speaker_uid_idx on public.agenda (speaker_uid);
create index poll_questions_poll_uid_idx on public.poll_questions (poll_uid);
create index poll_responses_poll_uid_idx on public.poll_responses (poll_uid);
create index poll_responses_respondent_uid_idx on public.poll_responses (respondent_uid);
create index poll_answers_poll_question_uid_idx on public.poll_answers (poll_question_uid);
create index poll_answers_poll_response_uid_idx on public.poll_answers (poll_response_uid);
create index poll_submission_status_poll_uid_idx on public.poll_submission_status (poll_uid);
create index poll_submission_status_user_uid_idx on public.poll_submission_status (user_uid);
create index questions_submitter_uid_idx on public.questions (submitter_uid);
create index questions_speaker_uid_idx on public.questions (speaker_uid);

-- ── updated_at maintenance ──────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_info_set_updated_at before update on public.user_info
  for each row execute function public.set_updated_at();
create trigger speakers_set_updated_at before update on public.speakers
  for each row execute function public.set_updated_at();
create trigger agenda_set_updated_at before update on public.agenda
  for each row execute function public.set_updated_at();
create trigger transcript_set_updated_at before update on public.transcript
  for each row execute function public.set_updated_at();
create trigger polls_set_updated_at before update on public.polls
  for each row execute function public.set_updated_at();
create trigger questions_set_updated_at before update on public.questions
  for each row execute function public.set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────
-- Starting point, not a full policy audit: locks every table down to
-- "read your own / write your own" plus admin override, using a
-- SECURITY DEFINER helper (owned by the migration role, which has
-- BYPASSRLS on Supabase) so the role lookup on user_info doesn't recurse
-- into user_info's own RLS policy.

create or replace function public.current_role_is(target public.user_role)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_info where uid = auth.uid() and role = target
  );
$$;

alter table public.user_info enable row level security;
alter table public.speakers enable row level security;
alter table public.agenda enable row level security;
alter table public.transcript enable row level security;
alter table public.polls enable row level security;
alter table public.poll_questions enable row level security;
alter table public.poll_responses enable row level security;
alter table public.poll_answers enable row level security;
alter table public.poll_submission_status enable row level security;
alter table public.questions enable row level security;

-- user_info: read/update your own row; admins read/write all.
create policy user_info_select_own on public.user_info
  for select using (uid = auth.uid() or public.current_role_is('admin'));
create policy user_info_update_own on public.user_info
  for update using (uid = auth.uid() or public.current_role_is('admin'));
create policy user_info_admin_write on public.user_info
  for insert with check (public.current_role_is('admin'));
create policy user_info_admin_delete on public.user_info
  for delete using (public.current_role_is('admin'));

-- speakers / agenda: public conference directory data, readable by any
-- signed-in attendee; only admins (or the speaker themself, for their bio)
-- can write.
create policy speakers_select_all on public.speakers
  for select using (auth.role() = 'authenticated');
create policy speakers_write_self_or_admin on public.speakers
  for update using (user_uid = auth.uid() or public.current_role_is('admin'));
create policy speakers_admin_insert on public.speakers
  for insert with check (public.current_role_is('admin'));
create policy speakers_admin_delete on public.speakers
  for delete using (public.current_role_is('admin'));

create policy agenda_select_all on public.agenda
  for select using (auth.role() = 'authenticated');
create policy agenda_admin_write on public.agenda
  for all using (public.current_role_is('admin')) with check (public.current_role_is('admin'));

-- transcript: sensitive-ish; restrict reads to admin/analytics roles.
create policy transcript_select_staff on public.transcript
  for select using (public.current_role_is('admin') or public.current_role_is('analytics'));
create policy transcript_admin_write on public.transcript
  for all using (public.current_role_is('admin')) with check (public.current_role_is('admin'));

-- polls / poll_questions: any signed-in attendee can read; only admins
-- author them.
create policy polls_select_all on public.polls
  for select using (auth.role() = 'authenticated');
create policy polls_admin_write on public.polls
  for all using (public.current_role_is('admin')) with check (public.current_role_is('admin'));

create policy poll_questions_select_all on public.poll_questions
  for select using (auth.role() = 'authenticated');
create policy poll_questions_admin_write on public.poll_questions
  for all using (public.current_role_is('admin')) with check (public.current_role_is('admin'));

-- poll_responses / poll_answers: attendees can insert their own response
-- (or an anonymous one), but only see it back (plus admin/analytics
-- seeing everything for reporting).
create policy poll_responses_insert_own on public.poll_responses
  for insert with check (respondent_uid = auth.uid() or respondent_uid is null);
create policy poll_responses_select_own_or_staff on public.poll_responses
  for select using (
    respondent_uid = auth.uid()
    or public.current_role_is('admin')
    or public.current_role_is('analytics')
  );

create policy poll_answers_insert_own on public.poll_answers
  for insert with check (
    exists (
      select 1 from public.poll_responses r
      where r.uid = poll_response_uid
        and (r.respondent_uid = auth.uid() or r.respondent_uid is null)
    )
  );
create policy poll_answers_select_own_or_staff on public.poll_answers
  for select using (
    exists (
      select 1 from public.poll_responses r
      where r.uid = poll_response_uid and r.respondent_uid = auth.uid()
    )
    or public.current_role_is('admin')
    or public.current_role_is('analytics')
  );

-- poll_submission_status: tracked per user even for anonymous polls
-- (completion only) — user manages their own row, staff can read all.
create policy poll_submission_status_own on public.poll_submission_status
  for all using (
    user_uid = auth.uid() or public.current_role_is('admin') or public.current_role_is('analytics')
  )
  with check (user_uid = auth.uid() or public.current_role_is('admin'));

-- questions: submitter manages their own; the routed speaker can read
-- questions assigned to them; admin/analytics see everything.
create policy questions_insert_own on public.questions
  for insert with check (submitter_uid = auth.uid());
create policy questions_select_own_routed_or_staff on public.questions
  for select using (
    submitter_uid = auth.uid()
    or exists (select 1 from public.speakers s where s.uid = speaker_uid and s.user_uid = auth.uid())
    or public.current_role_is('admin')
    or public.current_role_is('analytics')
  );
create policy questions_update_own_or_staff on public.questions
  for update using (
    submitter_uid = auth.uid()
    or public.current_role_is('admin')
    or public.current_role_is('analytics')
  );

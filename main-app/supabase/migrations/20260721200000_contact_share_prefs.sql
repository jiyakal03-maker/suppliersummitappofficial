-- Persists the profile modal's per-field "share my contact" toggles
-- (previously local-only React state) so they survive a reload.
--
-- No RLS policy changes needed — the existing "update own user row" policy
-- (user_id = auth.uid()) already covers writes to these new columns.

alter table public."user" add column if not exists share_email boolean not null default false;
alter table public."user" add column if not exists share_phone boolean not null default false;
alter table public."user" add column if not exists share_company boolean not null default false;

-- One-time backfill for existing rows: default each toggle to "on" only
-- where that field actually has a value, matching the UI's prior
-- Boolean(value) behavior before this migration existed.
update public."user"
set share_email = (email is not null),
    share_phone = (phone is not null),
    share_company = (company is not null)
where share_email = false and share_phone = false and share_company = false;

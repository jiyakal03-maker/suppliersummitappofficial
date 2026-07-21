-- PIN-based login support.
--
-- Adds a public-facing unique_id (badge code) so the login form has
-- something to look a user up by, since "user" previously had nothing
-- usable for that (email was null on all seed rows).
--
-- Also fixes a real bug found while wiring this up: hash_pin_trigger fired
-- on every UPDATE to "user", not just when pin changed, because the WHEN
-- clause only checked `new.pin is not null` — any unrelated update (e.g.
-- setting email) re-hashed the already-hashed pin on top of itself,
-- silently corrupting it. Rewritten to compare against old.pin.

alter table public."user" add column if not exists unique_id varchar(50);
alter table public."user" add constraint user_unique_id_key unique (unique_id);

-- verify_pin: the only server-side entry point that ever touches the pin
-- hash. RLS blocks anon/authenticated from selecting the pin column
-- directly (see "view own user row" / "admin view all users" policies),
-- so this SECURITY DEFINER function is how login checks a PIN without
-- ever exposing the hash to a client.
create or replace function public.verify_pin(p_unique_id text, p_pin text)
returns uuid
language sql
stable security definer
set search_path = public, extensions
as $$
  select user_id from public."user"
  where unique_id = p_unique_id and pin is not null and crypt(p_pin, pin) = pin;
$$;

grant execute on function public.verify_pin(text, text) to anon, authenticated;

create or replace function public.hash_pin()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  if new.pin is not null and (tg_op = 'INSERT' or new.pin is distinct from old.pin) then
    new.pin = crypt(new.pin, gen_salt('bf'));
  end if;
  return new;
end;
$$;

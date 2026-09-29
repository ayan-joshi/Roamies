-- Week 2: atomic onboarding + intro quota helpers

-- Single source of truth for the daily intro cap.
create function public.daily_intro_limit()
returns int
language sql
immutable
as $$ select 8 $$;

create function public.intros_sent_today(p_user uuid)
returns int
language sql
stable
security definer set search_path = ''
as $$
  select count(*)::int
  from public.interactions
  where sender_id = p_user
    and created_at >= (date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata');
$$;

-- Internal: callable only by other definer functions, never by clients.
revoke execute on function public.intros_sent_today(uuid) from public, anon, authenticated;

create function public.intros_left_today()
returns int
language sql
stable
security definer set search_path = ''
as $$
  select greatest(public.daily_intro_limit() - public.intros_sent_today((select auth.uid())), 0);
$$;

create or replace function public.enforce_interaction_rules()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  target_owner uuid;
begin
  -- The liked content must belong to the receiver.
  if new.target_type = 'itinerary' then
    select user_id into target_owner from public.itineraries where id = new.itinerary_id;
  else
    select user_id into target_owner from public.user_prompts where id = new.user_prompt_id;
  end if;

  if target_owner is distinct from new.receiver_id then
    raise exception 'Target content does not belong to receiver' using errcode = '23514';
  end if;

  if public.intros_sent_today(new.sender_id) >= public.daily_intro_limit() then
    raise exception 'Daily limit of % intros reached', public.daily_intro_limit() using errcode = 'P0001';
  end if;

  new.status := 'pending';
  new.responded_at := null;
  return new;
end;
$$;

-- Profile basics + exactly two prompt answers + first trip, all or nothing.
-- security invoker: runs with the caller's RLS and column grants.
create function public.complete_onboarding(
  p_display_name text,
  p_birth_date   date,
  p_gender       text,
  p_home_city    text,
  p_prompts      jsonb,   -- [{"prompt_id": 1, "answer": "..."}, {...}]
  p_place_id     bigint,
  p_start_date   date,
  p_end_date     date,
  p_budget       text,
  p_vibe         text,
  p_note         text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;

  if jsonb_typeof(p_prompts) <> 'array'
     or jsonb_array_length(p_prompts) <> 2
     or (select count(distinct (e ->> 'prompt_id')) from jsonb_array_elements(p_prompts) e) <> 2 then
    raise exception 'Pick exactly two different prompts' using errcode = '22023';
  end if;

  if p_start_date < current_date then
    raise exception 'Trip must start today or later' using errcode = '22023';
  end if;

  update public.profiles
     set display_name = btrim(p_display_name),
         birth_date   = p_birth_date,
         gender       = p_gender,
         home_city    = nullif(btrim(p_home_city), '')
   where id = uid;

  delete from public.user_prompts where user_id = uid;

  insert into public.user_prompts (user_id, prompt_id, answer, position)
  select uid, (e ->> 'prompt_id')::bigint, btrim(e ->> 'answer'), ord::smallint
  from jsonb_array_elements(p_prompts) with ordinality as t(e, ord);

  insert into public.itineraries (user_id, place_id, start_date, end_date, budget_bracket, vibe_tag, note)
  values (uid, p_place_id, p_start_date, p_end_date, p_budget, p_vibe, nullif(btrim(p_note), ''));

  update public.profiles set onboarded_at = now() where id = uid;
end;
$$;

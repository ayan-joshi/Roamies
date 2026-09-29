-- Launch safety: block, report, delete my account. Plus more places for real travellers.

-- ---------------------------------------------------------------------------
-- BLOCKS: either direction hides the pair from each other everywhere
-- ---------------------------------------------------------------------------
create table public.blocks (
  blocker_id uuid not null references public.profiles on delete cascade,
  blocked_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

create policy "blocks own" on public.blocks
  for all to authenticated
  using (blocker_id = (select auth.uid())) with check (blocker_id = (select auth.uid()));

create function public.is_blocked_pair(a uuid, b uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- Blocking closes any pending intro between the two people.
create function public.handle_block()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.interactions
     set status = 'declined', responded_at = now()
   where status = 'pending'
     and ((sender_id = new.blocker_id and receiver_id = new.blocked_id)
       or (sender_id = new.blocked_id and receiver_id = new.blocker_id));
  return new;
end;
$$;

create trigger blocks_after_insert
  after insert on public.blocks
  for each row execute function public.handle_block();

-- No intros between blocked people.
create or replace function public.enforce_interaction_rules()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  target_owner uuid;
begin
  if public.is_blocked_pair(new.sender_id, new.receiver_id) then
    raise exception 'You cannot contact this person' using errcode = '42501';
  end if;

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

-- A match stays readable, but nobody can post into it once either side blocks.
create function public.can_post_in_match(p_match_id bigint)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.matches m
    where m.id = p_match_id
      and (select auth.uid()) in (m.user_a, m.user_b)
      and not public.is_blocked_pair(m.user_a, m.user_b)
  );
$$;

drop policy "messages members send" on public.messages;
create policy "messages members send" on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.can_post_in_match(match_id));

-- ---------------------------------------------------------------------------
-- REPORTS: write-only for users; reviewed in the Supabase dashboard
-- ---------------------------------------------------------------------------
create table public.reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid references public.profiles on delete set null,
  reported_id uuid references public.profiles on delete set null,
  match_id    bigint references public.matches on delete set null,
  reason      text not null check (reason in ('Harassment', 'Fake profile', 'Scam or money request', 'Unsafe meetup', 'Spam', 'Something else')),
  details     text check (char_length(details) <= 500),
  status      text not null default 'open' check (status in ('open', 'reviewed', 'actioned')),
  created_at  timestamptz not null default now(),
  check (reporter_id is distinct from reported_id)
);

alter table public.reports enable row level security;

create policy "reports file" on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));
revoke select, update, delete on public.reports from anon, authenticated;

-- ---------------------------------------------------------------------------
-- DELETE MY ACCOUNT: removes the auth user; everything else cascades
-- ---------------------------------------------------------------------------
create function public.delete_my_account()
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------------------------
-- FEED: same as before, minus blocked people
-- ---------------------------------------------------------------------------
create or replace function public.get_feed(radius_km int default 50, slack_days int default 3)
returns table (
  itinerary_id   bigint,
  user_id        uuid,
  display_name   text,
  age            int,
  gender         text,
  home_city      text,
  avatar_url     text,
  is_verified    boolean,
  place_name     text,
  circuit        text,
  start_date     date,
  end_date       date,
  budget_bracket text,
  vibe_tag       text,
  note           text,
  distance_km    numeric,
  my_place_name  text,
  overlap_days   int
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select * from (
  select distinct on (o.id)
    o.id                                                    as itinerary_id,
    o.user_id                                               as user_id,
    p.display_name                                          as display_name,
    extract(year from age(p.birth_date))::int               as age,
    p.gender                                                as gender,
    p.home_city                                             as home_city,
    p.avatar_url                                            as avatar_url,
    p.verification_status = 'verified'                      as is_verified,
    op.name                                                 as place_name,
    op.circuit                                              as circuit,
    o.start_date                                            as start_date,
    o.end_date                                              as end_date,
    o.budget_bracket                                        as budget_bracket,
    o.vibe_tag                                              as vibe_tag,
    o.note                                                  as note,
    round((st_distance(op.geo, mp.geo) / 1000)::numeric, 1) as distance_km,
    mp.name                                                 as my_place_name,
    greatest(least(o.end_date, m.end_date) - greatest(o.start_date, m.start_date) + 1, 0) as overlap_days
  from itineraries m
  join places mp on mp.id = m.place_id
  join itineraries o
    on o.user_id <> m.user_id
   and o.end_date >= current_date
   and o.start_date <= m.end_date + slack_days
   and o.end_date >= m.start_date - slack_days
  join places op on op.id = o.place_id
  join profiles p on p.id = o.user_id and p.onboarded_at is not null
  where m.user_id = (select auth.uid())
    and m.end_date >= current_date
    and st_dwithin(op.geo, mp.geo, radius_km * 1000)
    and not public.is_blocked_pair(m.user_id, o.user_id)
    and not exists (
      select 1 from skips s
      where s.user_id = m.user_id and s.skipped_user_id = o.user_id
    )
    and not exists (
      select 1 from interactions i
      where (i.sender_id = m.user_id and i.receiver_id = o.user_id)
         or (i.sender_id = o.user_id and i.receiver_id = m.user_id)
    )
  order by o.id, st_distance(op.geo, mp.geo),
           least(o.end_date, m.end_date) - greatest(o.start_date, m.start_date) desc
  ) feed
  order by feed.distance_km, feed.start_date;
$$;

-- ---------------------------------------------------------------------------
-- MORE PLACES (coordinates are approximate town centres, fine for km-radius matching)
-- ---------------------------------------------------------------------------
insert into public.places (name, circuit, geo) values
  ('Tapovan (Rishikesh)', 'Uttarakhand', 'SRID=4326;POINT(78.3226 30.1263)'),
  ('Shivpuri',            'Uttarakhand', 'SRID=4326;POINT(78.3910 30.1403)'),
  ('Haridwar',            'Uttarakhand', 'SRID=4326;POINT(78.1642 29.9457)'),
  ('Landour',             'Uttarakhand', 'SRID=4326;POINT(78.0987 30.4597)'),
  ('Dhanaulti',           'Uttarakhand', 'SRID=4326;POINT(78.2440 30.4260)'),
  ('Kanatal',             'Uttarakhand', 'SRID=4326;POINT(78.3500 30.4100)'),
  ('Chakrata',            'Uttarakhand', 'SRID=4326;POINT(77.8690 30.7020)'),
  ('Lansdowne',           'Uttarakhand', 'SRID=4326;POINT(78.6871 29.8377)'),
  ('Uttarkashi',          'Uttarakhand', 'SRID=4326;POINT(78.4354 30.7268)'),
  ('Harsil',              'Uttarakhand', 'SRID=4326;POINT(78.7400 31.0400)'),
  ('Sankri (Kedarkantha)','Uttarakhand', 'SRID=4326;POINT(78.1840 31.0780)'),
  ('Joshimath',           'Uttarakhand', 'SRID=4326;POINT(79.5640 30.5550)'),
  ('Ghangaria (Valley of Flowers)', 'Uttarakhand', 'SRID=4326;POINT(79.6053 30.6967)'),
  ('Almora',              'Uttarakhand', 'SRID=4326;POINT(79.6591 29.5971)'),
  ('Binsar',              'Uttarakhand', 'SRID=4326;POINT(79.7550 29.7050)'),
  ('Munsiyari',           'Uttarakhand', 'SRID=4326;POINT(80.2386 30.0675)'),
  ('Ramnagar (Jim Corbett)', 'Uttarakhand', 'SRID=4326;POINT(79.1260 29.3947)'),
  ('Kheerganga',          'Himachal',    'SRID=4326;POINT(77.5100 31.9960)'),
  ('Malana',              'Himachal',    'SRID=4326;POINT(77.2620 32.0626)'),
  ('Sissu',               'Himachal',    'SRID=4326;POINT(77.1250 32.4800)'),
  ('Dharamkot',           'Himachal',    'SRID=4326;POINT(76.3300 32.2500)'),
  ('Barot',               'Himachal',    'SRID=4326;POINT(76.8490 32.0360)'),
  ('Kasauli',             'Himachal',    'SRID=4326;POINT(76.9650 30.9010)'),
  ('Dalhousie',           'Himachal',    'SRID=4326;POINT(75.9710 32.5387)'),
  ('Chitkul',             'Himachal',    'SRID=4326;POINT(78.4370 31.3510)'),
  ('Kalpa',               'Himachal',    'SRID=4326;POINT(78.2540 31.5370)'),
  ('Candolim',            'Goa',         'SRID=4326;POINT(73.7620 15.5180)'),
  ('Assagao',             'Goa',         'SRID=4326;POINT(73.7780 15.5950)'),
  ('Mandrem',             'Goa',         'SRID=4326;POINT(73.7140 15.6550)'),
  ('Agonda',              'Goa',         'SRID=4326;POINT(73.9870 15.0450)')
on conflict (name) do nothing;

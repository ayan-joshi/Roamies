-- Roamies core schema
-- Design notes (borrowed from Hinge's client data model, see README):
--   * Prompts come from a fixed catalog; users only pick and answer.
--   * You never "like a person". Every interaction targets one piece of content
--     (an itinerary or a prompt answer) and must carry an intro message.
--   * Skips are stored so a skipped traveller never comes back in the feed.
--   * A daily interaction cap keeps it anti-swipe.
--   * Accepting an interaction creates a match, and chat hangs off the match.

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------------
-- 1. PROFILES
-- A stub row is created by trigger on signup; onboarding fills the rest.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users on delete cascade,
  display_name        text check (char_length(display_name) between 1 and 40),
  birth_date          date check (birth_date <= current_date - interval '18 years'),
  gender              text check (gender in ('Male', 'Female', 'Non-Binary')),
  home_city           text,
  avatar_url          text,
  bio                 text check (char_length(bio) <= 300),
  -- Trust layer: we never store an Aadhaar number or image, only the outcome.
  verification_status text not null default 'unverified'
                      check (verification_status in ('unverified', 'pending', 'verified')),
  id_last4            text check (id_last4 ~ '^[0-9]{4}$'),
  onboarded_at        timestamptz,
  created_at          timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 40),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. PLACES (curated destinations with real coordinates for PostGIS)
-- ---------------------------------------------------------------------------
create table public.places (
  id      bigint generated always as identity primary key,
  name    text not null unique,
  circuit text not null check (circuit in ('Himachal', 'Uttarakhand', 'Goa')),
  geo     extensions.geography(point, 4326) not null
);

create index places_geo_idx on public.places using gist (geo);

-- ---------------------------------------------------------------------------
-- 3. PROMPT CATALOG + ANSWERS
-- ---------------------------------------------------------------------------
create table public.prompts (
  id          bigint generated always as identity primary key,
  text        text not null unique,
  placeholder text not null,
  category    text not null check (category in ('travel-style', 'about-me', 'logistics')),
  is_active   boolean not null default true
);

create table public.user_prompts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles on delete cascade,
  prompt_id  bigint not null references public.prompts,
  answer     text not null check (char_length(answer) between 1 and 200),
  position   smallint not null check (position in (1, 2)),
  created_at timestamptz not null default now(),
  unique (user_id, position),
  unique (user_id, prompt_id)
);

-- ---------------------------------------------------------------------------
-- 4. ITINERARIES (the core matching object)
-- ---------------------------------------------------------------------------
create table public.itineraries (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references public.profiles on delete cascade,
  place_id       bigint not null references public.places,
  start_date     date not null,
  end_date       date not null,
  budget_bracket text not null check (budget_bracket in ('Hostel/Budget', 'Mid-range', 'Luxury')),
  vibe_tag       text not null check (vibe_tag in ('Trekking/Adventure', 'Spiritual', 'Cafe Hopping/Chill', 'Partying')),
  note           text check (char_length(note) <= 200),
  created_at     timestamptz not null default now(),
  check (end_date >= start_date),
  check (end_date - start_date <= 90)
);

create index itineraries_user_idx on public.itineraries (user_id);
create index itineraries_dates_idx on public.itineraries (start_date, end_date);

-- ---------------------------------------------------------------------------
-- 5. INTERACTIONS (content-targeted likes with a forced intro message)
-- ---------------------------------------------------------------------------
create table public.interactions (
  id             bigint generated always as identity primary key,
  sender_id      uuid not null references public.profiles on delete cascade,
  receiver_id    uuid not null references public.profiles on delete cascade,
  target_type    text not null check (target_type in ('itinerary', 'prompt')),
  itinerary_id   bigint references public.itineraries on delete cascade,
  user_prompt_id bigint references public.user_prompts on delete cascade,
  intro_message  text not null check (char_length(btrim(intro_message)) between 10 and 300),
  status         text not null default 'pending'
                 check (status in ('pending', 'accepted', 'declined')),
  created_at     timestamptz not null default now(),
  responded_at   timestamptz,
  check (sender_id <> receiver_id),
  check (
    (target_type = 'itinerary' and itinerary_id is not null and user_prompt_id is null) or
    (target_type = 'prompt' and user_prompt_id is not null and itinerary_id is null)
  ),
  unique (sender_id, receiver_id)
);

create index interactions_receiver_idx on public.interactions (receiver_id, status);
create index interactions_sender_day_idx on public.interactions (sender_id, created_at);

-- Daily cap on outgoing interactions, counted in IST.
create function public.enforce_interaction_rules()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  daily_limit constant int := 8;
  sent_today int;
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

  select count(*) into sent_today
  from public.interactions
  where sender_id = new.sender_id
    and created_at >= (date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata');

  if sent_today >= daily_limit then
    raise exception 'Daily limit of % intros reached', daily_limit using errcode = 'P0001';
  end if;

  new.status := 'pending';
  new.responded_at := null;
  return new;
end;
$$;

create trigger interactions_before_insert
  before insert on public.interactions
  for each row execute function public.enforce_interaction_rules();

-- ---------------------------------------------------------------------------
-- 6. SKIPS
-- ---------------------------------------------------------------------------
create table public.skips (
  user_id         uuid not null references public.profiles on delete cascade,
  skipped_user_id uuid not null references public.profiles on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (user_id, skipped_user_id),
  check (user_id <> skipped_user_id)
);

-- ---------------------------------------------------------------------------
-- 7. MATCHES + MESSAGES (the planning room)
-- ---------------------------------------------------------------------------
create table public.matches (
  id             bigint generated always as identity primary key,
  interaction_id bigint not null unique references public.interactions on delete cascade,
  user_a         uuid not null references public.profiles on delete cascade,
  user_b         uuid not null references public.profiles on delete cascade,
  created_at     timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table public.messages (
  id         bigint generated always as identity primary key,
  match_id   bigint not null references public.matches on delete cascade,
  sender_id  uuid not null references public.profiles on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_match_idx on public.messages (match_id, created_at);

create function public.is_match_member(p_match_id bigint)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.matches
    where id = p_match_id and (select auth.uid()) in (user_a, user_b)
  );
$$;

-- Accepting an interaction opens a match (and so a chat room).
create function public.handle_interaction_response()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if old.status <> 'pending' then
    raise exception 'Interaction already answered' using errcode = 'P0001';
  end if;

  new.responded_at := now();

  if new.status = 'accepted' then
    insert into public.matches (interaction_id, user_a, user_b)
    values (
      new.id,
      least(new.sender_id, new.receiver_id),
      greatest(new.sender_id, new.receiver_id)
    )
    on conflict (user_a, user_b) do nothing;
  end if;

  return new;
end;
$$;

create trigger interactions_before_update
  before update of status on public.interactions
  for each row
  when (old.status is distinct from new.status)
  execute function public.handle_interaction_response();

-- ---------------------------------------------------------------------------
-- 8. THE FEED: travellers heading near my trips on overlapping dates
-- ---------------------------------------------------------------------------
create function public.get_feed(radius_km int default 50, slack_days int default 3)
returns table (
  itinerary_id   bigint,
  user_id        uuid,
  display_name   text,
  avatar_url     text,
  is_verified    boolean,
  place_name     text,
  start_date     date,
  end_date       date,
  budget_bracket text,
  vibe_tag       text,
  note           text,
  distance_km    numeric
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
    p.avatar_url                                            as avatar_url,
    p.verification_status = 'verified'                      as is_verified,
    op.name                                                 as place_name,
    o.start_date                                            as start_date,
    o.end_date                                              as end_date,
    o.budget_bracket                                        as budget_bracket,
    o.vibe_tag                                              as vibe_tag,
    o.note                                                  as note,
    round((st_distance(op.geo, mp.geo) / 1000)::numeric, 1) as distance_km
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
    and not exists (
      select 1 from skips s
      where s.user_id = m.user_id and s.skipped_user_id = o.user_id
    )
    and not exists (
      select 1 from interactions i
      where (i.sender_id = m.user_id and i.receiver_id = o.user_id)
         or (i.sender_id = o.user_id and i.receiver_id = m.user_id)
    )
  order by o.id, st_distance(op.geo, mp.geo)
  ) feed
  order by feed.distance_km, feed.start_date;
$$;

-- ---------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.places       enable row level security;
alter table public.prompts      enable row level security;
alter table public.user_prompts enable row level security;
alter table public.itineraries  enable row level security;
alter table public.interactions enable row level security;
alter table public.skips        enable row level security;
alter table public.matches      enable row level security;
alter table public.messages     enable row level security;

-- Profiles: any signed-in user can view; you edit only safe columns of your own.
create policy "profiles readable" on public.profiles
  for select to authenticated using (true);
create policy "profiles self update" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name, birth_date, gender, home_city, avatar_url, bio, onboarded_at)
  on public.profiles to authenticated;

-- Reference data: read-only.
create policy "places readable" on public.places
  for select to authenticated using (true);
create policy "prompts readable" on public.prompts
  for select to authenticated using (is_active);

-- Prompt answers and itineraries: public to members, owned by author.
create policy "user_prompts readable" on public.user_prompts
  for select to authenticated using (true);
create policy "user_prompts own write" on public.user_prompts
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "itineraries readable" on public.itineraries
  for select to authenticated using (true);
create policy "itineraries own write" on public.itineraries
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Interactions: only the two people involved can see one.
create policy "interactions participants read" on public.interactions
  for select to authenticated
  using ((select auth.uid()) in (sender_id, receiver_id));
create policy "interactions send" on public.interactions
  for insert to authenticated
  with check (sender_id = (select auth.uid()));
create policy "interactions respond" on public.interactions
  for update to authenticated
  using (receiver_id = (select auth.uid()) and status = 'pending')
  with check (receiver_id = (select auth.uid()) and status in ('accepted', 'declined'));

-- The receiver may change the status column and nothing else.
revoke update, delete on public.interactions from anon, authenticated;
grant update (status) on public.interactions to authenticated;

-- Skips are private to the skipper.
create policy "skips own" on public.skips
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Matches are created only by trigger; members can read them.
create policy "matches members read" on public.matches
  for select to authenticated
  using ((select auth.uid()) in (user_a, user_b));
revoke insert, update, delete on public.matches from anon, authenticated;

-- Messages: members of the match read and write; no edits or deletes.
create policy "messages members read" on public.messages
  for select to authenticated using (public.is_match_member(match_id));
create policy "messages members send" on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.is_match_member(match_id));
revoke update, delete on public.messages from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 10. REALTIME
-- postgres_changes respects RLS, so each client only receives its own rows.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages, public.interactions;

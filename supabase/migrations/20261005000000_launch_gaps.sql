-- Launch gaps: place kinds + treks/spots, trips already under way, unread chats,
-- feedback, and editing your profile after onboarding.

-- ---------------------------------------------------------------------------
-- 1. PLACE KINDS + MORE CITIES, TREKS, BEACHES AND SPOTS
-- ---------------------------------------------------------------------------
alter table public.places
  add column kind text not null default 'town' check (kind in ('town', 'trek', 'beach', 'spot'));

update public.places set kind = 'trek' where name in (
  'Kheerganga', 'Sandakphu', 'Ghangaria (Valley of Flowers)', 'Sankri (Kedarkantha)');
update public.places set kind = 'beach' where name in (
  'Calangute', 'Anjuna', 'Vagator', 'Morjim', 'Arambol', 'Palolem', 'Candolim', 'Mandrem', 'Agonda',
  'Varkala', 'Kovalam', 'Gokarna', 'Havelock (Swaraj Dweep)', 'Neil (Shaheed Dweep)', 'Tarkarli',
  'Murudeshwar', 'Alibaug', 'Mahabalipuram');
update public.places set kind = 'spot' where name in (
  'Pangong Tso', 'Tso Moriri', 'Nubra Valley', 'Dawki', 'Mawlynnong', 'Chilika Lake', 'Kaziranga',
  'Gir (Sasan)', 'Ranthambore', 'Kanha', 'Bandhavgarh', 'Prashar Lake', 'Solang', 'Majuli', 'Zuluk');

insert into public.places (name, circuit, kind, geo) values
  -- Treks (points are near the trail or its high point; approximate)
  ('Triund',                    'Himachal',          'trek', 'SRID=4326;POINT(76.3580 32.2595)'),
  ('Hampta Pass',               'Himachal',          'trek', 'SRID=4326;POINT(77.3500 32.2700)'),
  ('Bhrigu Lake',               'Himachal',          'trek', 'SRID=4326;POINT(77.2200 32.2850)'),
  ('Beas Kund',                 'Himachal',          'trek', 'SRID=4326;POINT(77.0800 32.3600)'),
  ('Kareri Lake',               'Himachal',          'trek', 'SRID=4326;POINT(76.2700 32.3250)'),
  ('Sar Pass',                  'Himachal',          'trek', 'SRID=4326;POINT(77.4200 32.0700)'),
  ('Kedarkantha',               'Uttarakhand',       'trek', 'SRID=4326;POINT(78.2270 31.0230)'),
  ('Har Ki Dun',                'Uttarakhand',       'trek', 'SRID=4326;POINT(78.4200 31.1500)'),
  ('Roopkund',                  'Uttarakhand',       'trek', 'SRID=4326;POINT(79.7330 30.2620)'),
  ('Brahmatal',                 'Uttarakhand',       'trek', 'SRID=4326;POINT(79.6500 30.1350)'),
  ('Kuari Pass',                'Uttarakhand',       'trek', 'SRID=4326;POINT(79.6700 30.4800)'),
  ('Nag Tibba',                 'Uttarakhand',       'trek', 'SRID=4326;POINT(78.1400 30.5850)'),
  ('Chadar Trek (Chilling)',    'Ladakh',            'trek', 'SRID=4326;POINT(77.2100 34.0400)'),
  ('Markha Valley',             'Ladakh',            'trek', 'SRID=4326;POINT(77.4500 33.8200)'),
  ('Kashmir Great Lakes',       'Jammu & Kashmir',   'trek', 'SRID=4326;POINT(75.1200 34.3500)'),
  ('Goechala',                  'Sikkim',            'trek', 'SRID=4326;POINT(88.1600 27.5300)'),
  ('Dzukou Valley',             'Nagaland',          'trek', 'SRID=4326;POINT(94.0700 25.5600)'),
  ('Nongriat (Double Decker Root Bridge)', 'Meghalaya', 'trek', 'SRID=4326;POINT(91.6800 25.2500)'),
  ('Kudremukh',                 'Karnataka',         'trek', 'SRID=4326;POINT(75.2530 13.1340)'),
  ('Tadiandamol',               'Karnataka',         'trek', 'SRID=4326;POINT(75.6450 12.2250)'),
  ('Kodachadri',                'Karnataka',         'trek', 'SRID=4326;POINT(74.8750 13.8630)'),
  ('Chembra Peak',              'Kerala',            'trek', 'SRID=4326;POINT(76.0850 11.5150)'),
  ('Kalsubai',                  'Maharashtra',       'trek', 'SRID=4326;POINT(73.7090 19.6010)'),
  ('Rajmachi',                  'Maharashtra',       'trek', 'SRID=4326;POINT(73.3960 18.8280)'),
  ('Harishchandragad',          'Maharashtra',       'trek', 'SRID=4326;POINT(73.7780 19.3880)'),
  -- Spots
  ('Khardung La',               'Ladakh',            'spot', 'SRID=4326;POINT(77.6040 34.2780)'),
  ('Rohtang Pass',              'Himachal',          'spot', 'SRID=4326;POINT(77.2470 32.3720)'),
  ('Gurudongmar Lake',          'Sikkim',            'spot', 'SRID=4326;POINT(88.7090 28.0250)'),
  ('Tsomgo Lake',               'Sikkim',            'spot', 'SRID=4326;POINT(88.7640 27.3740)'),
  ('Sela Pass',                 'Arunachal Pradesh', 'spot', 'SRID=4326;POINT(92.1030 27.5060)'),
  ('Dudhsagar Falls',           'Goa',               'spot', 'SRID=4326;POINT(74.3144 15.3144)'),
  ('Jog Falls',                 'Karnataka',         'spot', 'SRID=4326;POINT(74.8120 14.2290)'),
  ('Athirappilly Falls',        'Kerala',            'spot', 'SRID=4326;POINT(76.5700 10.2850)'),
  ('Chitrakote Falls',          'Chhattisgarh',      'spot', 'SRID=4326;POINT(81.7070 19.2060)'),
  ('Lonar Crater',              'Maharashtra',       'spot', 'SRID=4326;POINT(76.5080 19.9760)'),
  ('Kaas Plateau',              'Maharashtra',       'spot', 'SRID=4326;POINT(73.8230 17.7200)'),
  ('Bhedaghat (Marble Rocks)',  'Madhya Pradesh',    'spot', 'SRID=4326;POINT(79.8040 23.1300)'),
  ('Statue of Unity',           'Gujarat',           'spot', 'SRID=4326;POINT(73.7191 21.8380)'),
  ('Sundarbans',                'West Bengal',       'spot', 'SRID=4326;POINT(88.8100 22.1650)'),
  ('Kabini',                    'Karnataka',         'spot', 'SRID=4326;POINT(76.3500 11.9500)'),
  -- Beaches
  ('Radhanagar Beach',          'Andaman & Nicobar', 'beach', 'SRID=4326;POINT(92.9570 11.9840)'),
  ('Cola Beach',                'Goa',               'beach', 'SRID=4326;POINT(74.0170 15.0430)'),
  ('Ganpatipule',               'Maharashtra',       'beach', 'SRID=4326;POINT(73.2660 17.1450)'),
  ('Poovar',                    'Kerala',            'beach', 'SRID=4326;POINT(77.0700 8.3200)'),
  ('Tranquebar',                'Tamil Nadu',        'beach', 'SRID=4326;POINT(79.8550 11.0290)'),
  ('Konark',                    'Odisha',            'beach', 'SRID=4326;POINT(86.0945 19.8876)'),
  ('Agatti',                    'Lakshadweep',       'beach', 'SRID=4326;POINT(72.1860 10.8500)'),
  -- Towns and cities
  ('Jammu',                     'Jammu & Kashmir',   'town', 'SRID=4326;POINT(74.8570 32.7266)'),
  ('Katra (Vaishno Devi)',      'Jammu & Kashmir',   'town', 'SRID=4326;POINT(74.9310 32.9916)'),
  ('Dharamshala',               'Himachal',          'town', 'SRID=4326;POINT(76.3234 32.2190)'),
  ('Kullu',                     'Himachal',          'town', 'SRID=4326;POINT(77.1090 31.9579)'),
  ('Tabo',                      'Himachal',          'town', 'SRID=4326;POINT(78.3850 32.0930)'),
  ('Sangla',                    'Himachal',          'town', 'SRID=4326;POINT(78.2640 31.4250)'),
  ('Kalga',                     'Himachal',          'town', 'SRID=4326;POINT(77.3900 32.0230)'),
  ('Bhimtal',                   'Uttarakhand',       'town', 'SRID=4326;POINT(79.5580 29.3440)'),
  ('Chaukori',                  'Uttarakhand',       'town', 'SRID=4326;POINT(80.0150 29.8420)'),
  ('Chittorgarh',               'Rajasthan',         'town', 'SRID=4326;POINT(74.6313 24.8887)'),
  ('Kumbhalgarh',               'Rajasthan',         'town', 'SRID=4326;POINT(73.5800 25.1480)'),
  ('Jawai',                     'Rajasthan',         'town', 'SRID=4326;POINT(73.1700 25.1000)'),
  ('Mandawa',                   'Rajasthan',         'town', 'SRID=4326;POINT(75.1500 28.0550)'),
  ('Somnath',                   'Gujarat',           'town', 'SRID=4326;POINT(70.4012 20.8880)'),
  ('Bhopal',                    'Madhya Pradesh',    'town', 'SRID=4326;POINT(77.4126 23.2599)'),
  ('Indore',                    'Madhya Pradesh',    'town', 'SRID=4326;POINT(75.8577 22.7196)'),
  ('Gwalior',                   'Madhya Pradesh',    'town', 'SRID=4326;POINT(78.1828 26.2183)'),
  ('Mandu',                     'Madhya Pradesh',    'town', 'SRID=4326;POINT(75.3950 22.3560)'),
  ('Omkareshwar',               'Madhya Pradesh',    'town', 'SRID=4326;POINT(76.1510 22.2450)'),
  ('Prayagraj',                 'Uttar Pradesh',     'town', 'SRID=4326;POINT(81.8463 25.4358)'),
  ('Bodh Gaya',                 'Bihar',             'town', 'SRID=4326;POINT(84.9870 24.6960)'),
  ('Bhubaneswar',               'Odisha',            'town', 'SRID=4326;POINT(85.8245 20.2961)'),
  ('Shantiniketan',             'West Bengal',       'town', 'SRID=4326;POINT(87.6780 23.6800)'),
  ('Dirang',                    'Arunachal Pradesh', 'town', 'SRID=4326;POINT(92.2400 27.3580)'),
  ('Bomdila',                   'Arunachal Pradesh', 'town', 'SRID=4326;POINT(92.4230 27.2640)'),
  ('Lachen',                    'Sikkim',            'town', 'SRID=4326;POINT(88.5550 27.7170)'),
  ('Namchi',                    'Sikkim',            'town', 'SRID=4326;POINT(88.3640 27.1660)'),
  ('Badami',                    'Karnataka',         'town', 'SRID=4326;POINT(75.6780 15.9180)'),
  ('Sakleshpur',                'Karnataka',         'town', 'SRID=4326;POINT(75.7850 12.9440)'),
  ('Dandeli',                   'Karnataka',         'town', 'SRID=4326;POINT(74.6200 15.2500)'),
  ('Vagamon',                   'Kerala',            'town', 'SRID=4326;POINT(76.9050 9.6860)'),
  ('Kozhikode',                 'Kerala',            'town', 'SRID=4326;POINT(75.7804 11.2588)'),
  ('Coonoor',                   'Tamil Nadu',        'town', 'SRID=4326;POINT(76.7959 11.3530)'),
  ('Tiruvannamalai',            'Tamil Nadu',        'town', 'SRID=4326;POINT(79.0747 12.2253)'),
  ('Tirupati',                  'Andhra Pradesh',    'town', 'SRID=4326;POINT(79.4192 13.6288)'),
  ('Igatpuri',                  'Maharashtra',       'town', 'SRID=4326;POINT(73.5540 19.6960)'),
  ('Malshej Ghat',              'Maharashtra',       'town', 'SRID=4326;POINT(73.7270 19.3420)')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- 2. TRIPS ALREADY UNDER WAY: only the end date has to be today or later
-- ---------------------------------------------------------------------------
create or replace function public.complete_onboarding(
  p_display_name text,
  p_birth_date   date,
  p_gender       text,
  p_home_city    text,
  p_prompts      jsonb,
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

  -- Travellers often join mid-trip, so a trip may have started already; it just can't be over.
  if p_end_date < current_date then
    raise exception 'That trip has already ended. Pick dates that end today or later.' using errcode = '22023';
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

-- ---------------------------------------------------------------------------
-- 2b. KEEP MATCHES AND CHATS WHEN A TRIP OR PROMPT IS DELETED
-- Previously these FKs cascaded, so deleting a trip wiped every intro, match and chat built on it.
-- Now the link is cleared and the app shows "this post was removed" instead.
-- ---------------------------------------------------------------------------
alter table public.interactions drop constraint interactions_itinerary_id_fkey;
alter table public.interactions add constraint interactions_itinerary_id_fkey
  foreign key (itinerary_id) references public.itineraries on delete set null;
alter table public.interactions drop constraint interactions_user_prompt_id_fkey;
alter table public.interactions add constraint interactions_user_prompt_id_fkey
  foreign key (user_prompt_id) references public.user_prompts on delete set null;

do $$
declare c text;
begin
  select conname into c from pg_constraint
   where conrelid = 'public.interactions'::regclass and contype = 'c'
     and pg_get_constraintdef(oid) like '%target_type%itinerary_id%';
  execute format('alter table public.interactions drop constraint %I', c);
end $$;

-- The target may be gone later, but never pointing at the wrong kind of thing.
alter table public.interactions add constraint interactions_target_check check (
  (target_type = 'itinerary' and user_prompt_id is null) or
  (target_type = 'prompt' and itinerary_id is null)
);

-- ---------------------------------------------------------------------------
-- 3. EDIT PROFILE: name, home city and the two prompts, all or nothing
-- ---------------------------------------------------------------------------
create function public.update_my_profile(p_display_name text, p_home_city text, p_prompts jsonb)
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

  update public.profiles
     set display_name = btrim(p_display_name),
         home_city    = nullif(btrim(p_home_city), '')
   where id = uid;

  -- Prompt ids stay stable when an answer is only edited, so intros that replied to it keep their context.
  delete from public.user_prompts
   where user_id = uid
     and prompt_id not in (select (e ->> 'prompt_id')::bigint from jsonb_array_elements(p_prompts) e);

  insert into public.user_prompts (user_id, prompt_id, answer, position)
  select uid, (e ->> 'prompt_id')::bigint, btrim(e ->> 'answer'), (ord + 10)::smallint
  from jsonb_array_elements(p_prompts) with ordinality as t(e, ord)
  on conflict (user_id, prompt_id) do update set answer = excluded.answer, position = excluded.position;

  -- Normalise positions back to 1 and 2 in the order given.
  update public.user_prompts up
     set position = (e.ord)::smallint
    from jsonb_array_elements(p_prompts) with ordinality as e(v, ord)
   where up.user_id = uid and up.prompt_id = (e.v ->> 'prompt_id')::bigint;
end;
$$;

-- position is limited to 1 or 2; allow a temporary 11/12 during the swap above.
alter table public.user_prompts drop constraint user_prompts_position_check;
alter table public.user_prompts add constraint user_prompts_position_check check (position in (1, 2, 11, 12));

-- ---------------------------------------------------------------------------
-- 4. UNREAD CHATS
-- ---------------------------------------------------------------------------
create table public.match_reads (
  user_id      uuid not null references public.profiles on delete cascade,
  match_id     bigint not null references public.matches on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

alter table public.match_reads enable row level security;

create policy "match_reads own" on public.match_reads
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.is_match_member(match_id));

-- My matches with the last message and an unread flag, newest activity first.
create function public.my_matches()
returns table (
  match_id     bigint,
  other_id     uuid,
  other_name   text,
  matched_at   timestamptz,
  last_body    text,
  last_at      timestamptz,
  last_from_me boolean,
  unread       boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    m.id,
    o.id,
    o.display_name,
    m.created_at,
    lm.body,
    lm.created_at,
    lm.sender_id = (select auth.uid()),
    case
      when lm.created_at is null then r.last_read_at is null  -- brand-new match, never opened
      else lm.sender_id <> (select auth.uid()) and lm.created_at > coalesce(r.last_read_at, '-infinity'::timestamptz)
    end
  from public.matches m
  join public.profiles o
    on o.id = case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end
  left join lateral (
    select body, created_at, sender_id from public.messages
    where match_id = m.id order by created_at desc limit 1
  ) lm on true
  left join public.match_reads r on r.match_id = m.id and r.user_id = (select auth.uid())
  where (select auth.uid()) in (m.user_a, m.user_b)
    and not exists (select 1 from public.blocks b where b.blocker_id = (select auth.uid()) and b.blocked_id = o.id)
  order by coalesce(lm.created_at, m.created_at) desc;
$$;

-- ---------------------------------------------------------------------------
-- 5. FEEDBACK (from signed-in users and demo visitors)
-- ---------------------------------------------------------------------------
create table public.feedback (
  id         bigint generated always as identity primary key,
  user_id    uuid references public.profiles on delete set null,
  kind       text not null check (kind in ('bug', 'idea', 'love')),
  message    text not null check (char_length(btrim(message)) between 1 and 1000),
  page       text check (char_length(page) <= 200),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "feedback send" on public.feedback
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
revoke select, update, delete on public.feedback from anon, authenticated;

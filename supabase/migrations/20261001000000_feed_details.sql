-- Feed card (noticeboard design) needs age, gender, home city, circuit,
-- and how many days the two trips overlap. The return type changes, so drop first.
drop function public.get_feed(int, int);

create function public.get_feed(radius_km int default 50, slack_days int default 3)
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
    and not exists (
      select 1 from skips s
      where s.user_id = m.user_id and s.skipped_user_id = o.user_id
    )
    and not exists (
      select 1 from interactions i
      where (i.sender_id = m.user_id and i.receiver_id = o.user_id)
         or (i.sender_id = o.user_id and i.receiver_id = m.user_id)
    )
  -- If several of my trips match, prefer the closest one, then the longest overlap.
  order by o.id, st_distance(op.geo, mp.geo),
           least(o.end_date, m.end_date) - greatest(o.start_date, m.start_date) desc
  ) feed
  order by feed.distance_km, feed.start_date;
$$;

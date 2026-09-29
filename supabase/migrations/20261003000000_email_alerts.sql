-- Email alerts opt-out (on by default). Users can change it in Account.
alter table public.profiles add column email_alerts boolean not null default true;

grant update (email_alerts) on public.profiles to authenticated;

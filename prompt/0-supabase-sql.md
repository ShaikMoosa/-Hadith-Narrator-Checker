create table public.search (
  id integer generated always as identity primary key,
  query text not null,
  result_found boolean not null,
  user_id uuid not null default next_auth.uid(),
  searched_at timestamp with time zone not null default now()
);
comment on table public.search is 'Stores each hadith search (query text, lookup result status, and searched timestamp).';

alter table public.search enable row level security;

create policy "Select search policy" on public.search as permissive for select
  to authenticated using (user_id = next_auth.uid());

create policy "Insert search policy" on public.search as permissive for insert
  to authenticated with check (user_id = next_auth.uid());

create policy "Update search policy" on public.search as permissive for update
  to authenticated using (user_id = next_auth.uid());

create policy "Delete search policy" on public.search as permissive for delete
  to authenticated using (user_id = next_auth.uid());

create table public.bookmark (
  id integer generated always as identity primary key,
  user_id uuid not null default next_auth.uid(),
  narrator_id integer not null references public.narrator(id) on delete cascade,
  created_at timestamp with time zone not null default now()
);
comment on table public.bookmark is 'Lets a user bookmark a narrator for later reference.';

alter table public.bookmark enable row level security;

create policy "Select bookmark policy" on public.bookmark as permissive for select
  to authenticated using (user_id = next_auth.uid());

create policy "Insert bookmark policy" on public.bookmark as permissive for insert
  to authenticated with check (user_id = next_auth.uid());

create policy "Update bookmark policy" on public.bookmark as permissive for update
  to authenticated using (user_id = next_auth.uid());

create policy "Delete bookmark policy" on public.bookmark as permissive for delete
  to authenticated using (user_id = next_auth.uid());

create table public.narrator (
  id integer generated always as identity primary key,
  name_arabic text not null,
  name_transliteration text,
  credibility text not null,
  biography text,
  birth_year integer,
  death_year integer,
  region text,
  created_at timestamp with time zone not null default now()
);
comment on table public.narrator is 'Stores core details for each narrator, including names in Arabic and transliteration, credibility, and additional biographical metadata.';

create table public.opinion (
  id integer generated always as identity primary key,
  narrator_id integer not null references public.narrator(id) on delete cascade,
  scholar text not null,
  verdict text not null,
  reason text,
  source_ref text,
  created_at timestamp with time zone not null default now()
);
comment on table public.opinion is 'Contains scholarly opinions about a narrator (linked via narrator_id) with verdicts and explanations.';
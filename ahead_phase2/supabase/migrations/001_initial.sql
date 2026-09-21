-- Ahead V1 tables + row-level security
create extension if not exists pgcrypto;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  diagnosis jsonb not null,
  model text not null,
  prompt_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.programmes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diagnosis_id uuid not null references public.diagnoses(id) on delete cascade,
  programme jsonb not null,
  model text not null,
  prompt_version text not null,
  created_at timestamptz not null default now()
);

alter table public.assessments enable row level security;
alter table public.diagnoses enable row level security;
alter table public.programmes enable row level security;

create policy "Users can read own assessments" on public.assessments for select using (auth.uid() = user_id);
create policy "Users can insert own assessments" on public.assessments for insert with check (auth.uid() = user_id);
create policy "Users can delete own assessments" on public.assessments for delete using (auth.uid() = user_id);

create policy "Users can read own diagnoses" on public.diagnoses for select using (auth.uid() = user_id);
create policy "Users can insert own diagnoses" on public.diagnoses for insert with check (auth.uid() = user_id);
create policy "Users can delete own diagnoses" on public.diagnoses for delete using (auth.uid() = user_id);

create policy "Users can read own programmes" on public.programmes for select using (auth.uid() = user_id);
create policy "Users can insert own programmes" on public.programmes for insert with check (auth.uid() = user_id);
create policy "Users can delete own programmes" on public.programmes for delete using (auth.uid() = user_id);

create index if not exists assessments_user_id_idx on public.assessments(user_id);
create index if not exists diagnoses_user_id_idx on public.diagnoses(user_id);
create index if not exists programmes_user_id_idx on public.programmes(user_id);

-- ============================================================
-- Diaspora Pay — Schéma PostgreSQL pour Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- Table: profiles
-- Étend auth.users avec les informations métier
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  country text default 'France',
  preferred_currency text default 'EUR',
  language text default 'fr',
  notifications_enabled boolean default true,
  biometric_enabled boolean default false,
  pin_hash text,
  kyc_level text default 'pending' check (kyc_level in ('pending','verified','rejected')),
  monthly_limit numeric default 2000,
  monthly_used numeric default 0,
  avatar_initials text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- Table: beneficiaries
-- Carnet de bénéficiaires par utilisateur
-- ─────────────────────────────────────────────────────────────
create table if not exists public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  network text not null check (network in ('orange-money','mtn-momo','wave','bank-transfer')),
  relation text,
  favorite boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_beneficiaries_user on public.beneficiaries(user_id);

-- ─────────────────────────────────────────────────────────────
-- Table: transfers
-- Historique des transferts internationaux
-- ─────────────────────────────────────────────────────────────
create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  receiver_name text not null,
  receiver_phone text,
  network text not null,
  country_code text not null,
  currency text not null,
  amount numeric not null check (amount > 0),
  fees numeric not null default 0,
  rate numeric not null,
  received_gnf numeric not null,
  status text default 'pending' check (status in ('pending','completed','failed')),
  reference text unique not null,
  created_at timestamptz default now()
);

create index if not exists idx_transfers_user on public.transfers(user_id);
create index if not exists idx_transfers_created on public.transfers(created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Trigger: crée automatiquement un profil à l'inscription
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, country, avatar_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'country', 'France'),
    upper(left(coalesce(new.raw_user_meta_data->>'full_name', new.email), 2))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security (RLS) — sécurité fintech
-- Chaque utilisateur ne voit/modifie QUE ses propres données
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.beneficiaries enable row level security;
alter table public.transfers enable row level security;

-- Profiles: lecture et modification de son propre profil uniquement
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Beneficiaries: CRUD limité à ses propres bénéficiaires
drop policy if exists "beneficiaries_select_own" on public.beneficiaries;
create policy "beneficiaries_select_own" on public.beneficiaries
  for select using (auth.uid() = user_id);

drop policy if exists "beneficiaries_insert_own" on public.beneficiaries;
create policy "beneficiaries_insert_own" on public.beneficiaries
  for insert with check (auth.uid() = user_id);

drop policy if exists "beneficiaries_update_own" on public.beneficiaries;
create policy "beneficiaries_update_own" on public.beneficiaries
  for update using (auth.uid() = user_id);

drop policy if exists "beneficiaries_delete_own" on public.beneficiaries;
create policy "beneficiaries_delete_own" on public.beneficiaries
  for delete using (auth.uid() = user_id);

-- Transfers: CRUD limité à ses propres transferts
drop policy if exists "transfers_select_own" on public.transfers;
create policy "transfers_select_own" on public.transfers
  for select using (auth.uid() = user_id);

drop policy if exists "transfers_insert_own" on public.transfers;
create policy "transfers_insert_own" on public.transfers
  for insert with check (auth.uid() = user_id);

drop policy if exists "transfers_update_own" on public.transfers;
create policy "transfers_update_own" on public.transfers
  for update using (auth.uid() = user_id);

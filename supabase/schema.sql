-- Keyber saves + global progression (run in Supabase SQL editor)
-- Tables used by /api/sauvegardes and /api/progression

create table if not exists sauvegardes (
  id text primary key,
  user_id text not null,
  slot smallint not null check (slot between 1 and 3),
  nom_joueur text not null default 'Pilote KEYBER',
  mode text,
  scenario_id text,
  game_state jsonb not null,
  date_derniere_sauvegarde timestamptz not null default now(),
  jour_actuel integer not null default 0,
  pourcentage_progression integer not null default 0,
  unique (user_id, slot)
);

create index if not exists sauvegardes_user_id_idx on sauvegardes (user_id);

create table if not exists progression_globale (
  user_id text primary key,
  niveau_global integer not null default 1,
  xp_total integer not null default 0,
  competences jsonb not null default '{}'::jsonb,
  histoires_terminees jsonb not null default '[]'::jsonb,
  entrainements_termines jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- For anon-key demos without auth: allow all (tighten with RLS + auth later)
alter table sauvegardes enable row level security;
alter table progression_globale enable row level security;

drop policy if exists "sauvegardes_all" on sauvegardes;
create policy "sauvegardes_all" on sauvegardes for all using (true) with check (true);

drop policy if exists "progression_all" on progression_globale;
create policy "progression_all" on progression_globale for all using (true) with check (true);

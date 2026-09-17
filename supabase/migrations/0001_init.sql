-- My Minni World — initial schema
-- Pattern mirrors cards-and-chaos / rummy-sekai: auth.users trigger -> profiles row,
-- RLS everywhere, SECURITY DEFINER RPCs for mutating writes so clients can never
-- unlock content or write world state for another user by hand.

-- ─── profiles ────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null default 'Explorer',
    email text,
    is_guest boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
    for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
    for update using (auth.uid() = id);

-- ─── locations (public catalog) ─────────────────────────────────────────────

create table if not exists public.locations (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    name text not null,
    description text not null default '',
    category text not null default 'community',
    thumbnail_url text,
    background_url text,
    is_default boolean not null default false,
    sort_order integer not null default 0
);

alter table public.locations enable row level security;

create policy "locations: public read" on public.locations
    for select using (true);

-- ─── wardrobe_items (public catalog: hair/face/outfit/accessory/prop) ──────────

create table if not exists public.wardrobe_items (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    category text not null,
    name text not null,
    asset_url text,
    is_default boolean not null default false,
    sort_order integer not null default 0
);

alter table public.wardrobe_items enable row level security;

create policy "wardrobe_items: public read" on public.wardrobe_items
    for select using (true);

-- ─── minnis (player characters) ─────────────────────────────────────────────

create table if not exists public.minnis (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references public.profiles(id) on delete cascade,
    name text not null default 'My Minni',
    appearance jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.minnis enable row level security;

create policy "minnis: owner read" on public.minnis
    for select using (auth.uid() = owner_id);
create policy "minnis: owner insert" on public.minnis
    for insert with check (auth.uid() = owner_id);
create policy "minnis: owner update" on public.minnis
    for update using (auth.uid() = owner_id);
create policy "minnis: owner delete" on public.minnis
    for delete using (auth.uid() = owner_id);

-- ─── location_unlocks / owned_items (write-only via RPC, see below) ───────────

create table if not exists public.location_unlocks (
    owner_id uuid not null references public.profiles(id) on delete cascade,
    location_id uuid not null references public.locations(id) on delete cascade,
    unlocked_at timestamptz not null default now(),
    primary key (owner_id, location_id)
);

alter table public.location_unlocks enable row level security;

create policy "location_unlocks: owner read" on public.location_unlocks
    for select using (auth.uid() = owner_id);
-- No insert/update/delete policy: rows are only ever written by the SECURITY DEFINER
-- RPCs below, which bypass RLS — a client can never unlock a location by writing here directly.

create table if not exists public.owned_items (
    owner_id uuid not null references public.profiles(id) on delete cascade,
    item_id uuid not null references public.wardrobe_items(id) on delete cascade,
    primary key (owner_id, item_id)
);

alter table public.owned_items enable row level security;

create policy "owned_items: owner read" on public.owned_items
    for select using (auth.uid() = owner_id);

-- ─── world_saves (sandbox decoration state per owner+location) ────────────────

create table if not exists public.world_saves (
    owner_id uuid not null references public.profiles(id) on delete cascade,
    location_id uuid not null references public.locations(id) on delete cascade,
    state jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now(),
    primary key (owner_id, location_id)
);

alter table public.world_saves enable row level security;

create policy "world_saves: owner read" on public.world_saves
    for select using (auth.uid() = owner_id);
-- Writes go through save_world_state() below.

-- ─── RPCs (SECURITY DEFINER — the only way owned_items/location_unlocks/world_saves get written) ─

create or replace function public.grant_starter_pack(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.location_unlocks (owner_id, location_id)
    select p_user_id, id from public.locations where is_default
    on conflict do nothing;

    insert into public.owned_items (owner_id, item_id)
    select p_user_id, id from public.wardrobe_items where is_default
    on conflict do nothing;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, display_name, email, is_guest)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'display_name', 'Explorer'),
        new.email,
        coalesce((new.raw_user_meta_data->>'is_guest')::boolean, false)
    )
    on conflict (id) do nothing;

    perform public.grant_starter_pack(new.id);

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

create or replace function public.unlock_location(p_location_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_location_id uuid;
begin
    select id into v_location_id from public.locations where key = p_location_key;
    if v_location_id is null then
        raise exception 'Unknown location key: %', p_location_key;
    end if;

    insert into public.location_unlocks (owner_id, location_id)
    values (auth.uid(), v_location_id)
    on conflict do nothing;
end;
$$;

create or replace function public.unlock_wardrobe_item(p_item_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_item_id uuid;
begin
    select id into v_item_id from public.wardrobe_items where key = p_item_key;
    if v_item_id is null then
        raise exception 'Unknown wardrobe item key: %', p_item_key;
    end if;

    insert into public.owned_items (owner_id, item_id)
    values (auth.uid(), v_item_id)
    on conflict do nothing;
end;
$$;

create or replace function public.save_world_state(p_location_id uuid, p_state jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.world_saves (owner_id, location_id, state, updated_at)
    values (auth.uid(), p_location_id, p_state, now())
    on conflict (owner_id, location_id)
        do update set state = excluded.state, updated_at = now();
end;
$$;

-- ─── seed data ──────────────────────────────────────────────────────────────

insert into public.locations (key, name, description, category, is_default, sort_order) values
    ('cozy_home', 'Cozy Home', 'A snug house with a kitchen, bedroom, and living room to decorate.', 'home', true, 0),
    ('sunny_cafe', 'Sunny Café', 'Brew drinks, bake treats, and serve your Minnis at the counter.', 'community', true, 1),
    ('pet_salon', 'Pet Salon', 'Wash, style, and dress up pets for their next big adventure.', 'community', false, 2),
    ('starlight_school', 'Starlight School', 'Classrooms, an art corner, and a playground to run around in.', 'community', false, 3),
    ('meadow_park', 'Meadow Park', 'A picnic spot, a pond, and a treehouse to climb.', 'nature', false, 4),
    ('candy_carnival', 'Candy Carnival', 'Rides, games, and a cotton-candy stand under string lights.', 'fantasy', false, 5)
on conflict (key) do nothing;

insert into public.wardrobe_items (key, category, name, is_default, sort_order) values
    ('hair_bob', 'hair', 'Bob Cut', true, 0),
    ('hair_ponytail', 'hair', 'Ponytail', true, 1),
    ('hair_curly', 'hair', 'Curly', false, 2),
    ('hair_buzz', 'hair', 'Buzz Cut', true, 3),
    ('hair_braids', 'hair', 'Braids', false, 4),
    ('face_happy', 'face', 'Happy', true, 0),
    ('face_wink', 'face', 'Wink', true, 1),
    ('face_surprised', 'face', 'Surprised', false, 2),
    ('face_freckles', 'face', 'Freckles', false, 3),
    ('outfit_tshirt', 'outfit', 'T-Shirt & Shorts', true, 0),
    ('outfit_dress', 'outfit', 'Sundress', true, 1),
    ('outfit_overalls', 'outfit', 'Overalls', false, 2),
    ('outfit_hoodie', 'outfit', 'Hoodie & Joggers', false, 3),
    ('outfit_pjs', 'outfit', 'Pajamas', false, 4),
    ('acc_glasses', 'accessory', 'Round Glasses', false, 0),
    ('acc_bow', 'accessory', 'Hair Bow', false, 1),
    ('acc_cap', 'accessory', 'Baseball Cap', false, 2),
    ('acc_backpack', 'accessory', 'Backpack', false, 3),
    ('prop_sofa', 'prop', 'Sofa', true, 0),
    ('prop_bed', 'prop', 'Bed', true, 1),
    ('prop_table', 'prop', 'Table', true, 2),
    ('prop_plant', 'prop', 'Potted Plant', true, 3)
on conflict (key) do nothing;

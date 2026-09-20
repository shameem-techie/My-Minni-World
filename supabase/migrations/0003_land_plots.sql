-- Land Explorer: raw plots claimed with stars/dust, then developed with a structure
-- blueprint. Mirrors the location_unlocks/unlock_location pattern from 0001_init.sql —
-- best-effort sync only, same as the rest of this app's economy (see
-- src/services/progress.service.ts): plot/blueprint ids and their star/dust costs are
-- not validated server-side, only the fact that the player claimed/built is recorded.

create table if not exists public.land_plot_claims (
    owner_id uuid not null references public.profiles(id) on delete cascade,
    plot_id text not null,
    blueprint_id text,
    claimed_at timestamptz not null default now(),
    blueprint_deployed_at timestamptz,
    primary key (owner_id, plot_id)
);

alter table public.land_plot_claims enable row level security;

create policy "land_plot_claims: owner read" on public.land_plot_claims
    for select using (auth.uid() = owner_id);
-- No insert/update/delete policy: rows are only ever written by the SECURITY DEFINER
-- RPCs below, matching every other mutable table in this schema.

create or replace function public.claim_land_plot(p_plot_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.land_plot_claims (owner_id, plot_id)
    values (auth.uid(), p_plot_id)
    on conflict do nothing;
end;
$$;

create or replace function public.deploy_plot_blueprint(p_plot_id text, p_blueprint_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.land_plot_claims
    set blueprint_id = p_blueprint_id, blueprint_deployed_at = now()
    where owner_id = auth.uid() and plot_id = p_plot_id;

    if not found then
        raise exception 'Plot % not claimed by this owner', p_plot_id;
    end if;
end;
$$;

# My Minni World

A Toca Boca World-style open sandbox for kids — build a character, explore
themed locations, decorate and play at your own pace. See
[GAME_DESIGN.md](./GAME_DESIGN.md) for the concept, data model, and roadmap.

## Stack

Expo SDK 54 · React Navigation v6 · TypeScript · Supabase (Postgres + Auth)

Same conventions as this workspace's other Supabase-backed apps
(`Cards-and-Chaos`, `RummySekai`): path aliases via `babel-plugin-module-resolver`,
a `profiles` row created by an `auth.users` trigger, RLS on every table, and
`SECURITY DEFINER` RPCs for any write that needs to be trusted server-side.

## Getting started

```bash
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
npm start
```

## Project layout

```
src/
  components/ui/   Reusable UI (Button, …)
  config/          Supabase client
  constants/       Local seed data for locations/wardrobe (mirrors the DB seed)
  context/         AuthContext
  navigation/      RootNavigator, deep-link config
  screens/         onboarding/, creator/, world/, location/, settings/
  services/        auth.service.ts, world.service.ts (all Supabase reads/writes)
  theme/           Candy Sandbox color palette + typography
  types/           Shared TS types (Minni, LocationDef, WardrobeItem, …)
supabase/
  migrations/0001_init.sql   Full schema, RLS policies, RPCs, seed data
```

## Supabase project

Project ref and keys are in `.env` (not committed). The schema in
`supabase/migrations/0001_init.sql` is the source of truth — apply it with the
Supabase CLI (`supabase db push`) or the Supabase MCP tools.

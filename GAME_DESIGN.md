# My Minni World — Game Design

A free-play sandbox for kids, in the spirit of Toca Boca World: no scores, no fail
states, no timers. Players build a custom character ("Minni"), explore a map of
themed locations, and decorate/interact with each one at their own pace.

## Core loop (Cosmic Bubble build, 2026-09-18)

1. **Play Now** on the Welcome screen drops a new player straight into guest play
   (Supabase anonymous auth) — no sign-up wall.
2. **Cosmic Minni Maker** builds their Minni: hair, skin, face, space suit and
   "bubble gear" (bubble helmet, star antennae, …), assembled as paper-doll layers
   (`MinniAppearance`) so any combination renders. A dice button randomises everything.
3. **World Map** is the hub: three districts — *Starry Island City* and *Transit &
   Market Plaza* (each an isometric Stitch map with a bobbing pin per building) and
   *Star Studios* (four hidden playsets floating as bubbles). Six playsets are open
   from the start; the rest cost stars.
4. **Play Rooms** are the 17 Cosmic Bubble playsets. In each: tap glowing hotspots
   for a Minni reaction (+1 ✨), fire three quick actions, spawn props from the tray
   and drag them around the scene (saved per room), and tick off a three-step *Star
   Routine* to claim a badge (+25 ✨). First visit to any room pays +10 ✨.
5. **Star Shop** spends the stars: the *Cosmic Orb Gacha* (60 ✨ → a random pet that
   then follows Minni into every room; duplicates become 💎 Star Dust), a free *Daily
   Mystery Pod* (+50 ✨ every six hours), and packs that unlock whole districts.

Everything in 3–5 is local-first (`GameContext` → AsyncStorage per user) so it works
offline; unlocks and room state are mirrored to Supabase best-effort via the existing
`unlock_location` / `save_world_state` RPCs once `0002_cosmic_bubble.sql` is applied.

## Data model

See `supabase/migrations/0001_init.sql` for the full schema. Summary:

| Table | Purpose |
|---|---|
| `profiles` | One row per player, created by an `auth.users` trigger (`handle_new_user`) |
| `locations` | Public catalog of explorable rooms |
| `wardrobe_items` | Public catalog of hair/face/outfit/accessory/prop options |
| `minnis` | A player's characters (owner-scoped RLS) |
| `location_unlocks` / `owned_items` | What a player has unlocked — write-only via `SECURITY DEFINER` RPCs (`unlock_location`, `unlock_wardrobe_item`) so a client can never unlock content by writing the table directly |
| `world_saves` | Per-room decoration/prop-placement state, written via `save_world_state()` |

New sign-ups get a starter pack (`grant_starter_pack`) of default locations and
wardrobe items automatically.

## Progression

Toca Boca World sells additional locations as in-app purchases. For an MVP
without payments, the plan is:
- Locations/items unlock via simple play milestones (e.g. "visit Cozy Home 3
  times") rather than currency, tracked with a lightweight `events` table.
- `unlock_location` / `unlock_wardrobe_item` RPCs already exist and are ready
  to be called once unlock rules are decided — no schema change needed.
- IAP-based unlocking (RevenueCat + Apple/Google) can be layered on later by
  calling the same RPCs from a verified-purchase webhook instead of the client.

## Art direction

Flat, saturated, paper-cutout illustration style — big rounded shapes, no
gradients-on-gradients, warm "Candy Sandbox" palette (`src/theme/colors.ts`).
This is a 2D illustrated world, not a 3D one; Blender is available in this
workspace but isn't the right tool for character/prop art here (see the
Stitch design system + generated screens for the actual visual direction).

Character art is layered like paper dolls (`MinniAppearance`): a base body +
independently swappable hair/face/outfit/accessory sprites, so any
combination the player picks always renders correctly. Real character/prop
sprites (replacing the current placeholder colored shapes in
`CharacterCreatorScreen`) are the next major art task — see the "Minni
Sprite Sheet" Stitch screen for the target look.

## What's scaffolded vs. what's next (updated 2026-09-18, Cosmic Bubble build)

**Done:** project skeleton (Expo 54 + TS + Supabase), auth (guest + email),
full schema + RLS + starter-pack trigger, 17 real Stitch-art playsets across
3 districts, the Cosmic Minni Maker, drag-and-drop props *and* a draggable
Minni + pet (walk them anywhere in a room, position saved per room), tap
reactions on hotspots/actions/props/Minni/pet, star routines + badges, the
Star Shop (gacha, daily pod, packs), and an in-app "How to Play?" guide.

**Not yet built:**
- Multiple Minnis per account + a Minni switcher
- Sound design (expo-av is installed; no audio files yet)
- A wardrobe/shop UI for browsing individual hair/face/outfit items by name
  (the creator currently offers a fixed curated set per category)
- Server-side validation of star spends (a determined player could edit
  AsyncStorage directly — fine for a local kids' sandbox, not for a
  leaderboard/multiplayer feature if one is ever added)

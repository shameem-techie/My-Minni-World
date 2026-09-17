# My Minni World — Game Design

A free-play sandbox for kids, in the spirit of Toca Boca World: no scores, no fail
states, no timers. Players build a custom character ("Minni"), explore a map of
themed locations, and decorate/interact with each one at their own pace.

## Core loop

1. **Play Now** on the Welcome screen drops a new player straight into guest play
   (Supabase anonymous auth) — no sign-up wall.
2. **Character Creator** builds their first Minni: skin tone, hair style/color,
   face, outfit, and accessories, assembled as independent paper-doll layers
   (`MinniAppearance` in `src/types`) so any combination is valid.
3. **World Map** is the hub — a grid of location tiles (Cozy Home, Sunny Café,
   Pet Salon, Starlight School, Meadow Park, Candy Carnival). Two are unlocked
   by default; the rest unlock through play (see Progression below).
4. **Location** screens are the actual rooms: tap a prop for a reaction, drag
   props around, walk Minnis between rooms. Every change is autosaved per
   (player, location) via the `world_saves` table — same jsonb-blob-per-room
   approach Cards-and-Chaos uses for live game state, just persisted instead
   of realtime-synced.

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

## Progression (not yet implemented)

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

## What's scaffolded vs. what's next

**Done:** project skeleton (Expo 54 + TS + Supabase, mirroring Cards-and-Chaos's
conventions), auth (guest + email), full schema + RLS + starter-pack trigger,
navigation shell, World Map / Character Creator / Location screens wired to
real Supabase reads and writes.

**Not yet built:**
- Real character/prop artwork (currently placeholder colored shapes)
- Drag-and-drop prop placement (props render at saved coordinates but aren't
  yet draggable in `LocationScreen`)
- Tap-to-react animations on props
- A wardrobe/shop UI for browsing and unlocking items
- Multiple Minnis per account + a Minni switcher
- Sound design (Toca Boca leans heavily on charming SFX per interaction)

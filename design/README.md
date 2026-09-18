# Design — Cosmic Bubble & Star Soda

Art direction and screen mockups generated via Stitch. As of 2026-09-18 the app is built
entirely around the **"Cosmic Bubble Asset Stack & Integration Manifest"** — the earlier
"Candy Sandbox" mockups (`stitch-mockups/01–05`) are kept for reference only.

- **Stitch project:** [My Minni World](https://stitch.withgoogle.com/projects/4385641576800933315) (project id `4385641576800933315`)
- **Manifest screen:** "Cosmic Bubble Asset Stack & Integration Manifest (Updated with Logos)" (screen `9ddbb3c6…`) — a copy is in [`stitch-mockups/cosmic-bubble/MANIFEST.md`](./stitch-mockups/cosmic-bubble/MANIFEST.md). It lists every asset key, its recommended file name, and the design tokens.

## Asset stack → `assets/themes/cosmic_bubble/`

The manifest's directory layout is used verbatim. Every file is registered in
`src/assets/cosmicBubble.ts` (Metro needs a static `require()` per image).

| Manifest group | Files | Used by |
|---|---|---|
| `branding/` | iOS squircle icon, Android round icon, bubble planet + castle icons, 3 vector SVGs (wordmark, squircle badge, Android vector) | `assets/images/icon.png` / `adaptive-icon.png` / `splash-icon.png` are derived from the two 3D icons (see below). The wordmark's mascot emblem is ported to `CosmicMascot.tsx`; the 3D title text is `CosmicWordmark.tsx`. |
| `maps/` | `cosmic_island_city_map.png`, `transit_market_district_map.png` | `WorldMapScreen` — the two map districts with bobbing pins over each building |
| `playsets/` | 17 × 1200×896 cutaway interiors | `PlayRoomScreen` — one room per playset, hotspots + spawned props layered on top |
| `characters/` | `alien_bubble_kid.png`, `alien_pet_creature.png` (+ circle-masked copies) | Welcome hero cast, the "Sparkle Star Blob" legendary gacha pet |

**Format gotcha:** every raster Stitch serves is JPEG data even though the manifest (and the
`screenshot` download) call it `.png`. Android's AAPT rejects a JPEG named `.png` at
build time, so the stack is stored as `.jpg`; only locally generated alpha cutouts are PNG.

**Icons:** the Stitch icon renders sit on a light-grey backdrop with a drop shadow. The
squircle / circle were located by saturation (grey shadow pixels excluded) and the iOS
one was made full-bleed by extending its edge colours into the corners — iOS applies its
own mask, so a pre-rounded PNG would show grey corners. The Android adaptive foreground
is the round render scaled to 80% on a transparent canvas over a magenta→violet→cyan
`adaptive-icon-bg.png`, so every launcher mask shape looks intentional.

**Fetching Stitch art at usable resolution:** `screenshot.downloadUrl` serves a small
thumbnail unless you append `=s2000`. The pull script that downloaded this whole stack
(all 63 screens, HTML + 2000px screenshots, in parallel) is a 30-line Node script; the
approach is the same as RummySekai's `scripts/pull-stitch-stack.mjs`.

## Screens built from the Stitch UI mockups (`stitch-mockups/cosmic-bubble/`)

| Stitch screen | App screen |
|---|---|
| Welcome — Cosmic Bubble (`0aa32da1`) | `WelcomeScreen` — bubblegum sky gradient, floating soda bubbles, 3D wordmark, bobbing hero cast, PLAY NOW pill |
| Cosmic Island City — Interactive World Map (`127021d0`) + Transit & Market District (`64da6f5e`) | `WorldMapScreen` — explorer header, district switcher, map with pins, zone cards, unlock sheet |
| Cosmic Minni Maker — Creator (`bf8eb28c`) | `CharacterCreatorScreen` — stage + platform, Rotate/Random/Pose, category pills, swatches |
| Sweet Lilac Bungalow — Play Room (`ce248f69`) and the other 16 play rooms | `PlayRoomScreen` — scene hotspots, Minni + pet, draggable props, actions, star routine, props tray |
| Mystery Orb & Star Shop (`f245f7c0`) | `StarShopScreen` — orb gacha, reveal card, daily pod, pet house, packs |

Design tokens (`#F72585` magenta, `#9D4EDD` violet, `#4CC9F0` cyan, `#FFD166` gold,
`#FEF7FF`/`#FAF0FF` surfaces, Rubik headline + Nunito Sans body, 24–32px clay radii)
live in `src/theme/colors.ts` and `src/theme/typography.ts`.

## Android rendering gotcha (still applies): bitmap Image + absolutely-positioned siblings

On the physical Samsung Galaxy XCover Pro 2 (`SM-G736B`) an earlier build showed a
persistent ghosting artifact when an `Image` was overlapped by an absolutely-positioned
label inside a clipped, rounded tile. The map and play-room scenes in this build *do*
overlap images with pins/hotspots, but the image is isolated in its own clipped frame
(`sceneFrame` / `mapFrame`, `overflow: 'hidden'` + radius) and the interactive layer is a
separate sibling `View` on top — retest on the device after any change to that layering.

## Why not Blender

Toca Boca World's art is flat/claymorphic 2D illustration; the Stitch stack already
provides finished 3D-look renders. Blender would only come into play for true 3D
elements (e.g. a rotating 3D icon render).

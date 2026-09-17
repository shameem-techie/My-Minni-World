# Design — Candy Sandbox

Art direction and screen mockups generated via Stitch, establishing the Toca
Boca World-style visual language for My Minni World.

- **Stitch project:** [My Minni World](https://stitch.withgoogle.com/projects/4385641576800933315) (project id `4385641576800933315`)
- **Design system:** "Candy Sandbox" (asset id `assets/14496597097888735785`) — Quicksand-style rounded headline font, Nunito Sans body font, `ROUND_TWELVE` corner radius, vibrant color variant seeded from coral `#FF7A59` / sky blue `#4FC3E8` / sunny yellow `#FFCB3D`. Full art-direction brief is in the design system's `designMd` (also summarized in [GAME_DESIGN.md](../GAME_DESIGN.md)).

## Mockups (`stitch-mockups/`)

| File | Screen | Maps to |
|---|---|---|
| `01-welcome.png` | Launch screen — app name, tagline, "Play Now" | `src/screens/onboarding/WelcomeScreen.tsx` |
| `02-character-creator.png` | Minni paper-doll builder — skin/hair/outfit swatches | `src/screens/creator/CharacterCreatorScreen.tsx` |
| `03-world-map.png` | Location grid hub, locked/unlocked tiles | `src/screens/world/WorldMapScreen.tsx` |
| `04-sunny-cafe.png` | Sample room interior with a draggable-props tray | `src/screens/location/LocationScreen.tsx` |

These are **visual direction references**, not production assets — they're
full HTML/CSS mockups (Stitch also generated downloadable HTML for each,
linked from the project) rather than exportable sprite/vector art. The actual
implementation screens currently render simplified placeholder shapes (see
`CharacterCreatorScreen`'s colored circles, `LocationScreen`'s cube icons)
until real character/prop artwork is produced in this style — e.g. via
Higgsfield image generation or a commissioned/licensed illustration pack,
using these mockups and `GAME_DESIGN.md`'s art-direction brief as the spec.

## Why not Blender

Toca Boca World's actual art is flat 2D paper-cutout illustration, not 3D —
matched here by the "Candy Sandbox" direction above. Blender is available in
this workspace but isn't the right tool for character/prop sprites in this
style; it'd only come into play if the game later added true 3D elements
(e.g. a 3D app icon render or a diorama-style promo shot).

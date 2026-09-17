# Design — Candy Sandbox

Art direction and screen mockups generated via Stitch, establishing the Toca
Boca World-style visual language for My Minni World.

- **Stitch project:** [My Minni World](https://stitch.withgoogle.com/projects/4385641576800933315) (project id `4385641576800933315`)
- **Design system:** "Candy Sandbox" (asset id `assets/14496597097888735785`) — Quicksand-style rounded headline font, Nunito Sans body font, `ROUND_TWELVE` corner radius, vibrant color variant seeded from coral `#FF7A59` / sky blue `#4FC3E8` / sunny yellow `#FFCB3D`. Full art-direction brief is in the design system's `designMd` (also summarized in [GAME_DESIGN.md](../GAME_DESIGN.md)).

## Mockups (`stitch-mockups/`)

| File | Screen | Status |
|---|---|---|
| `01-welcome.png` | Launch screen | Reference only — the real screen is code-built (`WelcomeScreen.tsx`), not an image |
| `02-character-creator.png` | Minni paper-doll builder | Reference only — see note on character art below |
| `03-world-map.png` | Location grid hub | **In use** — all 6 location icons cropped into `assets/images/locations/*.png`, rendered in `WorldMapScreen.tsx` |
| `04-sunny-cafe-playroom.png` | Sunny Café interior (variant 1) | **In use** — wall/window section cropped into `assets/images/rooms/sunny_cafe_wall.png`, rendered as the room background in `LocationScreen.tsx` |
| `05-sunny-cafe-interior.png` | Sunny Café interior (variant 2) | Reference only |

**Fetching these at usable resolution:** Stitch's `screenshot.downloadUrl` is a
`lh3.googleusercontent.com` link that serves a small default thumbnail
(~180×512px) unless you append a size suffix — `?...=s2000` returns the image
at up to 2000px on the long edge, which is what the files in this folder now
are. This tripped us up once already: the first pass at these mockups was
downloaded at default (thumbnail) size, decided to be too blurry to crop
usable assets from, and the app shipped with hand-built SVG icons instead.
Re-fetching with `=s2000` fixed that — don't repeat the mistake.

## What's actually wired into the app vs. still a placeholder

- **World Map tiles**: real cropped Stitch art (`assets/images/locations/`).
- **Sunny Café room background**: real cropped Stitch art (`assets/images/rooms/`). Other locations (Cozy Home, etc.) don't have a matching interior mockup yet, so they still use a plain background color.
- **Character (`MinniCharacter.tsx`) and room props (`PropIcon.tsx`)**: intentionally **not** replaced with cropped Stitch images. Those need to change dynamically with the player's color/style choices (skin tone, hair color, outfit color); a flattened PNG can't do that. They're hand-built `react-native-svg` vector components instead — free, crisp at any size, and easy to extend with new variants as the wardrobe grows. Revisit this if/when a proper layered-asset export pipeline exists (Stitch doesn't do per-layer exports; that'd need a different tool).
- Real AI-generated art (Higgsfield or similar) is still an option for a future, more polished pass — it was skipped so far because the connected Higgsfield account is at 0 credits.

## Why not Blender

Toca Boca World's actual art is flat 2D paper-cutout illustration, not 3D —
matched here by the "Candy Sandbox" direction above. Blender is available in
this workspace but isn't the right tool for character/prop sprites in this
style; it'd only come into play if the game later added true 3D elements
(e.g. a 3D app icon render or a diorama-style promo shot).

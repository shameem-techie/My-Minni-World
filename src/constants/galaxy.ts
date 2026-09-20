import type { GalaxySectorDef } from '../types';

// The top-level "Cosmic Bubble Galaxy" overview — one pin per orbit sector, positioned
// as x/y percent over the native-portrait galaxy_aerial_world_map art (768×1376, Stitch
// screen 719015af, "9:16 Portrait — World-Map-V4"). Coordinates were measured against a
// 10%-gridline overlay drawn on the actual pulled art (not eyeballed freehand), same
// precision every other MapPin in this app should really get.
//
// Space Carnival and Candy Nebulae are both genuinely labeled "Orbit Sector 05" in the
// source art itself (not a data-entry mistake here) — the art's own duplicate numbering,
// left as-is since we don't control the baked-in labels.
//
// Sector 10 ("Uncharted Asteroids") was added to the art in a later edit pass. Sector 03
// still isn't on the render — no pin for it yet; add one once art exists to anchor to.
export const GALAXY_SECTORS: GalaxySectorDef[] = [
    { key: 'hub', number: 1, name: 'Cosmic Bubble Hub', emoji: '⭐', x: 48, y: 48, tone: 'magenta', kind: 'hub' },

    // Sectors with real, playable content.
    { key: 'sparkle_jungle', number: 2, name: 'Sparkle Jungle', emoji: '🌳', x: 28, y: 44, tone: 'mint', kind: 'playset', playsetKey: 'sparkle_jungle' },
    { key: 'star_pet_sanctuary', number: 11, name: 'Star Pet Sanctuary', emoji: '🐾', x: 14, y: 72, tone: 'lilac', kind: 'playset', playsetKey: 'star_pet_sanctuary' },
    { key: 'supernova_sports_dome', number: 12, name: 'Supernova Sports Dome', emoji: '🏟️', x: 88, y: 72, tone: 'aqua', kind: 'playset', playsetKey: 'supernova_sports_dome' },
    { key: 'galaxy_music_amphitheater', number: 13, name: 'Galaxy Music Amphitheater', emoji: '🎶', x: 77, y: 24, tone: 'grape', kind: 'playset', playsetKey: 'galaxy_music_amphitheater' },
    { key: 'aurora_floating_bazaar', number: 14, name: 'Aurora Floating Bazaar', emoji: '🛍️', x: 9, y: 29, tone: 'gold', kind: 'playset', playsetKey: 'aurora_floating_bazaar' },
    { key: 'cyberbot_speed_racetrack', number: 15, name: 'Cyberbot Speed Racetrack', emoji: '🏎️', x: 83, y: 43, tone: 'teal', kind: 'playset', playsetKey: 'cyberbot_speed_racetrack' },
    { key: 'secret_nebula_mythic_shrine', number: 16, name: 'Secret Nebula Mythic Shrine', emoji: '🔮', x: 33, y: 24, tone: 'snow', kind: 'playset', playsetKey: 'secret_nebula_mythic_shrine' },
    { key: 'astronaut_academy', number: 4, name: 'Astronaut Academy', emoji: '🧑‍🚀', x: 61, y: 43, tone: 'violet', kind: 'playset', playsetKey: 'astronaut_academy' },
    { key: 'space_carnival', number: 5, name: 'Space Carnival', emoji: '🎡', x: 62, y: 35, tone: 'gold', kind: 'playset', playsetKey: 'space_carnival' },
    { key: 'candy_nebulae', number: 5, name: 'Candy Nebulae', emoji: '🍭', x: 73, y: 52, tone: 'pink', kind: 'playset', playsetKey: 'candy_nebulae' },
    { key: 'ocean_reef', number: 6, name: 'Ocean Reef', emoji: '🐠', x: 61, y: 65, tone: 'aqua', kind: 'playset', playsetKey: 'ocean_reef' },
    { key: 'robot_factory', number: 7, name: 'Robot Factory', emoji: '🤖', x: 63, y: 72, tone: 'grape', kind: 'playset', playsetKey: 'robot_factory' },
    { key: 'crystal_caves', number: 9, name: 'Crystal Caves', emoji: '💎', x: 10, y: 52, tone: 'grape', kind: 'playset', playsetKey: 'crystal_caves' },
    { key: 'uncharted_asteroids', number: 10, name: 'Uncharted Asteroids', emoji: '☄️', x: 50, y: 79, tone: 'teal', kind: 'playset', playsetKey: 'uncharted_asteroids' },
];

export const GALAXY_SECTORS_BY_KEY: Record<string, GalaxySectorDef> = Object.fromEntries(GALAXY_SECTORS.map((s) => [s.key, s]));

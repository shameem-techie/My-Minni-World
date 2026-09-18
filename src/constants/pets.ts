import type { PetDef } from '../types';

// The Cosmic Orb Gacha pool. `sparkle_star_blob` is the Stitch "alien pet creature"
// render; the rest are emoji pets so the pool has enough variety to be worth pulling.
export const PETS: PetDef[] = [
    { id: 'sparkle_star_blob', name: 'Sparkle Star Blob', emoji: '⭐', blurb: 'A bubbly stellar companion that leaves a trail of fizzy star dust wherever it bounces!', rarity: 'legendary' },
    { id: 'moon_bunny', name: 'Moon Bunny', emoji: '🐰', blurb: 'Hops in zero gravity and naps in crater cushions.', rarity: 'rare' },
    { id: 'nebula_kitten', name: 'Nebula Kitten', emoji: '🐱', blurb: 'Purrs in rainbow colours when you tap it.', rarity: 'rare' },
    { id: 'jelly_octo', name: 'Jelly Octo', emoji: '🐙', blurb: 'Eight wiggly arms for eight high-fives.', rarity: 'common' },
    { id: 'soda_pup', name: 'Soda Pup', emoji: '🐶', blurb: 'Fizzes with joy and chases comet balls.', rarity: 'common' },
    { id: 'galaxy_duck', name: 'Galaxy Duck', emoji: '🦆', blurb: 'Quacks in Morse code. Nobody knows what it says.', rarity: 'common' },
    { id: 'comet_fox', name: 'Comet Fox', emoji: '🦊', blurb: 'Leaves glitter footprints across the sky.', rarity: 'rare' },
    { id: 'planet_turtle', name: 'Planet Turtle', emoji: '🐢', blurb: 'Carries a tiny garden on its shell.', rarity: 'common' },
    { id: 'bubble_frog', name: 'Bubble Frog', emoji: '🐸', blurb: 'Blows soap bubbles instead of ribbits.', rarity: 'common' },
    { id: 'star_unicorn', name: 'Star Unicorn', emoji: '🦄', blurb: 'Its horn glows when a routine is finished.', rarity: 'legendary' },
];

export const GACHA_COST = 60;
export const DAILY_POD_REWARD = 50;
export const ROUTINE_BADGE_REWARD = 25;
export const HOTSPOT_REWARD = 1;
export const SPAWN_REWARD = 1;
export const FIRST_VISIT_REWARD = 10;
export const DUPLICATE_DUST = 10;

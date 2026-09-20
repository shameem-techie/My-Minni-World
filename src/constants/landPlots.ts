import type { LandPlotDef, StructureBlueprintDef } from '../types';

// Land Explorer: raw, unbuilt plots the player claims with stars or dust, then
// develops with a structure blueprint. Adapted from the Stitch "Next-Level" manifest
// (design pass 2026-09-19) — the manifest's example numbers (level 5 architect,
// 1450/85 wallet, plots gated at level 4/5/5/6) were just illustrative placeholder
// game-state, not a tuned curve, and would have hard-locked a fresh player out of
// ever claiming a first plot (nothing else in the app grants "Architect XP", so a
// level-4 gate on the cheapest plot is unreachable from zero). Redesigned here so
// the cheapest plot needs no level at all, and each subsequent tier is reachable by
// playing the feature itself (claim → XP → level → next tier).
//
// Currency: this reuses the existing `dust` field from progress.service.ts (shown
// with a 💎 in the UI, see StatBar.tsx) as "diamonds" — the manifest's own naming for
// the second currency was inconsistent ("Diamonds" vs "Gems" in different mockups),
// and the app already has a 💎 currency, so no third ProgressState field was added.

export const CLAIM_PLOT_XP = 80;
export const DEPLOY_BLUEPRINT_XP = 150;

// Cumulative XP needed to REACH each level; index 0 = level 1 (always 0).
export const ARCHITECT_LEVEL_THRESHOLDS = [0, 150, 400, 800, 1300, 1950] as const;

export function architectLevelForXp(xp: number): number {
    let level = 1;
    for (let i = 1; i < ARCHITECT_LEVEL_THRESHOLDS.length; i++) {
        if (xp >= ARCHITECT_LEVEL_THRESHOLDS[i]) level = i + 1;
    }
    return level;
}

export function xpForNextLevel(xp: number): { level: number; xpIntoLevel: number; xpToNext: number | null } {
    const level = architectLevelForXp(xp);
    const floor = ARCHITECT_LEVEL_THRESHOLDS[level - 1];
    const nextThreshold = ARCHITECT_LEVEL_THRESHOLDS[level];
    if (nextThreshold === undefined) return { level, xpIntoLevel: xp - floor, xpToNext: null };
    return { level, xpIntoLevel: xp - floor, xpToNext: nextThreshold - xp };
}

export const LAND_PLOTS: LandPlotDef[] = [
    {
        id: 'plot_801',
        name: 'Starry Cloud Plateau',
        subtitle: 'A breezy starter parcel drifting just outside the city.',
        plotNumber: '#801',
        costStars: 350,
        costDust: 35,
        requiredLevel: 1,
        image: null,
        tone: 'aqua',
        emoji: '☁️',
        perk: '+10% Build Speed · Breezy Plot',
    },
    {
        id: 'plot_802',
        name: 'Floating Starlight Crater & Nebula Plateau',
        subtitle: 'A glowing crater plot with room for a cosmic cottage.',
        plotNumber: '#802',
        costStars: 500,
        costDust: 50,
        requiredLevel: 2,
        // NOT 'plot_starlight_crater_raw' — that Stitch render has a "Toca Life World"
        // logo baked into the pixels (real trademark risk, not croppable out cleanly).
        // See project memory for the full finding; needs a clean re-render before any
        // plot in this feature gets real hero art.
        image: null,
        tone: 'violet',
        emoji: '🌠',
        perk: '+15% Boost · Sunny Land',
    },
    {
        id: 'plot_803',
        name: 'Bubble Lagoon Coral Archipelago',
        subtitle: 'A tropical soda-water archipelago with its own dock.',
        plotNumber: '#803',
        costStars: 750,
        costDust: 70,
        requiredLevel: 2,
        // Same issue as plot_802 — see note above. Also branded, not used.
        image: null,
        tone: 'teal',
        emoji: '🌊',
        perk: 'Ocean View · Extra Dock Slot',
    },
    {
        id: 'plot_804',
        name: 'Nebula Crystal Quarry',
        subtitle: 'A rare crystal-rich quarry for master architects.',
        plotNumber: '#804',
        costStars: 1200,
        costDust: 110,
        requiredLevel: 3,
        image: null,
        tone: 'grape',
        emoji: '💠',
        perk: 'Rare Crystal Yield · +20% Sparkle',
    },
];

export const LAND_PLOTS_BY_ID: Record<string, LandPlotDef> = Object.fromEntries(LAND_PLOTS.map((p) => [p.id, p]));

export const STRUCTURE_BLUEPRINTS: StructureBlueprintDef[] = [
    {
        id: 'starlight_observatory',
        name: 'Starlight Observatory Cottage',
        category: 'Cozy Homes',
        costStars: 400,
        costDust: 40,
        perks: ['2 Bedrooms', 'Brass Telescope Tower', 'Gilded Star Balcony'],
        emoji: '🔭',
        tone: 'lilac',
    },
    {
        id: 'bubble_tea_cafe',
        name: 'Cosmic Bubble Tea & Donut Café',
        category: 'Shops & Cafes',
        costStars: 600,
        costDust: 55,
        perks: ['Boba Pearl Fountain', 'Macaron Display', 'Outdoor Cloud Terrace'],
        emoji: '🧋',
        tone: 'pink',
    },
    {
        id: 'mega_rollercoaster',
        name: 'Mega Star Rollercoaster & Mini Theme Park',
        category: 'Attractions',
        costStars: 850,
        costDust: 80,
        perks: ['Loop-de-loop Track', 'Ferris Wheel Pod', 'Cotton Candy Stall'],
        emoji: '🎢',
        tone: 'magenta',
    },
    {
        id: 'cyber_arcade',
        name: 'Cyber Nebula Arcade & Robot Workshop',
        category: 'Hi-Tech',
        costStars: 720,
        costDust: 65,
        perks: ['Dance Dance Pods', 'Claw Machines', 'Hologram Minni Bot Station'],
        emoji: '🕹️',
        tone: 'grape',
    },
];

export const STRUCTURE_BLUEPRINTS_BY_ID: Record<string, StructureBlueprintDef> = Object.fromEntries(
    STRUCTURE_BLUEPRINTS.map((b) => [b.id, b]),
);

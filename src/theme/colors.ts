// "Cosmic Bubble & Star Soda" palette — straight from the Stitch asset-stack manifest
// (design/stitch-mockups/cosmic-bubble/MANIFEST.md): neon magenta, star-glow violet,
// nebula cyan, star-honey yellow over light celestial pastels. Tactile claymorphism:
// pill/clay radii (24–32), flat "extruded" bottom edges, jelly-glass highlights.
// No dark mode — this is a kids' app and always renders bright.

export const COSMIC = {
    magenta: '#F72585',
    magentaLight: '#FF4D9E',
    magentaDark: '#B5005D',
    magentaDeep: '#9E004B',

    violet: '#9D4EDD',
    grape: '#5A189A',
    grapeLight: '#7B2CBF',
    grapeDeep: '#3A0CA3',
    ink: '#270057',

    aqua: '#4CC9F0',
    aquaDark: '#0096C7',
    aquaDeep: '#006780',
    aquaPale: '#CFF4FF',

    gold: '#FFD166',
    goldDark: '#E0A300',
    goldDeep: '#936F03',
    goldPale: '#FFF3B0',

    mint: '#7CF0C4',
    mintDark: '#1E9E63',
    mintPale: '#DDFBEF',

    pink: '#FF70A6',
    pinkPale: '#FFE0EE',
    lilac: '#E9D5FF',
    lilacPale: '#F5EAFF',

    surface: '#FEF7FF',
    surfaceLow: '#FAF0FF',
    surfaceContainer: '#F5EAFF',
    surfaceHigh: '#F0E3FF',
    white: '#FFFFFF',

    onSurface: '#270057',
    onSurfaceVariant: '#5A3F47',
    muted: '#9A86B8',
} as const;

// Welcome-screen sky: bubblegum pink at the top fading through lilac to a soft sky blue.
export const GRADIENT_SKY = ['#F9C4E6', '#F1D6F7', '#D6E7FD'] as const;
export const GRADIENT_MAGENTA = ['#FF4D9E', '#F72585', '#D9046C'] as const;
export const GRADIENT_NEBULA = ['#4CC9F0', '#7209B7', '#F72585'] as const;
export const GRADIENT_SPACE = ['#2B0A5E', '#4A1A8A', '#7B2CBF'] as const;
export const GRADIENT_LILAC_CARD = ['#F7EEFF', '#EBDCFF'] as const;

// Clay tone pairs: a `base` fill, a flat `shadow` bottom edge (the fake 3D extrusion),
// plus text colours that read on top of them.
export const CLAY = {
    magenta: { base: '#F72585', shadow: '#9E004B', text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)' },
    violet: { base: '#9D4EDD', shadow: '#5A189A', text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)' },
    grape: { base: '#7B2CBF', shadow: '#3A0CA3', text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)' },
    aqua: { base: '#4CC9F0', shadow: '#0096C7', text: '#03045E', sub: '#0A5A73' },
    teal: { base: '#0096C7', shadow: '#006780', text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)' },
    gold: { base: '#FFD166', shadow: '#E0A300', text: '#5A3A00', sub: '#8A6E20' },
    mint: { base: '#7CF0C4', shadow: '#1E9E63', text: '#0B4D2C', sub: '#3C7A5C' },
    lilac: { base: '#F0E3FF', shadow: '#C9A7F5', text: '#270057', sub: '#7A5FA0' },
    snow: { base: '#FFFFFF', shadow: '#E4D4FF', text: '#270057', sub: '#7A5FA0' },
    pink: { base: '#FFD6E8', shadow: '#F49AC1', text: '#B5005D', sub: '#C2557F' },
} as const;

export type ClayTone = keyof typeof CLAY;

// Character creator palettes — small, bright, mix-and-match.
export const SKIN_TONES = ['#FFE0BD', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5C3A21', '#B8F0D8', '#D9C6FF'] as const;
export const HAIR_COLORS = ['#2B1B12', '#6B3F1D', '#C68642', '#FFD166', '#F72585', '#4CC9F0', '#7CF0C4', '#9D4EDD'] as const;
export const OUTFIT_COLORS = ['#F72585', '#4CC9F0', '#FFD166', '#9D4EDD', '#7CF0C4', '#FF70A6', '#FFFFFF', '#3A0CA3'] as const;

export const COLORS = {
    background: COSMIC.surface,
    backgroundCard: COSMIC.white,
    backgroundDark: COSMIC.ink,
    surface: COSMIC.surfaceContainer,
    surfaceHigh: COSMIC.surfaceHigh,

    primary: COSMIC.magenta,
    primaryLight: COSMIC.magentaLight,
    primaryDark: COSMIC.magentaDark,
    accent: COSMIC.aqua,
    gold: COSMIC.gold,

    success: '#22C55E',
    successLight: '#DCF5E7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',

    text: {
        primary: COSMIC.onSurface,
        secondary: COSMIC.onSurfaceVariant,
        muted: COSMIC.muted,
        inverse: COSMIC.white,
        magenta: COSMIC.magentaDark,
        onDarkSecondary: 'rgba(255,255,255,0.75)',
    },

    border: '#E9D8FF',
    borderStrong: '#D4B8FF',
    shadow: 'rgba(90, 24, 154, 0.18)',
    overlay: 'rgba(39, 0, 87, 0.55)',

    glass: 'rgba(255,255,255,0.6)',
    glassBorder: 'rgba(255,255,255,0.8)',
    glassStrong: 'rgba(255,255,255,0.8)',
};

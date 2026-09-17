// "Candy Sandbox" palette — warm, saturated, paper-cutout playfulness in the spirit of
// Toca Boca World: cream/sand backgrounds, candy-bright accents, soft rounded clay tiles.
// No dark mode — this app targets kids and always renders in bright daylight colors.

export const GRADIENT_SUNSET = ['#FFE1A8', '#FFC5A3', '#FFA3C0'] as const;

// "Clay" tactile tone pairs, same shape as Cards-and-Chaos's CLAY palette: a `base` fill,
// a `shadow` used as a flat bottom border to fake a sculpted/extruded edge, plus text pairs.
export const CLAY = {
    coral: { base: '#FF7A59', shadow: '#C2431F', text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)' },
    coralPale: { base: '#FFDCCF', shadow: '#C2431F', text: '#8A3010', sub: '#B0603F' },
    sky: { base: '#4FC3E8', shadow: '#0E7FA3', text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)' },
    skyPale: { base: '#CFF0FA', shadow: '#0E7FA3', text: '#0A5A73', sub: '#3E8398' },
    sun: { base: '#FFCB3D', shadow: '#C4930A', text: '#5A4200', sub: '#8A6E20' },
    grape: { base: '#B368E0', shadow: '#7A3AA8', text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)' },
    mint: { base: '#6FDCA8', shadow: '#1E9E63', text: '#0B4D2C', sub: '#3C7A5C' },
    lilac: { base: '#F1E4FF', shadow: '#CBA8EE', text: '#4B2E70', sub: '#7A5FA0' },
    cream: { base: '#FFF8EC', shadow: '#F0DCBB', text: '#5A4426', sub: '#8A7550' },
} as const;

export type ClayTone = keyof typeof CLAY;

// Fixed set of skin tones, hair colors, and outfit accent colors offered in the
// character creator — deliberately small, bright, and mix-and-match (paper-doll layers).
export const SKIN_TONES = ['#FFE0BD', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5C3A21'] as const;
export const HAIR_COLORS = ['#2B1B12', '#6B3F1D', '#C68642', '#E8C468', '#E85D75', '#5D8FE8', '#8FE85D', '#B368E0'] as const;
export const OUTFIT_COLORS = ['#FF7A59', '#4FC3E8', '#FFCB3D', '#B368E0', '#6FDCA8', '#F06292', '#FFFFFF', '#4B2E70'] as const;

export const COLORS = {
    // App backgrounds
    background: '#FFF8EC',
    backgroundCard: '#FFFFFF',
    backgroundDark: '#4B2E70',
    surface: '#FFF1D9',

    // Primary brand: sunny coral
    primary: '#FF7A59',
    primaryLight: '#FF9B7F',
    primaryDark: '#C2431F',

    // Accent: sky blue
    accent: '#4FC3E8',

    // Semantic
    success: '#22C55E',
    successLight: '#DCF5E7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#4FC3E8',

    // Text
    text: {
        primary: '#4B2E1A',
        secondary: '#8A6E4E',
        muted: '#B8A582',
        inverse: '#FFFFFF',
        onCard: '#FFFFFF',
        onDarkSecondary: 'rgba(255,255,255,0.72)',
        onDarkMuted: 'rgba(255,255,255,0.50)',
    },

    // UI
    border: '#F0DCBB',
    borderDark: '#E0BE8A',
    shadow: 'rgba(194, 67, 31, 0.15)',
    overlay: 'rgba(75, 46, 26, 0.55)',

    // "Frosted" surfaces for cards/rows/inputs over photos or gradients
    glass: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(255,255,255,0.7)',
    glassStrong: 'rgba(255,255,255,0.75)',
};

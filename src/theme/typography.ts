// Rubik for headlines / UI chrome (chubby, rounded — the Stitch "Cosmic Bubble" screens
// set `font-headline: Rubik`), Nunito Sans for body copy. Fonts are loaded in App.tsx
// but rendering never waits on them: a missing family just falls back to the system font.
export const TYPOGRAPHY = {
    fontFamily: 'NunitoSans_400Regular',
    fontFamilySemiBold: 'NunitoSans_600SemiBold',
    fontFamilyBold: 'NunitoSans_700Bold',
    fontFamilyExtraBold: 'NunitoSans_800ExtraBold',

    fontFamilyDisplay: 'Rubik_700Bold',
    fontFamilyDisplayExtraBold: 'Rubik_800ExtraBold',
    fontFamilyDisplayBlack: 'Rubik_900Black',

    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,

    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
    '5xl': 44,
};

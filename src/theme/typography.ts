export const TYPOGRAPHY = {
    // Baloo 2 for headers/UI chrome (rounded, playful — matches the clay-tile look),
    // Nunito for body copy (friendly but more legible at small sizes).
    fontFamily: 'Nunito_400Regular',
    fontFamilyBold: 'Nunito_700Bold',
    fontFamilySemiBold: 'Nunito_600SemiBold',

    fontFamilyDisplay: 'Baloo2_700Bold',
    fontFamilyDisplayExtraBold: 'Baloo2_800ExtraBold',

    light: '300' as const,
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
    '5xl': 42,
};

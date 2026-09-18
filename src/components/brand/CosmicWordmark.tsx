import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COSMIC, TYPOGRAPHY } from '../../theme';

// "MY MINNI / WORLD" title with the layered 3D text-shadow from the Stitch Welcome screen
// (.cosmic-title-3d / .soda-gold-3d). React Native only supports one text shadow, so the
// extrusion is faked by stacking three copies of each word offset downward.
function Extruded({ text, color, layers, size }: { text: string; color: string; layers: string[]; size: number }) {
    return (
        <View>
            {layers.map((c, i) => (
                <Text
                    key={i}
                    style={[styles.word, { fontSize: size, color: c, position: 'absolute', top: (layers.length - i) * 3 }]}
                >
                    {text}
                </Text>
            ))}
            <Text style={[styles.word, { fontSize: size, color }]}>{text}</Text>
        </View>
    );
}

export function CosmicWordmark({ scale = 1 }: { scale?: number }) {
    return (
        <View style={styles.wrap}>
            <Extruded text="MY MINNI" color="#FFFFFF" layers={['rgba(90,24,154,0.35)', COSMIC.grapeLight, COSMIC.magentaDark]} size={48 * scale} />
            <Extruded text="WORLD" color={COSMIC.gold} layers={['rgba(147,111,3,0.35)', COSMIC.goldDeep, '#D49000']} size={56 * scale} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: 'center' },
    word: {
        fontFamily: TYPOGRAPHY.fontFamilyDisplayBlack,
        letterSpacing: 1.5,
        textAlign: 'center',
        includeFontPadding: false,
        lineHeight: undefined,
    },
});

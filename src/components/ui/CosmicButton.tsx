import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bouncy } from '../fx/Bouncy';
import { CLAY, GRADIENT_MAGENTA, TYPOGRAPHY, type ClayTone } from '../../theme';

interface CosmicButtonProps {
    label: string;
    onPress: () => void;
    tone?: ClayTone;
    size?: 'sm' | 'md' | 'lg';
    leading?: string; // emoji
    trailing?: string;
    disabled?: boolean;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
}

// The ".bubble-btn": a pill with a flat coloured bottom edge (the clay extrusion), a
// glossy top highlight, and a springy squish on press. Magenta buttons get the gradient
// fill from the mockup; other tones are flat clay.
export function CosmicButton({ label, onPress, tone = 'magenta', size = 'md', leading, trailing, disabled, loading, style }: CosmicButtonProps) {
    const colors = CLAY[tone];
    const padV = size === 'lg' ? 18 : size === 'sm' ? 8 : 13;
    const padH = size === 'lg' ? 28 : size === 'sm' ? 16 : 22;
    const fontSize = size === 'lg' ? TYPOGRAPHY['2xl'] : size === 'sm' ? TYPOGRAPHY.sm : TYPOGRAPHY.lg;

    return (
        <Bouncy onPress={onPress} disabled={disabled || loading} style={[{ opacity: disabled ? 0.55 : 1 }, style]} scaleTo={0.95}>
            <View style={[styles.shell, { backgroundColor: colors.shadow, borderRadius: 999 }]}>
                <View style={[styles.face, { backgroundColor: colors.base, paddingVertical: padV, paddingHorizontal: padH }]}>
                    {tone === 'magenta' && (
                        <LinearGradient
                            colors={GRADIENT_MAGENTA}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]}
                        />
                    )}
                    <View style={styles.gloss} />
                    {loading ? (
                        <ActivityIndicator color={colors.text} />
                    ) : (
                        <View style={styles.row}>
                            {leading ? <Text style={[styles.emoji, { fontSize: fontSize + 2 }]}>{leading}</Text> : null}
                            {/* numberOfLines+adjustsFontSizeToFit rather than letting long labels
                                wrap: a wrapped label makes this button taller than its neighbours
                                in the same row (e.g. "Character Maker" next to "My Town"), which
                                reads as a broken layout. Shrinking to fit keeps every button in a
                                row the same height instead. */}
                            <Text
                                style={[styles.label, { color: colors.text, fontSize }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.72}
                            >
                                {label}
                            </Text>
                            {trailing ? <Text style={[styles.emoji, { fontSize: fontSize + 2 }]}>{trailing}</Text> : null}
                        </View>
                    )}
                </View>
            </View>
        </Bouncy>
    );
}

const styles = StyleSheet.create({
    shell: { paddingBottom: 6 },
    face: { borderRadius: 999, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    gloss: {
        position: 'absolute',
        left: 14,
        right: 14,
        top: 4,
        height: 10,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    label: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, letterSpacing: 0.5 },
    emoji: {},
});

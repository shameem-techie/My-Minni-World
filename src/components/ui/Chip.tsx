import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Bouncy } from '../fx/Bouncy';
import { CLAY, TYPOGRAPHY, type ClayTone } from '../../theme';

interface ChipProps {
    label: string;
    emoji?: string;
    tone?: ClayTone;
    selected?: boolean;
    onPress?: () => void;
    small?: boolean;
    style?: StyleProp<ViewStyle>;
}

// Pill chip. Selected chips flip to magenta with the clay edge; unselected are pale lilac.
export function Chip({ label, emoji, tone, selected, onPress, small, style }: ChipProps) {
    const colors = CLAY[tone ?? (selected ? 'magenta' : 'lilac')];
    const inner = (
        <View style={[styles.shell, { backgroundColor: colors.shadow }, style]}>
            <View style={[styles.face, { backgroundColor: colors.base, paddingVertical: small ? 5 : 8, paddingHorizontal: small ? 10 : 14 }]}>
                {emoji ? <Text style={{ fontSize: small ? 12 : 15 }}>{emoji}</Text> : null}
                <Text style={[styles.label, { color: colors.text, fontSize: small ? TYPOGRAPHY.xs : TYPOGRAPHY.sm }]} numberOfLines={1}>
                    {label}
                </Text>
            </View>
        </View>
    );
    if (!onPress) return inner;
    return (
        <Bouncy onPress={onPress} scaleTo={0.93}>
            {inner}
        </Bouncy>
    );
}

const styles = StyleSheet.create({
    shell: { borderRadius: 999, paddingBottom: 3 },
    face: { borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
    label: { fontFamily: TYPOGRAPHY.fontFamilyDisplay },
});

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { CLAY, TYPOGRAPHY, type ClayTone } from '../../theme';

interface ButtonProps {
    label: string;
    onPress: () => void;
    tone?: ClayTone;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

// "Clay tile" button: a flat bottom border simulates a sculpted, pressable edge —
// the same tactile trick Cards-and-Chaos uses, applied to the Candy Sandbox palette.
export function Button({ label, onPress, tone = 'coral', disabled, loading, style }: ButtonProps) {
    const colors = CLAY[tone];
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.base,
                {
                    backgroundColor: colors.base,
                    borderBottomColor: colors.shadow,
                    opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
                    transform: [{ translateY: pressed ? 2 : 0 }],
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={colors.text} />
            ) : (
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderBottomWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontFamily: TYPOGRAPHY.fontFamilyDisplay,
        fontSize: TYPOGRAPHY.lg,
    },
});

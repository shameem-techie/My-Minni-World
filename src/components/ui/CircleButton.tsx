import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bouncy } from '../fx/Bouncy';
import { CLAY, type ClayTone } from '../../theme';

interface CircleButtonProps {
    icon?: keyof typeof Ionicons.glyphMap;
    emoji?: string;
    onPress: () => void;
    tone?: ClayTone;
    size?: number;
    style?: StyleProp<ViewStyle>;
}

// ".cosmic-circle-btn": round clay button with the flat bottom edge, for header chrome
// (settings, sound, back).
export function CircleButton({ icon, emoji, onPress, tone = 'snow', size = 44, style }: CircleButtonProps) {
    const colors = CLAY[tone];
    return (
        <Bouncy onPress={onPress} style={style} hitSlop={8}>
            <View style={[styles.shell, { backgroundColor: colors.shadow, borderRadius: size }]}>
                <View style={[styles.face, { backgroundColor: colors.base, width: size, height: size, borderRadius: size }]}>
                    {emoji ? (
                        <Text style={{ fontSize: size * 0.48 }}>{emoji}</Text>
                    ) : icon ? (
                        <Ionicons name={icon} size={size * 0.5} color={colors.text} />
                    ) : null}
                </View>
            </View>
        </Bouncy>
    );
}

const styles = StyleSheet.create({
    shell: { paddingBottom: 4 },
    face: { alignItems: 'center', justifyContent: 'center' },
});

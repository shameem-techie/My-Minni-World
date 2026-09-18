import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useGame } from '../../context/GameContext';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { RootStackParamList } from '../../types';
import { CircleButton } from './CircleButton';

function StatPill({ emoji, value, tint }: { emoji: string; value: number; tint: string }) {
    const scale = useSharedValue(1);
    const prev = useRef(value);
    useEffect(() => {
        if (prev.current !== value) {
            scale.value = withSequence(withSpring(1.25, { damping: 6, stiffness: 320 }), withSpring(1, { damping: 8 }));
            prev.current = value;
        }
    }, [value, scale]);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
        <Animated.View style={[styles.pill, { backgroundColor: tint }, style]}>
            <View style={styles.pillIcon}>
                <Text style={{ fontSize: 15 }}>{emoji}</Text>
            </View>
            <Text style={styles.pillValue}>{value.toLocaleString()}</Text>
        </Animated.View>
    );
}

// Header chrome shared by every in-game screen: star + dust counters that pop when they
// change, plus round settings/profile buttons. Mirrors the top bar on the Stitch
// Play Room / Creator / Shop screens.
export function StatBar({ showProfile = true, showSettings = true }: { showProfile?: boolean; showSettings?: boolean }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { progress } = useGame();
    return (
        <View style={styles.row}>
            <StatPill emoji="✨" value={progress.stars} tint={COSMIC.aquaPale} />
            <StatPill emoji="💎" value={progress.dust} tint={COSMIC.goldPale} />
            <View style={{ flex: 1 }} />
            {showSettings && <CircleButton icon="settings-sharp" tone="magenta" size={40} onPress={() => navigation.navigate('Settings')} />}
            {showProfile && (
                <CircleButton icon="person" tone="grape" size={40} onPress={() => navigation.navigate('CharacterCreator')} style={{ marginLeft: 8 }} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8, gap: 8 },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 6,
        paddingRight: 14,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    pillIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    pillValue: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base, color: COSMIC.ink },
});

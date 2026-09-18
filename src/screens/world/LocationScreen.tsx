import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EXTERIORS, PLAYSETS } from '../../assets/cosmicBubble';
import { PLAYSETS_BY_KEY } from '../../constants/playsets';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;
const ARRIVAL_MS = 900;

// The brief "arriving outside" beat between picking a pin on the map and landing inside
// the fullscreen room — auto-advances on its own (no tap required), tap just skips the
// wait. Uses a dedicated exterior render when one exists for this playset (see
// assets/cosmicBubble.ts EXTERIORS); playsets without one yet fall back to a
// dimmed/blurred crop of the room's own interior image.
export function LocationScreen({ navigation, route }: Props) {
    const { playsetKey } = route.params;
    const def = PLAYSETS_BY_KEY[playsetKey];
    const insets = useSafeAreaInsets();
    const exterior = EXTERIORS[def?.image];

    useEffect(() => {
        if (!def) return;
        const t = setTimeout(() => navigation.replace('PlayRoom', { playsetKey }), ARRIVAL_MS);
        return () => clearTimeout(t);
    }, [def, navigation, playsetKey]);

    if (!def) {
        navigation.goBack();
        return null;
    }

    return (
        <Pressable style={styles.container} onPress={() => navigation.replace('PlayRoom', { playsetKey })}>
            <StatusBar hidden />
            {exterior ? (
                <Image source={exterior} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            ) : (
                <>
                    <Image source={PLAYSETS[def.image]} style={StyleSheet.absoluteFillObject} resizeMode="cover" blurRadius={2} />
                    <View style={[StyleSheet.absoluteFillObject, styles.dim]} />
                </>
            )}
            <LinearGradient colors={['transparent', 'rgba(39,0,87,0.85)']} style={styles.bottomGradient} />

            <Animated.View entering={FadeIn.duration(300)} style={[styles.body, { paddingBottom: insets.bottom + 40 }]}>
                <Text style={styles.emoji}>{def.emoji}</Text>
                <Text style={styles.name}>{def.name}</Text>
                <Text style={styles.blurb}>{def.blurb}</Text>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.grapeDeep },
    dim: { backgroundColor: 'rgba(39,0,87,0.35)' },
    bottomGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
    body: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 28, gap: 8 },
    emoji: { fontSize: 56 },
    name: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY['3xl'], color: '#FFFFFF', textAlign: 'center' },
    blurb: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.base, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
});

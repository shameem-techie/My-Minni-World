import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MAPS } from '../../assets/cosmicBubble';
import { Bobbing } from '../../components/fx/Bobbing';
import { Bouncy } from '../../components/fx/Bouncy';
import { CircleButton } from '../../components/ui/CircleButton';
import { DISTRICTS, PLAYSETS_BY_KEY } from '../../constants/playsets';
import { CLAY, COSMIC, TYPOGRAPHY } from '../../theme';
import type { RootStackParamList } from '../../types';
import { UnlockSheet } from './UnlockSheet';
import { useZoneUnlock } from './useZoneUnlock';

type Props = NativeStackScreenProps<RootStackParamList, 'FullscreenMap'>;

// The map art's own native resolution — matches the aspect ratio the small map card on
// WorldMapScreen already renders at, just used here as a fixed cover-fit source size
// instead of a 4-wide card.
const MAP_NATURAL_W = 1376;
const MAP_NATURAL_H = 768;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;

// The World Map's own fullscreen, pannable/zoomable view — reached by tapping the map
// tile on WorldMapScreen. One finger pans (in any direction — unlike the room, the map
// has slack on both axes, not just left/right) and also taps a pin; two-finger pinch
// zooms — same rule as the room. This is now the only place the "tap any pin" hint
// shows — the small map card back on WorldMapScreen dropped it since
// that tile's only job now is opening this screen.
export function FullscreenWorldMapScreen({ navigation, route }: Props) {
    const { district } = route.params;
    const { width: viewportW, height: viewportH } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { pendingUnlock, setPendingUnlock, enter, confirmUnlock, isUnlocked, progress } = useZoneUnlock();

    const districtDef = useMemo(() => DISTRICTS.find((d) => d.key === district) ?? DISTRICTS[0], [district]);

    const coverScale = Math.max(viewportW / MAP_NATURAL_W, viewportH / MAP_NATURAL_H);
    const mapW = MAP_NATURAL_W * coverScale;
    const mapH = MAP_NATURAL_H * coverScale;
    const mapLeft = (viewportW - mapW) / 2;
    const mapTop = (viewportH - mapH) / 2;

    const scale = useSharedValue(1);
    const startScale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const clamp = (nextScale: number, x: number, y: number) => {
        'worklet';
        const dispW = mapW * nextScale;
        const dispH = mapH * nextScale;
        const boundX = Math.max(0, (dispW - viewportW) / 2);
        const boundY = Math.max(0, (dispH - viewportH) / 2);
        return { x: Math.max(-boundX, Math.min(boundX, x)), y: Math.max(-boundY, Math.min(boundY, y)) };
    };

    // One finger pans, matching the room screen's rule (one finger moves things, two
    // fingers zoom). Pins use a plain Pressable (Bouncy), which needs real movement to
    // lose a tap to this Pan gesture, so a one-finger pan and one-finger pin taps can
    // coexist here without the blocksExternalGesture relation the room needs for
    // dragging Minni.
    const pan = Gesture.Pan()
        .maxPointers(1)
        .onStart(() => {
            startX.value = tx.value;
            startY.value = ty.value;
        })
        .onUpdate((e) => {
            const clamped = clamp(scale.value, startX.value + e.translationX, startY.value + e.translationY);
            tx.value = clamped.x;
            ty.value = clamped.y;
        });

    const pinch = Gesture.Pinch()
        .onStart(() => {
            startScale.value = scale.value;
        })
        .onUpdate((e) => {
            const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, startScale.value * e.scale));
            scale.value = next;
            const clamped = clamp(next, tx.value, ty.value);
            tx.value = clamped.x;
            ty.value = clamped.y;
        });

    const resetCamera = () => {
        scale.value = withSpring(1);
        tx.value = withSpring(0);
        ty.value = withSpring(0);
    };

    const cameraStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    }));

    const [showHint, setShowHint] = useState(true);

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
                <Animated.View style={[styles.mapBox, { left: mapLeft, top: mapTop, width: mapW, height: mapH }, cameraStyle]}>
                    {districtDef.map ? (
                        <Image source={MAPS[districtDef.map]} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                    ) : (
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COSMIC.grapeDeep }]} />
                    )}

                    {districtDef.pins.map((pin, i) => {
                        const def = PLAYSETS_BY_KEY[pin.playsetKey];
                        const open = isUnlocked(def.key);
                        return (
                            <View key={def.key} style={[styles.pinAnchor, { left: `${pin.x}%`, top: `${pin.y}%` }]}>
                                <Bobbing amplitude={5} duration={2600 + i * 230} delay={i * 140}>
                                    <Bouncy
                                        onPress={() => {
                                            setShowHint(false);
                                            enter(def);
                                        }}
                                        scaleTo={0.9}
                                    >
                                        <View style={[styles.pin, { backgroundColor: open ? CLAY[def.tone].base : '#D9D3E6' }]}>
                                            <Text style={styles.pinEmoji}>{open ? def.emoji : '🔒'}</Text>
                                            <Text style={[styles.pinLabel, { color: open ? CLAY[def.tone].text : '#6B6480' }]} numberOfLines={1}>
                                                {def.shortName}
                                            </Text>
                                        </View>
                                        <View style={[styles.pinTail, { borderTopColor: open ? CLAY[def.tone].base : '#D9D3E6' }]} />
                                    </Bouncy>
                                </Bobbing>
                            </View>
                        );
                    })}
                </Animated.View>
            </GestureDetector>

            <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
                <View style={styles.titleChip}>
                    <Text style={styles.titleChipText} numberOfLines={1}>
                        ⭐ {districtDef.sector}
                    </Text>
                </View>
                <View style={{ flex: 1 }} />
                <CircleButton icon="close" tone="magenta" size={44} onPress={() => navigation.goBack()} />
            </View>

            {showHint && (
                <View style={[styles.hintWrap, { bottom: insets.bottom + 20 }]} pointerEvents="none">
                    <Text style={styles.hintText}>👆 {districtDef.tagline}</Text>
                </View>
            )}

            <View style={[styles.recenterWrap, { bottom: insets.bottom + 20 }]}>
                <CircleButton icon="scan" tone="snow" size={48} onPress={resetCamera} />
            </View>

            <UnlockSheet pendingUnlock={pendingUnlock} stars={progress.stars} onConfirm={confirmUnlock} onCancel={() => setPendingUnlock(null)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.grapeDeep },
    mapBox: { position: 'absolute' },

    pinAnchor: { position: 'absolute', width: 140, marginLeft: -70, height: 0, alignItems: 'center', justifyContent: 'flex-end' },
    pin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 6,
        paddingRight: 10,
        paddingVertical: 4,
        minHeight: 28,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        marginBottom: -2,
        overflow: 'visible',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    pinEmoji: { fontSize: 14, lineHeight: 17 },
    pinLabel: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 11, lineHeight: 14 },
    pinTail: {
        alignSelf: 'center',
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },

    topOverlay: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    titleChip: { backgroundColor: 'rgba(39,0,87,0.65)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
    titleChipText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.sm, lineHeight: 16 },

    hintWrap: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
    // overflow:'hidden' here rounds this Text's own background to the pill shape —
    // exactly the kind of spot where an unset lineHeight, defaulting differently per
    // platform, can clip the text against its own clipped background on one platform
    // and not the other. Explicit lineHeight removes that ambiguity.
    hintText: {
        color: '#FFFFFF',
        fontFamily: TYPOGRAPHY.fontFamilyDisplay,
        fontSize: TYPOGRAPHY.sm,
        lineHeight: 16,
        backgroundColor: 'rgba(39,0,87,0.7)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        overflow: 'hidden',
    },
    recenterWrap: { position: 'absolute', right: 16 },
});

import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    FadeInDown,
    FadeOut,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDecay,
    withSpring,
    type SharedValue,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MAPS } from '../../assets/cosmicBubble';
import { Bobbing } from '../../components/fx/Bobbing';
import { Bouncy } from '../../components/fx/Bouncy';
import { FloatingBubbles } from '../../components/fx/FloatingBubbles';
import { CircleButton } from '../../components/ui/CircleButton';
import { CosmicTabBar } from '../../components/ui/CosmicTabBar';
import { GALAXY_SECTORS } from '../../constants/galaxy';
import { PLAYSETS_BY_KEY } from '../../constants/playsets';
import { CLAY, COSMIC, GRADIENT_SPACE, TYPOGRAPHY } from '../../theme';
import type { GalaxySectorDef, RootStackParamList } from '../../types';
import { UnlockSheet } from './UnlockSheet';
import { useZoneUnlock } from './useZoneUnlock';

type Props = NativeStackScreenProps<RootStackParamList, 'GalaxyMap'>;

// The galaxy art's own native resolution — "9:16 Portrait — World-Map-V4", Stitch
// screen 719015af, drawn to already roughly match a phone's aspect ratio (unlike the
// original 1200×896 landscape render, which forced huge cover-fit/letterbox trade-offs).
const GALAXY_NATURAL_W = 768;
const GALAXY_NATURAL_H = 1376;

// Overscan on top of pure cover-fit so panning can actually reach every sector at rest,
// not just whichever axis the art happens to overshoot on at scale 1. This art's aspect
// (0.56) is closer to a phone's than the old landscape source, but a typical phone
// viewport (~0.45) still binds cover-fit to height, leaving ~0 vertical slack at 1.0.
// 2.0 was tuned so the single farthest sector (~40% of the art's width from center) is
// reachable with room to spare, not just barely peeking onto the edge of the screen at
// full clamp — see the reach math in project memory if this ever needs retuning.
const DEFAULT_OVERSCAN = 2.0;
const MAX_ZOOM = 3;

const PIN_SIZE = 44;
const HUB_SIZE = 56;

// The fullscreen blow-up of the World Map block on the landing page: the same pinch/pan
// overview of every orbit sector (Stitch's "Cosmic Bubble Galaxy"), with the whole
// viewport to explore in. Reached from the card's ⛶ button — it is deliberately not the
// app's landing route any more (a full-bleed map left nowhere to put the explorer
// header, the zone grid or the tab chrome). Tapping the Hub returns to that landing
// page; tapping a sector with real content goes through the same enter()/unlock pipeline
// every other playset pin already uses; tapping a sector with no content yet just shows
// a "Coming Soon" toast.
export function GalaxyMapScreen({ navigation }: Props) {
    const { width: viewportW, height: viewportH } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { pendingUnlock, setPendingUnlock, enter, confirmUnlock, isUnlocked, progress } = useZoneUnlock();
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Remounting the map view (via this key) is the confirmed fix for a rendering glitch,
    // not a math one: after a fast fling, tx/ty/scale were provably correct (a plain
    // value reset via the recenter button did not clear it) but the GPU-composited layer
    // itself stayed stuck showing stale/blank pixels past the art's true edge — closing
    // and reopening this screen (a full remount) was the only thing that reliably cleared
    // it. Bumping this key after every drag release forces that same fresh layer without
    // making the player back out of the screen to get it.
    const [renderTick, setRenderTick] = useState(0);
    const bumpRenderTick = () => setRenderTick((n) => n + 1);

    // baseScale (with overscan) is the "scale = 1" reference the pinch gesture scales
    // from. MIN_ZOOM is capped at 1 — pure cover-fit — rather than contain-fit: letting
    // pinch reach contain-fit exposed the ambient gradient as a flat purple corner
    // wherever the portrait art's aspect didn't match the viewport's, which read as
    // broken rather than intentional (see project memory). Capping here means the map
    // always fills the whole screen, at every pinch level.
    const rawCoverScale = Math.max(viewportW / GALAXY_NATURAL_W, viewportH / GALAXY_NATURAL_H);
    const baseScale = rawCoverScale * DEFAULT_OVERSCAN;
    const MIN_ZOOM = 1;
    const mapW = GALAXY_NATURAL_W * baseScale;
    const mapH = GALAXY_NATURAL_H * baseScale;
    const mapLeft = (viewportW - mapW) / 2;
    const mapTop = (viewportH - mapH) / 2;

    const scale = useSharedValue(1);
    const startScale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const getBounds = (nextScale: number) => {
        'worklet';
        const dispW = mapW * nextScale;
        const dispH = mapH * nextScale;
        return { boundX: Math.max(0, (dispW - viewportW) / 2), boundY: Math.max(0, (dispH - viewportH) / 2) };
    };

    const clamp = (nextScale: number, x: number, y: number) => {
        'worklet';
        const { boundX, boundY } = getBounds(nextScale);
        return { x: Math.max(-boundX, Math.min(boundX, x)), y: Math.max(-boundY, Math.min(boundY, y)) };
    };

    // Keeps tx/ty numerically inside bounds every frame regardless of how they got set
    // (decay, spring, a future gesture, an orientation change mid-flight). Cheap
    // insurance, but not the actual fix for the stuck-blank-corner bug below — that one
    // turned out to be a rendering-layer issue, not a value one (see renderTick above).
    useAnimatedReaction(
        () => ({ x: tx.value, y: ty.value, s: scale.value }),
        (cur) => {
            const { boundX, boundY } = getBounds(cur.s);
            const cx = Math.max(-boundX, Math.min(boundX, cur.x));
            const cy = Math.max(-boundY, Math.min(boundY, cur.y));
            if (cx !== cur.x) tx.value = cx;
            if (cy !== cur.y) ty.value = cy;
        },
    );

    // A flick that lifts the finger mid-motion needs to keep travelling and decelerate
    // into the clamp bounds, same as any map app — without this, panning dead-stops
    // exactly where the finger lifts, so reaching a far sector needs the finger to
    // physically cross the whole distance in one continuous drag instead of a flick.
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
        })
        .onEnd((e) => {
            const { boundX, boundY } = getBounds(scale.value);
            tx.value = withDecay({ velocity: e.velocityX, clamp: [-boundX, boundX] });
            ty.value = withDecay({ velocity: e.velocityY, clamp: [-boundY, boundY] });
            runOnJS(bumpRenderTick)();
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
        bumpRenderTick();
    };

    const cameraStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    }));

    const showComingSoon = (name: string) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(`🔒 ${name}: Coming Soon!`);
        toastTimer.current = setTimeout(() => setToast(null), 2200);
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Ambient space behind the map canvas — covers any letterbox margin at low
                zoom with the same deep-space gradient + drifting bubbles used elsewhere,
                instead of a flat void that looks unfinished. */}
            <LinearGradient colors={GRADIENT_SPACE} style={StyleSheet.absoluteFillObject} />
            <FloatingBubbles count={10} seed={9} />

            <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
                <Animated.View
                    key={renderTick}
                    style={[styles.mapBox, { left: mapLeft, top: mapTop, width: mapW, height: mapH }, cameraStyle]}
                >
                    <Image source={MAPS.galaxy} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

                    {/* Pins are children of the same scaled box as the art, so they
                        inherit its native pan/zoom transform exactly like every other
                        map pin in this app (proven correct elsewhere) — positioned via
                        plain percentage layout, not hand-rolled transform math. Each
                        pin then applies an inverse counter-scale to its own circle so
                        it stays a constant, readable, tappable size at any zoom level
                        instead of shrinking to an illegible dot when zoomed out. */}
                    {GALAXY_SECTORS.map((sector, i) => {
                        const isHub = sector.kind === 'hub';
                        const open = isHub || (sector.kind === 'playset' && sector.playsetKey ? isUnlocked(sector.playsetKey) : false);

                        const onPress = () => {
                            if (isHub) {
                                // Back to the landing page this screen was opened from,
                                // rather than pushing a second copy of it on the stack.
                                if (navigation.canGoBack()) navigation.goBack();
                                else navigation.navigate('WorldMap');
                                return;
                            }
                            if (sector.kind === 'playset' && sector.playsetKey) {
                                const def = PLAYSETS_BY_KEY[sector.playsetKey];
                                if (def) enter(def);
                                return;
                            }
                            showComingSoon(sector.name);
                        };

                        return <GalaxyPin key={sector.key} sector={sector} index={i} open={open} scale={scale} onPress={onPress} />;
                    })}
                </Animated.View>
            </GestureDetector>

            <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
                <CircleButton icon="close" tone="magenta" size={40} onPress={() => navigation.goBack()} />
                <View style={{ flex: 1 }} />
                <View style={styles.statPillRow}>
                    <View style={styles.statPill}>
                        <Text style={styles.statPillText}>✨ {progress.stars}</Text>
                    </View>
                    <View style={styles.statPill}>
                        <Text style={styles.statPillText}>💎 {progress.dust}</Text>
                    </View>
                </View>
                <CircleButton icon="settings-sharp" tone="lilac" size={40} onPress={() => navigation.navigate('Settings')} style={{ marginLeft: 8 }} />
            </View>

            <View style={[styles.recenterWrap, { bottom: insets.bottom + 96 }]}>
                <CircleButton icon="scan" tone="snow" size={44} onPress={resetCamera} />
            </View>

            {toast && (
                <Animated.View entering={FadeInDown.duration(250).springify()} exiting={FadeOut.duration(200)} style={[styles.toast, { top: insets.top + 60 }]} pointerEvents="none">
                    <Text style={styles.toastText}>{toast}</Text>
                </Animated.View>
            )}

            <View style={styles.bottomOverlay}>
                <CosmicTabBar active="map" />
            </View>

            <UnlockSheet pendingUnlock={pendingUnlock} stars={progress.stars} onConfirm={confirmUnlock} onCancel={() => setPendingUnlock(null)} />
        </View>
    );
}

// A single sector marker, positioned via native percentage layout inside the scaled
// map box (so it inherits pan/zoom exactly like the art itself), with an inverse
// counter-scale applied to its own circle so the circle's rendered size stays
// constant regardless of the parent's current zoom level.
function GalaxyPin({
    sector,
    index,
    open,
    scale,
    onPress,
}: {
    sector: GalaxySectorDef;
    index: number;
    open: boolean;
    scale: SharedValue<number>;
    onPress: () => void;
}) {
    const isHub = sector.kind === 'hub';
    const size = isHub ? HUB_SIZE : PIN_SIZE;
    const tone = open ? CLAY[sector.tone].base : '#D9D3E6';

    const counterScale = useAnimatedStyle(() => ({ transform: [{ scale: 1 / scale.value }] }));

    return (
        <View style={[styles.pinAnchor, { left: `${sector.x}%`, top: `${sector.y}%`, marginLeft: -size / 2, marginTop: -size / 2 }]} pointerEvents="box-none">
            <Animated.View style={counterScale}>
                <Bobbing amplitude={4} duration={2600 + index * 180} delay={index * 110}>
                    <Bouncy onPress={onPress} scaleTo={0.88}>
                        <View
                            style={[
                                styles.pinCircle,
                                { width: size, height: size, borderRadius: size / 2, backgroundColor: tone, borderWidth: isHub ? 3 : 2 },
                            ]}
                        >
                            <Text style={{ fontSize: size * 0.42 }}>{open ? sector.emoji : '🔒'}</Text>
                        </View>
                    </Bouncy>
                </Bobbing>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.grapeDeep },
    mapBox: { position: 'absolute' },

    pinAnchor: { position: 'absolute' },
    pinCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
    },

    topOverlay: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
    statPillRow: { flexDirection: 'row', gap: 6 },
    statPill: { backgroundColor: 'rgba(39,0,87,0.65)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 },
    statPillText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xs, lineHeight: 14 },

    recenterWrap: { position: 'absolute', right: 16 },

    toast: { position: 'absolute', left: 24, right: 24, backgroundColor: COSMIC.ink, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
    toastText: { color: COSMIC.gold, fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base },

    bottomOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PLAYSETS } from '../../assets/cosmicBubble';
import { Bobbing } from '../../components/fx/Bobbing';
import { FloatingBubbles } from '../../components/fx/FloatingBubbles';
import { Bouncy } from '../../components/fx/Bouncy';
import { SparkleBursts, type Burst } from '../../components/fx/SparkleBurst';
import { CircleButton } from '../../components/ui/CircleButton';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { PETS, ROUTINE_BADGE_REWARD, SPAWN_REWARD, HOTSPOT_REWARD } from '../../constants/pets';
import { PLAYSETS_BY_KEY } from '../../constants/playsets';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { loadActiveMinni } from '../../services/minni.service';
import { CLAY, COSMIC, TYPOGRAPHY } from '../../theme';
import type { Minni, PlacedProp, RootStackParamList } from '../../types';
import { DraggableMinni, MINNI_BOX_H, MINNI_BOX_W } from './DraggableMinni';
import { Sticker } from './Sticker';

type Props = NativeStackScreenProps<RootStackParamList, 'PlayRoom'>;

// The scene art is always generated at this aspect ratio (see the old card-based
// layout this replaces) — using it as a fixed ratio instead of Image.getSize lets the
// cover-fit math below run synchronously off the very first render.
const SCENE_NATURAL_W = 1200;
const SCENE_NATURAL_H = 896;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const TONES = ['magenta', 'aqua', 'gold'] as const;

type Sheet = 'actions' | 'routine' | 'props' | null;

// A single playset ("Sweet Lilac Bungalow — Play Room", Stitch ce248f69, and its 16
// siblings) as a fullscreen, walk-in room: the scene fills the whole screen edge to
// edge, two-finger pinch/drag pans the camera around it (one finger stays free for
// tapping hotspots and dragging Minni/props, exactly as before), and a ✕ top-right
// leaves the room back to the World Map. Actions, the star routine, and the props tray
// live in bottom-sheet drawers so they don't crowd the immersive view.
export function PlayRoomScreen({ navigation, route }: Props) {
    const { playsetKey } = route.params;
    const def = PLAYSETS_BY_KEY[playsetKey];
    const { user } = useAuth();
    const { room, visitPlayset, addStars, setRoomProps, setMinniPosition, toggleRoutineTask, claimRoutineBadge, progress } = useGame();
    const save = room(playsetKey);
    const { width: viewportW, height: viewportH } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const [minni, setMinni] = useState<Minni | null>(null);
    const [bursts, setBursts] = useState<Burst[]>([]);
    const [speech, setSpeech] = useState<{ id: number; text: string } | null>(null);
    const [selectedProp, setSelectedProp] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
    const [sheet, setSheet] = useState<Sheet>(null);
    const burstId = useRef(0);
    const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hotspotLabelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const spawnedOnce = useRef<Set<string>>(new Set());

    // Cover-fit the fixed-aspect scene art into whatever the device's screen aspect is.
    // The room images are landscape and phones are tall, so height is always the
    // binding dimension — the room fills edge to edge top-to-bottom, and there's extra
    // width either side to pan into. That's the "walk left / walk right" of the room.
    const coverScale = Math.max(viewportW / SCENE_NATURAL_W, viewportH / SCENE_NATURAL_H);
    const sceneW = SCENE_NATURAL_W * coverScale;
    const sceneH = SCENE_NATURAL_H * coverScale;
    const sceneLeft = (viewportW - sceneW) / 2;
    const sceneTop = (viewportH - sceneH) / 2;

    const scale = useSharedValue(1);
    const startScale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    useEffect(() => {
        if (!user) return;
        loadActiveMinni(user.uid).then(setMinni);
    }, [user]);

    // First-visit bonus + remember this as the "Play Room" tab target.
    useEffect(() => {
        const bonus = visitPlayset(playsetKey);
        if (bonus > 0) {
            setTimeout(() => say(`Welcome to ${def.shortName}! +${bonus} ✨ for exploring somewhere new!`), 400);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playsetKey]);

    const clampCamera = (nextScale: number, x: number, y: number) => {
        'worklet';
        const dispW = sceneW * nextScale;
        const dispH = sceneH * nextScale;
        const boundX = Math.max(0, (dispW - viewportW) / 2);
        const boundY = Math.max(0, (dispH - viewportH) / 2);
        return { x: Math.max(-boundX, Math.min(boundX, x)), y: Math.max(-boundY, Math.min(boundY, y)) };
    };

    // One finger pans the camera, same as walking around the room. This overlaps
    // Minni's/props' own one-finger drag, so those children get first refusal via
    // blocksExternalGesture below — a touch that starts on Minni wins outright; the
    // camera only starts panning once it's clear the touch began on empty scenery.
    const camPan = Gesture.Pan()
        .maxPointers(1)
        .onStart(() => {
            startX.value = tx.value;
            startY.value = ty.value;
        })
        .onUpdate((e) => {
            const clamped = clampCamera(scale.value, startX.value + e.translationX, startY.value + e.translationY);
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
            const clamped = clampCamera(next, tx.value, ty.value);
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

    const say = useCallback((text: string) => {
        if (speechTimer.current) clearTimeout(speechTimer.current);
        const id = Date.now();
        setSpeech({ id, text });
        speechTimer.current = setTimeout(() => setSpeech((s) => (s?.id === id ? null : s)), 3200);
    }, []);

    const burst = useCallback((x: number, y: number, label?: string) => {
        const id = ++burstId.current;
        setBursts((b) => [...b, { id, x, y, label }]);
    }, []);
    const removeBurst = useCallback((id: number) => setBursts((b) => b.filter((x) => x.id !== id)), []);

    const tapHotspot = (h: (typeof def.hotspots)[number]) => {
        addStars(HOTSPOT_REWARD);
        burst((h.x / 100) * sceneW, (h.y / 100) * sceneH, `+${HOTSPOT_REWARD}`);
        say(h.reaction);
        if (hotspotLabelTimer.current) clearTimeout(hotspotLabelTimer.current);
        setActiveHotspot(h.id);
        hotspotLabelTimer.current = setTimeout(() => setActiveHotspot(null), 1400);
    };

    const runAction = (a: (typeof def.actions)[number]) => {
        addStars(HOTSPOT_REWARD);
        burst(sceneW * 0.5, sceneH * 0.5, `+${HOTSPOT_REWARD}`);
        say(a.reaction);
    };

    const spawnProp = (propId: string) => {
        const prop: PlacedProp = {
            id: 'placed_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            propId,
            x: 25 + Math.random() * 50,
            y: 35 + Math.random() * 40,
        };
        setRoomProps(playsetKey, [...save.props, prop]);
        const propDef = def.props.find((p) => p.id === propId);
        if (!spawnedOnce.current.has(propId)) {
            spawnedOnce.current.add(propId);
            addStars(SPAWN_REWARD);
            burst((prop.x / 100) * sceneW, (prop.y / 100) * sceneH, `+${SPAWN_REWARD}`);
        } else {
            burst((prop.x / 100) * sceneW, (prop.y / 100) * sceneH);
        }
        say(`${propDef?.emoji ?? '✨'} ${propDef?.name ?? 'Prop'} spawned! Drag it anywhere.`);
    };

    const moveProp = useCallback(
        (id: string, x: number, y: number) => {
            const current = room(playsetKey);
            setRoomProps(playsetKey, current.props.map((p) => (p.id === id ? { ...p, x, y } : p)));
        },
        [playsetKey, room, setRoomProps],
    );

    // Same bottom-left corner the old fixed layout used, but measured from the visible
    // viewport, not the full scene — the cover-fit scene is usually wider than the
    // screen (that's the pannable slack), and the camera starts centered on it, so "10dp
    // from the scene's own edge" landed off-screen in the hidden portion. Offsetting by
    // how far the centered camera's visible window sits into the scene fixes that.
    const defaultMinniPos = useMemo(() => {
        const visibleLeft = (sceneW - viewportW) / 2;
        const visibleTop = (sceneH - viewportH) / 2;
        // 130dp clearance, not 8, so she doesn't spawn straight into the bottom dock.
        return {
            x: ((visibleLeft + 10 + MINNI_BOX_W / 2) / sceneW) * 100,
            y: ((visibleTop + viewportH - 130 - MINNI_BOX_H / 2) / sceneH) * 100,
        };
    }, [sceneW, sceneH, viewportW, viewportH]);
    const minniX = save.minniX ?? defaultMinniPos.x;
    const minniY = save.minniY ?? defaultMinniPos.y;

    const moveMinni = useCallback((x: number, y: number) => setMinniPosition(playsetKey, x, y), [playsetKey, setMinniPosition]);

    const removeProp = (id: string) => {
        setRoomProps(playsetKey, save.props.filter((p) => p.id !== id));
        setSelectedProp(null);
        say('Put away neatly! ✨');
    };

    const routineDone = def.routine.tasks.filter((t) => save.routineDone.includes(t.id)).length;
    const routineComplete = routineDone === def.routine.tasks.length;

    const onToggleTask = (taskId: string) => {
        if (save.badgeClaimed) return;
        toggleRoutineTask(playsetKey, taskId);
        if (!save.routineDone.includes(taskId)) {
            burst(sceneW * 0.5, sceneH * 0.8);
            say(def.routine.tasks.find((t) => t.id === taskId)?.label + '! ✅');
        }
    };

    const onClaimBadge = () => {
        if (claimRoutineBadge(playsetKey)) {
            burst(sceneW * 0.5, sceneH * 0.4, `+${ROUTINE_BADGE_REWARD}`);
            say(`🏅 ${def.routine.badge} earned! +${ROUTINE_BADGE_REWARD} stars!`);
            setToast(`${def.routine.badge} unlocked!`);
            setTimeout(() => setToast(null), 2500);
        }
    };

    const pet = useMemo(() => PETS.find((p) => p.id === progress.equippedPet) ?? null, [progress.equippedPet]);

    if (!def) {
        navigation.goBack();
        return null;
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <View style={[styles.viewport, { width: viewportW, height: viewportH }]}>
                <GestureDetector gesture={Gesture.Simultaneous(pinch, camPan)}>
                    <Animated.View style={[styles.sceneBox, { left: sceneLeft, top: sceneTop, width: sceneW, height: sceneH }, cameraStyle]}>
                        <Image source={PLAYSETS[def.image]} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                        <Pressable
                            style={StyleSheet.absoluteFillObject}
                            onPress={(e) => {
                                setSelectedProp(null);
                                burst(e.nativeEvent.locationX, e.nativeEvent.locationY);
                            }}
                        >
                            {def.hotspots.map((h, i) => (
                                <View key={h.id} style={[styles.hotspotAnchor, { left: `${h.x}%`, top: `${h.y}%` }]}>
                                    <Bobbing amplitude={4} duration={2400 + i * 300} delay={i * 200}>
                                        <Bouncy onPress={() => tapHotspot(h)} scaleTo={0.85}>
                                            <View style={styles.hotspotBadge}>
                                                <Text style={styles.hotspotEmoji}>{h.emoji}</Text>
                                            </View>
                                        </Bouncy>
                                        {activeHotspot === h.id && (
                                            <Animated.View entering={ZoomIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.hotspotLabel} pointerEvents="none">
                                                <Text style={styles.hotspotLabelText} numberOfLines={1}>
                                                    {h.label}
                                                </Text>
                                            </Animated.View>
                                        )}
                                    </Bobbing>
                                </View>
                            ))}

                            {save.props.map((p) => {
                                const propDef = def.props.find((pd) => pd.id === p.propId);
                                return propDef ? (
                                    <Sticker
                                        key={p.id}
                                        placed={p}
                                        def={propDef}
                                        sceneWidth={sceneW}
                                        sceneHeight={sceneH}
                                        selected={selectedProp === p.id}
                                        onSelect={setSelectedProp}
                                        onMove={moveProp}
                                        onRemove={removeProp}
                                        zoomScale={scale}
                                        cameraPan={camPan}
                                    />
                                ) : null;
                            })}

                            <DraggableMinni
                                appearance={minni?.appearance ?? null}
                                pet={pet}
                                sceneWidth={sceneW}
                                sceneHeight={sceneH}
                                x={minniX}
                                y={minniY}
                                onMove={moveMinni}
                                zoomScale={scale}
                                cameraPan={camPan}
                                onTapMinni={() => {
                                    burst((minniX / 100) * sceneW, (minniY / 100) * sceneH, '💖');
                                    say(`${minni?.name ?? 'Minni'} says hi! Tap things to play, or drag me anywhere!`);
                                }}
                                onTapPet={() => {
                                    burst((minniX / 100) * sceneW + 60, (minniY / 100) * sceneH - 50, '✨');
                                    if (pet) say(`${pet.name}: ${pet.blurb}`);
                                }}
                            />

                            {speech && (
                                <Animated.View key={speech.id} entering={ZoomIn.duration(250).springify()} exiting={FadeOut.duration(200)} style={styles.speech} pointerEvents="none">
                                    <Text style={styles.speechText}>
                                        <Text style={styles.speechName}>{minni?.name ?? 'Minni'} </Text>
                                        {speech.text}
                                    </Text>
                                </Animated.View>
                            )}

                            <SparkleBursts bursts={bursts} onDone={removeBurst} />
                        </Pressable>
                    </Animated.View>
                </GestureDetector>

                {/* Ambient life — the baked scene art is a flat, static image, so this
                    drifts a few soft cosmic bubbles across whatever's currently in view
                    (independent of camera pan/zoom, like dust catching the light) to
                    keep the room from feeling like a still photo. Purely decorative. */}
                <FloatingBubbles count={6} seed={playsetKey.length + def.name.length} />
            </View>

            {/* Top chrome */}
            <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
                <View style={styles.titleChip}>
                    <Text style={styles.titleChipText} numberOfLines={1}>
                        {def.emoji} {def.shortName}
                    </Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={styles.statPillRow}>
                    <View style={styles.statPill}>
                        <Text style={styles.statPillText}>✨ {progress.stars}</Text>
                    </View>
                    <View style={styles.statPill}>
                        <Text style={styles.statPillText}>💎 {progress.dust}</Text>
                    </View>
                </View>
                <CircleButton icon="close" tone="magenta" size={44} onPress={() => navigation.goBack()} style={{ marginLeft: 10 }} />
            </View>

            {/* Bottom dock */}
            <View style={[styles.bottomOverlay, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
                <View style={styles.dockRow}>
                    <CircleButton icon="scan" tone="snow" size={48} onPress={resetCamera} />
                    <CircleButton emoji="⚡" tone="aqua" size={58} onPress={() => setSheet('actions')} />
                    <CircleButton emoji="✅" tone="gold" size={58} onPress={() => setSheet('routine')} />
                    <CircleButton emoji="🎒" tone="magenta" size={58} onPress={() => setSheet('props')} />
                </View>
            </View>

            {toast && (
                <Animated.View entering={FadeInDown.duration(300).springify()} exiting={FadeOut.duration(200)} style={[styles.toast, { top: insets.top + 60 }]} pointerEvents="none">
                    <Text style={styles.toastText}>🏅 {toast}</Text>
                </Animated.View>
            )}

            {/* Bottom sheets */}
            <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
                <Pressable style={styles.sheetBackdrop} onPress={() => setSheet(null)}>
                    <Pressable style={[styles.sheetCard, { paddingBottom: Math.max(insets.bottom, 16) }]} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.sheetHandle} />

                        {sheet === 'actions' && (
                            <View style={styles.sheetHeaderRow}>
                                <Text style={styles.sheetTitle}>⚡ Quick Actions</Text>
                                <CircleButton icon="checkmark" tone="magenta" size={38} onPress={() => setSheet(null)} />
                            </View>
                        )}
                        {sheet === 'actions' && (
                            <View style={styles.actionRow}>
                                {def.actions.map((a, i) => (
                                    <CosmicButton key={a.id} label={a.label} leading={a.emoji} tone={TONES[i % TONES.length]} size="sm" style={{ flex: 1 }} onPress={() => runAction(a)} />
                                ))}
                            </View>
                        )}

                        {sheet === 'routine' && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.sheetHeaderRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sheetTitle}>{def.routine.title}</Text>
                                        <Text style={styles.sheetSub}>{def.routine.subtitle}</Text>
                                    </View>
                                    <CircleButton icon="checkmark" tone="magenta" size={38} onPress={() => setSheet(null)} />
                                </View>
                                {def.routine.tasks.map((t) => {
                                    const done = save.routineDone.includes(t.id);
                                    return (
                                        <Bouncy key={t.id} onPress={() => onToggleTask(t.id)} scaleTo={0.97} style={styles.task}>
                                            <View style={[styles.check, done && styles.checkDone]}>{done && <Text style={styles.checkMark}>✓</Text>}</View>
                                            <Text style={[styles.taskLabel, done && styles.taskLabelDone]}>{t.label}</Text>
                                            <Text style={{ fontSize: 16 }}>{done ? '⭐' : '🤍'}</Text>
                                        </Bouncy>
                                    );
                                })}
                                {save.badgeClaimed ? (
                                    <View style={styles.badgeEarned}>
                                        <Text style={styles.badgeEarnedText}>🏅 {def.routine.badge} earned!</Text>
                                    </View>
                                ) : (
                                    <CosmicButton
                                        label={`Claim ${def.routine.badge} (+${ROUTINE_BADGE_REWARD} Stars)`}
                                        leading="✨"
                                        tone={routineComplete ? 'magenta' : 'lilac'}
                                        disabled={!routineComplete}
                                        onPress={onClaimBadge}
                                        style={{ marginTop: 8 }}
                                    />
                                )}
                            </ScrollView>
                        )}

                        {sheet === 'props' && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.sheetHeaderRow}>
                                    <Text style={styles.sheetTitle}>{def.shortName} Props Tray</Text>
                                    <CircleButton icon="checkmark" tone="magenta" size={38} onPress={() => setSheet(null)} />
                                </View>
                                <View style={styles.propGrid}>
                                    {def.props.map((p, i) => (
                                        <Animated.View key={p.id} entering={FadeIn.delay(i * 30).duration(250)} style={styles.propCardWrap}>
                                            <Bouncy onPress={() => spawnProp(p.id)} scaleTo={0.93} style={styles.propCard}>
                                                <View style={[styles.propArt, { backgroundColor: CLAY[def.tone].base + '33' }]}>
                                                    <Text style={{ fontSize: 40 }}>{p.emoji}</Text>
                                                    <View style={[styles.rarity, { backgroundColor: p.rarity >= 4 ? COSMIC.magenta : p.rarity === 3 ? COSMIC.grape : COSMIC.aquaDark }]}>
                                                        <Text style={styles.rarityText}>
                                                            {p.rarity}★{p.rarity >= 4 ? ' VIP' : ''}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.propName} numberOfLines={1}>
                                                    {p.name}
                                                </Text>
                                                <Text style={styles.propSub} numberOfLines={1}>
                                                    {p.sub}
                                                </Text>
                                            </Bouncy>
                                        </Animated.View>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    viewport: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
    sceneBox: { position: 'absolute' },

    hotspotAnchor: { position: 'absolute', width: 40, marginLeft: -20, height: 0, alignItems: 'center', justifyContent: 'center' },
    hotspotBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: COSMIC.lilac,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    hotspotEmoji: { fontSize: 19, lineHeight: 23 },
    hotspotLabel: {
        position: 'absolute',
        bottom: 46,
        alignSelf: 'center',
        maxWidth: 150,
        backgroundColor: 'rgba(39,0,87,0.85)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    // Explicit lineHeight — see WorldMapScreen's pinLabel for why an unset one is risky.
    hotspotLabelText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 11, lineHeight: 14, color: '#FFFFFF' },
    speech: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 24,
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 2,
        borderColor: COSMIC.lilac,
    },
    speechText: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.ink },
    speechName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, color: COSMIC.magentaDark },

    topOverlay: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
    titleChip: { backgroundColor: 'rgba(39,0,87,0.65)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, maxWidth: '48%' },
    titleChipText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.sm, lineHeight: 16 },
    statPillRow: { flexDirection: 'row', gap: 6 },
    statPill: { backgroundColor: 'rgba(39,0,87,0.65)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 },
    statPillText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xs, lineHeight: 14 },

    bottomOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingTop: 14 },
    dockRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },

    toast: { position: 'absolute', left: 24, right: 24, backgroundColor: COSMIC.ink, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
    toastText: { color: COSMIC.gold, fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base },

    sheetBackdrop: { flex: 1, backgroundColor: 'rgba(39,0,87,0.55)', justifyContent: 'flex-end' },
    sheetCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, maxHeight: '70%' },
    sheetHandle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: COSMIC.lilac, marginBottom: 12 },
    sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    sheetTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: COSMIC.ink },
    sheetSub: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.xs, color: COSMIC.onSurfaceVariant },

    actionRow: { flexDirection: 'row', gap: 10, paddingBottom: 20 },

    task: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COSMIC.lilacPale, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 8 },
    check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: COSMIC.lilac, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
    checkDone: { backgroundColor: COSMIC.magenta, borderColor: COSMIC.magenta },
    checkMark: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
    taskLabel: { flex: 1, fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.ink },
    taskLabelDone: { textDecorationLine: 'line-through', color: COSMIC.muted },
    badgeEarned: { marginTop: 6, marginBottom: 20, backgroundColor: COSMIC.goldPale, borderRadius: 999, paddingVertical: 10, alignItems: 'center' },
    badgeEarnedText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, color: COSMIC.goldDeep },

    propGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 20 },
    propCardWrap: { width: '47.5%' },
    propCard: { padding: 8, backgroundColor: COSMIC.surfaceLow, borderRadius: 20 },
    propArt: { height: 100, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    rarity: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
    rarityText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 9 },
    propName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.ink, paddingHorizontal: 4 },
    propSub: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.xs, color: COSMIC.onSurfaceVariant, paddingHorizontal: 4, paddingBottom: 4 },
});

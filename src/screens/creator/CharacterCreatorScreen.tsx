import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bobbing } from '../../components/fx/Bobbing';
import { Bouncy } from '../../components/fx/Bouncy';
import { FloatingBubbles } from '../../components/fx/FloatingBubbles';
import { MinniCharacter } from '../../components/illustrations/MinniCharacter';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { CircleButton } from '../../components/ui/CircleButton';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { CosmicTabBar } from '../../components/ui/CosmicTabBar';
import { StatBar } from '../../components/ui/StatBar';
import { useAuth } from '../../context/AuthContext';
import { deleteFacePhoto, saveFacePhoto, type CropRect } from '../../services/facePhoto.service';
import { loadActiveMinni, saveActiveMinni } from '../../services/minni.service';
import { FaceCropModal } from './FaceCropModal';
import { COSMIC, GRADIENT_LILAC_CARD, HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES, TYPOGRAPHY } from '../../theme';
import type { Minni, MinniAppearance, RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterCreator'>;

const DEFAULT_APPEARANCE: MinniAppearance = {
    skinTone: SKIN_TONES[0],
    hairStyle: 'hair_bob',
    hairColor: HAIR_COLORS[0],
    faceStyle: 'face_happy',
    outfitId: 'outfit_tshirt',
    outfitColor: OUTFIT_COLORS[0],
    accessoryIds: ['acc_helmet'],
    faceMode: 'illustrated',
    facePhotoUri: null,
};

const HAIR_STYLES = [
    { key: 'hair_bob', label: 'Bob', emoji: '💇' },
    { key: 'hair_ponytail', label: 'Ponytail', emoji: '🎀' },
    { key: 'hair_curly', label: 'Curly', emoji: '🌀' },
    { key: 'hair_buzz', label: 'Buzz', emoji: '✂️' },
    { key: 'hair_braids', label: 'Braids', emoji: '🧶' },
];
const FACE_STYLES = [
    { key: 'face_happy', label: 'Happy', emoji: '😊' },
    { key: 'face_wink', label: 'Wink', emoji: '😉' },
    { key: 'face_surprised', label: 'Surprised', emoji: '😮' },
    { key: 'face_freckles', label: 'Freckles', emoji: '🥰' },
];
const OUTFITS = [
    { key: 'outfit_tshirt', label: 'Tee & Shorts', emoji: '👕' },
    { key: 'outfit_dress', label: 'Sundress', emoji: '👗' },
    { key: 'outfit_overalls', label: 'Overalls', emoji: '🧑‍🔧' },
    { key: 'outfit_hoodie', label: 'Puffer Suit', emoji: '🧥' },
    { key: 'outfit_pjs', label: 'Pajamas', emoji: '🌙' },
];
const GEAR = [
    { key: 'acc_helmet', label: 'Bubble Helmet', emoji: '🫧' },
    { key: 'acc_antennae', label: 'Star Antennae', emoji: '✨' },
    { key: 'acc_glasses', label: 'Round Glasses', emoji: '👓' },
    { key: 'acc_bow', label: 'Hair Bow', emoji: '🎀' },
    { key: 'acc_cap', label: 'Star Cap', emoji: '🧢' },
    { key: 'acc_backpack', label: 'Rocket Pack', emoji: '🎒' },
];
const TABS = [
    { key: 'photo', label: 'Photo', emoji: '📸' },
    { key: 'hair', label: 'Hair', emoji: '💇' },
    { key: 'skin', label: 'Skin', emoji: '🎨' },
    { key: 'face', label: 'Face', emoji: '😊' },
    { key: 'suit', label: 'Suits', emoji: '👗' },
    { key: 'gear', label: 'Gear', emoji: '🫧' },
] as const;
type Tab = (typeof TABS)[number]['key'];

const NAMES = ['Zippy', 'Nova', 'Pip', 'Luna', 'Cosmo', 'Fizz', 'Astra', 'Bubbles', 'Comet', 'Sunny', 'Orbit', 'Twinkle'];
const SUFFIX = ['Star', 'Bloop', 'Sparkle', 'Moon', 'Bubble', 'Jelly', 'Rocket', 'Glow'];

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomAppearance(): MinniAppearance {
    return {
        skinTone: pick(SKIN_TONES),
        hairStyle: pick(HAIR_STYLES).key,
        hairColor: pick(HAIR_COLORS),
        faceStyle: pick(FACE_STYLES).key,
        outfitId: pick(OUTFITS).key,
        outfitColor: pick(OUTFIT_COLORS),
        accessoryIds: GEAR.filter(() => Math.random() < 0.35).map((g) => g.key),
    };
}

// "Cosmic Minni Maker — Creator" (Stitch bf8eb28c): preview on a lilac gradient stage
// with a glowing platform, Rotate / Random / Pose controls, category pills and swatch
// rows, and one big "Save & Launch Minni!" pill. The character itself is the layered
// paper-doll SVG (MinniCharacter) so every colour/gear combination renders live.
export function CharacterCreatorScreen({ navigation, route }: Props) {
    const { user } = useAuth();
    const isFirstMinni = route.params?.isFirstMinni ?? false;
    const [existing, setExisting] = useState<Minni | null>(null);
    const [appearance, setAppearance] = useState<MinniAppearance>(DEFAULT_APPEARANCE);
    const [name, setName] = useState('Minni Astronaut');
    const [tab, setTab] = useState<Tab>('hair');
    const [isSaving, setIsSaving] = useState(false);
    const [flipped, setFlipped] = useState(false);
    const [posing, setPosing] = useState(false);
    const [pickedUri, setPickedUri] = useState<string | null>(null); // awaiting crop confirmation
    // The dimensions expo-image-manipulator itself reports for pickedUri, from the very
    // manipulateAsync call that produced it — see pickPhoto for why this matters.
    const [pickedSize, setPickedSize] = useState<{ width: number; height: number } | null>(null);
    const [isSavingPhoto, setIsSavingPhoto] = useState(false);
    const bounce = useSharedValue(1);
    const tilt = useSharedValue(0);

    useEffect(() => {
        if (!user || isFirstMinni) return;
        loadActiveMinni(user.uid).then((m) => {
            if (m) {
                setExisting(m);
                setAppearance(m.appearance);
                setName(m.name);
            }
        });
    }, [user, isFirstMinni]);

    const pop = () => {
        bounce.value = withSequence(withSpring(1.12, { damping: 5, stiffness: 320 }), withSpring(1, { damping: 8 }));
    };
    const change = (patch: Partial<MinniAppearance>) => {
        setAppearance((a) => ({ ...a, ...patch }));
        pop();
    };
    const toggleGear = (key: string) => {
        setAppearance((a) => ({
            ...a,
            accessoryIds: a.accessoryIds.includes(key) ? a.accessoryIds.filter((k) => k !== key) : [...a.accessoryIds, key],
        }));
        pop();
    };
    const randomize = () => {
        // The dice reshuffles hair/skin/face/suit/gear only — a real photo face is a
        // deliberate, personal choice, not something a random roll should ever wipe.
        setAppearance((a) => ({ ...randomAppearance(), faceMode: a.faceMode, facePhotoUri: a.facePhotoUri }));
        setName(`${pick(NAMES)} ${pick(SUFFIX)}`);
        pop();
    };
    const pose = () => {
        setPosing(true);
        tilt.value = withSequence(withSpring(-10, { damping: 4 }), withSpring(10, { damping: 4 }), withSpring(0, { damping: 6 }));
        setTimeout(() => setPosing(false), 900);
    };

    const previewStyle = useAnimatedStyle(() => ({
        transform: [{ scale: bounce.value }, { rotate: `${tilt.value}deg` }, { scaleX: flipped ? -1 : 1 }],
    }));

    const pickPhoto = async (source: 'camera' | 'library') => {
        try {
            const permission =
                source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(
                    'Permission needed',
                    source === 'camera'
                        ? 'Allow camera access so your Minni can use your real face.'
                        : 'Allow photo access so your Minni can use your real face.',
                );
                return;
            }
            // No allowsEditing here — the OS's own crop screen is inconsistent across
            // Android devices/manufacturers. FaceCropModal below is our own reliable
            // crop step instead, on every platform.
            const result =
                source === 'camera'
                    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
                    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
            if (!result.canceled && result.assets[0]) {
                // Front-camera selfies carry an EXIF orientation/mirror flag rather than
                // upright pixels. expo-image-manipulator always re-renders its output
                // respecting that flag, even with an empty action list, so this bakes the
                // photo upright once — which both the crop stage and, critically, the ML
                // Kit face detector (which has read the raw mirrored pixels wrong on real
                // selfies) can then treat as unambiguous.
                const normalized = await ImageManipulator.manipulateAsync(result.assets[0].uri, [], {
                    compress: 1,
                    format: ImageManipulator.SaveFormat.JPEG,
                });
                setPickedUri(normalized.uri);
                // Deliberately from THIS manipulateAsync call's own result, not a
                // separate Image.getSize() — the crop that saveFacePhoto runs later
                // goes through this same expo-image-manipulator pipeline on this same
                // file, so using its own reported width/height (rather than a second,
                // independent native subsystem's opinion of the same file) is what
                // guarantees the crop rect FaceCropModal computes lines up with the
                // pixels manipulateAsync's own crop step actually cuts.
                setPickedSize({ width: normalized.width, height: normalized.height });
            }
        } catch (err) {
            console.warn('Could not open camera/gallery', err);
            Alert.alert('Could not open that', err instanceof Error ? err.message : 'Please try again.');
        }
    };

    const handleCropConfirm = async (crop: CropRect, cartoon: boolean) => {
        if (!user || !pickedUri) return;
        setIsSavingPhoto(true);
        try {
            const uri = await saveFacePhoto(user.uid, pickedUri, crop, { cartoon });
            setAppearance((a) => ({ ...a, faceMode: 'photo', facePhotoUri: uri }));
            setPickedUri(null);
            setPickedSize(null);
            pop();
        } catch (err) {
            console.warn('Could not save face photo', err);
            Alert.alert('Could not save your photo', err instanceof Error ? err.message : 'Please try again.');
        } finally {
            setIsSavingPhoto(false);
        }
    };

    const handleRemovePhoto = () => {
        Alert.alert('Remove your photo?', "Your Minni will go back to its illustrated face. You can add a new photo any time.", [
            { text: 'Keep it', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    if (user) void deleteFacePhoto(user.uid);
                    setAppearance((a) => ({ ...a, faceMode: 'illustrated', facePhotoUri: null }));
                    pop();
                },
            },
        ]);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await saveActiveMinni(user.uid, name.trim() || 'Minni', appearance, existing);
            if (isFirstMinni) navigation.replace('GalaxyMap');
            else if (navigation.canGoBack()) navigation.goBack();
            else navigation.replace('GalaxyMap');
        } catch (err) {
            console.warn('Could not save Minni', err);
            const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            Alert.alert('Could not save your Minni', message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatBar showProfile={false} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Stage */}
                <Animated.View entering={FadeInDown.duration(500).springify()}>
                    <LinearGradient colors={GRADIENT_LILAC_CARD} style={styles.stage}>
                        <FloatingBubbles count={4} seed={11} />
                        <View style={styles.stageTop}>
                            {!isFirstMinni && <CircleButton icon="arrow-back" tone="snow" size={40} onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('GalaxyMap'))} />}
                            <View style={styles.namePill}>
                                <Text style={{ fontSize: 14 }}>✏️</Text>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    maxLength={22}
                                    placeholder="Name your Minni"
                                    placeholderTextColor={COSMIC.muted}
                                    style={styles.nameInput}
                                />
                            </View>
                        </View>

                        <View style={styles.previewArea}>
                            <Bobbing amplitude={7} duration={3400}>
                                <Animated.View style={previewStyle}>
                                    <MinniCharacter appearance={appearance} size={210} />
                                </Animated.View>
                            </Bobbing>
                            <View style={styles.platformGlow} />
                            <View style={styles.platform}>
                                <LinearGradient colors={['#8EE4FF', '#FFFFFF', '#FFD1E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
                            </View>
                            {posing && (
                                <Animated.Text entering={FadeInUp.duration(250)} style={styles.poseLabel}>
                                    ✨ Ta-da! ✨
                                </Animated.Text>
                            )}
                        </View>

                        <View style={styles.stageControls}>
                            <CosmicButton label="Rotate" leading="🔄" tone="snow" size="sm" onPress={() => setFlipped((f) => !f)} />
                            <CircleButton emoji="🎲" tone="magenta" size={54} onPress={randomize} />
                            <CosmicButton label="Pose" leading="🕺" tone="snow" size="sm" onPress={pose} />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Options */}
                <Animated.View entering={FadeInUp.delay(120).duration(450)}>
                    <Card style={styles.options}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
                            {TABS.map((t) => (
                                <Chip key={t.key} label={t.label} emoji={t.emoji} selected={tab === t.key} onPress={() => setTab(t.key)} />
                            ))}
                        </ScrollView>

                        {tab === 'photo' && (
                            <Section title="Your Real Face" meta={appearance.faceMode === 'photo' ? 'Photo on' : 'Illustrated'}>
                                {appearance.faceMode === 'photo' && appearance.facePhotoUri ? (
                                    <View style={styles.photoRow}>
                                        <Image source={{ uri: appearance.facePhotoUri }} style={styles.photoPreview} />
                                        <View style={styles.photoActions}>
                                            <Text style={styles.photoHint}>This is what your Minni looks like now!</Text>
                                            <View style={styles.photoButtonRow}>
                                                <CosmicButton label="Retake" leading="📸" tone="aqua" size="sm" onPress={() => pickPhoto('camera')} style={{ flex: 1 }} />
                                                <CosmicButton label="Remove" leading="🗑️" tone="pink" size="sm" onPress={handleRemovePhoto} style={{ flex: 1 }} />
                                            </View>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.photoCta}>
                                        <Text style={styles.photoHint}>
                                            Take a selfie and we'll crop it right into your Minni's face — hair, suit and gear stay exactly as you picked
                                            them.
                                        </Text>
                                        <View style={styles.photoButtonRow}>
                                            <CosmicButton label="Take a Selfie" leading="📸" tone="magenta" size="sm" onPress={() => pickPhoto('camera')} style={{ flex: 1 }} />
                                            <CosmicButton label="From Gallery" leading="🖼️" tone="lilac" size="sm" onPress={() => pickPhoto('library')} style={{ flex: 1 }} />
                                        </View>
                                    </View>
                                )}
                            </Section>
                        )}
                        {tab === 'hair' && (
                            <>
                                <Section title="Hair Style" meta={HAIR_STYLES.find((h) => h.key === appearance.hairStyle)?.label}>
                                    <View style={styles.optionGrid}>
                                        {HAIR_STYLES.map((h) => (
                                            <OptionTile key={h.key} emoji={h.emoji} label={h.label} selected={appearance.hairStyle === h.key} onPress={() => change({ hairStyle: h.key })} />
                                        ))}
                                    </View>
                                </Section>
                                <Section title="Hair Hue">
                                    <Swatches colors={HAIR_COLORS} selected={appearance.hairColor} onSelect={(c) => change({ hairColor: c })} />
                                </Section>
                            </>
                        )}
                        {tab === 'skin' && (
                            <Section title="Skin Tone" meta="Every Minni is unique">
                                <Swatches colors={SKIN_TONES} selected={appearance.skinTone} onSelect={(c) => change({ skinTone: c })} />
                            </Section>
                        )}
                        {tab === 'face' && (
                            <Section title="Expression" meta={FACE_STYLES.find((f) => f.key === appearance.faceStyle)?.label}>
                                <View style={styles.optionGrid}>
                                    {FACE_STYLES.map((f) => (
                                        <OptionTile key={f.key} emoji={f.emoji} label={f.label} selected={appearance.faceStyle === f.key} onPress={() => change({ faceStyle: f.key })} />
                                    ))}
                                </View>
                            </Section>
                        )}
                        {tab === 'suit' && (
                            <>
                                <Section title="Space Suit" meta={OUTFITS.find((o) => o.key === appearance.outfitId)?.label}>
                                    <View style={styles.optionGrid}>
                                        {OUTFITS.map((o) => (
                                            <OptionTile key={o.key} emoji={o.emoji} label={o.label} selected={appearance.outfitId === o.key} onPress={() => change({ outfitId: o.key })} />
                                        ))}
                                    </View>
                                </Section>
                                <Section title="Suit Hue">
                                    <Swatches colors={OUTFIT_COLORS} selected={appearance.outfitColor} onSelect={(c) => change({ outfitColor: c })} />
                                </Section>
                            </>
                        )}
                        {tab === 'gear' && (
                            <Section title="Bubble Gear" meta={`${appearance.accessoryIds.length} equipped`}>
                                <View style={styles.optionGrid}>
                                    {GEAR.map((g) => (
                                        <OptionTile key={g.key} emoji={g.emoji} label={g.label} selected={appearance.accessoryIds.includes(g.key)} onPress={() => toggleGear(g.key)} />
                                    ))}
                                </View>
                            </Section>
                        )}
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(220).duration(450)} style={styles.footer}>
                    <CosmicButton label={isFirstMinni ? 'Save & Launch Minni!' : 'Save Minni'} size="lg" leading="🚀" trailing="⭐" onPress={handleSave} loading={isSaving} />
                </Animated.View>
            </ScrollView>
            {!isFirstMinni && <CosmicTabBar active="avatar" />}
            <FaceCropModal
                visible={!!pickedUri}
                sourceUri={pickedUri}
                sourceSize={pickedSize}
                onCancel={() => {
                    setPickedUri(null);
                    setPickedSize(null);
                }}
                onConfirm={handleCropConfirm}
                isSaving={isSavingPhoto}
            />
        </SafeAreaView>
    );
}

function Section({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
            </View>
            {children}
        </View>
    );
}

function Swatches({ colors, selected, onSelect }: { colors: readonly string[]; selected: string; onSelect: (c: string) => void }) {
    return (
        <View style={styles.swatchRow}>
            {colors.map((c) => {
                const on = c === selected;
                return (
                    <Bouncy key={c} onPress={() => onSelect(c)} scaleTo={0.85}>
                        <View style={[styles.swatch, { backgroundColor: c }, on && styles.swatchSelected]}>
                            {on && <Text style={[styles.swatchCheck, { color: c === '#FFFFFF' || c === '#FFD166' || c === '#FFE0BD' ? COSMIC.ink : '#FFFFFF' }]}>✓</Text>}
                        </View>
                    </Bouncy>
                );
            })}
        </View>
    );
}

function OptionTile({ emoji, label, selected, onPress }: { emoji: string; label: string; selected: boolean; onPress: () => void }) {
    return (
        <Bouncy onPress={onPress} scaleTo={0.9} style={styles.tileWrap}>
            <View style={[styles.tile, selected && styles.tileSelected]}>
                <View style={styles.tileIcon}>
                    <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </View>
                <Text style={[styles.tileLabel, selected && styles.tileLabelSelected]} numberOfLines={1}>
                    {label}
                </Text>
                {selected && (
                    <View style={styles.tileCheck}>
                        <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>✓</Text>
                    </View>
                )}
            </View>
        </Bouncy>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.surfaceLow },
    scroll: { padding: 16, gap: 14, paddingBottom: 24 },
    stage: { borderRadius: 32, padding: 14, overflow: 'hidden', minHeight: 420 },
    stageTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    namePill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4 },
    nameInput: { flex: 1, fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base, color: COSMIC.ink, paddingVertical: 8 },
    previewArea: { alignItems: 'center', justifyContent: 'flex-end', height: 270, marginTop: 4 },
    platformGlow: { position: 'absolute', bottom: 8, width: 240, height: 40, borderRadius: 120, backgroundColor: COSMIC.aqua, opacity: 0.35 },
    platform: { width: 200, height: 22, borderRadius: 11, overflow: 'hidden', marginTop: -6 },
    poseLabel: { position: 'absolute', top: 10, fontFamily: TYPOGRAPHY.fontFamilyDisplayBlack, fontSize: TYPOGRAPHY.xl, color: COSMIC.magenta },
    stageControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 12 },

    options: { gap: 6 },
    tabRow: { gap: 8, paddingBottom: 6 },
    section: { paddingTop: 10, gap: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.lg, color: COSMIC.ink },
    sectionMeta: { fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.magentaDark },
    swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    swatch: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: COSMIC.grape, shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
    swatchSelected: { borderColor: COSMIC.magenta, transform: [{ scale: 1.08 }] },
    swatchCheck: { fontSize: 18, fontWeight: '900' },
    optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tileWrap: { width: '30.5%' },
    tile: { backgroundColor: COSMIC.lilacPale, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: 'transparent' },
    tileSelected: { backgroundColor: COSMIC.pinkPale, borderColor: COSMIC.magenta },
    tileIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    tileLabel: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 11, color: COSMIC.ink },
    tileLabelSelected: { color: COSMIC.magentaDark },
    tileCheck: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: COSMIC.magenta, alignItems: 'center', justifyContent: 'center' },
    footer: { paddingTop: 4 },

    photoRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
    photoPreview: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: COSMIC.magenta },
    photoActions: { flex: 1, gap: 10 },
    photoCta: { gap: 12 },
    photoHint: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurfaceVariant, lineHeight: 19 },
    photoButtonRow: { flexDirection: 'row', gap: 10 },
});

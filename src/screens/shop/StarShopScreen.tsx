import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { Easing, FadeInDown, FadeInUp, ZoomIn, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CHARACTERS } from '../../assets/cosmicBubble';
import { Bobbing } from '../../components/fx/Bobbing';
import { Bouncy } from '../../components/fx/Bouncy';
import { Card } from '../../components/ui/Card';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { CosmicTabBar } from '../../components/ui/CosmicTabBar';
import { StatBar } from '../../components/ui/StatBar';
import { DAILY_POD_REWARD, GACHA_COST, PETS } from '../../constants/pets';
import { PLAYSETS } from '../../constants/playsets';
import { useGame } from '../../context/GameContext';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { PetDef, RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'StarShop'>;

const ORB_ICONS = ['👑', '🐾', '✨', '⭐', '🚀', '🧸'];
const ORB_TINTS = [COSMIC.magenta, COSMIC.aqua, COSMIC.gold, '#FFFFFF', COSMIC.violet, COSMIC.mint];

const PACKS = [
    { id: 'transit', emoji: '🚌', title: 'Transit Pass Pack', sub: 'Opens every station, market & pit stop', cost: 300, keys: PLAYSETS.filter((p) => p.district === 'transit').map((p) => p.key) },
    { id: 'studios', emoji: '🎬', title: 'Star Studios Pass', sub: 'Music, emotes, wardrobe & the secret treehouse', cost: 450, keys: PLAYSETS.filter((p) => p.district === 'studios').map((p) => p.key) },
];

function fmt(ms: number) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// "Mystery Orb & Star Shop" (Stitch f245f7c0): the Cosmic Orb Gacha, a just-unboxed
// reveal card, the Daily Mystery Pod, and featured packs that unlock whole districts.
export function StarShopScreen({ navigation }: Props) {
    const { progress, podReadyAt, pullGacha, claimDailyPod, equipPet, unlockPack, grantRandomPets } = useGame();
    const [reveal, setReveal] = useState<{ pet: PetDef; isNew: boolean } | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [now, setNow] = useState(Date.now());
    const [spinning, setSpinning] = useState(false);
    const rotation = useSharedValue(0);
    const orbScale = useSharedValue(1);

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
    const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: orbScale.value }] }));

    const flash = (text: string) => {
        setMessage(text);
        setTimeout(() => setMessage(null), 2600);
    };

    const onPull = () => {
        if (spinning) return;
        if (progress.stars < GACHA_COST) {
            flash(`You need ${GACHA_COST} ✨ for a twist. Play in a room to earn more!`);
            return;
        }
        setSpinning(true);
        setReveal(null);
        rotation.value = withTiming(rotation.value + 1080, { duration: 1600, easing: Easing.out(Easing.cubic) });
        orbScale.value = withSequence(withTiming(0.9, { duration: 300 }), withSpring(1.08, { damping: 5 }), withSpring(1));
        setTimeout(() => {
            const result = pullGacha();
            setSpinning(false);
            if (result) {
                setReveal(result);
                flash(result.isNew ? `NEW pet: ${result.pet.name}!` : `Duplicate ${result.pet.name} → +10 💎 Star Dust`);
            }
        }, 1500);
    };

    const onClaimPod = () => {
        if (claimDailyPod()) flash(`Daily Mystery Pod hatched: +${DAILY_POD_REWARD} ✨!`);
    };

    const onBuyPack = (pack: (typeof PACKS)[number]) => {
        const alreadyOpen = pack.keys.every((k) => progress.unlocked.includes(k));
        if (alreadyOpen) {
            flash('You already own everything in this pack!');
            return;
        }
        if (unlockPack(pack.keys, pack.cost)) flash(`${pack.title} unlocked! Check the World Map.`);
        else flash(`Not enough stars — the ${pack.title} costs ${pack.cost} ✨.`);
    };

    const onPetParadise = () => {
        const missing = PETS.filter((p) => !progress.pets.includes(p.id)).length;
        if (missing === 0) {
            flash('You have every cosmic pet already! 🎉');
            return;
        }
        const picks = grantRandomPets(3, 300);
        if (!picks) flash('Not enough stars — Bubble Pet Paradise costs 300 ✨.');
        else flash(`New friends: ${picks.map((p) => p.emoji + ' ' + p.name).join(', ')}`);
    };

    const equippedPet = useMemo(() => PETS.find((p) => p.id === progress.equippedPet) ?? null, [progress.equippedPet]);
    const podCountdown = podReadyAt ? fmt(podReadyAt - now) : null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatBar />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Stash */}
                <Card style={styles.stash}>
                    <View style={styles.stashIcon}>
                        <Text style={{ fontSize: 22 }}>⭐</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.stashLabel}>COSMIC STASH</Text>
                        <Text style={styles.stashValue}>
                            {progress.stars.toLocaleString()} <Text style={styles.stashUnit}>STARS</Text>
                        </Text>
                    </View>
                    <CosmicButton label="Earn" leading="🚀" size="sm" onPress={() => navigation.navigate('WorldMap')} />
                </Card>

                {/* Gacha */}
                <Animated.View entering={FadeInDown.delay(80).duration(450).springify()}>
                    <Card style={styles.gacha} tint={COSMIC.lilacPale}>
                        <View style={styles.gachaHeader}>
                            <View style={[styles.stashIcon, { backgroundColor: COSMIC.magenta }]}>
                                <Text style={{ fontSize: 18 }}>✨</Text>
                            </View>
                            <Text style={styles.gachaTitle}>Cosmic Orb Gacha</Text>
                            <View style={styles.series}>
                                <Text style={styles.seriesText}>Series 04 ✨</Text>
                            </View>
                        </View>

                        <Animated.View style={[styles.orb, orbStyle]}>
                            <Animated.View style={[styles.ring, ringStyle]}>
                                {ORB_ICONS.map((icon, i) => {
                                    const angle = (i / ORB_ICONS.length) * Math.PI * 2;
                                    return (
                                        <View
                                            key={icon}
                                            style={[
                                                styles.orbChip,
                                                { backgroundColor: ORB_TINTS[i], transform: [{ translateX: Math.cos(angle) * 78 }, { translateY: Math.sin(angle) * 78 }] },
                                            ]}
                                        >
                                            <Text style={{ fontSize: 20 }}>{icon}</Text>
                                        </View>
                                    );
                                })}
                            </Animated.View>
                            <View style={styles.orbCenter}>
                                <Text style={{ fontSize: 30 }}>{spinning ? '🌀' : '🎁'}</Text>
                            </View>
                        </Animated.View>

                        <View style={styles.pullRow}>
                            <View style={styles.pullInfo}>
                                <Text style={styles.pullTitle}>1 Twist</Text>
                                <Text style={styles.pullCost}>Cost: {GACHA_COST} Stars</Text>
                            </View>
                            <CosmicButton label={spinning ? 'Spinning…' : 'PULL!'} onPress={onPull} disabled={spinning} />
                        </View>
                    </Card>
                </Animated.View>

                {/* Reveal */}
                {reveal && (
                    <Animated.View key={reveal.pet.id + String(progress.pets.length)} entering={ZoomIn.duration(500).springify()}>
                        <Card style={styles.reveal} tint="#FFF9E6">
                            <View style={styles.revealTop}>
                                <View style={styles.revealTag}>
                                    <Text style={styles.revealTagText}>✅ JUST UNBOXED!</Text>
                                </View>
                                <View style={[styles.revealTag, { backgroundColor: COSMIC.goldPale }]}>
                                    <Text style={[styles.revealTagText, { color: COSMIC.goldDeep }]}>{reveal.isNew ? 'NEW!' : 'DUPE → 💎'}</Text>
                                </View>
                            </View>
                            <Bobbing amplitude={6} duration={2800}>
                                <View style={styles.revealArt}>
                                    {reveal.pet.id === 'sparkle_star_blob' ? (
                                        <Image source={CHARACTERS.starPet} style={styles.revealImage} />
                                    ) : (
                                        <Text style={{ fontSize: 96 }}>{reveal.pet.emoji}</Text>
                                    )}
                                    <View style={styles.rarityPill}>
                                        <Text style={styles.rarityText}>
                                            {reveal.pet.rarity === 'legendary' ? '⭐ Legendary Pet' : reveal.pet.rarity === 'rare' ? '💫 Rare Pet' : '🫧 Common Pet'}
                                        </Text>
                                    </View>
                                </View>
                            </Bobbing>
                            <Text style={styles.revealName}>{reveal.pet.name}</Text>
                            <Text style={styles.revealBlurb}>{reveal.pet.blurb}</Text>
                            <View style={styles.revealActions}>
                                <CosmicButton label="Pet Cry" leading="🔊" tone="lilac" size="sm" style={{ flex: 1 }} onPress={() => flash(`${reveal.pet.emoji} ${reveal.pet.name} says: ${['Bwoop!', 'Fizz fizz!', 'Sparkle!', 'Twinkle~'][Math.floor(Math.random() * 4)]}`)} />
                                <CosmicButton
                                    label={progress.equippedPet === reveal.pet.id ? 'Equipped ✓' : 'Equip Pet'}
                                    leading="🐾"
                                    tone="teal"
                                    size="sm"
                                    style={{ flex: 1 }}
                                    onPress={() => {
                                        equipPet(reveal.pet.id);
                                        flash(`${reveal.pet.name} will follow you into every room!`);
                                    }}
                                />
                            </View>
                        </Card>
                    </Animated.View>
                )}

                {/* Daily pod */}
                <Animated.View entering={FadeInUp.delay(150).duration(450)}>
                    <Card style={styles.pod} tint={COSMIC.magenta}>
                        <View style={styles.podRow}>
                            <View style={styles.podIcon}>
                                <Text style={{ fontSize: 26 }}>🎁</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.podTitle}>Daily Mystery Pod</Text>
                                <Text style={styles.podSub}>{podCountdown ? 'Hatching soon…' : 'Free reward ready to hatch!'}</Text>
                            </View>
                            <View style={styles.freePill}>
                                <Text style={styles.freeText}>{podCountdown ? 'SOON' : 'FREE'}</Text>
                            </View>
                        </View>
                        <View style={styles.podBottom}>
                            <View style={styles.timer}>
                                <Text style={styles.timerText}>⏱ {podCountdown ?? 'READY!'}</Text>
                            </View>
                            <CosmicButton label={podCountdown ? 'Come back later' : `CLAIM +${DAILY_POD_REWARD} ✨`} tone="snow" size="sm" disabled={!!podCountdown} onPress={onClaimPod} />
                        </View>
                    </Card>
                </Animated.View>

                {/* Pet collection */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🐾 Pet House</Text>
                    <Text style={styles.sectionMeta}>
                        {progress.pets.length} / {PETS.length} collected
                    </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petRow}>
                    {PETS.map((pet) => {
                        const owned = progress.pets.includes(pet.id);
                        const equipped = progress.equippedPet === pet.id;
                        return (
                            <Bouncy key={pet.id} onPress={() => (owned ? equipPet(equipped ? null : pet.id) : flash('Pull the Cosmic Orb to find this pet!'))} scaleTo={0.9}>
                                <View style={[styles.petCard, equipped && styles.petCardEquipped, !owned && styles.petCardLocked]}>
                                    {pet.id === 'sparkle_star_blob' && owned ? (
                                        <Image source={CHARACTERS.starPetCircle} style={styles.petCardImage} />
                                    ) : (
                                        <Text style={{ fontSize: 34, opacity: owned ? 1 : 0.35 }}>{owned ? pet.emoji : '❔'}</Text>
                                    )}
                                    <Text style={styles.petName} numberOfLines={1}>
                                        {owned ? pet.name : '???'}
                                    </Text>
                                    {equipped && <Text style={styles.petEquipped}>Following ✓</Text>}
                                </View>
                            </Bouncy>
                        );
                    })}
                </ScrollView>
                {equippedPet && <Text style={styles.petHint}>{equippedPet.emoji} {equippedPet.name} follows you into every play room. Tap a pet to swap.</Text>}

                {/* Packs */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🛍️ Featured Cosmic Packs</Text>
                </View>
                <View style={styles.packs}>
                    {PACKS.map((pack, i) => {
                        const owned = pack.keys.every((k) => progress.unlocked.includes(k));
                        return (
                            <Animated.View key={pack.id} entering={FadeInUp.delay(220 + i * 80).duration(400)}>
                                <Card style={styles.pack}>
                                    <View style={[styles.packArt, { backgroundColor: i === 0 ? COSMIC.aquaPale : COSMIC.lilac }]}>
                                        <Text style={{ fontSize: 48 }}>{pack.emoji}</Text>
                                        <View style={styles.packMeta}>
                                            <Text style={styles.packMetaText}>🏠 {pack.keys.length} Playsets</Text>
                                        </View>
                                    </View>
                                    <View style={styles.packBody}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.packTitle}>{pack.title}</Text>
                                            <Text style={styles.packSub}>{pack.sub}</Text>
                                        </View>
                                        <CosmicButton label={owned ? 'Owned ✓' : `${pack.cost}`} leading={owned ? undefined : '⭐'} tone={owned ? 'mint' : 'gold'} size="sm" onPress={() => onBuyPack(pack)} />
                                    </View>
                                </Card>
                            </Animated.View>
                        );
                    })}
                    <Animated.View entering={FadeInUp.delay(400).duration(400)}>
                        <Card style={styles.pack}>
                            <View style={[styles.packArt, { backgroundColor: COSMIC.pinkPale }]}>
                                <Image source={CHARACTERS.starPetCircle} style={{ width: 84, height: 84 }} />
                                <View style={styles.packMeta}>
                                    <Text style={styles.packMetaText}>🐾 3 Cosmic Pets</Text>
                                </View>
                            </View>
                            <View style={styles.packBody}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.packTitle}>Bubble Pet Paradise</Text>
                                    <Text style={styles.packSub}>Three new glowing stardust pets, guaranteed no duplicates!</Text>
                                </View>
                                <CosmicButton label="300" leading="⭐" tone="gold" size="sm" onPress={onPetParadise} />
                            </View>
                        </Card>
                    </Animated.View>
                </View>

                <View style={styles.tip}>
                    <Text style={styles.tipText}>💡 Tip: Unboxing identical duplicates automatically converts them into 💎 Super Star Dust!</Text>
                </View>
            </ScrollView>

            {message && (
                <Animated.View entering={FadeInDown.duration(300).springify()} style={styles.toast} pointerEvents="none">
                    <Text style={styles.toastText}>{message}</Text>
                </Animated.View>
            )}

            <CosmicTabBar active="shop" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.surfaceLow },
    scroll: { padding: 16, gap: 14, paddingBottom: 24 },
    stash: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stashIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COSMIC.gold, alignItems: 'center', justifyContent: 'center' },
    stashLabel: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 10, letterSpacing: 1.5, color: COSMIC.grape },
    stashValue: { fontFamily: TYPOGRAPHY.fontFamilyDisplayBlack, fontSize: TYPOGRAPHY['2xl'], color: COSMIC.ink },
    stashUnit: { fontSize: TYPOGRAPHY.sm, color: COSMIC.grapeLight },

    gacha: { alignItems: 'center', gap: 12 },
    gachaHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch' },
    gachaTitle: { flex: 1, fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: COSMIC.ink },
    series: { backgroundColor: COSMIC.goldPale, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    seriesText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xs, color: COSMIC.goldDeep },
    orb: { width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
    ring: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    orbChip: { position: 'absolute', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
    orbCenter: { width: 70, height: 70, borderRadius: 35, backgroundColor: COSMIC.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
    pullRow: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 10, paddingLeft: 16 },
    pullInfo: { flex: 1 },
    pullTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base, color: COSMIC.ink },
    pullCost: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurfaceVariant },

    reveal: { alignItems: 'center', gap: 8 },
    revealTop: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
    revealTag: { backgroundColor: COSMIC.mintPale, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    revealTagText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xs, color: COSMIC.mintDark },
    revealArt: { width: 200, height: 200, borderRadius: 28, backgroundColor: COSMIC.lilacPale, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    revealImage: { width: 200, height: 200 },
    rarityPill: { position: 'absolute', bottom: 10, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    rarityText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xs, color: COSMIC.grape },
    revealName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayBlack, fontSize: TYPOGRAPHY['2xl'], color: COSMIC.ink },
    revealBlurb: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurfaceVariant, textAlign: 'center' },
    revealActions: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 4 },

    pod: { gap: 12 },
    podRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    podIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
    podTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.lg, color: '#FFFFFF' },
    podSub: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: 'rgba(255,255,255,0.85)' },
    freePill: { backgroundColor: COSMIC.gold, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    freeText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayBlack, fontSize: TYPOGRAPHY.xs, color: COSMIC.goldDeep },
    podBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    timer: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
    timerText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, color: '#FFFFFF', fontSize: TYPOGRAPHY.sm, fontVariant: ['tabular-nums'] },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 },
    sectionTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: COSMIC.ink },
    sectionMeta: { fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.magentaDark },
    petRow: { gap: 10, paddingVertical: 2 },
    petCard: { width: 96, height: 108, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 2, borderColor: COSMIC.lilac, padding: 6 },
    petCardEquipped: { borderColor: COSMIC.magenta, backgroundColor: COSMIC.pinkPale },
    petCardLocked: { backgroundColor: COSMIC.surfaceHigh },
    petCardImage: { width: 48, height: 48 },
    petName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 11, color: COSMIC.ink, textAlign: 'center' },
    petEquipped: { fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: 9, color: COSMIC.magentaDark },
    petHint: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.xs, color: COSMIC.onSurfaceVariant, textAlign: 'center' },

    packs: { gap: 12 },
    pack: { padding: 10, gap: 10 },
    packArt: { height: 120, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    packMeta: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
    packMetaText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 10, color: COSMIC.grape },
    packBody: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4, paddingBottom: 2 },
    packTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.lg, color: COSMIC.ink },
    packSub: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.xs, color: COSMIC.onSurfaceVariant },

    tip: { backgroundColor: COSMIC.aquaPale, borderRadius: 20, padding: 14 },
    tipText: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.aquaDeep },

    toast: { position: 'absolute', top: 64, left: 24, right: 24, backgroundColor: COSMIC.ink, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
    toastText: { color: COSMIC.gold, fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.sm, textAlign: 'center' },
});

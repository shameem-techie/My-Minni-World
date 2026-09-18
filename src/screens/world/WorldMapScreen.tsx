import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MAPS } from '../../assets/cosmicBubble';
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
import { CATEGORY_FILTERS, DISTRICTS, PLAYSETS, PLAYSETS_BY_KEY } from '../../constants/playsets';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { loadActiveMinni } from '../../services/minni.service';
import { CLAY, COSMIC, GRADIENT_SPACE, TYPOGRAPHY } from '../../theme';
import type { DistrictKey, Minni, RootStackParamList, ZoneCategory } from '../../types';
import { UnlockSheet } from './UnlockSheet';
import { useZoneUnlock } from './useZoneUnlock';

type Props = NativeStackScreenProps<RootStackParamList, 'WorldMap'>;

const MAP_ASPECT = 1376 / 768;

// "Cosmic Island City — Interactive World Map" (Stitch 127021d0) + "Transit & Market
// District" (64da6f5e): explorer header, district switcher, the isometric map with bobbing
// pins over every building, then the zone list with ENTER / UNLOCK buttons.
export function WorldMapScreen({ navigation }: Props) {
    const { user } = useAuth();
    const { progress, isUnlocked } = useGame();
    const { pendingUnlock, setPendingUnlock, enter, confirmUnlock } = useZoneUnlock();
    const [district, setDistrict] = useState<DistrictKey>('island');
    const [filter, setFilter] = useState<'all' | ZoneCategory>('all');
    const [minni, setMinni] = useState<Minni | null>(null);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        loadActiveMinni(user.uid).then((m) => {
            if (!cancelled) setMinni(m);
        });
        return () => {
            cancelled = true;
        };
    }, [user]);

    // Refresh the avatar when coming back from the creator.
    useEffect(() => {
        const unsub = navigation.addListener('focus', () => {
            if (user) loadActiveMinni(user.uid).then(setMinni);
        });
        return unsub;
    }, [navigation, user]);

    const districtDef = DISTRICTS.find((d) => d.key === district)!;
    const zones = useMemo(
        () => PLAYSETS.filter((p) => p.district === district && (filter === 'all' || p.category === filter)),
        [district, filter],
    );
    const openCount = zones.filter((z) => isUnlocked(z.key)).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#7B2CBF', '#5A189A', '#3A0CA3']} style={StyleSheet.absoluteFillObject} />
            <FloatingBubbles count={5} seed={3} />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Explorer header */}
                <View style={styles.header}>
                    <Bouncy onPress={() => navigation.navigate('CharacterCreator')} style={styles.explorerCard}>
                        <View style={styles.avatar}>
                            {minni ? <MinniCharacter appearance={minni.appearance} size={54} /> : <Text style={{ fontSize: 24 }}>👩‍🚀</Text>}
                        </View>
                        <View>
                            <Text style={styles.explorerLabel}>EXPLORER</Text>
                            <Text style={styles.explorerName} numberOfLines={1}>
                                {progress.explorerName} 🛸
                            </Text>
                        </View>
                    </Bouncy>
                    <View style={{ flex: 1 }} />
                    <CircleButton icon="settings-sharp" tone="lilac" size={40} onPress={() => navigation.navigate('Settings')} />
                </View>
                <StatBar showProfile={false} showSettings={false} />

                {/* District switcher */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.districtRow}>
                    {DISTRICTS.map((d) => (
                        <Chip
                            key={d.key}
                            label={d.name}
                            emoji={d.key === 'island' ? '⭐' : d.key === 'transit' ? '🚌' : '✨'}
                            selected={d.key === district}
                            tone={d.key === district ? 'magenta' : 'snow'}
                            onPress={() => {
                                setDistrict(d.key);
                                setFilter('all');
                            }}
                        />
                    ))}
                </ScrollView>

                {/* Map card — a single tap target now: the whole tile opens the
                    fullscreen, pannable map where pins actually become selectable.
                    Bouncy (which applies a Reanimated transform for the tap-squish
                    feel) wraps only the image, not the pins — a transformed ancestor
                    combined with mapFrame's borderRadius/overflow:hidden clipped pin
                    labels near the card's edges on iOS, even though nothing clipped on
                    Android. Pins sit as an un-transformed sibling instead; taps still
                    reach the image underneath since pinLayer is pointerEvents="none". */}
                <Animated.View key={district} entering={FadeIn.duration(400)} style={styles.mapCard}>
                    <Bouncy onPress={() => navigation.navigate('FullscreenMap', { district })} scaleTo={0.98} style={styles.mapFrame}>
                        {districtDef.map ? (
                            <Image source={MAPS[districtDef.map]} style={styles.mapImage} resizeMode="cover" />
                        ) : (
                            <LinearGradient colors={GRADIENT_SPACE} style={styles.mapImage}>
                                <Starfield />
                            </LinearGradient>
                        )}
                    </Bouncy>
                    <View style={styles.pinLayer} pointerEvents="none">
                        {districtDef.pins.map((pin, i) => {
                            const def = PLAYSETS_BY_KEY[pin.playsetKey];
                            const open = isUnlocked(def.key);
                            return (
                                <View key={def.key} style={[styles.pinAnchor, { left: `${pin.x}%`, top: `${pin.y}%` }]}>
                                    <Bobbing amplitude={5} duration={2600 + i * 230} delay={i * 140}>
                                        <View style={[styles.pin, { backgroundColor: open ? CLAY[def.tone].base : '#D9D3E6' }]}>
                                            <Text style={styles.pinEmoji}>{open ? def.emoji : '🔒'}</Text>
                                            <Text style={[styles.pinLabel, { color: open ? CLAY[def.tone].text : '#6B6480' }]} numberOfLines={1}>
                                                {def.shortName}
                                            </Text>
                                        </View>
                                        <View style={[styles.pinTail, { borderTopColor: open ? CLAY[def.tone].base : '#D9D3E6' }]} />
                                    </Bobbing>
                                </View>
                            );
                        })}
                        <View style={styles.sectorChip} pointerEvents="none">
                            <Text style={styles.sectorText}>✨ {districtDef.sector}</Text>
                        </View>
                        <View style={styles.tapHint} pointerEvents="none">
                            <Text style={styles.tapHintText}>🔍 Tap to open the full map</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Zone list */}
                <View style={styles.zoneHeader}>
                    <View>
                        <Text style={styles.zoneTitle}>🪐 Explore {district === 'studios' ? 'Star Studios' : 'District Zones'}</Text>
                        <Text style={styles.zoneSub}>Select a zone to start roleplaying</Text>
                    </View>
                    <View style={styles.openPill}>
                        <Text style={styles.openPillText}>
                            {openCount} / {zones.length} Open
                        </Text>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {CATEGORY_FILTERS.filter((f) => f.key === 'all' || PLAYSETS.some((p) => p.district === district && p.category === f.key)).map((f) => (
                        <Chip key={f.key} label={f.label} emoji={f.emoji} selected={filter === f.key} tone={filter === f.key ? 'gold' : 'snow'} small onPress={() => setFilter(f.key)} />
                    ))}
                </ScrollView>

                <View style={styles.zoneList}>
                    {zones.map((def, i) => {
                        const open = isUnlocked(def.key);
                        const tone = CLAY[def.tone];
                        return (
                            <Animated.View key={def.key} entering={FadeInDown.delay(60 * i).duration(400).springify()}>
                                <Card style={[styles.zoneCard, !open && styles.zoneCardLocked]}>
                                    <View style={[styles.zoneIcon, { backgroundColor: open ? tone.base : '#EFEAF7' }]}>
                                        <Text style={{ fontSize: 30 }}>{def.emoji}</Text>
                                        {!open && (
                                            <View style={styles.lockBadge}>
                                                <Text style={{ fontSize: 12 }}>🔒</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.zoneBody}>
                                        <View style={styles.zoneTagRow}>
                                            <View style={[styles.zoneTag, { backgroundColor: open ? CLAY.lilac.base : '#F1EEF7' }]}>
                                                <Text style={styles.zoneTagText}>{def.tag}</Text>
                                            </View>
                                            <Text style={[styles.zoneStatus, { color: open ? COSMIC.mintDark : COSMIC.muted }]} numberOfLines={1}>
                                                {open ? `● ${def.status}` : `Needs ${def.unlockCost} ✨`}
                                            </Text>
                                        </View>
                                        <Text style={styles.zoneName} numberOfLines={2}>
                                            {def.name}
                                        </Text>
                                        <Text style={styles.zoneBlurb} numberOfLines={2}>
                                            {def.blurb}
                                        </Text>
                                    </View>
                                    <CosmicButton
                                        label={open ? (def.category === 'homes' && def.unlockCost > 0 ? 'BUILD' : 'ENTER') : 'Unlock'}
                                        trailing={open ? (def.key === 'star_soda_arcade' ? '🎮' : '🚀') : '🔑'}
                                        size="sm"
                                        tone={open ? def.tone : 'lilac'}
                                        onPress={() => enter(def)}
                                    />
                                </Card>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            <CosmicTabBar active="map" />

            <UnlockSheet pendingUnlock={pendingUnlock} stars={progress.stars} onConfirm={confirmUnlock} onCancel={() => setPendingUnlock(null)} />
        </SafeAreaView>
    );
}

// Decorative star dots for the map-less "Star Studios" district.
function Starfield() {
    const stars = useMemo(() => {
        let s = 42;
        const rand = () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
        return Array.from({ length: 40 }, () => ({ x: rand() * 100, y: rand() * 100, size: 2 + rand() * 4, o: 0.4 + rand() * 0.6 }));
    }, []);
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {stars.map((st, i) => (
                <View key={i} style={{ position: 'absolute', left: `${st.x}%`, top: `${st.y}%`, width: st.size, height: st.size, borderRadius: st.size, backgroundColor: '#FFFFFF', opacity: st.o }} />
            ))}
            <Text style={{ position: 'absolute', left: '44%', top: '44%', fontSize: 34 }}>🪐</Text>
            <Text style={{ position: 'absolute', left: '8%', top: '78%', fontSize: 22 }}>☄️</Text>
            <Text style={{ position: 'absolute', left: '84%', top: '10%', fontSize: 22 }}>🌙</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.grape },
    scroll: { paddingBottom: 24 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6 },
    explorerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
        paddingRight: 18,
        paddingLeft: 6,
        paddingVertical: 5,
        borderWidth: 2,
        borderColor: COSMIC.magenta,
        maxWidth: '70%',
    },
    avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: COSMIC.lilacPale, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    explorerLabel: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 10, letterSpacing: 1.5, color: COSMIC.magenta },
    explorerName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.lg, color: COSMIC.ink },
    districtRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },

    mapCard: {
        marginHorizontal: 16,
        aspectRatio: MAP_ASPECT,
        borderRadius: 28,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        backgroundColor: COSMIC.grapeDeep,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    mapFrame: { ...StyleSheet.absoluteFillObject, borderRadius: 24, overflow: 'hidden' },
    mapImage: { width: '100%', height: '100%' },
    pinLayer: { ...StyleSheet.absoluteFillObject },
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
    // Explicit lineHeight, not left to the platform default — a custom font's default
    // line metrics can differ enough between iOS and Android to clip the bottom of this
    // text against the pill's own rounded background on one platform and not the other.
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
    sectorChip: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(39,0,87,0.65)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    sectorText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplay, fontSize: 11 },
    tapHint: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(39,0,87,0.65)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    tapHintText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplay, fontSize: 11 },

    zoneHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    zoneTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: '#FFFFFF' },
    zoneSub: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: 'rgba(255,255,255,0.75)' },
    openPill: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
    openPillText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplay, fontSize: TYPOGRAPHY.xs },
    filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
    zoneList: { paddingHorizontal: 16, gap: 12 },
    zoneCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
    zoneCardLocked: { opacity: 0.9 },
    zoneIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    lockBadge: { position: 'absolute', right: -4, top: -4, backgroundColor: '#FFFFFF', borderRadius: 999, padding: 3 },
    zoneBody: { flex: 1, gap: 2 },
    zoneTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    zoneTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    zoneTagText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 9, letterSpacing: 0.8, color: COSMIC.grape },
    zoneStatus: { flex: 1, fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.xs },
    zoneName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base, color: COSMIC.ink },
    zoneBlurb: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.xs, color: COSMIC.onSurfaceVariant },
});

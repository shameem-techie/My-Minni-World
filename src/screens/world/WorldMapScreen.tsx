import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bouncy } from '../../components/fx/Bouncy';
import { FloatingBubbles } from '../../components/fx/FloatingBubbles';
import { MinniCharacter } from '../../components/illustrations/MinniCharacter';
import { Chip } from '../../components/ui/Chip';
import { CircleButton } from '../../components/ui/CircleButton';
import { CosmicTabBar } from '../../components/ui/CosmicTabBar';
import { GridCard } from '../../components/ui/GridCard';
import { StatBar } from '../../components/ui/StatBar';
import { CATEGORY_FILTERS, DISTRICTS, PLAYSETS, PLAYSETS_BY_KEY } from '../../constants/playsets';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { loadActiveMinni } from '../../services/minni.service';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { DistrictKey, GalaxySectorDef, Minni, RootStackParamList, ZoneCategory } from '../../types';
import { GalaxyMapCard } from './GalaxyMapCard';
import { UnlockSheet } from './UnlockSheet';
import { useZoneUnlock } from './useZoneUnlock';

type Props = NativeStackScreenProps<RootStackParamList, 'WorldMap'>;

// The landing screen: explorer header, then the World Map as a *block* on the page
// (GalaxyMapCard — drag/pinch/zoom in place), then the district switcher and zone grid.
//
// The galaxy briefly lived here as a full-bleed screen of its own (GalaxyMapScreen as
// the app's initial route) and it never sat right — a map that owns the whole viewport
// leaves nowhere for the explorer header, the zone list or the tab chrome to go without
// overlapping the art. It's back inside a card, where the rest of the page can breathe;
// the fullscreen version still exists behind the card's ⛶ button for actual exploring.
export function WorldMapScreen({ navigation }: Props) {
    const { user } = useAuth();
    const { progress, isUnlocked } = useGame();
    const { pendingUnlock, setPendingUnlock, enter, confirmUnlock } = useZoneUnlock();
    const [district, setDistrict] = useState<DistrictKey>('island');
    const [filter, setFilter] = useState<'all' | ZoneCategory>('all');
    const [minni, setMinni] = useState<Minni | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    useEffect(() => () => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
    }, []);

    const districtDef = DISTRICTS.find((d) => d.key === district)!;
    const zones = useMemo(
        () => PLAYSETS.filter((p) => p.district === district && (filter === 'all' || p.category === filter)),
        [district, filter],
    );
    const openCount = zones.filter((z) => isUnlocked(z.key)).length;

    const showToast = (message: string) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(message);
        toastTimer.current = setTimeout(() => setToast(null), 2200);
    };

    // Sector taps from the card. The Hub opens the isometric district map fullscreen
    // (the art that used to fill this card); a sector with real content goes through the
    // same enter()/unlock pipeline every zone card below uses; a sector the art names but
    // nothing is built for yet just says so.
    const handleSector = (sector: GalaxySectorDef) => {
        if (sector.kind === 'hub') {
            navigation.navigate('FullscreenMap', { district });
            return;
        }
        if (sector.kind === 'playset' && sector.playsetKey) {
            const def = PLAYSETS_BY_KEY[sector.playsetKey];
            if (def) enter(def);
            return;
        }
        showToast(`🔒 ${sector.name}: Coming Soon!`);
    };

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

                {/* World Map block */}
                <GalaxyMapCard onSelectSector={handleSector} onExpand={() => navigation.navigate('GalaxyMap')} />

                {/* District switcher — drives the zone list below. */}
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

                {/* Zone list */}
                <View style={styles.zoneHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.zoneTitle}>🪐 Explore {district === 'studios' ? 'Star Studios' : 'District Zones'}</Text>
                        <Text style={styles.zoneSub}>Select a zone to start roleplaying</Text>
                    </View>
                    {districtDef.map && (
                        <CircleButton icon="map" tone="snow" size={36} onPress={() => navigation.navigate('FullscreenMap', { district })} style={{ marginRight: 8 }} />
                    )}
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

                <View style={styles.zoneGrid}>
                    {zones.map((def, i) => {
                        const open = isUnlocked(def.key);
                        return (
                            <Animated.View key={def.key} entering={FadeInDown.delay(60 * i).duration(400).springify()} style={styles.zoneGridItem}>
                                <GridCard
                                    tone={open ? def.tone : 'lilac'}
                                    emoji={def.emoji}
                                    label={def.shortName}
                                    badge={open ? 'OPEN' : undefined}
                                    locked={!open}
                                    onPress={() => enter(def)}
                                />
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            {toast && (
                <Animated.View entering={FadeInDown.duration(250).springify()} exiting={FadeOut.duration(200)} style={styles.toast} pointerEvents="none">
                    <Text style={styles.toastText}>{toast}</Text>
                </Animated.View>
            )}

            <CosmicTabBar active="map" />

            <UnlockSheet pendingUnlock={pendingUnlock} stars={progress.stars} onConfirm={confirmUnlock} onCancel={() => setPendingUnlock(null)} />
        </SafeAreaView>
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
    districtRow: { paddingHorizontal: 16, gap: 8, paddingTop: 16 },

    zoneHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
    zoneTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: '#FFFFFF' },
    zoneSub: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: 'rgba(255,255,255,0.75)' },
    openPill: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
    openPillText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplay, fontSize: TYPOGRAPHY.xs },
    filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
    zoneGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
    zoneGridItem: { width: '50%', padding: 4 },

    toast: { position: 'absolute', left: 24, right: 24, top: 90, backgroundColor: COSMIC.ink, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
    toastText: { color: COSMIC.gold, fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base },
});

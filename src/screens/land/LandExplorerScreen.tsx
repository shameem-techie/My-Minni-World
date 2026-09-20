import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PLOTS_RAW } from '../../assets/cosmicBubble';
import { Bouncy } from '../../components/fx/Bouncy';
import { FloatingBubbles } from '../../components/fx/FloatingBubbles';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { CosmicTabBar } from '../../components/ui/CosmicTabBar';
import { StatBar } from '../../components/ui/StatBar';
import { ARCHITECT_LEVEL_THRESHOLDS, LAND_PLOTS, xpForNextLevel } from '../../constants/landPlots';
import { useGame } from '../../context/GameContext';
import { CLAY, COSMIC, TYPOGRAPHY } from '../../theme';
import type { LandCurrency, LandPlotDef, RootStackParamList } from '../../types';
import { ClaimPlotSheet } from './ClaimPlotSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'LandExplorer'>;

type FilterKey = 'all' | 'buildable' | 'owned';

// "Next-Level: Raw Sites & Land Explorer" (Stitch 93356379) — reskinned with this
// app's own component kit (CosmicButton/Card/Chip) rather than a pixel clone of the
// mockup's bespoke HTML, so it matches every other screen's feel.
export function LandExplorerScreen({ navigation }: Props) {
    const { progress, architectLevel, isPlotClaimed, claimPlot } = useGame();
    const [filter, setFilter] = useState<FilterKey>('all');
    const [pendingClaim, setPendingClaim] = useState<LandPlotDef | null>(null);

    const { xpIntoLevel, xpToNext } = xpForNextLevel(progress.architectXp);
    const levelSpan = xpToNext === null ? 1 : xpIntoLevel + xpToNext;
    const levelProgress = xpToNext === null ? 1 : Math.min(1, xpIntoLevel / levelSpan);
    const nextThreshold = ARCHITECT_LEVEL_THRESHOLDS[architectLevel] as number | undefined;

    const buildableCount = LAND_PLOTS.filter((p) => !isPlotClaimed(p.id) && architectLevel >= p.requiredLevel).length;
    const ownedCount = LAND_PLOTS.filter((p) => isPlotClaimed(p.id)).length;

    const visiblePlots = useMemo(() => {
        if (filter === 'buildable') return LAND_PLOTS.filter((p) => !isPlotClaimed(p.id) && architectLevel >= p.requiredLevel);
        if (filter === 'owned') return LAND_PLOTS.filter((p) => isPlotClaimed(p.id));
        return LAND_PLOTS;
    }, [filter, architectLevel, isPlotClaimed]);

    const onPressPlot = (plot: LandPlotDef) => {
        if (isPlotClaimed(plot.id)) {
            navigation.navigate('SiteDevelopment', { plotId: plot.id });
            return;
        }
        setPendingClaim(plot);
    };

    const confirmClaim = (currency: LandCurrency) => {
        if (!pendingClaim) return;
        const plot = pendingClaim;
        const ok = claimPlot(plot.id, currency);
        setPendingClaim(null);
        if (ok) navigation.navigate('SiteDevelopment', { plotId: plot.id });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#7B2CBF', '#5A189A', '#3A0CA3']} style={StyleSheet.absoluteFillObject} />
            <FloatingBubbles count={5} seed={7} />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <StatBar />

                <View style={styles.headerBlock}>
                    <Text style={styles.title}>🏗️ Available Raw Real Estate</Text>
                    <Text style={styles.subtitle}>Tap a land parcel to inspect & claim</Text>
                </View>

                <Card style={styles.levelCard}>
                    <View style={styles.levelRow}>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelBadgeText}>Lv.{architectLevel}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.levelTitle}>Architect Level {architectLevel}</Text>
                            <Text style={styles.levelSub}>{xpToNext === null ? 'Max level reached!' : `${xpToNext} XP to Level ${architectLevel + 1}`}</Text>
                        </View>
                    </View>
                    <View style={styles.xpTrack}>
                        <View style={[styles.xpFill, { width: `${levelProgress * 100}%` }]} />
                    </View>
                    {nextThreshold !== undefined && (
                        <Text style={styles.levelFootnote}>Claim plots (+80 XP) and deploy blueprints (+150 XP) to level up.</Text>
                    )}
                </Card>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    <Chip label={`All Sites (${LAND_PLOTS.length})`} selected={filter === 'all'} tone={filter === 'all' ? 'gold' : 'snow'} onPress={() => setFilter('all')} />
                    <Chip label={`Buildable Now (${buildableCount})`} selected={filter === 'buildable'} tone={filter === 'buildable' ? 'gold' : 'snow'} onPress={() => setFilter('buildable')} />
                    <Chip label={`Owned (${ownedCount}/${LAND_PLOTS.length})`} selected={filter === 'owned'} tone={filter === 'owned' ? 'gold' : 'snow'} onPress={() => setFilter('owned')} />
                </ScrollView>

                <View style={styles.grid}>
                    {visiblePlots.map((plot, i) => {
                        const claimed = isPlotClaimed(plot.id);
                        const locked = !claimed && architectLevel < plot.requiredLevel;
                        const tone = CLAY[plot.tone];
                        return (
                            <Animated.View key={plot.id} entering={FadeInDown.delay(60 * i).duration(400).springify()} style={styles.cardWrap}>
                                <Bouncy onPress={() => onPressPlot(plot)} scaleTo={0.97}>
                                    <View style={[styles.plotShell, { backgroundColor: tone.shadow }]}>
                                        <View style={styles.plotFace}>
                                            {plot.image ? (
                                                <Image source={PLOTS_RAW[plot.image]} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                                            ) : (
                                                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: tone.base }]} />
                                            )}
                                            <View style={styles.plotNumberTag}>
                                                <Text style={styles.plotNumberText}>{plot.plotNumber}</Text>
                                            </View>
                                            {claimed ? (
                                                <View style={styles.ownedTag}>
                                                    <Text style={styles.ownedText}>OWNED ✓</Text>
                                                </View>
                                            ) : locked ? (
                                                <View style={styles.lockTag}>
                                                    <Text style={styles.lockText}>🔒 Lv.{plot.requiredLevel}</Text>
                                                </View>
                                            ) : null}
                                            <View style={styles.plotScrim}>
                                                <Text style={styles.plotName} numberOfLines={2}>
                                                    {plot.name}
                                                </Text>
                                                {!claimed && (
                                                    <Text style={styles.plotCost}>
                                                        ⭐ {plot.costStars} · 💎 {plot.costDust}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </Bouncy>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            <CosmicTabBar active="land" />

            <ClaimPlotSheet
                plot={pendingClaim}
                stars={progress.stars}
                dust={progress.dust}
                architectLevel={architectLevel}
                onConfirm={confirmClaim}
                onCancel={() => setPendingClaim(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.grape },
    scroll: { paddingBottom: 24 },
    headerBlock: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
    title: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: '#FFFFFF' },
    subtitle: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: 'rgba(255,255,255,0.75)' },

    levelCard: { marginHorizontal: 16, marginBottom: 14, gap: 8 },
    levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    levelBadge: { backgroundColor: COSMIC.goldPale, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
    levelBadgeText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.lg, color: COSMIC.goldDeep },
    levelTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base, color: COSMIC.ink },
    levelSub: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.xs, color: COSMIC.onSurfaceVariant },
    xpTrack: { height: 10, borderRadius: 999, backgroundColor: COSMIC.surfaceContainer, overflow: 'hidden' },
    xpFill: { height: '100%', borderRadius: 999, backgroundColor: COSMIC.magenta },
    levelFootnote: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.xs, color: COSMIC.onSurfaceVariant },

    filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 0 },
    cardWrap: { width: '50%', padding: 4 },
    plotShell: { borderRadius: 24, paddingBottom: 6, aspectRatio: 0.95 },
    plotFace: { flex: 1, borderRadius: 20, overflow: 'hidden' },
    plotNumberTag: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(39,0,87,0.6)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    plotNumberText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 10, color: '#FFFFFF' },
    ownedTag: { position: 'absolute', top: 10, right: 10, backgroundColor: COSMIC.mint, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    ownedText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 9, color: COSMIC.mintDark },
    lockTag: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    lockText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 9, color: COSMIC.magentaDark },
    plotScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(39,0,87,0.7)', padding: 10, gap: 2 },
    plotName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xs, color: '#FFFFFF' },
    plotCost: { fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: 10, color: COSMIC.goldPale },
});

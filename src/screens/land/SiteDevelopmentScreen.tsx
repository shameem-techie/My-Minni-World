import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bouncy } from '../../components/fx/Bouncy';
import { Card } from '../../components/ui/Card';
import { CircleButton } from '../../components/ui/CircleButton';
import { CosmicTabBar } from '../../components/ui/CosmicTabBar';
import { StatBar } from '../../components/ui/StatBar';
import { LAND_PLOTS_BY_ID, STRUCTURE_BLUEPRINTS, STRUCTURE_BLUEPRINTS_BY_ID } from '../../constants/landPlots';
import { useGame } from '../../context/GameContext';
import { CLAY, COSMIC, TYPOGRAPHY } from '../../theme';
import type { LandCurrency, RootStackParamList, StructureBlueprintDef } from '../../types';
import { DeployBlueprintSheet } from './DeployBlueprintSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'SiteDevelopment'>;

// "Next-Level: Site Architect & Development" (Stitch 034ff297) — the structure
// blueprint catalog shown once a plot is claimed. The manifest's per-plot "Zone A/B/C"
// sub-parcel system was left out: it's a whole extra layer (multiple structures per
// plot, zone-by-zone) that doesn't fit this app's one-playset-per-place model, so this
// keeps it to one blueprint per plot, matching how every other buildable spot
// (e.g. Empire Builder Plot) already works.
export function SiteDevelopmentScreen({ route }: Props) {
    const { plotId } = route.params;
    const plot = LAND_PLOTS_BY_ID[plotId];
    const { progress, deployBlueprint } = useGame();
    const [pendingBlueprint, setPendingBlueprint] = useState<StructureBlueprintDef | null>(null);

    const builtBlueprintId = progress.plotBlueprints[plotId];
    const builtBlueprint = builtBlueprintId ? STRUCTURE_BLUEPRINTS_BY_ID[builtBlueprintId] : null;

    const confirmDeploy = (currency: LandCurrency) => {
        if (!pendingBlueprint) return;
        deployBlueprint(plotId, pendingBlueprint.id, currency);
        setPendingBlueprint(null);
    };

    if (!plot) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#7B2CBF', '#5A189A', '#3A0CA3']} style={StyleSheet.absoluteFillObject} />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <StatBar />

                <View style={styles.headerBlock}>
                    <Text style={styles.eyebrow}>Plot {plot.plotNumber} · {plot.name}</Text>
                    <Text style={styles.title}>{builtBlueprint ? '🏡 This Parcel Is Built' : '🛠️ What would you like to build here?'}</Text>
                    <Text style={styles.subtitle}>{builtBlueprint ? 'Deployed and ready to visit in a future update.' : 'Choose a custom structure blueprint to develop this parcel!'}</Text>
                </View>

                {builtBlueprint ? (
                    <Card style={styles.builtCard}>
                        <Text style={{ fontSize: 48 }}>{builtBlueprint.emoji}</Text>
                        <Text style={styles.builtName}>{builtBlueprint.name}</Text>
                        <Text style={styles.builtCategory}>{builtBlueprint.category}</Text>
                    </Card>
                ) : (
                    <View style={styles.blueprintList}>
                        {STRUCTURE_BLUEPRINTS.map((bp, i) => {
                            const tone = CLAY[bp.tone];
                            return (
                                <Animated.View key={bp.id} entering={FadeInDown.delay(70 * i).duration(400).springify()}>
                                    <Bouncy onPress={() => setPendingBlueprint(bp)} scaleTo={0.97}>
                                        <Card style={styles.blueprintCard}>
                                            <View style={[styles.blueprintIcon, { backgroundColor: tone.base }]}>
                                                <Text style={{ fontSize: 30 }}>{bp.emoji}</Text>
                                            </View>
                                            <View style={styles.blueprintBody}>
                                                <View style={styles.blueprintTag}>
                                                    <Text style={styles.blueprintTagText}>{bp.category}</Text>
                                                </View>
                                                <Text style={styles.blueprintName} numberOfLines={2}>
                                                    {bp.name}
                                                </Text>
                                                <Text style={styles.blueprintPerks} numberOfLines={2}>
                                                    {bp.perks.join(' · ')}
                                                </Text>
                                                <Text style={styles.blueprintCost}>
                                                    ⭐ {bp.costStars} Stars · 💎 {bp.costDust} Diamonds
                                                </Text>
                                            </View>
                                            <CircleButton emoji="🔨" tone={bp.tone} size={40} onPress={() => setPendingBlueprint(bp)} />
                                        </Card>
                                    </Bouncy>
                                </Animated.View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            <CosmicTabBar active="land" />

            <DeployBlueprintSheet
                blueprint={pendingBlueprint}
                stars={progress.stars}
                dust={progress.dust}
                onConfirm={confirmDeploy}
                onCancel={() => setPendingBlueprint(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.grape },
    scroll: { paddingBottom: 24 },
    headerBlock: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 2 },
    eyebrow: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xs, letterSpacing: 0.6, color: COSMIC.aquaPale },
    title: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: '#FFFFFF' },
    subtitle: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: 'rgba(255,255,255,0.75)' },

    builtCard: { marginHorizontal: 16, alignItems: 'center', gap: 4, paddingVertical: 28 },
    builtName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.lg, color: COSMIC.ink, textAlign: 'center' },
    builtCategory: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurfaceVariant },

    blueprintList: { paddingHorizontal: 16, gap: 12 },
    blueprintCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
    blueprintIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    blueprintBody: { flex: 1, gap: 2 },
    blueprintTag: { alignSelf: 'flex-start', backgroundColor: COSMIC.lilacPale, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    blueprintTagText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 9, letterSpacing: 0.6, color: COSMIC.grape },
    blueprintName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base, color: COSMIC.ink },
    blueprintPerks: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.xs, color: COSMIC.onSurfaceVariant },
    blueprintCost: { fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.xs, color: COSMIC.goldDeep, marginTop: 2 },
});

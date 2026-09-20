import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { LandCurrency, StructureBlueprintDef } from '../../types';

interface DeployBlueprintSheetProps {
    blueprint: StructureBlueprintDef | null;
    stars: number;
    dust: number;
    onConfirm: (currency: LandCurrency) => void;
    onCancel: () => void;
}

// "Deploy this blueprint?" — same shape as ClaimPlotSheet, for the Site Development
// screen's structure catalog. No level-gate here (that's only on claiming the plot
// itself), so it's simpler than the plot sheet.
export function DeployBlueprintSheet({ blueprint, stars, dust, onConfirm, onCancel }: DeployBlueprintSheetProps) {
    return (
        <Modal visible={!!blueprint} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.backdrop}>
                {blueprint && (
                    <Animated.View entering={ZoomIn.duration(300).springify()} style={styles.card}>
                        <Text style={{ fontSize: 52 }}>{blueprint.emoji}</Text>
                        <Text style={styles.title}>Build {blueprint.name}?</Text>
                        <View style={styles.perks}>
                            {blueprint.perks.map((perk) => (
                                <Text key={perk} style={styles.perk}>
                                    ✦ {perk}
                                </Text>
                            ))}
                        </View>
                        <View style={styles.payRow}>
                            <CosmicButton
                                label={`${blueprint.costStars} Stars`}
                                leading="⭐"
                                tone={stars >= blueprint.costStars ? 'gold' : 'snow'}
                                disabled={stars < blueprint.costStars}
                                onPress={() => onConfirm('stars')}
                                style={{ flex: 1 }}
                            />
                            <CosmicButton
                                label={`${blueprint.costDust} Gems`}
                                leading="💎"
                                tone={dust >= blueprint.costDust ? 'aqua' : 'snow'}
                                disabled={dust < blueprint.costDust}
                                onPress={() => onConfirm('dust')}
                                style={{ flex: 1 }}
                            />
                        </View>
                        <CosmicButton label="Maybe later" tone="snow" size="sm" onPress={onCancel} style={{ marginTop: 10 }} />
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(39,0,87,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 32, padding: 24, alignItems: 'center', gap: 10 },
    title: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY['2xl'], color: COSMIC.ink, textAlign: 'center' },
    perks: { alignSelf: 'stretch', gap: 4, marginVertical: 4 },
    perk: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurfaceVariant },
    payRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 6 },
});

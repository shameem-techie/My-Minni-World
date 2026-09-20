import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { LandCurrency, LandPlotDef } from '../../types';

interface ClaimPlotSheetProps {
    plot: LandPlotDef | null;
    stars: number;
    dust: number;
    architectLevel: number;
    onConfirm: (currency: LandCurrency) => void;
    onCancel: () => void;
}

// "Claim this plot?" sheet — same shape as world/UnlockSheet.tsx, but plots take
// either stars OR dust (the Stitch mockup's dual pricing, "500 Stars or 50 Gems"),
// so this shows two payment buttons instead of one.
export function ClaimPlotSheet({ plot, stars, dust, architectLevel, onConfirm, onCancel }: ClaimPlotSheetProps) {
    const levelMet = !!plot && architectLevel >= plot.requiredLevel;
    return (
        <Modal visible={!!plot} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.backdrop}>
                {plot && (
                    <Animated.View entering={ZoomIn.duration(300).springify()} style={styles.card}>
                        <Text style={{ fontSize: 52 }}>{plot.emoji}</Text>
                        <Text style={styles.title}>Claim {plot.name}?</Text>
                        <Text style={styles.body}>{plot.subtitle}</Text>

                        {!levelMet ? (
                            <>
                                <View style={styles.lockedBox}>
                                    <Text style={styles.lockedText}>🔒 Needs Architect Level {plot.requiredLevel}</Text>
                                </View>
                                <Text style={styles.hint}>Claim cheaper plots and build on them to earn Architect XP and level up!</Text>
                            </>
                        ) : (
                            <View style={styles.payRow}>
                                <CosmicButton
                                    label={`${plot.costStars} Stars`}
                                    leading="⭐"
                                    tone={stars >= plot.costStars ? 'gold' : 'snow'}
                                    disabled={stars < plot.costStars}
                                    onPress={() => onConfirm('stars')}
                                    style={{ flex: 1 }}
                                />
                                <CosmicButton
                                    label={`${plot.costDust} Gems`}
                                    leading="💎"
                                    tone={dust >= plot.costDust ? 'aqua' : 'snow'}
                                    disabled={dust < plot.costDust}
                                    onPress={() => onConfirm('dust')}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        )}

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
    body: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.base, color: COSMIC.onSurfaceVariant, textAlign: 'center' },
    payRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 6 },
    lockedBox: { backgroundColor: COSMIC.pinkPale, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, marginVertical: 6 },
    lockedText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base, color: COSMIC.magentaDark },
    hint: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurfaceVariant, textAlign: 'center' },
});

import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { PlaysetDef } from '../../types';

interface UnlockSheetProps {
    pendingUnlock: PlaysetDef | null;
    stars: number;
    onConfirm: () => void;
    onCancel: () => void;
}

// The "spend stars to unlock this zone?" confirm sheet — shared by the WorldMap zone
// list and the fullscreen pannable map's pins, so a locked zone behaves identically
// wherever it's tapped from.
export function UnlockSheet({ pendingUnlock, stars, onConfirm, onCancel }: UnlockSheetProps) {
    return (
        <Modal visible={!!pendingUnlock} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.backdrop}>
                {pendingUnlock && (
                    <Animated.View entering={ZoomIn.duration(300).springify()} style={styles.card}>
                        <Text style={{ fontSize: 52 }}>{pendingUnlock.emoji}</Text>
                        <Text style={styles.title}>Unlock {pendingUnlock.name}?</Text>
                        <Text style={styles.body}>{pendingUnlock.blurb}</Text>
                        <View style={styles.cost}>
                            <Text style={styles.costText}>Costs {pendingUnlock.unlockCost} ✨</Text>
                            <Text style={[styles.have, { color: stars >= pendingUnlock.unlockCost ? COSMIC.mintDark : COSMIC.magentaDark }]}>
                                You have {stars} ✨
                            </Text>
                        </View>
                        {stars >= pendingUnlock.unlockCost ? (
                            <CosmicButton label="Unlock & Enter!" trailing="🔑" onPress={onConfirm} />
                        ) : (
                            <Text style={styles.hint}>Earn more stars by playing in open zones, finishing star routines and opening the Daily Mystery Pod in the Star Shop!</Text>
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
    cost: { alignItems: 'center', backgroundColor: COSMIC.goldPale, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, marginVertical: 6 },
    costText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.lg, color: COSMIC.goldDeep },
    have: { fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.sm },
    hint: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurfaceVariant, textAlign: 'center' },
});

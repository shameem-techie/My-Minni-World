import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Bouncy } from '../fx/Bouncy';
import { CLAY, COSMIC, TYPOGRAPHY, type ClayTone } from '../../theme';

interface GridCardProps {
    tone: ClayTone;
    emoji: string;
    label: string;
    badge?: string; // top-left pill text, e.g. "OPEN"
    locked?: boolean; // shows a 🔒 badge top-right instead of the icon's own color
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
}

// Big square colour card — icon centered, name pill pinned to the bottom, optional
// status badge. The "My Minni World — World Map (V2)" reskin's card language
// (design pass 2026-09-19), reused for the Land Explorer's plot grid too so both
// screens share one visual system instead of two competing card styles.
export function GridCard({ tone, emoji, label, badge, locked, onPress, style }: GridCardProps) {
    const colors = CLAY[tone];
    return (
        <Bouncy onPress={onPress} scaleTo={0.96} style={[styles.shell, { backgroundColor: colors.shadow }, style]}>
            <View style={[styles.face, { backgroundColor: colors.base }]}>
                {badge ? (
                    <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                ) : null}
                {locked ? (
                    <View style={styles.lockBadge}>
                        <Text style={{ fontSize: 14 }}>🔒</Text>
                    </View>
                ) : null}
                <Text style={styles.emoji}>{emoji}</Text>
                <View style={styles.namePill}>
                    <Text style={styles.name} numberOfLines={1}>
                        {label}
                    </Text>
                </View>
            </View>
        </Bouncy>
    );
}

const styles = StyleSheet.create({
    shell: { flex: 1, aspectRatio: 0.92, borderRadius: 28, paddingBottom: 6 },
    face: { flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 12, overflow: 'hidden' },
    badgePill: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: 9, letterSpacing: 0.5, color: '#270057' },
    lockBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 999, padding: 5 },
    emoji: { fontSize: 44 },
    namePill: { position: 'absolute', bottom: 10, left: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 999, paddingVertical: 7, alignItems: 'center' },
    name: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.ink },
});

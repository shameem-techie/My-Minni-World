import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { RootStackParamList } from '../../types';
import { Bouncy } from '../fx/Bouncy';

export type TabKey = 'map' | 'land' | 'avatar' | 'shop';

const TABS: { key: TabKey; label: string; emoji: string }[] = [
    { key: 'map', label: 'World Map', emoji: '🗺️' },
    { key: 'land', label: 'Land', emoji: '🏗️' },
    { key: 'avatar', label: 'Avatar', emoji: '🎨' },
    { key: 'shop', label: 'Star Shop', emoji: '🎁' },
];

// The bottom bar from every Stitch in-game screen. Implemented as a plain component
// rather than a tab navigator so the stack keeps its fade transitions. "World Map"
// always returns to the landing page (explorer header + the galaxy map block + the zone
// grid), not whichever district/room was last open — there used to be a "Play Room" tab
// here that jumped straight back into the last-visited room, defaulting to a guessed
// room on first use; it was confusing (looked like a room picker, wasn't one) and is
// gone now.
export function CosmicTabBar({ active }: { active: TabKey }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();

    const go = (key: TabKey) => {
        if (key === active) return;
        switch (key) {
            case 'map':
                navigation.navigate('WorldMap');
                break;
            case 'land':
                navigation.navigate('LandExplorer');
                break;
            case 'avatar':
                navigation.navigate('CharacterCreator');
                break;
            case 'shop':
                navigation.navigate('StarShop');
                break;
        }
    };

    return (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {TABS.map((tab) => {
                const isActive = tab.key === active;
                return (
                    <Bouncy key={tab.key} onPress={() => go(tab.key)} style={styles.tab} scaleTo={0.9}>
                        <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                            <Text style={{ fontSize: 22 }}>{tab.emoji}</Text>
                        </View>
                        <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
                    </Bouncy>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 10,
        paddingHorizontal: 8,
        shadowColor: COSMIC.grape,
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 12,
    },
    tab: { flex: 1, alignItems: 'center', gap: 4 },
    iconWrap: { width: 52, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: COSMIC.surfaceContainer },
    iconWrapActive: { backgroundColor: COSMIC.magenta },
    label: { fontFamily: TYPOGRAPHY.fontFamilyDisplay, fontSize: TYPOGRAPHY.xs, color: COSMIC.muted },
    labelActive: { color: COSMIC.magentaDark },
});

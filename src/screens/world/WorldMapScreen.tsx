import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { getLocations, getUnlockedLocationIds } from '../../services/world.service';
import { CLAY, COLORS, TYPOGRAPHY } from '../../theme';
import type { LocationDef, RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'WorldMap'>;

// The hub screen — a grid of location "tiles" a player taps into, mirroring Toca Boca
// World's home map of unlockable locations. Locked tiles are dimmed with a lock icon;
// unlocking flow (currency/shop) is a stretch goal noted in GAME_DESIGN.md.
export function WorldMapScreen({ navigation }: Props) {
    const { user } = useAuth();
    const [locations, setLocations] = useState<LocationDef[]>([]);
    const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const locs = await getLocations();
            setLocations(locs);
            if (user) {
                const unlocked = await getUnlockedLocationIds(user.uid);
                // Default locations are always playable even before the unlock row exists.
                locs.filter((l) => l.isDefault).forEach((l) => unlocked.add(l.id));
                setUnlockedIds(unlocked);
            }
            setIsLoading(false);
        })();
    }, [user]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Minni World</Text>
                <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={12}>
                    <Ionicons name="settings-sharp" size={24} color={COLORS.text.primary} />
                </Pressable>
            </View>

            <FlatList
                data={locations}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.column}
                refreshing={isLoading}
                renderItem={({ item }) => {
                    const unlocked = item.isDefault || unlockedIds.has(item.id);
                    return (
                        <Pressable
                            disabled={!unlocked}
                            onPress={() => navigation.navigate('Location', { locationKey: item.key })}
                            style={[styles.tile, { backgroundColor: unlocked ? CLAY.sky.base : CLAY.cream.base }]}
                        >
                            {!unlocked && (
                                <View style={styles.lockBadge}>
                                    <Ionicons name="lock-closed" size={16} color={COLORS.text.inverse} />
                                </View>
                            )}
                            <Text style={[styles.tileName, { color: unlocked ? COLORS.text.inverse : COLORS.text.muted }]}>
                                {item.name}
                            </Text>
                        </Pressable>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
    },
    title: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY['2xl'], color: COLORS.text.primary },
    grid: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
    column: { gap: 16 },
    tile: {
        flex: 1,
        aspectRatio: 1.3,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 12,
    },
    lockBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        padding: 6,
    },
    tileName: { fontFamily: TYPOGRAPHY.fontFamilyDisplay, fontSize: TYPOGRAPHY.lg },
});

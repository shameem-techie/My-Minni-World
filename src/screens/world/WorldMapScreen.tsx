import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LocationIcon } from '../../components/illustrations/LocationIcon';
import { useAuth } from '../../context/AuthContext';
import { getLocations, getUnlockedLocationIds } from '../../services/world.service';
import { CLAY, COLORS, TYPOGRAPHY, type ClayTone } from '../../theme';
import type { LocationDef, RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'WorldMap'>;

// Each location gets its own tile color + icon so the grid reads as a set of distinct
// places at a glance, not six identical blue boxes with only a name to tell them apart.
const TILE_TONE_BY_KEY: Record<string, ClayTone> = {
    cozy_home: 'sky',
    sunny_cafe: 'sun',
    pet_salon: 'coralPale',
    starlight_school: 'grape',
    meadow_park: 'mint',
    candy_carnival: 'coral',
};

// Real illustrated icons cropped from the Stitch-generated World Map mockup (see
// design/README.md) — Metro requires a static require() per key, so no dynamic path.
const TILE_IMAGES: Record<string, ReturnType<typeof require>> = {
    cozy_home: require('../../../assets/images/locations/cozy_home.png'),
    sunny_cafe: require('../../../assets/images/locations/sunny_cafe.png'),
    pet_salon: require('../../../assets/images/locations/pet_salon.png'),
    starlight_school: require('../../../assets/images/locations/starlight_school.png'),
    meadow_park: require('../../../assets/images/locations/meadow_park.png'),
    candy_carnival: require('../../../assets/images/locations/candy_carnival.png'),
};

// The hub screen — a grid of location "tiles" a player taps into, mirroring Toca Boca
// World's home map of unlockable locations. Locked tiles are dimmed with a lock icon;
// unlocking flow (currency/shop) is a stretch goal noted in GAME_DESIGN.md.
//
// NOTE on tile layout: the image and the name label are stacked in normal flow (image on
// top, label below), not overlapped with position:'absolute'. An earlier version floated
// the label over the bottom of the image; on this test device, any layout that combined a
// bitmap Image with an absolutely-positioned sibling produced a persistent ghosting
// artifact (visible as a soft duplicate of the label below the tile) that survived every
// targeted fix (expo-image vs core Image, transitions, clipping, alpha-baked corners,
// removing the label entirely). Only removing the overlap entirely fixed it. If revisiting
// the overlapping-label look, retest carefully on real devices first.
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
                <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={12} style={styles.settingsButton}>
                    <Ionicons name="settings-sharp" size={22} color={COLORS.text.primary} />
                </Pressable>
            </View>
            <Text style={styles.hint}>Tap an unlocked place to explore it. Locked ones open as you play!</Text>

            <FlatList
                data={locations}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.column}
                refreshing={isLoading}
                renderItem={({ item }) => {
                    const unlocked = item.isDefault || unlockedIds.has(item.id);
                    const tone = CLAY[TILE_TONE_BY_KEY[item.key] ?? 'sky'];
                    return (
                        <Pressable
                            disabled={!unlocked}
                            onPress={() => navigation.navigate('Location', { locationKey: item.key })}
                            style={[styles.tile, { backgroundColor: unlocked ? tone.base : CLAY.cream.base }]}
                        >
                            <View style={styles.tileArt}>
                                {unlocked && TILE_IMAGES[item.key] ? (
                                    <Image source={TILE_IMAGES[item.key]} style={styles.tileImage} resizeMode="cover" />
                                ) : (
                                    <LocationIcon type={item.key} size={40} color={COLORS.text.muted} />
                                )}
                                {!unlocked && (
                                    <View style={styles.lockBadge}>
                                        <Ionicons name="lock-closed" size={16} color={COLORS.text.inverse} />
                                    </View>
                                )}
                            </View>
                            <View style={styles.tileNameRow}>
                                <Text style={styles.tileName} numberOfLines={1}>
                                    {item.name}
                                </Text>
                            </View>
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
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
    },
    title: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY['2xl'], color: COLORS.text.primary },
    hint: {
        paddingHorizontal: 24,
        marginTop: 6,
        marginBottom: 12,
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.text.secondary,
    },
    grid: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
    column: { gap: 16 },
    tile: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 24,
        overflow: 'hidden',
    },
    tileArt: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tileImage: {
        width: '100%',
        height: '100%',
    },
    lockBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        padding: 6,
    },
    tileNameRow: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        alignItems: 'center',
    },
    tileName: {
        fontFamily: TYPOGRAPHY.fontFamilyDisplay,
        fontSize: TYPOGRAPHY.base,
        textAlign: 'center',
        color: COLORS.text.primary,
    },
});

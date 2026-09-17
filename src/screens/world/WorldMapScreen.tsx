import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
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
                            style={[
                                styles.tile,
                                {
                                    backgroundColor: unlocked ? tone.base : CLAY.cream.base,
                                    borderBottomColor: unlocked ? tone.shadow : CLAY.cream.shadow,
                                },
                            ]}
                        >
                            {unlocked && TILE_IMAGES[item.key] && (
                                <Image
                                    source={TILE_IMAGES[item.key]}
                                    style={StyleSheet.absoluteFillObject}
                                    contentFit="cover"
                                />
                            )}
                            {!unlocked && (
                                <>
                                    <View style={styles.iconWrap}>
                                        <LocationIcon type={item.key} size={40} color={COLORS.text.muted} />
                                    </View>
                                    <View style={styles.lockBadge}>
                                        <Ionicons name="lock-closed" size={16} color={COLORS.text.inverse} />
                                    </View>
                                </>
                            )}
                            <View style={styles.tileNamePill}>
                                <Text style={[styles.tileName, { color: unlocked ? tone.text : COLORS.text.muted }]}>
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
        aspectRatio: 1.1,
        borderRadius: 24,
        borderBottomWidth: 4,
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 12,
        overflow: 'hidden',
    },
    iconWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    tileNamePill: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 14,
        paddingVertical: 6,
        paddingHorizontal: 10,
        alignSelf: 'stretch',
    },
    lockBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        padding: 6,
    },
    tileName: { fontFamily: TYPOGRAPHY.fontFamilyDisplay, fontSize: TYPOGRAPHY.base, textAlign: 'center' },
});

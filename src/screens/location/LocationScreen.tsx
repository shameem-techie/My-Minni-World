import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PropIcon } from '../../components/illustrations/PropIcon';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import {
    getLocations,
    getOwnedItemIds,
    getWardrobeItems,
    getWorldSave,
    saveWorldState,
} from '../../services/world.service';
import { COLORS, TYPOGRAPHY } from '../../theme';
import type { LocationDef, PlacedProp, RootStackParamList, WardrobeItem } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;

const GRID_COLUMNS = 3;
const TILE_SIZE = 88;
const TILE_GAP = 20;

function makePropInstanceId(): string {
    return 'placed_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// Real room art cropped from the Stitch-generated Sunny Café mockup (design/README.md).
// Only Sunny Café has one so far — other rooms fall back to the plain surface color
// until matching interior mockups exist for them.
const ROOM_BACKGROUNDS: Record<string, ReturnType<typeof require>> = {
    sunny_cafe: require('../../../assets/images/rooms/sunny_cafe_wall.png'),
};

// A single explorable room. Free-play, no fail states or timers — tapping a prop puts it
// away for now (a real tap-for-a-reaction interaction, and a wardrobe to bring in more
// props, are the next things to build — see GAME_DESIGN.md). On a player's first visit to
// a room with nothing saved yet, it's furnished with whatever "prop" items they already
// own (their starter pack) rather than left empty with no way to add anything.
export function LocationScreen({ route }: Props) {
    const { user } = useAuth();
    const { locationKey } = route.params;
    const [location, setLocation] = useState<LocationDef | null>(null);
    const [props, setProps] = useState<PlacedProp[]>([]);
    const [itemsById, setItemsById] = useState<Record<string, WardrobeItem>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setIsLoading(true);
            const [allLocations, allItems] = await Promise.all([getLocations(), getWardrobeItems()]);
            if (cancelled) return;

            const found = allLocations.find((l) => l.key === locationKey) ?? null;
            setLocation(found);

            const lookup: Record<string, WardrobeItem> = {};
            allItems.forEach((item) => {
                lookup[item.id] = item;
            });
            setItemsById(lookup);

            if (found && user) {
                const save = await getWorldSave(user.uid, found.id);
                if (cancelled) return;

                if (save && save.props.length > 0) {
                    setProps(save.props);
                } else {
                    const ownedIds = await getOwnedItemIds(user.uid);
                    if (cancelled) return;

                    const starterProps = allItems.filter((i) => i.category === 'prop' && ownedIds.has(i.id));
                    const placed: PlacedProp[] = starterProps.map((item, index) => ({
                        id: makePropInstanceId(),
                        itemId: item.id,
                        x: TILE_GAP + (index % GRID_COLUMNS) * (TILE_SIZE + TILE_GAP),
                        y: TILE_GAP + Math.floor(index / GRID_COLUMNS) * (TILE_SIZE + TILE_GAP),
                        rotation: 0,
                        scale: 1,
                    }));
                    setProps(placed);
                    if (placed.length > 0) {
                        await saveWorldState(user.uid, found.id, placed, {});
                    }
                }
            }
            if (!cancelled) setIsLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [locationKey, user]);

    const handleRemoveProp = async (propId: string) => {
        const next = props.filter((p) => p.id !== propId);
        setProps(next);
        if (user && location) {
            await saveWorldState(user.uid, location.id, next, {});
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader title={location?.name ?? 'Loading…'} />
            {location && <Text style={styles.description}>{location.description}</Text>}

            <View style={styles.room}>
                {ROOM_BACKGROUNDS[locationKey] && (
                    <Image
                        source={ROOM_BACKGROUNDS[locationKey]}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                    />
                )}
                {!isLoading && props.length === 0 && (
                    <Text style={styles.empty}>
                        Nothing here yet — a wardrobe to bring in more props is coming soon.
                    </Text>
                )}
                {props.map((prop) => {
                    const item = itemsById[prop.itemId];
                    return (
                        <Pressable
                            key={prop.id}
                            onPress={() => handleRemoveProp(prop.id)}
                            style={[styles.prop, { left: prop.x, top: prop.y }]}
                        >
                            <View style={styles.propIcon}>
                                <PropIcon itemKey={item?.key ?? ''} size={44} />
                            </View>
                            <Text style={styles.propLabel} numberOfLines={1}>
                                {item?.name ?? 'Item'}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {!isLoading && props.length > 0 && <Text style={styles.hint}>Tap something to put it away.</Text>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    description: { paddingHorizontal: 24, marginTop: -4, marginBottom: 4, fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text.secondary },
    room: { flex: 1, margin: 16, borderRadius: 24, backgroundColor: COLORS.surface, overflow: 'hidden' },
    empty: {
        flex: 1,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: TYPOGRAPHY.fontFamilySemiBold,
        color: COLORS.text.muted,
        padding: 32,
    },
    prop: { position: 'absolute', width: TILE_SIZE, alignItems: 'center' },
    propIcon: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: 20,
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    propLabel: {
        marginTop: 4,
        fontFamily: TYPOGRAPHY.fontFamilySemiBold,
        fontSize: TYPOGRAPHY.xs,
        color: COLORS.text.secondary,
    },
    hint: {
        textAlign: 'center',
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.sm,
        color: COLORS.text.muted,
        paddingBottom: 16,
    },
});

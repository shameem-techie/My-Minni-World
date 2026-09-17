import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { getLocations, getWorldSave, saveWorldState } from '../../services/world.service';
import { COLORS, TYPOGRAPHY } from '../../theme';
import type { LocationDef, PlacedProp, RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;

// A single explorable room. Free-play, no fail states or timers — tapping a prop is
// meant to trigger a small reaction/animation (sound, wiggle) once real art lands;
// dragging repositions it and persists through saveWorldState. This screen currently
// renders the saved prop layout as placeholder tiles the player can tap to remove,
// enough to prove the read/write round-trip against world_saves.
export function LocationScreen({ route }: Props) {
    const { user } = useAuth();
    const { locationKey } = route.params;
    const [location, setLocation] = useState<LocationDef | null>(null);
    const [props, setProps] = useState<PlacedProp[]>([]);

    useEffect(() => {
        (async () => {
            const all = await getLocations();
            const found = all.find((l) => l.key === locationKey) ?? null;
            setLocation(found);
            if (found && user) {
                const save = await getWorldSave(user.uid, found.id);
                setProps(save?.props ?? []);
            }
        })();
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
            <View style={styles.header}>
                <Text style={styles.title}>{location?.name ?? 'Loading…'}</Text>
            </View>
            <Text style={styles.description}>{location?.description}</Text>

            <View style={styles.room}>
                {props.length === 0 && (
                    <Text style={styles.empty}>Nothing placed here yet — drag props in from your wardrobe.</Text>
                )}
                {props.map((prop) => (
                    <Pressable
                        key={prop.id}
                        onPress={() => handleRemoveProp(prop.id)}
                        style={[styles.prop, { left: prop.x, top: prop.y }]}
                    >
                        <Ionicons name="cube" size={28} color={COLORS.primary} />
                    </Pressable>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingHorizontal: 24, paddingTop: 8 },
    title: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY['2xl'], color: COLORS.text.primary },
    description: { paddingHorizontal: 24, marginTop: 4, fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text.secondary },
    room: { flex: 1, margin: 16, borderRadius: 24, backgroundColor: COLORS.surface, overflow: 'hidden' },
    empty: {
        flex: 1,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: TYPOGRAPHY.fontFamilySemiBold,
        color: COLORS.text.muted,
        padding: 32,
    },
    prop: { position: 'absolute' },
});

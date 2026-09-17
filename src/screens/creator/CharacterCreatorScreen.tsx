import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { createMinni } from '../../services/world.service';
import { COLORS, HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES, TYPOGRAPHY } from '../../theme';
import type { MinniAppearance, RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterCreator'>;

const DEFAULT_APPEARANCE: MinniAppearance = {
    skinTone: SKIN_TONES[0],
    hairStyle: 'hair_bob',
    hairColor: HAIR_COLORS[0],
    faceStyle: 'face_happy',
    outfitId: 'outfit_tshirt',
    outfitColor: OUTFIT_COLORS[0],
    accessoryIds: [],
};

// A simplified paper-doll picker: swatches for skin tone, hair color, and outfit color.
// The Minni preview is a placeholder circle-stack for now — swap in the real cutout art
// once the Stitch/Higgsfield-generated character sprites are dropped into assets/minnis.
export function CharacterCreatorScreen({ navigation, route }: Props) {
    const { user } = useAuth();
    const [appearance, setAppearance] = useState<MinniAppearance>(DEFAULT_APPEARANCE);
    const [isSaving, setIsSaving] = useState(false);
    const isFirstMinni = route.params?.isFirstMinni ?? false;

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await createMinni(user.uid, 'My Minni', appearance);
            navigation.replace('WorldMap');
        } catch (err) {
            console.warn('Could not save Minni', err);
            const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            Alert.alert('Could not save your Minni', message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{isFirstMinni ? 'Make Your Minni' : 'Edit Minni'}</Text>

            <View style={styles.preview}>
                <View style={[styles.previewHead, { backgroundColor: appearance.skinTone }]} />
                <View style={[styles.previewHair, { backgroundColor: appearance.hairColor }]} />
                <View style={[styles.previewBody, { backgroundColor: appearance.outfitColor }]} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Swatches
                    label="Skin Tone"
                    colors={SKIN_TONES}
                    selected={appearance.skinTone}
                    onSelect={(c) => setAppearance((a) => ({ ...a, skinTone: c }))}
                />
                <Swatches
                    label="Hair Color"
                    colors={HAIR_COLORS}
                    selected={appearance.hairColor}
                    onSelect={(c) => setAppearance((a) => ({ ...a, hairColor: c }))}
                />
                <Swatches
                    label="Outfit Color"
                    colors={OUTFIT_COLORS}
                    selected={appearance.outfitColor}
                    onSelect={(c) => setAppearance((a) => ({ ...a, outfitColor: c }))}
                />
            </ScrollView>

            <View style={styles.footer}>
                <Button label="Let's Go!" tone="mint" onPress={handleSave} loading={isSaving} />
            </View>
        </SafeAreaView>
    );
}

function Swatches({
    label,
    colors,
    selected,
    onSelect,
}: {
    label: string;
    colors: readonly string[];
    selected: string;
    onSelect: (c: string) => void;
}) {
    return (
        <View style={styles.swatchSection}>
            <Text style={styles.swatchLabel}>{label}</Text>
            <View style={styles.swatchRow}>
                {colors.map((c) => (
                    <Pressable
                        key={c}
                        onPress={() => onSelect(c)}
                        style={[
                            styles.swatch,
                            { backgroundColor: c },
                            c === selected && styles.swatchSelected,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    title: {
        fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold,
        fontSize: TYPOGRAPHY['3xl'],
        color: COLORS.text.primary,
        textAlign: 'center',
        marginTop: 16,
    },
    preview: { height: 180, alignItems: 'center', justifyContent: 'center' },
    previewHead: { width: 70, height: 70, borderRadius: 35, position: 'absolute', top: 20 },
    previewHair: { width: 78, height: 34, borderTopLeftRadius: 40, borderTopRightRadius: 40, position: 'absolute', top: 12 },
    previewBody: { width: 100, height: 90, borderRadius: 24, position: 'absolute', top: 90 },
    scroll: { paddingHorizontal: 24, paddingBottom: 16 },
    swatchSection: { marginBottom: 20 },
    swatchLabel: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.base, color: COLORS.text.secondary, marginBottom: 8 },
    swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
    swatchSelected: { borderColor: COLORS.text.primary },
    footer: { padding: 24 },
});

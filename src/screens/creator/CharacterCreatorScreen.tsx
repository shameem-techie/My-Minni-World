import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/ui/Button';
import { MinniCharacter } from '../../components/illustrations/MinniCharacter';
import { useAuth } from '../../context/AuthContext';
import { createMinni } from '../../services/world.service';
import { CLAY, COLORS, HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES, TYPOGRAPHY } from '../../theme';
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

const HAIR_STYLES: { key: string; label: string }[] = [
    { key: 'hair_bob', label: 'Bob' },
    { key: 'hair_ponytail', label: 'Ponytail' },
    { key: 'hair_curly', label: 'Curly' },
    { key: 'hair_buzz', label: 'Buzz' },
    { key: 'hair_braids', label: 'Braids' },
];

const FACE_STYLES: { key: string; label: string }[] = [
    { key: 'face_happy', label: 'Happy' },
    { key: 'face_wink', label: 'Wink' },
    { key: 'face_surprised', label: 'Surprised' },
    { key: 'face_freckles', label: 'Freckles' },
];

const ACCESSORIES: { key: string; label: string }[] = [
    { key: 'acc_glasses', label: 'Glasses' },
    { key: 'acc_bow', label: 'Bow' },
    { key: 'acc_cap', label: 'Cap' },
    { key: 'acc_backpack', label: 'Backpack' },
];

export function CharacterCreatorScreen({ navigation, route }: Props) {
    const { user } = useAuth();
    const [appearance, setAppearance] = useState<MinniAppearance>(DEFAULT_APPEARANCE);
    const [isSaving, setIsSaving] = useState(false);
    const isFirstMinni = route.params?.isFirstMinni ?? false;

    const toggleAccessory = (key: string) => {
        setAppearance((a) => ({
            ...a,
            accessoryIds: a.accessoryIds.includes(key)
                ? a.accessoryIds.filter((id) => id !== key)
                : [...a.accessoryIds, key],
        }));
    };

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
                <MinniCharacter appearance={appearance} size={160} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Chips
                    label="Hair Style"
                    options={HAIR_STYLES}
                    selected={appearance.hairStyle}
                    onSelect={(key) => setAppearance((a) => ({ ...a, hairStyle: key }))}
                />
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
                <Chips
                    label="Face"
                    options={FACE_STYLES}
                    selected={appearance.faceStyle}
                    onSelect={(key) => setAppearance((a) => ({ ...a, faceStyle: key }))}
                />
                <Swatches
                    label="Outfit Color"
                    colors={OUTFIT_COLORS}
                    selected={appearance.outfitColor}
                    onSelect={(c) => setAppearance((a) => ({ ...a, outfitColor: c }))}
                />
                <View style={styles.swatchSection}>
                    <Text style={styles.swatchLabel}>Accessories (tap to add or remove)</Text>
                    <View style={styles.chipRow}>
                        {ACCESSORIES.map((opt) => {
                            const isOn = appearance.accessoryIds.includes(opt.key);
                            return (
                                <Pressable
                                    key={opt.key}
                                    onPress={() => toggleAccessory(opt.key)}
                                    style={[styles.chip, isOn && styles.chipSelected]}
                                >
                                    <Text style={[styles.chipLabel, isOn && styles.chipLabelSelected]}>{opt.label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button label="Let's Go!" tone="mint" onPress={handleSave} loading={isSaving} />
            </View>
        </SafeAreaView>
    );
}

function Chips({
    label,
    options,
    selected,
    onSelect,
}: {
    label: string;
    options: { key: string; label: string }[];
    selected: string;
    onSelect: (key: string) => void;
}) {
    return (
        <View style={styles.swatchSection}>
            <Text style={styles.swatchLabel}>{label}</Text>
            <View style={styles.chipRow}>
                {options.map((opt) => {
                    const isOn = opt.key === selected;
                    return (
                        <Pressable
                            key={opt.key}
                            onPress={() => onSelect(opt.key)}
                            style={[styles.chip, isOn && styles.chipSelected]}
                        >
                            <Text style={[styles.chipLabel, isOn && styles.chipLabelSelected]}>{opt.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
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
    scroll: { paddingHorizontal: 24, paddingBottom: 16 },
    swatchSection: { marginBottom: 20 },
    swatchLabel: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.base, color: COLORS.text.secondary, marginBottom: 8 },
    swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
    swatchSelected: { borderColor: COLORS.text.primary },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    chipSelected: { backgroundColor: CLAY.coral.base, borderColor: CLAY.coral.shadow },
    chipLabel: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: COLORS.text.secondary },
    chipLabelSelected: { color: COLORS.text.inverse },
    footer: { padding: 24 },
});

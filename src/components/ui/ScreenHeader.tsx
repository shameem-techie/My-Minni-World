import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY } from '../../theme';

interface ScreenHeaderProps {
    title: string;
    onBack?: () => void; // defaults to navigation.goBack()
}

// Every pushed screen (anything reached via navigate, not replace) needs one of these —
// screenOptions sets headerShown: false globally, so without this a screen has no way
// back at all. WorldMap and Welcome are entry points and intentionally don't use it.
export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
    const navigation = useNavigation();
    const handleBack = onBack ?? (() => navigation.goBack());

    return (
        <View style={styles.row}>
            <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color={COLORS.text.primary} />
            </Pressable>
            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>
            <View style={styles.spacer} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
    },
    title: {
        flex: 1,
        fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold,
        fontSize: TYPOGRAPHY['2xl'],
        color: COLORS.text.primary,
    },
    spacer: { width: 40 },
});

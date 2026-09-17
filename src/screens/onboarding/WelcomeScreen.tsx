import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { signInAsGuest } from '../../services/auth.service';
import { COLORS, GRADIENT_SUNSET, TYPOGRAPHY } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

// First screen a new player sees. Play Now drops them straight into guest play (no
// sign-up wall, matching Toca Boca World's zero-friction launch) — an account can be
// linked later from Settings, same "guest-then-upgrade" pattern as Cards-and-Chaos.
export function WelcomeScreen({ navigation }: Props) {
    const { setUser } = useAuth();
    const [isStarting, setIsStarting] = useState(false);

    const handlePlayNow = async () => {
        setIsStarting(true);
        try {
            const profile = await signInAsGuest('Explorer');
            setUser(profile);
            navigation.replace('CharacterCreator', { isFirstMinni: true });
        } catch (err) {
            console.warn('Guest sign-in failed', err);
            const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            Alert.alert('Could not start', message);
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <LinearGradient colors={GRADIENT_SUNSET} style={styles.flex}>
            <SafeAreaView style={styles.flex}>
                <View style={styles.center}>
                    <Text style={styles.title}>My Minni World</Text>
                    <Text style={styles.subtitle}>Build your Minni. Explore your world. Play free.</Text>
                </View>
                <View style={styles.actions}>
                    <Button label="Play Now" tone="coral" onPress={handlePlayNow} loading={isStarting} />
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    title: {
        fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold,
        fontSize: TYPOGRAPHY['5xl'],
        color: COLORS.text.inverse,
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 12,
        fontFamily: TYPOGRAPHY.fontFamilySemiBold,
        fontSize: TYPOGRAPHY.lg,
        color: COLORS.text.inverse,
        textAlign: 'center',
        opacity: 0.9,
    },
    actions: { paddingHorizontal: 32, paddingBottom: 40 },
});

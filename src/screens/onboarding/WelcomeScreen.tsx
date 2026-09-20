import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CHARACTERS } from '../../assets/cosmicBubble';
import { CosmicMascot } from '../../components/brand/CosmicMascot';
import { CosmicWordmark } from '../../components/brand/CosmicWordmark';
import { Bobbing } from '../../components/fx/Bobbing';
import { FloatingBubbles } from '../../components/fx/FloatingBubbles';
import { CircleButton } from '../../components/ui/CircleButton';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { useAuth } from '../../context/AuthContext';
import { signInAsGuest } from '../../services/auth.service';
import { COSMIC, GRADIENT_SKY, TYPOGRAPHY } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

// "Welcome — Cosmic Bubble" (Stitch screen 0aa32da1): bubblegum sky, floating soda
// bubbles, the 3D wordmark, a bobbing hero cast on a glowing platform, and one huge
// PLAY NOW pill. Play Now drops a new player straight into guest play — no sign-up wall.
export function WelcomeScreen({ navigation }: Props) {
    const { user, setUser } = useAuth();
    const [isStarting, setIsStarting] = useState(false);

    const handlePlayNow = async () => {
        if (user) {
            navigation.replace('GalaxyMap');
            return;
        }
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
        <LinearGradient colors={GRADIENT_SKY} style={styles.flex}>
            <FloatingBubbles count={8} seed={7} />
            <SafeAreaView style={styles.flex}>
                <View style={styles.topRow}>
                    <View style={{ flex: 1 }} />
                    <CircleButton icon="settings-sharp" tone="lilac" onPress={() => navigation.navigate('Settings')} />
                </View>

                <View style={styles.hero}>
                    <Animated.View entering={ZoomIn.duration(600).springify()} style={styles.mascotWrap}>
                        <Bobbing amplitude={6} duration={3200} rotate={3}>
                            <CosmicMascot size={104} />
                        </Bobbing>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(150).duration(600).springify()}>
                        <CosmicWordmark />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(320).duration(600)} style={styles.taglinePill}>
                        <Text style={styles.taglineArrow}>‹</Text>
                        <Text style={styles.tagline}>Build your Minni. Explore your world.</Text>
                        <Text style={styles.taglineArrow}>🎨</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(420).duration(700).springify()} style={styles.cast}>
                        <Bobbing amplitude={10} duration={3800} delay={300} style={styles.castKid}>
                            <View style={styles.portalBig}>
                                <Image source={CHARACTERS.bubbleKidCircle} style={styles.portalImageBig} />
                            </View>
                        </Bobbing>
                        <Bobbing amplitude={8} duration={4100} delay={900} style={styles.castPet}>
                            <View style={styles.portalSmall}>
                                <Image source={CHARACTERS.starPetCircle} style={styles.portalImageSmall} />
                            </View>
                        </Bobbing>
                        <View style={styles.platform}>
                            <LinearGradient
                                colors={['#7EE3FF', COSMIC.aqua, COSMIC.aquaDark]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.platformFill}
                            />
                        </View>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInUp.delay(600).duration(600).springify()} style={styles.actions}>
                    <CosmicButton
                        label="PLAY NOW"
                        size="lg"
                        leading="▷"
                        trailing="◁"
                        onPress={handlePlayNow}
                        loading={isStarting}
                    />
                    <View style={styles.subRow}>
                        <CosmicButton
                            label="Character Maker"
                            tone="snow"
                            size="sm"
                            leading="🎨"
                            style={{ flex: 1 }}
                            onPress={() => (user ? navigation.navigate('CharacterCreator') : handlePlayNow())}
                        />
                        <CosmicButton
                            label="My Town"
                            tone="snow"
                            size="sm"
                            leading="🌍"
                            style={{ flex: 1 }}
                            onPress={() => (user ? navigation.navigate('GalaxyMap') : handlePlayNow())}
                        />
                    </View>
                    <Text style={styles.footer}>🛡️ 100% Safe Kids Sandbox • No login needed</Text>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    topRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 6 },
    hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    mascotWrap: { marginBottom: 6 },
    taglinePill: {
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.85)',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 999,
        shadowColor: COSMIC.grape,
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
    },
    taglineArrow: { fontSize: 18, color: COSMIC.magenta, fontFamily: TYPOGRAPHY.fontFamilyDisplayBlack },
    tagline: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base, color: COSMIC.magentaDark, textAlign: 'center' },
    cast: { marginTop: 26, width: '100%', height: 220, alignItems: 'center', justifyContent: 'flex-end' },
    castKid: { position: 'absolute', bottom: 40, zIndex: 2 },
    castPet: { position: 'absolute', bottom: 46, right: '12%', zIndex: 1 },
    portalBig: {
        width: 172,
        height: 172,
        borderRadius: 86,
        borderWidth: 5,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        backgroundColor: '#8FD3F4',
        shadowColor: COSMIC.aquaDark,
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    portalImageBig: { width: 172, height: 172, marginLeft: -5, marginTop: -5 },
    portalSmall: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        backgroundColor: '#C9B6F5',
        shadowColor: COSMIC.grape,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    portalImageSmall: { width: 96, height: 96, marginLeft: -4, marginTop: -4 },
    platform: { width: '100%', height: 54, borderRadius: 27, overflow: 'hidden' },
    platformFill: { flex: 1 },
    actions: { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
    subRow: { flexDirection: 'row', gap: 12 },
    footer: { textAlign: 'center', fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.grapeLight, marginTop: 2 },
});

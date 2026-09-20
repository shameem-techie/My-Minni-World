import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BRANDING } from '../../assets/cosmicBubble';
import { Card } from '../../components/ui/Card';
import { CircleButton } from '../../components/ui/CircleButton';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { PLAYSETS } from '../../constants/playsets';
import { PETS } from '../../constants/pets';
import { clearActiveMinni } from '../../services/minni.service';
import { signOut } from '../../services/auth.service';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
    const { user, setUser } = useAuth();
    const { progress, setExplorerName, resetProgress, isUnlocked } = useGame();
    const [name, setName] = useState(progress.explorerName);

    const openCount = PLAYSETS.filter((p) => isUnlocked(p.key)).length;
    const badges = Object.values(progress.rooms).filter((r) => r.badgeClaimed).length;

    const handleSignOut = async () => {
        if (user) await clearActiveMinni(user.uid);
        await signOut();
        setUser(null);
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    };

    const handleReset = () => {
        Alert.alert('Start over?', 'This clears your stars, pets, unlocked zones and room decorations. Your Minni is kept.', [
            { text: 'Keep playing', style: 'cancel' },
            {
                text: 'Reset everything',
                style: 'destructive',
                onPress: async () => {
                    await resetProgress();
                    setName('Zippy Star');
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <CircleButton icon="arrow-back" tone="snow" onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('GalaxyMap'))} />
                <Text style={styles.title}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Animated.View entering={FadeInDown.duration(400).springify()}>
                    <Card style={styles.about}>
                        <Image source={BRANDING.iconIos} style={styles.appIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.appName}>My Minni World</Text>
                            <Text style={styles.appSub}>Cosmic Bubble edition • v1.1</Text>
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(40).duration(400).springify()}>
                    <Card style={styles.guide} tint={COSMIC.magenta}>
                        <Text style={styles.guideTitle}>New here? 🪐</Text>
                        <Text style={styles.guideText}>A step-by-step guide to every screen, how to earn and spend stars, the challenges and what makes the game special.</Text>
                        <CosmicButton label="How to Play?" leading="📖" tone="gold" onPress={() => navigation.navigate('HowToPlay')} />
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(80).duration(400).springify()}>
                    <Card style={styles.card}>
                        <Text style={styles.label}>Explorer name</Text>
                        <View style={styles.inputRow}>
                            <TextInput value={name} onChangeText={setName} maxLength={20} style={styles.input} placeholder="Zippy Star" placeholderTextColor={COSMIC.muted} />
                            <CosmicButton label="Save" size="sm" tone="aqua" onPress={() => setExplorerName(name)} />
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Playing as</Text>
                            <Text style={styles.rowValue}>{user?.isGuest ? 'Guest explorer' : user?.displayName ?? 'Explorer'}</Text>
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(160).duration(400).springify()}>
                    <Card style={styles.card}>
                        <Text style={styles.label}>Progress</Text>
                        <View style={styles.statsRow}>
                            <Stat emoji="✨" value={progress.stars} label="Stars" />
                            <Stat emoji="💎" value={progress.dust} label="Star Dust" />
                            <Stat emoji="🏠" value={openCount} label={`of ${PLAYSETS.length} zones`} />
                        </View>
                        <View style={styles.statsRow}>
                            <Stat emoji="🐾" value={progress.pets.length} label={`of ${PETS.length} pets`} />
                            <Stat emoji="🏅" value={badges} label="Badges" />
                            <Stat emoji="🧸" value={Object.values(progress.rooms).reduce((n, r) => n + r.props.length, 0)} label="Props placed" />
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(240).duration(400).springify()} style={styles.actions}>
                    <CosmicButton label="Reset progress" tone="lilac" leading="🔄" onPress={handleReset} />
                    <CosmicButton label="Sign out" tone="pink" leading="👋" onPress={handleSignOut} />
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

function Stat({ emoji, value, label }: { emoji: string; value: number; label: string }) {
    return (
        <View style={styles.stat}>
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
            <Text style={styles.statValue}>{value.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.surfaceLow },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
    title: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY['2xl'], color: COSMIC.ink },
    scroll: { padding: 16, gap: 14, paddingBottom: 32 },
    about: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    appIcon: { width: 64, height: 64, borderRadius: 18 },
    appName: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: COSMIC.ink },
    appSub: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurfaceVariant },
    card: { gap: 10 },
    guide: { gap: 10 },
    guideTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: '#FFFFFF' },
    guideText: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: 'rgba(255,255,255,0.9)', lineHeight: 19 },
    label: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.base, color: COSMIC.grape },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    input: { flex: 1, backgroundColor: COSMIC.lilacPale, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.base, color: COSMIC.ink },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6 },
    rowLabel: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurfaceVariant },
    rowValue: { fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.ink },
    statsRow: { flexDirection: 'row', gap: 8 },
    stat: { flex: 1, backgroundColor: COSMIC.lilacPale, borderRadius: 18, paddingVertical: 10, alignItems: 'center', gap: 2 },
    statValue: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.lg, color: COSMIC.ink },
    statLabel: { fontFamily: TYPOGRAPHY.fontFamily, fontSize: 10, color: COSMIC.onSurfaceVariant, textAlign: 'center' },
    actions: { gap: 12, paddingTop: 6 },
});

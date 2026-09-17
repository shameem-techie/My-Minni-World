import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/auth.service';
import { COLORS, TYPOGRAPHY } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
    const { user, setUser } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        setUser(null);
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader title="Settings" />
            <View style={styles.body}>
                <View style={styles.row}>
                    <Text style={styles.label}>Playing as</Text>
                    <Text style={styles.value}>{user?.displayName ?? 'Explorer'}</Text>
                </View>
                <View style={styles.spacer} />
                <Button label="Sign Out" tone="coralPale" onPress={handleSignOut} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    body: { flex: 1, padding: 24 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    label: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.base, color: COLORS.text.secondary },
    value: { fontFamily: TYPOGRAPHY.fontFamilyBold, fontSize: TYPOGRAPHY.base, color: COLORS.text.primary },
    spacer: { flex: 1 },
});

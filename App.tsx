import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
    useFonts as useNunitoSans,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
} from '@expo-google-fonts/nunito-sans';
import { useFonts as useRubik, Rubik_700Bold, Rubik_800ExtraBold, Rubik_900Black } from '@expo-google-fonts/rubik';
import { AuthProvider } from './src/context/AuthContext';
import { GameProvider } from './src/context/GameContext';
import { RootNavigator } from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {});

const hideSplash = () => {
    SplashScreen.hideAsync().catch(() => {});
};

export default function App() {
    // Kick off font loading, but never gate rendering on it finishing — a stalled or failed
    // font fetch must not leave the whole app stuck behind the splash screen forever. Text
    // using a custom fontFamily just falls back to the system font until the real one
    // resolves; React re-renders once it does.
    useNunitoSans({ NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold, NunitoSans_800ExtraBold });
    useRubik({ Rubik_700Bold, Rubik_800ExtraBold, Rubik_900Black });

    const onLayout = useCallback(() => {
        hideSplash();
    }, []);

    // Safety net in case onLayout never fires — the splash must never get stuck open.
    useEffect(() => {
        const timer = setTimeout(hideSplash, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
            <SafeAreaProvider>
                <AuthProvider>
                    <GameProvider>
                        <StatusBar style="dark" />
                        <RootNavigator />
                    </GameProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

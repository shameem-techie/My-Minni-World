import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts as useNunito, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useFonts as useBaloo2, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {});

const hideSplash = () => {
    SplashScreen.hideAsync().catch(() => {});
};

export default function App() {
    // Kick off font loading, but never gate rendering on it finishing — a stalled or failed
    // font fetch (over the Metro asset server) must not leave the whole app stuck behind the
    // splash screen forever. Text using a custom fontFamily just falls back to the system font
    // until the real one resolves; React re-renders once it does.
    useNunito({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });
    useBaloo2({ Baloo2_700Bold, Baloo2_800ExtraBold });

    const onLayout = useCallback(() => {
        hideSplash();
    }, []);

    // Safety net in case onLayout never fires for some reason — the splash must never be
    // able to get stuck open indefinitely.
    useEffect(() => {
        const timer = setTimeout(hideSplash, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
            <SafeAreaProvider>
                <AuthProvider>
                    <StatusBar style="dark" />
                    <RootNavigator />
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

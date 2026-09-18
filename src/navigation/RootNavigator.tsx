import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useAuth } from '../context/AuthContext';
import { navigationRef } from './navigationRef';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { CharacterCreatorScreen } from '../screens/creator/CharacterCreatorScreen';
import { WorldMapScreen } from '../screens/world/WorldMapScreen';
import { FullscreenWorldMapScreen } from '../screens/world/FullscreenWorldMapScreen';
import { LocationScreen } from '../screens/world/LocationScreen';
import { PlayRoomScreen } from '../screens/playroom/PlayRoomScreen';
import { StarShopScreen } from '../screens/shop/StarShopScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { HowToPlayScreen } from '../screens/settings/HowToPlayScreen';
import { COLORS } from '../theme';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: COLORS.background,
        primary: COLORS.primary,
    },
};

const linking = {
    prefixes: [Linking.createURL('/'), 'https://myminniworld.app'],
    config: { screens: {} },
};

export function RootNavigator() {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    return (
        <NavigationContainer ref={navigationRef} theme={theme} linking={linking}>
            <Stack.Navigator
                initialRouteName={user ? 'WorldMap' : 'Welcome'}
                screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: COLORS.background } }}
            >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="CharacterCreator" component={CharacterCreatorScreen} />
                <Stack.Screen name="WorldMap" component={WorldMapScreen} />
                <Stack.Screen name="FullscreenMap" component={FullscreenWorldMapScreen} options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="Location" component={LocationScreen} options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="PlayRoom" component={PlayRoomScreen} options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="StarShop" component={StarShopScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="HowToPlay" component={HowToPlayScreen} options={{ animation: 'slide_from_right' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

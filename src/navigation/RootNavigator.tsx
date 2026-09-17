import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useAuth } from '../context/AuthContext';
import { navigationRef } from './navigationRef';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { CharacterCreatorScreen } from '../screens/creator/CharacterCreatorScreen';
import { WorldMapScreen } from '../screens/world/WorldMapScreen';
import { LocationScreen } from '../screens/location/LocationScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
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
                screenOptions={{ headerShown: false, animation: 'fade' }}
            >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="CharacterCreator" component={CharacterCreatorScreen} />
                <Stack.Screen name="WorldMap" component={WorldMapScreen} />
                <Stack.Screen name="Location" component={LocationScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

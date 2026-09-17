import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
    name: 'My Minni World',
    slug: 'my-minni-world',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    scheme: 'myminniworld',
    icon: './assets/images/icon.png',

    assetBundlePatterns: ['**/*'],

    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.myminniworld.app',
        buildNumber: '1',
        config: { usesNonExemptEncryption: false },
        infoPlist: {
            NSPhotoLibraryUsageDescription: 'We use your photo library so your Minni can have a profile picture.',
            NSCameraUsageDescription: 'We use your camera so your Minni can have a profile picture.',
        },
    },

    android: {
        package: 'com.myminniworld.app',
        versionCode: 1,
        adaptiveIcon: {
            foregroundImage: './assets/images/adaptive-icon.png',
            backgroundColor: '#FFF4E0',
        },
        permissions: ['CAMERA', 'READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE'],
    },

    extra: {
        eas: {
            // Run `npx eas-cli init` to generate and fill this in when ready to build.
            projectId: '',
        },
        environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },

    // JS-only OTA updates — same rollout gap noted in Cards-with-Cousins; enable once
    // runtimeVersion + channel + `eas-cli update:configure` are wired up.
    updates: { enabled: false },

    // No custom native modules yet, so this runs fine in plain Expo Go — don't add the
    // expo-dev-client plugin back until a real native module actually requires a dev-client
    // build (see the eas-cli / expo run:android note in README.md).
    plugins: [],
};

export default config;

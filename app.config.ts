import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
    name: 'My Minni World',
    slug: 'my-minni-world',
    version: '1.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    scheme: 'myminniworld',
    // Cosmic Bubble app icon — the Stitch "iOS squircle 3D" render, cropped full-bleed
    // (design/stitch-mockups/cosmic-bubble/MANIFEST.md → ICON_IOS_STAR_BUBBLE).
    icon: './assets/images/icon.png',

    assetBundlePatterns: ['**/*'],

    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.myminniworld.app',
        buildNumber: '2',
        config: { usesNonExemptEncryption: false },
        infoPlist: {
            NSPhotoLibraryUsageDescription: 'We use your photo library so your Minni can have a profile picture.',
            NSCameraUsageDescription: 'We use your camera so your Minni can have a profile picture.',
        },
    },

    android: {
        package: 'com.myminniworld.app',
        versionCode: 2,
        // ICON_ANDROID_ADAPTIVE_3D: the round winking-star render as the foreground, over a
        // magenta→violet→cyan nebula background so any launcher mask shape looks intentional.
        adaptiveIcon: {
            foregroundImage: './assets/images/adaptive-icon.png',
            backgroundImage: './assets/images/adaptive-icon-bg.png',
        },
        permissions: ['CAMERA', 'READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE'],
    },

    extra: {
        eas: {
            projectId: '',
        },
        environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },

    updates: { enabled: false },

    plugins: [
        [
            'expo-splash-screen',
            {
                image: './assets/images/splash-icon.png',
                imageWidth: 180,
                resizeMode: 'contain',
                backgroundColor: '#FAF0FF',
            },
        ],
        // Selfie-to-Minni-face feature. The actual permission strings are already
        // hand-authored above in ios.infoPlist / android.permissions (from before this
        // package was added), so this entry exists mainly so a *future* fresh
        // `expo prebuild` still links the module's native config correctly.
        [
            'expo-image-picker',
            {
                cameraPermission: 'We use your camera so your Minni can use your real face.',
                photosPermission: 'We use your photo library so your Minni can use your real face.',
            },
        ],
        // AI face-angle detection for the selfie crop (@react-native-ml-kit/face-detection)
        // needs iOS 15.5+, and expo-build-properties itself refuses anything below 16.4 (the
        // New Architecture floor) — the app's own default was 15.1. Set here so a future
        // fresh `expo prebuild` regenerates Podfile.properties.json with the right target
        // instead of failing CocoaPods resolution / config validation the way today's first
        // two attempts did.
        [
            'expo-build-properties',
            {
                ios: { deploymentTarget: '16.4' },
            },
        ],
    ],
};

export default config;

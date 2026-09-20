module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src'],
                    alias: {
                        '@': './src',
                        '@screens': './src/screens',
                        '@components': './src/components',
                        '@services': './src/services',
                        '@hooks': './src/hooks',
                        '@theme': './src/theme',
                        '@navigation': './src/navigation',
                        '@constants': './src/constants',
                        '@utils': './src/utils',
                        '@context': './src/context',
                        '@config': './src/config',
                        '@types': './src/types',
                    },
                },
            ],
            // Reanimated 4 moved worklet compilation out into its own package — leaving
            // the old 'react-native-reanimated/plugin' here (its pre-4.x name) silently
            // stops worklets from compiling correctly instead of erroring, which is what
            // broke FaceCropModal's pinch/pan (its gesture handlers are worklets). Must
            // be the last plugin in this list per react-native-worklets' own docs.
            'react-native-worklets/plugin',
        ],
    };
};

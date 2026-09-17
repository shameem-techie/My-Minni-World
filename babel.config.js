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
            'react-native-reanimated/plugin',
        ],
    };
};

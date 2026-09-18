import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BouncyProps extends Omit<PressableProps, 'style'> {
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
    haptic?: boolean;
    children: React.ReactNode;
}

// A Pressable that squishes on press with a springy overshoot — the `cubic-bezier(0.34,
// 1.56, 0.64, 1)` feel from the Stitch buttons. Used for every tappable thing in the app so
// the whole UI feels like soft clay.
export function Bouncy({ style, scaleTo = 0.94, haptic = true, children, onPressIn, onPressOut, onPress, ...rest }: BouncyProps) {
    const scale = useSharedValue(1);
    const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <AnimatedPressable
            {...rest}
            onPressIn={(e) => {
                scale.value = withSpring(scaleTo, { damping: 12, stiffness: 300 });
                onPressIn?.(e);
            }}
            onPressOut={(e) => {
                scale.value = withSpring(1, { damping: 10, stiffness: 260 });
                onPressOut?.(e);
            }}
            onPress={(e) => {
                if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onPress?.(e);
            }}
            style={[style, animated]}
        >
            {children}
        </AnimatedPressable>
    );
}

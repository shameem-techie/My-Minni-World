import React, { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface BobbingProps {
    children: React.ReactNode;
    amplitude?: number; // px of vertical travel
    duration?: number; // ms for one full up-and-down
    delay?: number;
    rotate?: number; // degrees of gentle sway
    style?: ViewStyle | ViewStyle[];
}

// The "gentle-bob" keyframe from the Stitch Welcome screen: an endless, eased float.
export function Bobbing({ children, amplitude = 8, duration = 3500, delay = 0, rotate = 0, style }: BobbingProps) {
    const t = useSharedValue(0);

    useEffect(() => {
        t.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
                ),
                -1,
                false,
            ),
        );
    }, [t, amplitude, duration, delay]);

    const animated = useAnimatedStyle(() => ({
        transform: [{ translateY: -amplitude * t.value }, { rotate: `${rotate * t.value}deg` }],
    }));

    return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

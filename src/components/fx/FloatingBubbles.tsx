import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface BubbleSpec {
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    tint: string;
}

function Bubble({ spec }: { spec: BubbleSpec }) {
    const t = useSharedValue(0);
    useEffect(() => {
        t.value = withDelay(
            spec.delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: spec.duration / 2, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: spec.duration / 2, easing: Easing.inOut(Easing.sin) }),
                ),
                -1,
                false,
            ),
        );
    }, [t, spec]);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: 12 - 24 * t.value }, { scale: 0.95 + 0.1 * t.value }],
        opacity: 0.65 + 0.3 * t.value,
    }));

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.bubble,
                { left: spec.x, top: spec.y, width: spec.size, height: spec.size, borderRadius: spec.size / 2 },
                style,
            ]}
        >
            <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.35)', spec.tint]}
                start={{ x: 0.2, y: 0.15 }}
                end={{ x: 0.9, y: 0.95 }}
                style={[StyleSheet.absoluteFillObject, { borderRadius: spec.size / 2 }]}
            />
            <Animated.View
                style={{
                    position: 'absolute',
                    left: spec.size * 0.22,
                    top: spec.size * 0.16,
                    width: spec.size * 0.22,
                    height: spec.size * 0.14,
                    borderRadius: spec.size,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    transform: [{ rotate: '-25deg' }],
                }}
            />
        </Animated.View>
    );
}

// Soap bubbles drifting up and down across the whole screen — the "float-soda-bubble"
// keyframes from the Stitch Welcome screen. Purely decorative and never intercepts touches.
export function FloatingBubbles({ count = 7, seed = 1 }: { count?: number; seed?: number }) {
    const { width, height } = useWindowDimensions();
    const bubbles = useMemo<BubbleSpec[]>(() => {
        const tints = ['rgba(76,201,240,0.45)', 'rgba(247,37,133,0.35)', 'rgba(157,78,221,0.4)', 'rgba(255,209,102,0.45)'];
        let s = seed * 9301 + 49297;
        const rand = () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
        return Array.from({ length: count }, (_, i) => {
            const size = 26 + rand() * 70;
            return {
                x: rand() * (width - size),
                y: rand() * (height - size),
                size,
                duration: 4200 + rand() * 3000,
                delay: rand() * 1500,
                tint: tints[i % tints.length],
            };
        });
    }, [count, seed, width, height]);

    return (
        <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {bubbles.map((b, i) => (
                <Bubble key={i} spec={b} />
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    bubble: {
        position: 'absolute',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.8)',
        overflow: 'hidden',
    },
});

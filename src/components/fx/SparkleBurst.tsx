import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export interface Burst {
    id: number;
    x: number;
    y: number;
    label?: string; // e.g. "+1"
}

const PARTICLES = ['✨', '⭐', '💫', '🫧', '✦', '💖'];

function Particle({ index, total }: { index: number; total: number }) {
    const t = useSharedValue(0);
    useEffect(() => {
        t.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    }, [t]);
    const angle = (index / total) * Math.PI * 2;
    const dist = 38 + (index % 3) * 14;
    const style = useAnimatedStyle(() => ({
        transform: [
            { translateX: Math.cos(angle) * dist * t.value },
            { translateY: Math.sin(angle) * dist * t.value - 10 * t.value },
            { scale: 0.4 + 0.9 * (1 - Math.abs(t.value - 0.5) * 2) + 0.2 },
        ],
        opacity: 1 - t.value,
    }));
    return (
        <Animated.Text style={[styles.particle, style]}>{PARTICLES[index % PARTICLES.length]}</Animated.Text>
    );
}

function SingleBurst({ burst, onDone }: { burst: Burst; onDone: (id: number) => void }) {
    const t = useSharedValue(0);
    useEffect(() => {
        t.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }, (finished) => {
            if (finished) runOnJS(onDone)(burst.id);
        });
    }, [t, burst.id, onDone]);
    const label = useAnimatedStyle(() => ({
        transform: [{ translateY: -46 * t.value }, { scale: 0.6 + 0.6 * Math.min(1, t.value * 3) }],
        opacity: t.value < 0.7 ? 1 : 1 - (t.value - 0.7) / 0.3,
    }));
    return (
        <Animated.View pointerEvents="none" style={[styles.burst, { left: burst.x, top: burst.y }]}>
            {Array.from({ length: 8 }, (_, i) => (
                <Particle key={i} index={i} total={8} />
            ))}
            {burst.label ? <Animated.Text style={[styles.label, label]}>{burst.label}</Animated.Text> : null}
        </Animated.View>
    );
}

// A ring of sparkle particles that fly outward and fade, with an optional floating
// "+1" style label. Render inside a `position: relative` container; coordinates are
// relative to that container.
export function SparkleBursts({ bursts, onDone }: { bursts: Burst[]; onDone: (id: number) => void }) {
    return (
        <>
            {bursts.map((b) => (
                <SingleBurst key={b.id} burst={b} onDone={onDone} />
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    burst: { position: 'absolute', width: 0, height: 0, alignItems: 'center', justifyContent: 'center' },
    particle: { position: 'absolute', fontSize: 18 },
    label: {
        position: 'absolute',
        fontFamily: 'Rubik_900Black',
        fontSize: 22,
        color: '#FFD166',
        textShadowColor: '#7B2CBF',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 2,
    },
});


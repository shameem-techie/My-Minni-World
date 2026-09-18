import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, type GestureType } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, type SharedValue } from 'react-native-reanimated';
import { COSMIC } from '../../theme';
import type { PlacedProp, PropDef } from '../../types';

interface StickerProps {
    placed: PlacedProp;
    def: PropDef;
    sceneWidth: number;
    sceneHeight: number;
    selected: boolean;
    onSelect: (id: string | null) => void;
    onMove: (id: string, x: number, y: number) => void;
    onRemove: (id: string) => void;
    // See DraggableMinni's zoomScale and cameraPan — same fixes, same reasons.
    zoomScale?: SharedValue<number>;
    cameraPan?: GestureType;
}

export const STICKER_SIZE = 56;

// A spawned prop living on the scene: drag it anywhere (pan), tap it to bounce and
// select it (which reveals a ✕ badge), tap the badge to put it away.
export function Sticker({ placed, def, sceneWidth, sceneHeight, selected, onSelect, onMove, onRemove, zoomScale, cameraPan }: StickerProps) {
    const startX = (placed.x / 100) * sceneWidth - STICKER_SIZE / 2;
    const startY = (placed.y / 100) * sceneHeight - STICKER_SIZE / 2;
    const tx = useSharedValue(startX);
    const ty = useSharedValue(startY);
    const ox = useSharedValue(startX);
    const oy = useSharedValue(startY);
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 9, stiffness: 220 });
    }, [scale]);

    const commit = (x: number, y: number) => {
        onMove(placed.id, ((x + STICKER_SIZE / 2) / sceneWidth) * 100, ((y + STICKER_SIZE / 2) / sceneHeight) * 100);
    };

    const panBase = Gesture.Pan().minDistance(6);
    if (cameraPan) panBase.blocksExternalGesture(cameraPan);
    const pan = panBase
        .onStart(() => {
            ox.value = tx.value;
            oy.value = ty.value;
            scale.value = withSpring(1.15);
        })
        .onUpdate((e) => {
            const z = zoomScale ? zoomScale.value : 1;
            tx.value = Math.max(-STICKER_SIZE / 3, Math.min(sceneWidth - (STICKER_SIZE * 2) / 3, ox.value + e.translationX / z));
            ty.value = Math.max(-STICKER_SIZE / 3, Math.min(sceneHeight - (STICKER_SIZE * 2) / 3, oy.value + e.translationY / z));
        })
        .onEnd(() => {
            scale.value = withSpring(1);
            runOnJS(commit)(tx.value, ty.value);
        });

    const tap = Gesture.Tap().onEnd(() => {
        scale.value = withSequence(withSpring(1.3, { damping: 5, stiffness: 300 }), withSpring(1, { damping: 8 }));
        runOnJS(onSelect)(selected ? null : placed.id);
    });

    const style = useAnimatedStyle(() => ({
        transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    }));

    return (
        <GestureDetector gesture={Gesture.Race(pan, tap)}>
            <Animated.View style={[styles.sticker, style]}>
                <View style={[styles.body, selected && styles.bodySelected]}>
                    <Text style={styles.emoji}>{def.emoji}</Text>
                </View>
                {selected && (
                    <Text onPress={() => onRemove(placed.id)} style={styles.remove} suppressHighlighting>
                        ✕
                    </Text>
                )}
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    sticker: { position: 'absolute', left: 0, top: 0, width: STICKER_SIZE, height: STICKER_SIZE },
    body: {
        width: STICKER_SIZE,
        height: STICKER_SIZE,
        borderRadius: STICKER_SIZE / 2,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COSMIC.grape,
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
    },
    bodySelected: { borderColor: COSMIC.magenta },
    emoji: { fontSize: 30 },
    remove: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 26,
        height: 26,
        lineHeight: 26,
        textAlign: 'center',
        borderRadius: 13,
        backgroundColor: COSMIC.magenta,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        overflow: 'hidden',
    },
});

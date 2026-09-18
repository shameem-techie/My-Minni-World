import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, type GestureType } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated';
import { CHARACTERS } from '../../assets/cosmicBubble';
import { MinniCharacter } from '../../components/illustrations/MinniCharacter';
import { COSMIC } from '../../theme';
import type { MinniAppearance, PetDef } from '../../types';

// Footprint the whole Minni-plus-pet group is dragged and bounded within. Minni sits at
// the bottom-left of it, the pet overlaps its top-right, matching the old fixed layout —
// only now the whole group walks around the scene instead of being pinned to a corner.
export const MINNI_BOX_W = 150;
export const MINNI_BOX_H = 132;
const MINNI_SIZE = 92;
const PET_SIZE = 56;

interface DraggableMinniProps {
    appearance: MinniAppearance | null;
    pet: PetDef | null;
    sceneWidth: number;
    sceneHeight: number;
    x: number; // percent, center of the box
    y: number; // percent, center of the box
    onMove: (x: number, y: number) => void;
    onTapMinni: () => void;
    onTapPet: () => void;
    // Current camera zoom of an ancestor scene that this component is nested inside, if
    // any. Gesture-handler reports pan translation in raw screen pixels, not adjusted
    // for an ancestor's transform scale, so a drag under 2x camera zoom would otherwise
    // move Minni twice as far as the finger. Dividing by it keeps the drag pinned 1:1
    // under the finger at any zoom level.
    zoomScale?: SharedValue<number>;
    // The room's one-finger camera-pan gesture, if any. A touch starting on Minni
    // should always win over panning the camera — see the pan gesture below.
    cameraPan?: GestureType;
}

// Your Minni (and equipped pet) as a walkable character: drag anywhere in the room, tap
// Minni or the pet for a reaction. Position is committed on release so the room
// remembers where you left them, exactly like a spawned prop does.
export function DraggableMinni({ appearance, pet, sceneWidth, sceneHeight, x, y, onMove, onTapMinni, onTapPet, zoomScale, cameraPan }: DraggableMinniProps) {
    const startX = (x / 100) * sceneWidth - MINNI_BOX_W / 2;
    const startY = (y / 100) * sceneHeight - MINNI_BOX_H / 2;
    const tx = useSharedValue(startX);
    const ty = useSharedValue(startY);
    const ox = useSharedValue(startX);
    const oy = useSharedValue(startY);
    const scale = useSharedValue(1);
    const bob = useSharedValue(0);

    // A room switch (new sceneWidth/height, or a freshly loaded save) re-seeds the
    // position instead of animating from the previous room's coordinates.
    useEffect(() => {
        tx.value = startX;
        ty.value = startY;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sceneWidth, sceneHeight]);

    useEffect(() => {
        bob.value = withRepeat(withSequence(withTiming(1, { duration: 1500 }), withTiming(0, { duration: 1500 })), -1, false);
    }, [bob]);

    const commit = (px: number, py: number) => {
        onMove(((px + MINNI_BOX_W / 2) / sceneWidth) * 100, ((py + MINNI_BOX_H / 2) / sceneHeight) * 100);
    };

    const panBase = Gesture.Pan().minDistance(6);
    if (cameraPan) panBase.blocksExternalGesture(cameraPan);
    const pan = panBase
        .onStart(() => {
            ox.value = tx.value;
            oy.value = ty.value;
            scale.value = withSpring(1.08);
        })
        .onUpdate((e) => {
            const z = zoomScale ? zoomScale.value : 1;
            tx.value = Math.max(-MINNI_BOX_W / 3, Math.min(sceneWidth - (MINNI_BOX_W * 2) / 3, ox.value + e.translationX / z));
            ty.value = Math.max(-MINNI_BOX_H / 3, Math.min(sceneHeight - (MINNI_BOX_H * 2) / 3, oy.value + e.translationY / z));
        })
        .onEnd(() => {
            scale.value = withSpring(1);
            runOnJS(commit)(tx.value, ty.value);
        });

    // A pet lives in the top-right corner of the group's box; anywhere else is Minni.
    const tap = Gesture.Tap().onEnd((e) => {
        scale.value = withSequence(withSpring(1.25, { damping: 5, stiffness: 320 }), withSpring(1, { damping: 8 }));
        const hitPet = pet && e.x > MINNI_BOX_W - PET_SIZE - 14 && e.y < PET_SIZE + 14;
        if (hitPet) runOnJS(onTapPet)();
        else runOnJS(onTapMinni)();
    });

    const groupStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    }));
    const minniStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * bob.value }] }));
    const petStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -9 * (1 - bob.value) }] }));

    return (
        <GestureDetector gesture={Gesture.Race(pan, tap)}>
            <Animated.View style={[styles.box, groupStyle]}>
                <Animated.View style={[styles.minni, minniStyle]}>
                    {appearance ? <MinniCharacter appearance={appearance} size={MINNI_SIZE} /> : <Text style={{ fontSize: 48 }}>👩‍🚀</Text>}
                </Animated.View>
                {pet && (
                    <Animated.View style={[styles.pet, petStyle]}>
                        {pet.id === 'sparkle_star_blob' ? (
                            <Image source={CHARACTERS.starPetCircle} style={styles.petImage} />
                        ) : (
                            <View style={styles.petBubble}>
                                <Text style={{ fontSize: 26 }}>{pet.emoji}</Text>
                            </View>
                        )}
                    </Animated.View>
                )}
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    box: { position: 'absolute', left: 0, top: 0, width: MINNI_BOX_W, height: MINNI_BOX_H },
    minni: { position: 'absolute', left: 0, bottom: 0 },
    pet: { position: 'absolute', right: 6, top: 0 },
    petImage: { width: PET_SIZE, height: PET_SIZE, borderRadius: PET_SIZE / 2, borderWidth: 3, borderColor: '#FFFFFF' },
    petBubble: {
        width: PET_SIZE - 6,
        height: PET_SIZE - 6,
        borderRadius: (PET_SIZE - 6) / 2,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COSMIC.grape,
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
});

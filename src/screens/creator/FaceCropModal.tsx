import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Mask, Rect } from 'react-native-svg';
import { Chip } from '../../components/ui/Chip';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import { detectFaceCropRect } from '../../services/faceDetection.service';
import type { CropRect } from '../../services/facePhoto.service';

const VIEWPORT = 320; // square crop stage, in dp
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

interface FaceCropModalProps {
    visible: boolean;
    sourceUri: string | null;
    // The dimensions expo-image-manipulator itself reported for sourceUri when it
    // produced that file (see CharacterCreatorScreen.pickPhoto) — deliberately NOT
    // measured here via RN's own Image.getSize(). That's a different native subsystem
    // from the one that will actually perform the crop later in saveFacePhoto, and the
    // two disagreeing about this file's own dimensions (even by an orientation
    // convention neither side documents) is what silently produced a crop rect that
    // didn't match what the pinch/pan UI showed on screen. Using the manipulator's own
    // number for every step keeps it self-consistent with itself, whatever that number
    // actually is.
    sourceSize: { width: number; height: number } | null;
    onCancel: () => void;
    onConfirm: (crop: CropRect, cartoon: boolean) => void;
    isSaving: boolean;
}

// Full-screen "position your face" step between picking a photo and it becoming your
// Minni's face: pinch to zoom, drag to pan, a circular guide shows exactly what gets
// used. The math converts the on-screen pan/zoom into a crop rectangle in the source
// photo's own pixel coordinates for expo-image-manipulator to cut.
export function FaceCropModal({ visible, sourceUri, sourceSize, onCancel, onConfirm, isSaving }: FaceCropModalProps) {
    const { width: screenWidth } = useWindowDimensions();
    const viewport = Math.min(VIEWPORT, screenWidth - 48);

    const natural = sourceSize;
    const [detecting, setDetecting] = useState(false);
    const [detectionFailed, setDetectionFailed] = useState(false);
    const [cartoon, setCartoon] = useState(false);
    const scale = useSharedValue(1);
    const startScale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    useEffect(() => {
        if (!visible || !sourceUri || !natural) {
            setDetecting(false);
            setDetectionFailed(false);
            return;
        }
        scale.value = 1;
        startScale.value = 1;
        tx.value = 0;
        ty.value = 0;
        setDetecting(false);
        setDetectionFailed(false);
        setCartoon(false);
        let cancelled = false;

        const v = Math.min(VIEWPORT, screenWidth - 48);
        const localBaseScale = v / Math.min(natural.width, natural.height);

        setDetecting(true);
        detectFaceCropRect(sourceUri, natural.width, natural.height)
            .then((crop) => {
                if (cancelled) return;
                if (!crop) {
                    setDetectionFailed(true);
                    return;
                }
                // Same math as handleConfirm, run in reverse: turn the AI's crop
                // rect (in source-image pixels) into the scale/pan that would
                // produce it, so the AI result is just a different starting
                // position for the same pinch/pan gesture the player already has.
                const totalScale = v / crop.width;
                const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, totalScale / localBaseScale));
                const displayW = natural.width * localBaseScale * next;
                const displayH = natural.height * localBaseScale * next;
                const originXOnScreen = -crop.originX * localBaseScale * next;
                const originYOnScreen = -crop.originY * localBaseScale * next;
                const rawTx = originXOnScreen - (v - displayW) / 2;
                const rawTy = originYOnScreen - (v - displayH) / 2;
                const boundX = Math.max(0, (displayW - v) / 2);
                const boundY = Math.max(0, (displayH - v) / 2);

                scale.value = withTiming(next, { duration: 260 });
                tx.value = withTiming(Math.max(-boundX, Math.min(boundX, rawTx)), { duration: 260 });
                ty.value = withTiming(Math.max(-boundY, Math.min(boundY, rawTy)), { duration: 260 });
            })
            .finally(() => {
                if (!cancelled) setDetecting(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, sourceUri, natural?.width, natural?.height]);

    const baseScale = natural ? viewport / Math.min(natural.width, natural.height) : 1;

    const clampPan = (nextScale: number, x: number, y: number, w: number, h: number) => {
        'worklet';
        const dispW = w * baseScale * nextScale;
        const dispH = h * baseScale * nextScale;
        const boundX = Math.max(0, (dispW - viewport) / 2);
        const boundY = Math.max(0, (dispH - viewport) / 2);
        return { x: Math.max(-boundX, Math.min(boundX, x)), y: Math.max(-boundY, Math.min(boundY, y)) };
    };

    const pan = Gesture.Pan()
        .onStart(() => {
            startX.value = tx.value;
            startY.value = ty.value;
        })
        .onUpdate((e) => {
            if (!natural) return;
            const clamped = clampPan(scale.value, startX.value + e.translationX, startY.value + e.translationY, natural.width, natural.height);
            tx.value = clamped.x;
            ty.value = clamped.y;
        });

    const pinch = Gesture.Pinch()
        .onStart(() => {
            startScale.value = scale.value;
        })
        .onUpdate((e) => {
            if (!natural) return;
            const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, startScale.value * e.scale));
            scale.value = next;
            const clamped = clampPan(next, tx.value, ty.value, natural.width, natural.height);
            tx.value = clamped.x;
            ty.value = clamped.y;
        });

    const imageStyle = useAnimatedStyle(() => {
        if (!natural) return {};
        return {
            width: natural.width * baseScale * scale.value,
            height: natural.height * baseScale * scale.value,
            transform: [{ translateX: tx.value }, { translateY: ty.value }],
        };
    });

    const handleConfirm = () => {
        if (!natural) return;
        const totalScale = baseScale * scale.value;
        const displayW = natural.width * totalScale;
        const displayH = natural.height * totalScale;
        const originXOnScreen = (viewport - displayW) / 2 + tx.value;
        const originYOnScreen = (viewport - displayH) / 2 + ty.value;
        const cropSize = viewport / totalScale;
        const crop: CropRect = {
            originX: Math.max(0, Math.min(natural.width - cropSize, -originXOnScreen / totalScale)),
            originY: Math.max(0, Math.min(natural.height - cropSize, -originYOnScreen / totalScale)),
            width: cropSize,
            height: cropSize,
        };
        onConfirm(crop, cartoon);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            {/* React Native's <Modal> renders its content in a separate native window,
                outside the app root's GestureHandlerRootView (set up once in App.tsx) —
                without its own GestureHandlerRootView here, gesture-handler's Pan/Pinch
                silently never activate inside a Modal at all, on both platforms. This is
                why pinch-to-zoom and drag never responded. */}
            <GestureHandlerRootView style={styles.backdrop}>
                <Text style={styles.title}>Position your face ✨</Text>
                <Text style={styles.subtitle}>
                    {detecting
                        ? '🤖 Finding your face…'
                        : detectionFailed
                          ? "🤖 Couldn't auto-find your face — line it up yourself below"
                          : 'Pinch to zoom, drag to move — line your face up inside the circle'}
                </Text>

                <View style={[styles.stage, { width: viewport, height: viewport }]}>
                    {sourceUri && natural ? (
                        <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
                            <View style={styles.clip}>
                                <Animated.Image source={{ uri: sourceUri }} style={imageStyle} resizeMode="cover" />
                            </View>
                        </GestureDetector>
                    ) : (
                        <View style={styles.loading}>
                            <ActivityIndicator color={COSMIC.magenta} />
                        </View>
                    )}
                    {/* react-native-svg must be >=15.14.0 here: earlier versions have a Fabric
                        iOS bug (fixed by RNSVGSvgView's "betterHitTest", software-mansion/
                        react-native-svg#2787) where this pointerEvents="none" overlay still
                        swallows every touch underneath it — Android was unaffected, which is
                        why pinch/drag looked "iOS-only broken" until this was found. */}
                    <Svg width={viewport} height={viewport} style={StyleSheet.absoluteFillObject} pointerEvents="none">
                        <Defs>
                            <Mask id="guideMask">
                                <Rect x={0} y={0} width={viewport} height={viewport} fill="#FFFFFF" />
                                <Circle cx={viewport / 2} cy={viewport / 2} r={viewport / 2 - 4} fill="#000000" />
                            </Mask>
                        </Defs>
                        <Rect x={0} y={0} width={viewport} height={viewport} fill="rgba(39,0,87,0.55)" mask="url(#guideMask)" />
                        <Circle cx={viewport / 2} cy={viewport / 2} r={viewport / 2 - 4} fill="none" stroke="#FFFFFF" strokeWidth={3} />
                    </Svg>
                </View>

                <Chip
                    label={cartoon ? 'Cartoon-ish look: on' : 'Cartoon-ish look'}
                    emoji="🎨"
                    selected={cartoon}
                    onPress={() => setCartoon((c) => !c)}
                    small
                />

                <View style={styles.actions}>
                    <CosmicButton label="Cancel" tone="snow" size="sm" onPress={onCancel} disabled={isSaving} style={{ flex: 1 }} />
                    <CosmicButton
                        label={isSaving ? 'Saving…' : 'Use This Photo'}
                        leading="✅"
                        tone="magenta"
                        size="sm"
                        onPress={handleConfirm}
                        disabled={!natural || isSaving}
                        loading={isSaving}
                        style={{ flex: 1 }}
                    />
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: COSMIC.ink, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
    title: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: '#FFFFFF', textAlign: 'center' },
    subtitle: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: -6 },
    stage: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#000000' },
    clip: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    actions: { flexDirection: 'row', gap: 12, alignSelf: 'stretch', marginTop: 8 },
});

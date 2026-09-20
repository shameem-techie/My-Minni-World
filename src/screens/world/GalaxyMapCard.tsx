import React from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MAPS } from '../../assets/cosmicBubble';
import { Bobbing } from '../../components/fx/Bobbing';
import { Bouncy } from '../../components/fx/Bouncy';
import { CircleButton } from '../../components/ui/CircleButton';
import { GALAXY_SECTORS } from '../../constants/galaxy';
import { useGame } from '../../context/GameContext';
import { CLAY, COSMIC, GRADIENT_SPACE, TYPOGRAPHY } from '../../theme';
import type { GalaxySectorDef } from '../../types';

// The galaxy art's own native resolution — "9:16 Portrait — World-Map-V4", Stitch
// screen 719015af.
const GALAXY_NATURAL_W = 768;
const GALAXY_NATURAL_H = 1376;

// The card is shaped to the art's own aspect ratio, not an arbitrary one. Pan/pinch used
// to reconcile a mismatched card shape against this art, but that made "see the whole
// map" and "no gaps" mutually exclusive — you could zoom out to see everything (empty
// gradient gutters down both sides, since the art is narrower than that card shape) or
// fill the frame (cropped, had to drag to reach the rest). Matching the card's shape to
// the art instead makes both true at once: it fills edge-to-edge *and* shows every sector
// at a glance, with nothing to drag or pinch to get there — the easiest possible version
// for a kid tapping around a landing page. Real pan/pinch exploration still exists, just
// one tap away in the fullscreen GalaxyMapScreen (⛶), which has the room for it.
const CARD_ASPECT = GALAXY_NATURAL_W / GALAXY_NATURAL_H;

// Smaller than the fullscreen map's pins (PIN_SIZE 34/HUB_SIZE 44 there) — this card now
// shows all 16 sectors packed into one static view instead of a partial zoomed-in crop,
// so the same pixel size that read fine on a few zoomed-in pins looks oversized and
// clutters the art once every pin is visible at once.
const PIN_SIZE = 22;
const HUB_SIZE = 30;

// Kept in sync with styles.card below.
const CARD_MARGIN = 16;
const CARD_BORDER = 4;

interface Props {
    onSelectSector: (sector: GalaxySectorDef) => void;
    onExpand: () => void;
}

// The World Map, as a static preview block on the landing page: the whole Cosmic Bubble
// Galaxy, every sector visible at once, tap a pin to jump straight to it. ⛶ hands off to
// the fullscreen GalaxyMapScreen for the same map with room to pan and pinch-zoom in.
export function GalaxyMapCard({ onSelectSector, onExpand }: Props) {
    const { isUnlocked } = useGame();
    const { width: winW } = useWindowDimensions();

    // The card's inner box is *computed* from the window width, not measured with
    // onLayout. onLayout fires more than once here (the card sits in a ScrollView that
    // lays out in several passes) and the first value is wrong, which left the art sized
    // for a box the card never actually had. The card's width is fully determined by the
    // window and these two constants, so there is nothing to wait for and nothing to race.
    const cardOuterW = winW - CARD_MARGIN * 2;
    const boxW = cardOuterW - CARD_BORDER * 2;
    // Derived straight from the art's own pixels, not from CARD_ASPECT — that keeps this
    // exact even though CARD_ASPECT above already had to round-trip through a border
    // subtraction for the outer card's `aspectRatio` style.
    const boxH = (boxW * GALAXY_NATURAL_H) / GALAXY_NATURAL_W;

    return (
        <View style={styles.card}>
            <View style={styles.clip}>
                <LinearGradient colors={GRADIENT_SPACE} style={StyleSheet.absoluteFillObject} />

                <View style={[styles.mapBox, { width: boxW, height: boxH }]}>
                    {/* Explicit width/height rather than absoluteFill + "cover". The box
                        is built at the art's exact aspect ratio, so a straight
                        width/height fill (no crop, no letterbox) puts the art and the
                        pins — positioned by percentage against this same box — in the
                        same coordinate space by construction. */}
                    <Image source={MAPS.galaxy} style={{ width: boxW, height: boxH }} resizeMode="cover" />

                    {GALAXY_SECTORS.map((sector, i) => {
                        const open =
                            sector.kind === 'hub' ||
                            (sector.kind === 'playset' && sector.playsetKey ? isUnlocked(sector.playsetKey) : false);
                        return (
                            <SectorPin
                                key={sector.key}
                                sector={sector}
                                index={i}
                                open={open}
                                onPress={() => onSelectSector(sector)}
                            />
                        );
                    })}
                </View>
            </View>

            <View style={styles.titleChip} pointerEvents="none">
                <Text style={styles.titleChipText}>✨ Cosmic Bubble Galaxy</Text>
            </View>

            <View style={styles.hintChip} pointerEvents="none">
                <Text style={styles.hintChipText}>👆 Tap a sector to explore</Text>
            </View>

            <View style={styles.expandWrap}>
                <CircleButton icon="expand" tone="magenta" size={32} onPress={onExpand} />
            </View>
        </View>
    );
}

// One sector marker, positioned via plain percentage layout against the static map box —
// no counter-scale needed any more, since this card never zooms.
function SectorPin({
    sector,
    index,
    open,
    onPress,
}: {
    sector: GalaxySectorDef;
    index: number;
    open: boolean;
    onPress: () => void;
}) {
    const isHub = sector.kind === 'hub';
    const size = isHub ? HUB_SIZE : PIN_SIZE;
    const tone = open ? CLAY[sector.tone].base : '#D9D3E6';

    return (
        <View
            style={[styles.pinAnchor, { left: `${sector.x}%`, top: `${sector.y}%`, marginLeft: -size / 2, marginTop: -size / 2 }]}
            pointerEvents="box-none"
        >
            <Bobbing amplitude={4} duration={2600 + index * 180} delay={index * 110}>
                <Bouncy onPress={onPress} scaleTo={0.88}>
                    <View
                        style={[
                            styles.pinCircle,
                            { width: size, height: size, borderRadius: size / 2, backgroundColor: tone, borderWidth: isHub ? 3 : 2 },
                        ]}
                    >
                        <Text style={{ fontSize: size * 0.42 }}>{open ? sector.emoji : '🔒'}</Text>
                    </View>
                </Bouncy>
            </Bobbing>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: CARD_MARGIN,
        aspectRatio: CARD_ASPECT,
        borderRadius: 28,
        borderWidth: CARD_BORDER,
        borderColor: '#FFFFFF',
        backgroundColor: COSMIC.grapeDeep,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    clip: { ...StyleSheet.absoluteFillObject, borderRadius: 24, overflow: 'hidden' },
    mapBox: { position: 'absolute', left: 0, top: 0 },

    pinAnchor: { position: 'absolute' },
    pinCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
    },

    titleChip: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(39,0,87,0.65)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    titleChipText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplay, fontSize: 11, lineHeight: 14 },
    hintChip: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(39,0,87,0.65)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    hintChipText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplay, fontSize: 11, lineHeight: 14 },

    expandWrap: { position: 'absolute', right: 10, top: 10 },
});

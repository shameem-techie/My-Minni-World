import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { CLAY } from '../../theme';

const STROKE = '#4B2E1A';
const STROKE_WIDTH = 1.4;

interface PropIconProps {
    itemKey: string;
    size?: number;
}

// Flat furniture/object icons for the small starter-pack props placed in a room.
// Falls back to a generic gift-box shape for any wardrobe item key not covered here
// (e.g. future catalog additions) rather than an unrelated icon font glyph.
export function PropIcon({ itemKey, size = 40 }: PropIconProps) {
    const common = { width: size, height: size, viewBox: '0 0 24 24' };

    switch (itemKey) {
        case 'prop_sofa':
            return (
                <Svg {...common}>
                    <Rect x="3.5" y="12" width="17" height="6" rx="1.6" fill={CLAY.sky.base} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Rect x="3.5" y="9" width="4" height="6" rx="1.4" fill={CLAY.sky.base} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Rect x="16.5" y="9" width="4" height="6" rx="1.4" fill={CLAY.sky.base} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Rect x="7.5" y="10.5" width="9" height="4" rx="1.2" fill="#FFFFFF" stroke={STROKE} strokeWidth={1} />
                    <Rect x="4.5" y="18" width="1.6" height="2" rx="0.5" fill={STROKE} />
                    <Rect x="17.9" y="18" width="1.6" height="2" rx="0.5" fill={STROKE} />
                </Svg>
            );
        case 'prop_bed':
            return (
                <Svg {...common}>
                    <Rect x="3.5" y="14" width="17" height="5" rx="1.2" fill={CLAY.lilac.base} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Rect x="3.5" y="9" width="17" height="3" rx="1" fill={CLAY.coral.base} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Rect x="4.5" y="7.5" width="4.5" height="3" rx="1" fill="#FFFFFF" stroke={STROKE} strokeWidth={1} />
                    <Rect x="4" y="19" width="1.6" height="2" fill={STROKE} />
                    <Rect x="18.4" y="19" width="1.6" height="2" fill={STROKE} />
                </Svg>
            );
        case 'prop_table':
            return (
                <Svg {...common}>
                    <Rect x="3" y="9" width="18" height="2.6" rx="1" fill={CLAY.sun.base} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Rect x="5" y="11.6" width="1.6" height="7" fill={STROKE} opacity={0.85} />
                    <Rect x="17.4" y="11.6" width="1.6" height="7" fill={STROKE} opacity={0.85} />
                </Svg>
            );
        case 'prop_plant':
            return (
                <Svg {...common}>
                    <Path d="M8 15h8l-1.2 5.5a1 1 0 0 1-1 .8h-3.6a1 1 0 0 1-1-.8L8 15z" fill={CLAY.coralPale.base} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <Path d="M12 15c0-3.4-3.4-4-3.4-7.4C10.8 8.4 12 10.6 12 15z" fill={CLAY.mint.base} stroke={STROKE} strokeWidth={1.1} strokeLinejoin="round" />
                    <Path d="M12 15c0-4 4-4.6 4-8.6-3.2 1-4 3.6-4 8.6z" fill={CLAY.mint.base} stroke={STROKE} strokeWidth={1.1} strokeLinejoin="round" />
                    <Path d="M12 15c0-2.6-2.4-3-2.4-5.6C11.2 10 12 11.6 12 15z" fill={CLAY.mint.base} stroke={STROKE} strokeWidth={1} strokeLinejoin="round" />
                </Svg>
            );
        default:
            return (
                <Svg {...common}>
                    <Rect x="4" y="9" width="16" height="11" rx="1.4" fill={CLAY.sun.base} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Rect x="4" y="9" width="16" height="3" fill={CLAY.coral.base} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Rect x="10.8" y="9" width="2.4" height="11" fill={CLAY.coral.base} stroke={STROKE} strokeWidth={1} />
                    <Circle cx="12" cy="6.5" r="2.4" fill="none" stroke={STROKE} strokeWidth={1.2} />
                </Svg>
            );
    }
}

import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

// Flat, thick-outline, single-color-on-white icon per location — matches the "Candy
// Sandbox" cutout art direction (see GAME_DESIGN.md) without depending on any paid
// image-generation service. Each is a plain 0-24 viewBox icon so it scales cleanly
// from a small world-map tile up to a room's header.

const STROKE = '#4B2E1A';
const STROKE_WIDTH = 1.4;

export type LocationIconKey =
    | 'cozy_home'
    | 'sunny_cafe'
    | 'pet_salon'
    | 'starlight_school'
    | 'meadow_park'
    | 'candy_carnival';

interface LocationIconProps {
    type: LocationIconKey | string;
    size?: number;
    color: string; // the icon's main fill — caller passes a color that reads against its tile
}

export function LocationIcon({ type, size = 40, color }: LocationIconProps) {
    const common = { width: size, height: size, viewBox: '0 0 24 24' };

    switch (type) {
        case 'cozy_home':
            return (
                <Svg {...common}>
                    <Path d="M4 11L12 4l8 7v8.5a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1V11z" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <Rect x="14" y="9.5" width="2.4" height="2.4" rx="0.4" fill="#FFF8EC" stroke={STROKE} strokeWidth={0.8} />
                </Svg>
            );
        case 'sunny_cafe':
            return (
                <Svg {...common}>
                    <Path d="M5 9h11v5.5A4.5 4.5 0 0 1 11.5 19h-2A4.5 4.5 0 0 1 5 14.5V9z" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <Path d="M16 10.5h1.3a2 2 0 0 1 0 4H16" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
                    <Path d="M8 4.5c0 1-1.2 1-1.2 2s1.2 1 1.2 2" stroke={STROKE} strokeWidth={1.1} fill="none" strokeLinecap="round" />
                    <Path d="M11.5 4.5c0 1-1.2 1-1.2 2s1.2 1 1.2 2" stroke={STROKE} strokeWidth={1.1} fill="none" strokeLinecap="round" />
                </Svg>
            );
        case 'pet_salon':
            return (
                <Svg {...common}>
                    <Ellipse cx="12" cy="15" rx="4.6" ry="4" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Ellipse cx="6.4" cy="9.5" rx="1.8" ry="2.2" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Ellipse cx="10.4" cy="6.8" rx="1.7" ry="2.1" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Ellipse cx="13.9" cy="6.8" rx="1.7" ry="2.1" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Ellipse cx="17.6" cy="9.5" rx="1.8" ry="2.2" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                </Svg>
            );
        case 'starlight_school':
            return (
                <Svg {...common}>
                    <Path d="M12 6.5c-1.6-1-4-1.3-6-.6v11.6c2-.7 4.4-.4 6 .6V6.5z" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <Path d="M12 6.5c1.6-1 4-1.3 6-.6v11.6c-2-.7-4.4-.4-6 .6V6.5z" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <Path d="M18.5 3.2l.5 1.1 1.2.2-.9.8.2 1.2-1-.6-1 .6.2-1.2-.9-.8 1.2-.2z" fill="#FFCB3D" stroke={STROKE} strokeWidth={0.8} strokeLinejoin="round" />
                </Svg>
            );
        case 'meadow_park':
            return (
                <Svg {...common}>
                    <Rect x="11" y="14" width="2" height="6" rx="0.6" fill="#8A6E4E" stroke={STROKE} strokeWidth={1} />
                    <Circle cx="9" cy="10" r="4" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Circle cx="14.5" cy="9" r="4.6" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                </Svg>
            );
        case 'candy_carnival':
            return (
                <Svg {...common}>
                    <Circle cx="12" cy="11" r="7" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Line x1="12" y1="4" x2="12" y2="18" stroke={STROKE} strokeWidth={1} />
                    <Line x1="5" y1="11" x2="19" y2="11" stroke={STROKE} strokeWidth={1} />
                    <Line x1="7" y1="6" x2="17" y2="16" stroke={STROKE} strokeWidth={1} />
                    <Line x1="17" y1="6" x2="7" y2="16" stroke={STROKE} strokeWidth={1} />
                    <Circle cx="12" cy="4" r="1.6" fill={color} stroke={STROKE} strokeWidth={0.8} />
                    <Circle cx="19" cy="11" r="1.6" fill={color} stroke={STROKE} strokeWidth={0.8} />
                    <Circle cx="12" cy="18" r="1.6" fill={color} stroke={STROKE} strokeWidth={0.8} />
                    <Circle cx="5" cy="11" r="1.6" fill={color} stroke={STROKE} strokeWidth={0.8} />
                    <Rect x="10.5" y="19.5" width="3" height="1.4" rx="0.4" fill={STROKE} />
                </Svg>
            );
        default:
            return (
                <Svg {...common}>
                    <Circle cx="12" cy="12" r="8" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                </Svg>
            );
    }
}

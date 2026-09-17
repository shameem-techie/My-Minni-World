import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import type { MinniAppearance } from '../../types';

const STROKE = '#3A2415';
const STROKE_WIDTH = 2;

// A layered paper-doll rendering of a Minni — body/head (skin tone), a hair shape
// (varies by hairStyle), an outfit shape (outfit color), and a simple face (varies by
// faceStyle). This is the actual character illustration used in the creator preview and
// (eventually) placed in a room, replacing the flat colored-rectangle placeholder.
interface MinniCharacterProps {
    appearance: MinniAppearance;
    size?: number;
}

function Hair({ style, color }: { style: string; color: string }) {
    switch (style) {
        case 'hair_ponytail':
            return (
                <>
                    <Path d="M28 26c0-11 8.5-19 20-19s20 8 20 19c0 3-1.4 5-4 5H32c-2.6 0-4-2-4-5z" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <Ellipse cx="70" cy="34" rx="6" ry="11" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                </>
            );
        case 'hair_curly':
            return (
                <>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Circle key={i} cx={26 + i * 9.5} cy={22 - (i % 2 === 0 ? 4 : 0)} r={8} fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    ))}
                    <Rect x="24" y="20" width="52" height="14" rx="7" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                </>
            );
        case 'hair_buzz':
            return <Path d="M26 28c0-13 10.5-22 22-22s22 9 22 22c0 2-1.2 3-3 3H29c-1.8 0-3-1-3-3z" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />;
        case 'hair_braids':
            return (
                <>
                    <Path d="M27 27c0-12 9-21 21-21s21 9 21 21c0 3-1.4 5-4 5H31c-2.6 0-4-2-4-5z" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
                    <Rect x="18" y="26" width="7" height="20" rx="3.5" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                    <Rect x="71" y="26" width="7" height="20" rx="3.5" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
                </>
            );
        case 'hair_bob':
        default:
            return <Path d="M25 30c0-13.8 10.7-24 23-24s23 10.2 23 24c0 4-2 8-4 8H29c-2 0-4-4-4-8z" fill={color} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />;
    }
}

function Face({ style }: { style: string }) {
    switch (style) {
        case 'face_wink':
            return (
                <>
                    <Path d="M35 46l6 3-6 3" stroke={STROKE} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <Circle cx="61" cy="47" r="3" fill={STROKE} />
                    <Path d="M42 57q6 6 12 0" stroke={STROKE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                </>
            );
        case 'face_surprised':
            return (
                <>
                    <Circle cx="39" cy="47" r="3.4" fill={STROKE} />
                    <Circle cx="61" cy="47" r="3.4" fill={STROKE} />
                    <Circle cx="50" cy="58" r="5" fill="#8A3010" stroke={STROKE} strokeWidth={2} />
                </>
            );
        case 'face_freckles':
            return (
                <>
                    <Circle cx="39" cy="47" r="3" fill={STROKE} />
                    <Circle cx="61" cy="47" r="3" fill={STROKE} />
                    <Path d="M42 57q8 7 16 0" stroke={STROKE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                    {[[32, 53], [36, 56], [64, 53], [68, 56]].map(([x, y], i) => (
                        <Circle key={i} cx={x} cy={y} r={1.3} fill="#C2431F" opacity={0.6} />
                    ))}
                </>
            );
        case 'face_happy':
        default:
            return (
                <>
                    <Circle cx="39" cy="47" r="3" fill={STROKE} />
                    <Circle cx="61" cy="47" r="3" fill={STROKE} />
                    <Path d="M40 56q10 9 20 0" stroke={STROKE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                </>
            );
    }
}

export function MinniCharacter({ appearance, size = 160 }: MinniCharacterProps) {
    const { skinTone, hairStyle, hairColor, faceStyle, outfitColor, accessoryIds } = appearance;

    return (
        <Svg width={size} height={size} viewBox="0 0 100 140">
            {/* legs */}
            <Rect x="38" y="108" width="9" height="22" rx="4" fill={skinTone} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <Rect x="53" y="108" width="9" height="22" rx="4" fill={skinTone} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* body / outfit */}
            <Path d="M30 76c0-9 8.5-15 20-15s20 6 20 15v34a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V76z" fill={outfitColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
            {/* arms */}
            <Rect x="18" y="74" width="11" height="30" rx="5.5" fill={skinTone} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <Rect x="71" y="74" width="11" height="30" rx="5.5" fill={skinTone} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* head */}
            <Circle cx="50" cy="46" r="26" fill={skinTone} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <Face style={faceStyle} />
            {/* hair (on top) */}
            <Hair style={hairStyle} color={hairColor} />
            {/* accessories */}
            {accessoryIds.includes('acc_glasses') && (
                <>
                    <Circle cx="39" cy="47" r="7" fill="none" stroke={STROKE} strokeWidth={2} />
                    <Circle cx="61" cy="47" r="7" fill="none" stroke={STROKE} strokeWidth={2} />
                    <Path d="M46 47h8" stroke={STROKE} strokeWidth={2} />
                </>
            )}
            {accessoryIds.includes('acc_bow') && (
                <Path d="M62 22l9-5v10zM62 22l9 5v-10z" fill="#F06292" stroke={STROKE} strokeWidth={1.4} strokeLinejoin="round" />
            )}
            {accessoryIds.includes('acc_cap') && (
                <Path d="M24 32c0-14 11.6-25 26-25s26 11 26 25h-8a18 18 0 0 0-36 0z" fill="#4FC3E8" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
            )}
            {accessoryIds.includes('acc_backpack') && (
                <Rect x="12" y="78" width="12" height="20" rx="4" fill="#B368E0" stroke={STROKE} strokeWidth={1.6} />
            )}
        </Svg>
    );
}

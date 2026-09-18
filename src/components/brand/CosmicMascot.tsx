import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';

// The smiling-star-in-a-bubble emblem from the Stitch "Horizontal Brand Logo Wordmark"
// (assets/themes/cosmic_bubble/branding/logo_horizontal_wordmark.svg), ported to
// react-native-svg without the SVG filters (drop shadows are done by the parent View).
export function CosmicMascot({ size = 120 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="-100 -100 200 200">
            <Defs>
                <LinearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#4CC9F0" />
                    <Stop offset="0.5" stopColor="#7209B7" />
                    <Stop offset="1" stopColor="#F72585" />
                </LinearGradient>
                <LinearGradient id="starFill" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#FFFFFF" />
                    <Stop offset="0.4" stopColor="#FFD166" />
                    <Stop offset="1" stopColor="#F72585" />
                </LinearGradient>
            </Defs>
            <Circle cx="0" cy="0" r="74" fill="url(#badgeGrad)" stroke="#FFFFFF" strokeWidth={7} />
            <Ellipse cx="0" cy="6" rx="88" ry="30" fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" transform="rotate(-18)" opacity={0.9} />
            <Ellipse cx="0" cy="6" rx="88" ry="30" fill="none" stroke="#4CC9F0" strokeWidth={5} strokeLinecap="round" transform="rotate(-18)" />
            <Polygon points="0,-48 14,-14 48,-14 20,8 30,42 0,22 -30,42 -20,8 -48,-14 -14,-14" fill="url(#starFill)" stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" />
            <Circle cx="-8" cy="2" r="3.5" fill="#240046" />
            <Circle cx="8" cy="2" r="3.5" fill="#240046" />
            <Path d="M -4 9 Q 0 14 4 9" fill="none" stroke="#240046" strokeWidth={2.5} strokeLinecap="round" />
            <Ellipse cx="-13" cy="7" rx="3.5" ry="2" fill="#F72585" />
            <Ellipse cx="13" cy="7" rx="3.5" ry="2" fill="#F72585" />
            <Circle cx="-42" cy="-40" r="9" fill="#4CC9F0" stroke="#FFFFFF" strokeWidth={2} />
            <Circle cx="48" cy="-35" r="7" fill="#FFD166" stroke="#FFFFFF" strokeWidth={2} />
        </Svg>
    );
}

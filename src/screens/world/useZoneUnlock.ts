import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGame } from '../../context/GameContext';
import type { PlaysetDef, RootStackParamList } from '../../types';

// Shared by WorldMapScreen's zone list and FullscreenWorldMapScreen's pins: tapping an
// open zone heads to its Location landing screen (the new exterior beat between the map
// and the fullscreen room); tapping a locked one raises the buy-in confirm sheet instead.
export function useZoneUnlock() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isUnlocked, unlockPlayset, progress } = useGame();
    const [pendingUnlock, setPendingUnlock] = useState<PlaysetDef | null>(null);

    const enter = (def: PlaysetDef) => {
        if (!isUnlocked(def.key)) {
            setPendingUnlock(def);
            return;
        }
        navigation.navigate('Location', { playsetKey: def.key });
    };

    const confirmUnlock = () => {
        if (!pendingUnlock) return;
        const def = pendingUnlock;
        const ok = unlockPlayset(def.key);
        setPendingUnlock(null);
        if (ok) setTimeout(() => navigation.navigate('Location', { playsetKey: def.key }), 250);
    };

    return { pendingUnlock, setPendingUnlock, enter, confirmUnlock, isUnlocked, progress };
}

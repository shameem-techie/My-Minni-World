import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Minni, MinniAppearance } from '../types';
import { createMinni, getMinnis, updateMinniAppearance } from './world.service';

const KEY_PREFIX = '@mmw:minni:';

// The active Minni is cached locally so the creator/map/rooms can render it instantly
// (and offline); Supabase's `minnis` table stays the durable copy.
export async function loadActiveMinni(uid: string): Promise<Minni | null> {
    try {
        const raw = await AsyncStorage.getItem(KEY_PREFIX + uid);
        if (raw) return JSON.parse(raw) as Minni;
    } catch {
        /* fall through to the network */
    }
    const remote = await getMinnis(uid);
    const active = remote.find((m) => m.isActive) ?? remote[0] ?? null;
    if (active) await AsyncStorage.setItem(KEY_PREFIX + uid, JSON.stringify(active)).catch(() => {});
    return active;
}

export async function saveActiveMinni(uid: string, name: string, appearance: MinniAppearance, existing: Minni | null): Promise<Minni> {
    let minni: Minni;
    if (existing && !existing.id.startsWith('local_')) {
        minni = { ...existing, name, appearance };
        try {
            await updateMinniAppearance(existing.id, appearance);
        } catch (err) {
            console.warn('Minni update did not reach Supabase; kept locally', err);
        }
    } else {
        try {
            minni = await createMinni(uid, name, appearance);
        } catch (err) {
            console.warn('Minni create did not reach Supabase; kept locally', err);
            minni = { id: 'local_' + Date.now().toString(36), ownerId: uid, name, appearance, isActive: true, createdAt: Date.now() };
        }
    }
    await AsyncStorage.setItem(KEY_PREFIX + uid, JSON.stringify(minni)).catch(() => {});
    return minni;
}

export async function clearActiveMinni(uid: string): Promise<void> {
    await AsyncStorage.removeItem(KEY_PREFIX + uid).catch(() => {});
}

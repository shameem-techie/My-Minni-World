import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import type { PlacedProp } from '../types';

// Player progress (stars, unlocks, pets, per-room decoration) lives in AsyncStorage,
// keyed per user, so the game works fully offline and on first launch with no round
// trips. Supabase is a best-effort mirror: unlocks go through the `unlock_location`
// RPC and room state through `save_world_state` whenever the playset also exists as a
// row in the `locations` table (see supabase/migrations/0002_cosmic_bubble.sql). Any
// failure there is swallowed — the local copy is the one the player plays against.

export interface RoomSave {
    props: PlacedProp[];
    routineDone: string[]; // task ids ticked
    badgeClaimed: boolean;
    visits: number;
    minniX?: number; // percent of scene width — undefined = not moved yet, use the default corner spot
    minniY?: number; // percent of scene height
}

export interface ProgressState {
    stars: number;
    dust: number; // "Super Star Dust" (the 💎 counter) — also the "diamonds" of the Land Explorer
    unlocked: string[]; // playset keys bought with stars (defaults are always open)
    pets: string[]; // pet ids collected
    equippedPet: string | null;
    lastPodClaimAt: number | null;
    lastPlaysetKey: string | null;
    rooms: Record<string, RoomSave>;
    explorerName: string;
    architectXp: number; // Land Explorer progression — see src/constants/landPlots.ts
    claimedPlots: string[]; // land plot ids the player has claimed
    plotBlueprints: Record<string, string>; // plot id -> deployed blueprint id, once built
}

export const INITIAL_PROGRESS: ProgressState = {
    stars: 120,
    dust: 5,
    unlocked: [],
    pets: [],
    equippedPet: null,
    lastPodClaimAt: null,
    lastPlaysetKey: null,
    rooms: {},
    explorerName: 'Zippy Star',
    architectXp: 0,
    claimedPlots: [],
    plotBlueprints: {},
};

const KEY_PREFIX = '@mmw:progress:';

export async function loadProgress(uid: string): Promise<ProgressState> {
    try {
        const raw = await AsyncStorage.getItem(KEY_PREFIX + uid);
        if (!raw) return { ...INITIAL_PROGRESS };
        const parsed = JSON.parse(raw) as Partial<ProgressState>;
        return {
            ...INITIAL_PROGRESS,
            ...parsed,
            rooms: parsed.rooms ?? {},
            claimedPlots: parsed.claimedPlots ?? [],
            plotBlueprints: parsed.plotBlueprints ?? {},
        };
    } catch {
        return { ...INITIAL_PROGRESS };
    }
}

export async function persistProgress(uid: string, state: ProgressState): Promise<void> {
    try {
        await AsyncStorage.setItem(KEY_PREFIX + uid, JSON.stringify(state));
    } catch (err) {
        console.warn('Could not persist progress', err);
    }
}

export async function clearProgress(uid: string): Promise<void> {
    await AsyncStorage.removeItem(KEY_PREFIX + uid);
}

// ─── Best-effort Supabase mirror ────────────────────────────────────────────────

let locationIdsByKey: Record<string, string> | null = null;

async function getLocationIdMap(): Promise<Record<string, string>> {
    if (locationIdsByKey) return locationIdsByKey;
    const { data, error } = await supabase.from('locations').select('id,key');
    if (error || !data) return {};
    locationIdsByKey = Object.fromEntries(data.map((row: any) => [row.key as string, row.id as string]));
    return locationIdsByKey;
}

export async function mirrorUnlock(playsetKey: string): Promise<void> {
    try {
        await supabase.rpc('unlock_location', { p_location_key: playsetKey });
    } catch {
        /* offline or playset not seeded yet — local copy is authoritative */
    }
}

export async function mirrorPlotClaim(plotId: string): Promise<void> {
    try {
        await supabase.rpc('claim_land_plot', { p_plot_id: plotId });
    } catch {
        /* offline, or migration 0003 not applied yet — local copy is authoritative */
    }
}

export async function mirrorBlueprintDeploy(plotId: string, blueprintId: string): Promise<void> {
    try {
        await supabase.rpc('deploy_plot_blueprint', { p_plot_id: plotId, p_blueprint_id: blueprintId });
    } catch {
        /* see above */
    }
}

export async function mirrorRoomSave(playsetKey: string, room: RoomSave): Promise<void> {
    try {
        const ids = await getLocationIdMap();
        const locationId = ids[playsetKey];
        if (!locationId) return;
        await supabase.rpc('save_world_state', {
            p_location_id: locationId,
            p_state: { props: room.props, routineDone: room.routineDone, badgeClaimed: room.badgeClaimed },
        });
    } catch {
        /* see above */
    }
}

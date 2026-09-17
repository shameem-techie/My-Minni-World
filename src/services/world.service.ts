import { supabase } from '../config/supabase';
import { LOCATIONS } from '../constants/locations';
import { WARDROBE_ITEMS } from '../constants/wardrobe';
import type {
    LocationDef,
    Minni,
    MinniAppearance,
    OwnedItem,
    PlacedProp,
    WardrobeItem,
    WorldSaveState,
} from '../types';

// ─── Catalog (public-read tables; fall back to local constants if offline) ─────

export async function getLocations(): Promise<LocationDef[]> {
    const { data, error } = await supabase.from('locations').select('*').order('sort_order');
    if (error || !data || data.length === 0) {
        return LOCATIONS.map((l, i) => ({ ...l, id: `local_${i}` }));
    }
    return data.map((row: any) => ({
        id: row.id,
        key: row.key,
        name: row.name,
        description: row.description,
        category: row.category,
        thumbnailUrl: row.thumbnail_url,
        backgroundUrl: row.background_url,
        isDefault: row.is_default,
        sortOrder: row.sort_order,
    }));
}

export async function getWardrobeItems(): Promise<WardrobeItem[]> {
    const { data, error } = await supabase.from('wardrobe_items').select('*').order('category').order('sort_order');
    if (error || !data || data.length === 0) {
        return WARDROBE_ITEMS.map((w, i) => ({ ...w, id: `local_${i}` }));
    }
    return data.map((row: any) => ({
        id: row.id,
        key: row.key,
        category: row.category,
        name: row.name,
        assetUrl: row.asset_url,
        isDefault: row.is_default,
        sortOrder: row.sort_order,
    }));
}

export async function getOwnedItemIds(ownerId: string): Promise<Set<string>> {
    const { data, error } = await supabase.from('owned_items').select('item_id').eq('owner_id', ownerId);
    if (error || !data) return new Set();
    return new Set(data.map((row: any) => row.item_id as string));
}

export async function getUnlockedLocationIds(ownerId: string): Promise<Set<string>> {
    const { data, error } = await supabase.from('location_unlocks').select('location_id').eq('owner_id', ownerId);
    if (error || !data) return new Set();
    return new Set(data.map((row: any) => row.location_id as string));
}

// Mutating writes go through SECURITY DEFINER RPCs (see supabase/migrations/0001_init.sql),
// same pattern as Cards-and-Chaos, so unlock rules stay server-side rather than being
// something a client could bypass by writing to owned_items/location_unlocks directly.
export async function unlockLocation(locationKey: string): Promise<void> {
    const { error } = await supabase.rpc('unlock_location', { p_location_key: locationKey });
    if (error) throw error;
}

export async function unlockWardrobeItem(itemKey: string): Promise<void> {
    const { error } = await supabase.rpc('unlock_wardrobe_item', { p_item_key: itemKey });
    if (error) throw error;
}

// ─── Minnis (player characters) ─────────────────────────────────────────────────

function rowToMinni(row: any): Minni {
    return {
        id: row.id,
        ownerId: row.owner_id,
        name: row.name,
        appearance: row.appearance as MinniAppearance,
        isActive: row.is_active,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    };
}

export async function getMinnis(ownerId: string): Promise<Minni[]> {
    const { data, error } = await supabase
        .from('minnis')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at');
    if (error || !data) return [];
    return data.map(rowToMinni);
}

export async function createMinni(ownerId: string, name: string, appearance: MinniAppearance): Promise<Minni> {
    const { data, error } = await supabase
        .from('minnis')
        .insert({ owner_id: ownerId, name, appearance })
        .select('*')
        .single();
    if (error || !data) throw error ?? new Error('Could not create Minni.');
    return rowToMinni(data);
}

export async function updateMinniAppearance(minniId: string, appearance: MinniAppearance): Promise<void> {
    const { error } = await supabase.from('minnis').update({ appearance }).eq('id', minniId);
    if (error) throw error;
}

// ─── World save state (placed props per location, the sandbox decoration state) ─

export async function getWorldSave(ownerId: string, locationId: string): Promise<WorldSaveState | null> {
    const { data, error } = await supabase
        .from('world_saves')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('location_id', locationId)
        .maybeSingle();
    if (error || !data) return null;
    return {
        ownerId: data.owner_id,
        locationId: data.location_id,
        props: (data.state?.props ?? []) as PlacedProp[],
        minniPositions: (data.state?.minniPositions ?? {}) as Record<string, { x: number; y: number }>,
        updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
    };
}

export async function saveWorldState(
    ownerId: string,
    locationId: string,
    props: PlacedProp[],
    minniPositions: Record<string, { x: number; y: number }>,
): Promise<void> {
    const { error } = await supabase.rpc('save_world_state', {
        p_location_id: locationId,
        p_state: { props, minniPositions },
    });
    if (error) throw error;
}

export type { OwnedItem };

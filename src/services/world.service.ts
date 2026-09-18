import { supabase } from '../config/supabase';
import { LOCATIONS } from '../constants/locations';
import type { LocationDef, Minni, MinniAppearance } from '../types';

// ─── Catalog (public-read tables; fall back to local constants if offline) ─────
// Playset content itself lives in src/constants/playsets.ts; the `locations` table is
// only consulted to find the row id a playset key maps to for Supabase mirroring.

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

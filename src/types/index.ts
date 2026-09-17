// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface UserProfile {
    uid: string;
    displayName: string;
    email?: string;
    isGuest?: boolean;
    createdAt: number;
}

// ─── Minni (playable character) ────────────────────────────────────────────────
// A paper-doll style stack of layers, mirroring how Toca Boca's characters are built:
// a base body + swappable hair/face/outfit/accessory layers, each an independent choice.

export interface MinniAppearance {
    skinTone: string;      // hex, from SKIN_TONES
    hairStyle: string;     // key into a hair-style catalog (asset id)
    hairColor: string;     // hex, from HAIR_COLORS
    faceStyle: string;     // key into a face/expression catalog
    outfitId: string;      // key into wardrobe catalog (category: 'outfit')
    outfitColor: string;   // hex, from OUTFIT_COLORS — tints the outfit asset
    accessoryIds: string[]; // keys into wardrobe catalog (category: 'accessory'), 0-3 items
}

export interface Minni {
    id: string;
    ownerId: string;
    name: string;
    appearance: MinniAppearance;
    isActive: boolean;      // the Minni currently being played as
    createdAt: number;
}

// ─── Locations (explorable rooms/scenes) ───────────────────────────────────────

export type LocationCategory = 'home' | 'community' | 'nature' | 'fantasy';

export interface LocationDef {
    id: string;
    key: string;             // stable slug, e.g. "cozy_home"
    name: string;
    description: string;
    category: LocationCategory;
    thumbnailUrl: string | null;
    backgroundUrl: string | null;
    isDefault: boolean;      // unlocked for every new player
    sortOrder: number;
}

export interface LocationUnlock {
    ownerId: string;
    locationId: string;
    unlockedAt: number;
}

// ─── Wardrobe / props catalog ───────────────────────────────────────────────────

export type WardrobeCategory = 'hair' | 'face' | 'outfit' | 'accessory' | 'prop';

export interface WardrobeItem {
    id: string;
    key: string;
    category: WardrobeCategory;
    name: string;
    assetUrl: string | null;
    isDefault: boolean;      // owned by every new player
    sortOrder: number;
}

export interface OwnedItem {
    ownerId: string;
    itemId: string;
}

// ─── Placed props inside a location (the sandbox decoration/interaction state) ──
// Mirrors Cards-and-Chaos's `games.state` jsonb pattern: one blob per (owner, location),
// synced through Supabase, holding wherever the player last left their props/Minnis.

export interface PlacedProp {
    id: string;             // instance id (uuid), distinct from the catalog itemId
    itemId: string;         // WardrobeItem.id (category 'prop') or a built-in prop key
    x: number;
    y: number;
    rotation: number;       // degrees
    scale: number;
    variant?: string;       // e.g. open/closed state, color variant
}

export interface WorldSaveState {
    ownerId: string;
    locationId: string;
    props: PlacedProp[];
    minniPositions: Record<string, { x: number; y: number }>; // minniId -> position in this room
    updatedAt: number;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    CharacterCreator: { isFirstMinni?: boolean } | undefined;
    WorldMap: undefined;
    Location: { locationKey: string };
    Wardrobe: undefined;
    Settings: undefined;
};

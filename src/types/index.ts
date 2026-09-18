// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface UserProfile {
    uid: string;
    displayName: string;
    email?: string;
    isGuest?: boolean;
    createdAt: number;
}

// ─── Minni (playable character) ────────────────────────────────────────────────
// A paper-doll style stack of layers: a base body + swappable hair/face/outfit/gear
// layers, each an independent choice so any combination renders correctly.

export interface MinniAppearance {
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    faceStyle: string;
    outfitId: string;
    outfitColor: string;
    accessoryIds: string[];
    // A real selfie cropped into the head, in place of the illustrated face — the
    // headline "your actual face on your Minni" feature. Optional because Minnis saved
    // before this feature shipped won't have these keys on their stored JSON at all;
    // every read site treats a missing/undefined faceMode as 'illustrated'.
    faceMode?: 'illustrated' | 'photo';
    facePhotoUri?: string | null; // local file:// URI under the app's document directory
}

export interface Minni {
    id: string;
    ownerId: string;
    name: string;
    appearance: MinniAppearance;
    isActive: boolean;
    createdAt: number;
}

// ─── Locations (kept for the Supabase catalog tables) ──────────────────────────

export type LocationCategory = 'home' | 'community' | 'nature' | 'fantasy';

export interface LocationDef {
    id: string;
    key: string;
    name: string;
    description: string;
    category: LocationCategory;
    thumbnailUrl: string | null;
    backgroundUrl: string | null;
    isDefault: boolean;
    sortOrder: number;
}

export type WardrobeCategory = 'hair' | 'face' | 'outfit' | 'accessory' | 'prop';

export interface WardrobeItem {
    id: string;
    key: string;
    category: WardrobeCategory;
    name: string;
    assetUrl: string | null;
    isDefault: boolean;
    sortOrder: number;
}

// ─── Play rooms (the Cosmic Bubble playsets) ───────────────────────────────────

export type DistrictKey = 'island' | 'transit' | 'studios';

export type ZoneCategory = 'community' | 'shopping' | 'homes' | 'travel' | 'food' | 'service' | 'secret';

export interface Hotspot {
    id: string;
    x: number; // 0-100, percent of scene width
    y: number; // 0-100, percent of scene height
    label: string;
    emoji: string;
    reaction: string; // what Minni says when tapped
}

export interface RoomAction {
    id: string;
    label: string;
    emoji: string;
    reaction: string;
}

export interface RoutineTask {
    id: string;
    label: string;
}

export interface PropDef {
    id: string;
    name: string;
    sub: string;
    emoji: string;
    rarity: 1 | 2 | 3 | 4;
}

export interface PlaysetDef {
    key: string;
    name: string;
    shortName: string;
    tag: string;
    subtitle: string;
    blurb: string;
    status: string; // little live-status line, e.g. "3 Buses Arriving"
    district: DistrictKey;
    category: ZoneCategory;
    emoji: string;
    tone: import('../theme').ClayTone;
    unlockCost: number; // 0 = open from the start
    image: import('../assets/cosmicBubble').PlaysetImageKey;
    hotspots: Hotspot[];
    actions: RoomAction[];
    routine: { title: string; subtitle: string; badge: string; tasks: RoutineTask[] };
    props: PropDef[];
    ambience: string[]; // status chips shown above the scene
}

export interface MapPin {
    playsetKey: string;
    x: number; // percent
    y: number; // percent
}

export interface DistrictDef {
    key: DistrictKey;
    name: string;
    sector: string;
    tagline: string;
    map: 'island' | 'transit' | null; // null = rendered starfield (no map art)
    pins: MapPin[];
}

export interface PlacedProp {
    id: string;
    propId: string;
    x: number; // percent of scene width
    y: number; // percent of scene height
}

export interface PetDef {
    id: string;
    name: string;
    emoji: string;
    blurb: string;
    rarity: 'common' | 'rare' | 'legendary';
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
    Welcome: undefined;
    CharacterCreator: { isFirstMinni?: boolean } | undefined;
    WorldMap: undefined;
    FullscreenMap: { district: DistrictKey };
    Location: { playsetKey: string };
    PlayRoom: { playsetKey: string };
    StarShop: undefined;
    Settings: undefined;
    HowToPlay: undefined;
};

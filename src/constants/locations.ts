import type { LocationDef } from '../types';

// Local fallback/seed catalog — mirrors what's seeded into the `locations` table.
// The app reads from Supabase at runtime; this constant is used for offline/dev fallback
// and as the source data for the seed migration.
export const LOCATIONS: Omit<LocationDef, 'id'>[] = [
    {
        key: 'cozy_home',
        name: 'Cozy Home',
        description: 'A snug house with a kitchen, bedroom, and living room to decorate.',
        category: 'home',
        thumbnailUrl: null,
        backgroundUrl: null,
        isDefault: true,
        sortOrder: 0,
    },
    {
        key: 'sunny_cafe',
        name: 'Sunny Café',
        description: 'Brew drinks, bake treats, and serve your Minnis at the counter.',
        category: 'community',
        thumbnailUrl: null,
        backgroundUrl: null,
        isDefault: true,
        sortOrder: 1,
    },
    {
        key: 'pet_salon',
        name: 'Pet Salon',
        description: 'Wash, style, and dress up pets for their next big adventure.',
        category: 'community',
        thumbnailUrl: null,
        backgroundUrl: null,
        isDefault: false,
        sortOrder: 2,
    },
    {
        key: 'starlight_school',
        name: 'Starlight School',
        description: 'Classrooms, an art corner, and a playground to run around in.',
        category: 'community',
        thumbnailUrl: null,
        backgroundUrl: null,
        isDefault: false,
        sortOrder: 3,
    },
    {
        key: 'meadow_park',
        name: 'Meadow Park',
        description: 'A picnic spot, a pond, and a treehouse to climb.',
        category: 'nature',
        thumbnailUrl: null,
        backgroundUrl: null,
        isDefault: false,
        sortOrder: 4,
    },
    {
        key: 'candy_carnival',
        name: 'Candy Carnival',
        description: 'Rides, games, and a cotton-candy stand under string lights.',
        category: 'fantasy',
        thumbnailUrl: null,
        backgroundUrl: null,
        isDefault: false,
        sortOrder: 5,
    },
];

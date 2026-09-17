import type { WardrobeItem } from '../types';

// Local fallback/seed catalog — mirrors what's seeded into the `wardrobe_items` table.
export const WARDROBE_ITEMS: Omit<WardrobeItem, 'id'>[] = [
    // Hair
    { key: 'hair_bob', category: 'hair', name: 'Bob Cut', assetUrl: null, isDefault: true, sortOrder: 0 },
    { key: 'hair_ponytail', category: 'hair', name: 'Ponytail', assetUrl: null, isDefault: true, sortOrder: 1 },
    { key: 'hair_curly', category: 'hair', name: 'Curly', assetUrl: null, isDefault: false, sortOrder: 2 },
    { key: 'hair_buzz', category: 'hair', name: 'Buzz Cut', assetUrl: null, isDefault: true, sortOrder: 3 },
    { key: 'hair_braids', category: 'hair', name: 'Braids', assetUrl: null, isDefault: false, sortOrder: 4 },

    // Face
    { key: 'face_happy', category: 'face', name: 'Happy', assetUrl: null, isDefault: true, sortOrder: 0 },
    { key: 'face_wink', category: 'face', name: 'Wink', assetUrl: null, isDefault: true, sortOrder: 1 },
    { key: 'face_surprised', category: 'face', name: 'Surprised', assetUrl: null, isDefault: false, sortOrder: 2 },
    { key: 'face_freckles', category: 'face', name: 'Freckles', assetUrl: null, isDefault: false, sortOrder: 3 },

    // Outfits
    { key: 'outfit_tshirt', category: 'outfit', name: 'T-Shirt & Shorts', assetUrl: null, isDefault: true, sortOrder: 0 },
    { key: 'outfit_dress', category: 'outfit', name: 'Sundress', assetUrl: null, isDefault: true, sortOrder: 1 },
    { key: 'outfit_overalls', category: 'outfit', name: 'Overalls', assetUrl: null, isDefault: false, sortOrder: 2 },
    { key: 'outfit_hoodie', category: 'outfit', name: 'Hoodie & Joggers', assetUrl: null, isDefault: false, sortOrder: 3 },
    { key: 'outfit_pjs', category: 'outfit', name: 'Pajamas', assetUrl: null, isDefault: false, sortOrder: 4 },

    // Accessories
    { key: 'acc_glasses', category: 'accessory', name: 'Round Glasses', assetUrl: null, isDefault: false, sortOrder: 0 },
    { key: 'acc_bow', category: 'accessory', name: 'Hair Bow', assetUrl: null, isDefault: false, sortOrder: 1 },
    { key: 'acc_cap', category: 'accessory', name: 'Baseball Cap', assetUrl: null, isDefault: false, sortOrder: 2 },
    { key: 'acc_backpack', category: 'accessory', name: 'Backpack', assetUrl: null, isDefault: false, sortOrder: 3 },

    // Props (a small starter set for Cozy Home)
    { key: 'prop_sofa', category: 'prop', name: 'Sofa', assetUrl: null, isDefault: true, sortOrder: 0 },
    { key: 'prop_bed', category: 'prop', name: 'Bed', assetUrl: null, isDefault: true, sortOrder: 1 },
    { key: 'prop_table', category: 'prop', name: 'Table', assetUrl: null, isDefault: true, sortOrder: 2 },
    { key: 'prop_plant', category: 'prop', name: 'Potted Plant', assetUrl: null, isDefault: true, sortOrder: 3 },
];

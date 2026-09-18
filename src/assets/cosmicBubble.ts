// Static registry for the "Cosmic Bubble & Star Soda" asset stack pulled from Stitch.
// Every file lives under assets/themes/cosmic_bubble/ using the exact names from the
// stack's integration manifest (design/stitch-mockups/cosmic-bubble/MANIFEST.md).
// Metro needs a literal require() per file, so this is the one place they're listed.
//
// NOTE: the manifest names these .png, but what Stitch actually serves is JPEG data.
// Android's AAPT refuses a JPEG wearing a .png extension ("file failed to compile"), so
// the raster renders are stored as .jpg. Only the circle-masked character cutouts
// (generated locally, need alpha) are real PNGs.

export const BRANDING = {
    iconIos: require('../../assets/themes/cosmic_bubble/branding/app_icon_ios_squircle_3d.jpg'),
    iconAndroidRound: require('../../assets/themes/cosmic_bubble/branding/app_icon_android_round_3d.jpg'),
    iconBubblePlanet: require('../../assets/themes/cosmic_bubble/branding/app_icon_bubble_planet_3d.jpg'),
    iconBubbleCastle: require('../../assets/themes/cosmic_bubble/branding/app_icon_bubble_castle_3d.jpg'),
} as const;

export const MAPS = {
    island: require('../../assets/themes/cosmic_bubble/maps/cosmic_island_city_map.jpg'),
    transit: require('../../assets/themes/cosmic_bubble/maps/transit_market_district_map.jpg'),
} as const;

export const PLAYSETS = {
    sound_music_studio: require('../../assets/themes/cosmic_bubble/playsets/sound_music_studio.jpg'),
    emote_animation_studio: require('../../assets/themes/cosmic_bubble/playsets/emote_animation_studio.jpg'),
    secret_star_treehouse: require('../../assets/themes/cosmic_bubble/playsets/secret_star_treehouse.jpg'),
    vip_wardrobe_studio: require('../../assets/themes/cosmic_bubble/playsets/vip_wardrobe_studio.jpg'),
    rainbow_playground: require('../../assets/themes/cosmic_bubble/playsets/rainbow_playground.jpg'),
    sweet_lilac_bungalow: require('../../assets/themes/cosmic_bubble/playsets/sweet_lilac_bungalow.jpg'),
    empire_builder_plot: require('../../assets/themes/cosmic_bubble/playsets/empire_builder_plot.jpg'),
    cosmic_dome_stadium: require('../../assets/themes/cosmic_bubble/playsets/cosmic_dome_stadium.jpg'),
    starlight_school_observatory: require('../../assets/themes/cosmic_bubble/playsets/starlight_school_observatory.jpg'),
    cozy_heart_hospital: require('../../assets/themes/cosmic_bubble/playsets/cozy_heart_hospital.jpg'),
    mega_shopping_mall: require('../../assets/themes/cosmic_bubble/playsets/mega_shopping_mall.jpg'),
    star_soda_arcade: require('../../assets/themes/cosmic_bubble/playsets/star_soda_arcade.jpg'),
    sweet_moon_bakery: require('../../assets/themes/cosmic_bubble/playsets/sweet_moon_bakery.jpg'),
    star_gas_car_wash: require('../../assets/themes/cosmic_bubble/playsets/star_gas_car_wash.jpg'),
    cosmic_bus_terminal: require('../../assets/themes/cosmic_bubble/playsets/cosmic_bus_terminal.jpg'),
    fresh_farmers_market: require('../../assets/themes/cosmic_bubble/playsets/fresh_farmers_market.jpg'),
    rainbow_railway_station: require('../../assets/themes/cosmic_bubble/playsets/rainbow_railway_station.jpg'),
} as const;

export type PlaysetImageKey = keyof typeof PLAYSETS;

// Dedicated "arrival" exterior renders for the Location screen (the beat between
// picking a pin and walking into the interior PlayRoom scene) — generated separately
// from the interiors above, so only playsets with one get a real building shot; any
// playset key not listed here falls back to a dimmed/blurred crop of its own interior
// image instead (see LocationScreen).
//
// NOTE: entries are added here only once the corresponding file actually exists under
// assets/themes/cosmic_bubble/exteriors/ — Metro resolves require() at bundle time, so
// a listed-but-missing file breaks every build, not just this screen.
export const EXTERIORS: Partial<Record<PlaysetImageKey, ReturnType<typeof require>>> = {
    starlight_school_observatory: require('../../assets/themes/cosmic_bubble/exteriors/starlight_school_observatory_exterior.jpg'),
    sweet_lilac_bungalow: require('../../assets/themes/cosmic_bubble/exteriors/sweet_lilac_bungalow_exterior.jpg'),
};

export const CHARACTERS = {
    bubbleKid: require('../../assets/themes/cosmic_bubble/characters/alien_bubble_kid.jpg'),
    starPet: require('../../assets/themes/cosmic_bubble/characters/alien_pet_creature.jpg'),
    bubbleKidCircle: require('../../assets/themes/cosmic_bubble/characters/bubble_kid_circle.png'),
    starPetCircle: require('../../assets/themes/cosmic_bubble/characters/star_pet_circle.png'),
} as const;

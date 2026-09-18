-- Cosmic Bubble & Star Soda playsets (2026-09-18)
-- Seeds the 17 playsets from the Stitch asset stack into the public `locations` catalog
-- so the app's best-effort Supabase mirror (unlock_location / save_world_state RPCs) has
-- rows to attach to. The app itself reads playset content from src/constants/playsets.ts
-- and keeps progress in AsyncStorage; this table is only the durable server copy.
--
-- Apply manually in this project's SQL Editor (the workspace's Supabase MCP connector is
-- authenticated as a different account — see the root CLAUDE.md "Known Issues").

insert into public.locations (key, name, description, category, is_default, sort_order) values
    ('sweet_lilac_bungalow',         'Sweet Lilac Bungalow',              'Cosy bedrooms, kitchen, backyard & flowers',                        'home',      true,  10),
    ('starlight_school_observatory', 'Starlight School & Observatory',    'Cosmic science & star gazing telescope',                            'community', true,  11),
    ('cozy_heart_hospital',          'Cozy Heart Hospital',               'Emergency nursery, X-ray & pet care',                               'community', false, 12),
    ('cosmic_dome_stadium',          'Cosmic Dome Stadium',               'Zero-G soccer & neon roller skate ring',                            'community', false, 13),
    ('mega_shopping_mall',           'Mega Shopping Mall',                'Fashion boutique, boba shop & food court',                          'community', false, 14),
    ('star_soda_arcade',             'Star Soda Arcade',                  'Claw machines, dance pad & ticket shop',                            'community', true,  15),
    ('rainbow_playground',           'Rainbow Playground',                'Big slides, seesaws, sandbox & ice cream van',                      'nature',    true,  16),
    ('empire_builder_plot',          'Empire Builder Plot',               'Custom villa, star pool & garden',                                  'home',      false, 17),
    ('cosmic_bus_terminal',          'Cosmic Bus Terminal',               'Double-decker star buses, luggage lockers & ticket punch',          'community', true,  20),
    ('rainbow_railway_station',      'Grand Rainbow Railway Station',     'High-speed maglev bubble train across cosmic nebulae',              'community', false, 21),
    ('star_gas_car_wash',            'Star Gas, EV & Car Wash',           'Neon fuel pumps, solar plugs & bubbly car wash sponge tunnel',      'community', false, 22),
    ('fresh_farmers_market',         'Starlight Fresh Farmers Market',    'Crisp cosmic carrots, glowing stardust berries, scales & cashier',  'community', false, 23),
    ('sweet_moon_bakery',            'Sweet Moon Bakery & Café',          'Star bagels, rainbow croissants, cinnamon rolls & hot cocoa tap',   'community', true,  24),
    ('sound_music_studio',           'Cosmic Sound & Music Studio',       'Music booth, rainbow turntables, synth lounge',                     'fantasy',   false, 30),
    ('emote_animation_studio',       'Emote & Animation Studio',          'Recording stage, director cam and emoji reaction bubbles',          'fantasy',   false, 31),
    ('vip_wardrobe_studio',          'VIP Wardrobe Studio',               'Rotating garment racks, vanity mirror, wings and accessories',      'fantasy',   false, 32),
    ('secret_star_treehouse',        'Secret Star Treehouse',             'Glow-tree observatory, stargazing pod, crystal chest and hammock',  'fantasy',   false, 33)
on conflict (key) do update set
    name = excluded.name,
    description = excluded.description,
    category = excluded.category,
    is_default = excluded.is_default,
    sort_order = excluded.sort_order;

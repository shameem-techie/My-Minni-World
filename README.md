# My Minni World

A Toca Boca World-style open sandbox for kids — build a character, explore
themed locations, decorate and play at your own pace. See
[GAME_DESIGN.md](./GAME_DESIGN.md) for the concept, data model, and roadmap.

## Stack

Expo SDK 54 · React Navigation v6 · TypeScript · Supabase (Postgres + Auth)

Same conventions as this workspace's other Supabase-backed apps
(`Cards-and-Chaos`, `RummySekai`): path aliases via `babel-plugin-module-resolver`,
a `profiles` row created by an `auth.users` trigger, RLS on every table, and
`SECURITY DEFINER` RPCs for any write that needs to be trusted server-side.

## Getting started

```bash
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
npm start
```

## Project layout

```
assets/themes/cosmic_bubble/   The Stitch "Cosmic Bubble" asset stack (branding, maps, playsets, characters)
src/
  assets/          cosmicBubble.ts — static require() registry for the stack
  components/      brand/ (mascot, wordmark), fx/ (Bobbing, FloatingBubbles, SparkleBurst, Bouncy),
                   ui/ (CosmicButton, Chip, CircleButton, StatBar, CosmicTabBar, Card), illustrations/
  config/          Supabase client
  constants/       playsets.ts (17 playsets + 3 districts), pets.ts (gacha pool + economy)
  context/         AuthContext, GameContext (stars, unlocks, pets, room saves → AsyncStorage)
  navigation/      RootNavigator
  screens/         onboarding/, creator/, world/, playroom/, shop/, settings/
  services/        auth, minni (active Minni cache), progress (persistence + Supabase mirror), world
  theme/           Cosmic Bubble palette + typography
  types/           Shared TS types
supabase/
  migrations/0001_init.sql            Full schema, RLS policies, RPCs
  migrations/0002_cosmic_bubble.sql   Seeds the 17 playsets into `locations` (apply manually)
```

## Building for real devices

Release builds bundle the JS, so the installed app needs no Metro server.

```bash
npx expo prebuild --platform all --no-install   # regenerates android/ + ios/ from app.config.ts
cd ios && pod install && cd ..

# Android (USB): needs JAVA_HOME pointed at Android Studio's JBR
cd android && ./gradlew assembleRelease && cd ..
adb -s <serial> install -r android/app/build/outputs/apk/release/app-release.apk

# iOS (paired iPhone, wireless is fine): xcodebuild UDID ≠ devicectl identifier
xcodebuild -workspace ios/MyMinniWorld.xcworkspace -scheme MyMinniWorld -configuration Release \
  -destination "id=<xctrace UDID>" -derivedDataPath /tmp/mmw-dd DEVELOPMENT_TEAM=<team> -allowProvisioningUpdates build
xcrun devicectl device install app --device <devicectl identifier> /tmp/mmw-dd/Build/Products/Release-iphoneos/MyMinniWorld.app
```

## Supabase project

Project ref and keys are in `.env` (not committed). The schema in
`supabase/migrations/0001_init.sql` is the source of truth — apply it with the
Supabase CLI (`supabase db push`) or the Supabase MCP tools.

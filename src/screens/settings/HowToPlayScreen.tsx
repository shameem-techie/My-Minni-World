import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../../components/ui/Card';
import { CircleButton } from '../../components/ui/CircleButton';
import { CosmicButton } from '../../components/ui/CosmicButton';
import { DAILY_POD_REWARD, DUPLICATE_DUST, FIRST_VISIT_REWARD, GACHA_COST, HOTSPOT_REWARD, PETS, ROUTINE_BADGE_REWARD, SPAWN_REWARD } from '../../constants/pets';
import { DISTRICTS, PLAYSETS } from '../../constants/playsets';
import { INITIAL_PROGRESS } from '../../services/progress.service';
import { COSMIC, TYPOGRAPHY } from '../../theme';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'HowToPlay'>;

// The complete "How to Play?" guide: the end-to-end flow, every feature, how stars and
// star dust are earned and spent, the long-term challenges, and what makes the game
// special. Numbers are pulled from the same constants the game runs on so the guide can
// never drift from the actual rules.
export function HowToPlayScreen({ navigation }: Props) {
    const freeZones = PLAYSETS.filter((p) => p.unlockCost === 0);
    const lockedZones = PLAYSETS.filter((p) => p.unlockCost > 0);
    const cheapest = Math.min(...lockedZones.map((p) => p.unlockCost));
    const priciest = Math.max(...lockedZones.map((p) => p.unlockCost));
    const legendary = PETS.filter((p) => p.rarity === 'legendary');

    let n = 0;
    const next = () => (n += 1);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <CircleButton icon="arrow-back" tone="snow" onPress={() => navigation.goBack()} />
                <Text style={styles.title}>How to Play?</Text>
                <View style={{ width: 44 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(400).springify()}>
                    <Card style={styles.hero} tint={COSMIC.ink}>
                        <Text style={styles.heroEmoji}>🪐✨🫧</Text>
                        <Text style={styles.heroTitle}>Welcome to My Minni World!</Text>
                        <Text style={styles.heroText}>
                            A free-play space sandbox. There are no timers, no losing and no game over. You build a little space kid called a Minni, fly
                            between glowing playsets, tap everything to see what it does, decorate rooms, finish star routines and collect cosmic pets.
                            Every tap earns you stars, and stars open up more of the world.
                        </Text>
                    </Card>
                </Animated.View>

                <Section n={next()} emoji="🚀" title="Start playing">
                    <Step text="On the Welcome screen tap the big pink PLAY NOW button. No login, no sign-up, no email — the game makes a guest explorer for you on the spot." />
                    <Step text="The first time you play you go straight to the Minni Maker to build your character. After that, PLAY NOW takes you to your World Map." />
                    <Step text="Character Maker and My Town on the Welcome screen are shortcuts to the same two places." />
                </Section>

                <Section n={next()} emoji="🎨" title="Make your Minni (Cosmic Minni Maker)">
                    <Step text="Your Minni floats on the stage at the top. It bounces every time you change something." />
                    <Step text="Tap the name pill (✏️) to type a name. Tap the 🎲 dice to get a random look and a random name." />
                    <Step text="Rotate flips your Minni around. Pose makes it strike a wobbly ta-da pose." />
                    <Step text="Use the pill tabs to customise: Hair (style + hair hue), Skin (8 tones), Face (happy, wink, surprised, freckles), Suits (5 outfits + suit hue) and Gear." />
                    <Step text="Gear is the cosmic bit: Bubble Helmet, Star Antennae, Round Glasses, Hair Bow, Star Cap and Rocket Pack. You can wear as many as you like at once." />
                    <Step text="Tap Save & Launch Minni! to fly to the World Map. You can come back any time with the Avatar tab at the bottom of the screen or the purple 👤 button." />
                </Section>

                <Section n={next()} emoji="🗺️" title="Explore the World Map">
                    <Step text="The top card shows you as an Explorer with your Minni's face. Tap the white name pill in Settings to change your explorer name." />
                    <Step text={`There are ${DISTRICTS.length} districts. Switch between them with the pills above the map:`} />
                    {DISTRICTS.map((d) => (
                        <Bullet key={d.key} text={`${d.name} — ${d.sector}: ${PLAYSETS.filter((p) => p.district === d.key).map((p) => p.shortName).join(', ')}.`} />
                    ))}
                    <Step text="Every building on the map has a bobbing pin. Coloured pins are open — tap one to fly in. Grey pins with a 🔒 are locked." />
                    <Step text="Below the map is the zone list. Use the filter pills (All Places, Community & Learn, Shopping & Fun, …) to narrow it down. ENTER flies you in; Unlock opens the unlock sheet." />
                    <Step text={`${freeZones.length} zones are open from the very start: ${freeZones.map((p) => p.shortName).join(', ')}. The other ${lockedZones.length} cost between ${cheapest} and ${priciest} ✨ stars.`} />
                    <Step text="Star Studios is the secret district: four hidden playsets floating as bubbles in space instead of on a map — the Music Studio, Emote Studio, VIP Wardrobe and the Secret Star Treehouse." />
                </Section>

                <Section n={next()} emoji="🏠" title="Inside a Play Room">
                    <Step text={`Each of the ${PLAYSETS.length} playsets is a 3D cutaway scene. The first time you visit any room you get +${FIRST_VISIT_REWARD} ✨ just for exploring somewhere new.`} />
                    <Step text={`Hotspots are the small white pills with a pink dot floating over the scene (like "Star Loft 🌙" or "Claw Machine 🧸"). Tap one: sparkles burst, your Minni says something about that spot, and you earn +${HOTSPOT_REWARD} ✨. Tap as often as you like.`} />
                    <Step text="Your Minni stands in the bottom-left corner of every room. Tap it to say hi. If you have a pet equipped, it floats next to your Minni — tap the pet to hear about it." />
                    <Step text={`The three coloured buttons under the scene are Quick Actions unique to that room (Snooze, Star Cocoa, Cushions in the Bungalow; Kick Off, Skate Lap, Cheer in the Stadium…). Each one triggers a reaction and +${HOTSPOT_REWARD} ✨.`} />
                    <Step text="The 📸 button snaps a picture pose. The yellow and blue chips above the scene show what's happening in the room right now (Bedtime Lamp: ON, Oven: WARM…)." />
                </Section>

                <Section n={next()} emoji="✅" title="Star Routines & Badges">
                    <Step text="Every room has a Star Routine card with three tasks, e.g. the Bungalow's Bedtime Star Routine: fluff the cloud duvet, light the nightlight, read a bedtime story." />
                    <Step text="Tap a task to tick it (tap again to untick). When all three are ticked the big button lights up." />
                    <Step text={`Tap Claim … Badge to earn that room's badge and +${ROUTINE_BADGE_REWARD} ✨. Each room's badge can be claimed once — there are ${PLAYSETS.length} badges to collect.`} />
                </Section>

                <Section n={next()} emoji="🧸" title="Props Tray: decorate your rooms">
                    <Step text="Scroll down in any room to the Props Tray. Each room has 6 props with a star rating (1★ common up to 4★ VIP)." />
                    <Step text={`Tap a prop card to spawn it into the scene as a sticker. The first time you spawn each prop you get +${SPAWN_REWARD} ✨.`} />
                    <Step text="Drag a sticker anywhere in the scene. Tap it to make it bounce and select it — a pink ✕ appears; tap the ✕ to put it away." />
                    <Step text="Your decoration is saved per room, so every room stays exactly how you left it." />
                </Section>

                <Section n={next()} emoji="✨" title="How to earn Stars & 💎 Star Dust">
                    <Step text={`You start with ${INITIAL_PROGRESS.stars} ✨ stars and ${INITIAL_PROGRESS.dust} 💎 star dust. The counters at the top of every screen pop whenever they change.`} />
                    <Row k={`+${FIRST_VISIT_REWARD} ✨`} v="first visit to any room" />
                    <Row k={`+${HOTSPOT_REWARD} ✨`} v="every hotspot tap and every quick action" />
                    <Row k={`+${SPAWN_REWARD} ✨`} v="first spawn of each prop" />
                    <Row k={`+${ROUTINE_BADGE_REWARD} ✨`} v="claiming a room's routine badge" />
                    <Row k={`+${DAILY_POD_REWARD} ✨`} v="hatching the Daily Mystery Pod in the Star Shop (free, every 6 hours)" />
                    <Row k={`+${DUPLICATE_DUST} 💎`} v="pulling a pet you already own from the Cosmic Orb" />
                    <Step text="Star dust is your bonus collection counter — it shows off how many duplicate pets you've turned into stardust. Stars are what you spend." />
                </Section>

                <Section n={next()} emoji="🛍️" title="How to spend Stars (Star Shop)">
                    <Row k={`${GACHA_COST} ✨`} v="one twist of the Cosmic Orb Gacha — a random pet" />
                    <Row k={`${cheapest}–${priciest} ✨`} v="unlock a single locked zone from the World Map" />
                    <Row k="300 ✨" v="Transit Pass Pack — every Transit & Market zone at once" />
                    <Row k="450 ✨" v="Star Studios Pass — all four secret studios at once" />
                    <Row k="300 ✨" v="Bubble Pet Paradise — 3 new pets, guaranteed no duplicates" />
                    <Step text="Tap PULL! on the Cosmic Orb and watch the icon ring spin. The pet is revealed on a Just Unboxed card: tap Pet Cry to hear it, or Equip Pet to make it follow your Minni into every room." />
                    <Step text={`There are ${PETS.length} pets: common, rare and legendary. The legendary ones are ${legendary.map((p) => p.name).join(' and ')}. Your first twist always finds a brand-new pet.`} />
                    <Step text="Pet House shows every pet you own. Tap an owned pet to swap which one follows you (tap again to send it home). ❔ cards are pets you haven't found yet." />
                    <Step text="The Daily Mystery Pod is the easiest stars in the game: tap CLAIM whenever the timer shows READY." />
                </Section>

                <Section n={next()} emoji="🏆" title="Challenges to chase">
                    <Bullet text={`Open every zone — all ${PLAYSETS.length} playsets across all ${DISTRICTS.length} districts.`} />
                    <Bullet text={`Earn all ${PLAYSETS.length} routine badges (one per room).`} />
                    <Bullet text={`Collect all ${PETS.length} cosmic pets, including both legendary ones.`} />
                    <Bullet text="Find the Secret Star Treehouse — the priciest, most hidden playset in Star Studios." />
                    <Bullet text="Spawn every prop in every room and furnish your whole world." />
                    <Bullet text="Hatch the Daily Mystery Pod every single day." />
                    <Step text="Settings shows your progress: stars, star dust, zones open, pets collected, badges earned and props placed." />
                </Section>

                <Section n={next()} emoji="🌟" title="What makes it special">
                    <Bullet text="Every scene, map, icon and character is real 3D Cosmic Bubble artwork — claymorphic playsets floating in a starry candy galaxy." />
                    <Bullet text="Everything is alive: bubbles float, pins bob, buttons squish, stars burst out of every tap and your Minni talks back." />
                    <Bullet text="No fail states, no timers, no ads, no chat, no login. A 100% safe kids sandbox." />
                    <Bullet text="Your Minni is a paper doll — any hair, face, suit and gear combination works, and it walks into every room with you." />
                    <Bullet text="Pets are companions, not stickers: the one you equip floats beside you everywhere and reacts when tapped." />
                    <Bullet text="Progress saves on the device automatically, so it works even with no internet, and syncs to the cloud when it can." />
                </Section>

                <Section n={next()} emoji="⚙️" title="Settings">
                    <Step text="Explorer name: type a new name and tap Save — it appears on the World Map header." />
                    <Step text="Reset progress clears stars, pets, unlocks and decorations (your Minni stays). Sign out returns to the Welcome screen." />
                </Section>

                <CosmicButton label="Got it — let's play!" leading="🚀" size="lg" onPress={() => navigation.navigate('GalaxyMap')} style={{ marginTop: 6 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function Section({ n, emoji, title, children }: { n: number; emoji: string; title: string; children: React.ReactNode }) {
    return (
        <Animated.View entering={FadeInDown.delay(60 * n).duration(400).springify()}>
            <Card style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionNum}>
                        <Text style={styles.sectionNumText}>{n}</Text>
                    </View>
                    <Text style={styles.sectionEmoji}>{emoji}</Text>
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                {children}
            </Card>
        </Animated.View>
    );
}

function Step({ text }: { text: string }) {
    return (
        <View style={styles.step}>
            <Text style={styles.stepDot}>▸</Text>
            <Text style={styles.stepText}>{text}</Text>
        </View>
    );
}

function Bullet({ text }: { text: string }) {
    return (
        <View style={[styles.step, { paddingLeft: 14 }]}>
            <Text style={[styles.stepDot, { color: COSMIC.gold }]}>★</Text>
            <Text style={styles.stepText}>{text}</Text>
        </View>
    );
}

function Row({ k, v }: { k: string; v: string }) {
    return (
        <View style={styles.row}>
            <View style={styles.rowKey}>
                <Text style={styles.rowKeyText}>{k}</Text>
            </View>
            <Text style={styles.rowValue}>{v}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COSMIC.surfaceLow },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
    title: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY['2xl'], color: COSMIC.ink },
    scroll: { padding: 16, gap: 14, paddingBottom: 32 },
    hero: { alignItems: 'center', gap: 8 },
    heroEmoji: { fontSize: 34 },
    heroTitle: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.xl, color: COSMIC.gold, textAlign: 'center' },
    heroText: { fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: '#FFFFFF', textAlign: 'center', lineHeight: 20 },
    section: { gap: 8 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    sectionNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: COSMIC.magenta, alignItems: 'center', justifyContent: 'center' },
    sectionNumText: { color: '#FFFFFF', fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.sm },
    sectionEmoji: { fontSize: 20 },
    sectionTitle: { flex: 1, fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.lg, color: COSMIC.ink },
    step: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
    stepDot: { color: COSMIC.magenta, fontSize: TYPOGRAPHY.base, lineHeight: 21, fontFamily: TYPOGRAPHY.fontFamilyExtraBold },
    stepText: { flex: 1, fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.base, lineHeight: 21, color: COSMIC.onSurface },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COSMIC.lilacPale, borderRadius: 14, padding: 8 },
    rowKey: { minWidth: 82, backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center' },
    rowKeyText: { fontFamily: TYPOGRAPHY.fontFamilyDisplayExtraBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.grape },
    rowValue: { flex: 1, fontFamily: TYPOGRAPHY.fontFamilySemiBold, fontSize: TYPOGRAPHY.sm, color: COSMIC.onSurface },
});

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PLAYSETS_BY_KEY } from '../constants/playsets';
import {
    DAILY_POD_REWARD,
    DUPLICATE_DUST,
    FIRST_VISIT_REWARD,
    GACHA_COST,
    PETS,
    ROUTINE_BADGE_REWARD,
} from '../constants/pets';
import { architectLevelForXp, CLAIM_PLOT_XP, DEPLOY_BLUEPRINT_XP, LAND_PLOTS_BY_ID, STRUCTURE_BLUEPRINTS_BY_ID } from '../constants/landPlots';
import {
    INITIAL_PROGRESS,
    clearProgress,
    loadProgress,
    mirrorBlueprintDeploy,
    mirrorPlotClaim,
    mirrorRoomSave,
    mirrorUnlock,
    persistProgress,
    type ProgressState,
    type RoomSave,
} from '../services/progress.service';
import type { LandCurrency, PetDef, PlacedProp } from '../types';
import { useAuth } from './AuthContext';

const DAILY_POD_COOLDOWN_MS = 6 * 60 * 60 * 1000; // a "day" for a kid is about six hours of patience

const EMPTY_ROOM: RoomSave = { props: [], routineDone: [], badgeClaimed: false, visits: 0 };

interface GameContextValue {
    progress: ProgressState;
    isReady: boolean;
    isUnlocked: (playsetKey: string) => boolean;
    room: (playsetKey: string) => RoomSave;
    podReadyAt: number | null; // timestamp when the daily pod can next be claimed (null = ready now)

    addStars: (amount: number) => void;
    unlockPlayset: (playsetKey: string) => boolean;
    visitPlayset: (playsetKey: string) => number; // returns stars awarded (first visit bonus)
    setRoomProps: (playsetKey: string, props: PlacedProp[]) => void;
    setMinniPosition: (playsetKey: string, x: number, y: number) => void;
    toggleRoutineTask: (playsetKey: string, taskId: string) => void;
    claimRoutineBadge: (playsetKey: string) => boolean;
    unlockPack: (playsetKeys: string[], cost: number) => boolean;
    pullGacha: () => { pet: PetDef; isNew: boolean } | null;
    grantRandomPets: (count: number, cost: number) => PetDef[] | null;
    claimDailyPod: () => boolean;
    equipPet: (petId: string | null) => void;
    setExplorerName: (name: string) => void;
    resetProgress: () => Promise<void>;

    architectLevel: number;
    isPlotClaimed: (plotId: string) => boolean;
    claimPlot: (plotId: string, currency: LandCurrency) => boolean;
    deployBlueprint: (plotId: string, blueprintId: string, currency: LandCurrency) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const uid = user?.uid ?? null;
    const [progress, setProgress] = useState<ProgressState>({ ...INITIAL_PROGRESS });
    const [isReady, setIsReady] = useState(false);
    const progressRef = useRef(progress);
    progressRef.current = progress;
    const loadedForUid = useRef<string | null>(null);
    const dirtyRooms = useRef<Set<string>>(new Set());

    useEffect(() => {
        let cancelled = false;
        setIsReady(false);
        loadedForUid.current = null;
        if (!uid) {
            setProgress({ ...INITIAL_PROGRESS });
            setIsReady(true);
            return;
        }
        loadProgress(uid).then((loaded) => {
            if (cancelled) return;
            setProgress(loaded);
            loadedForUid.current = uid;
            setIsReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, [uid]);

    // Every state change is persisted; debounced slightly so drag gestures don't thrash storage.
    useEffect(() => {
        if (!uid || !isReady || loadedForUid.current !== uid) return;
        const timer = setTimeout(() => {
            persistProgress(uid, progressRef.current);
            // Mirror any rooms touched since the last flush to Supabase (best effort).
            const rooms = progressRef.current.rooms;
            dirtyRooms.current.forEach((key) => {
                if (rooms[key]) void mirrorRoomSave(key, rooms[key]);
            });
            dirtyRooms.current.clear();
        }, 600);
        return () => clearTimeout(timer);
    }, [progress, uid, isReady]);

    const update = useCallback((fn: (prev: ProgressState) => ProgressState) => {
        setProgress((prev) => fn(prev));
    }, []);

    const updateRoom = useCallback((playsetKey: string, fn: (room: RoomSave) => RoomSave, mirror = true) => {
        if (mirror) dirtyRooms.current.add(playsetKey);
        setProgress((prev) => ({ ...prev, rooms: { ...prev.rooms, [playsetKey]: fn(prev.rooms[playsetKey] ?? EMPTY_ROOM) } }));
    }, []);

    const isUnlocked = useCallback(
        (key: string) => {
            const def = PLAYSETS_BY_KEY[key];
            if (!def) return false;
            return def.unlockCost === 0 || progress.unlocked.includes(key);
        },
        [progress.unlocked],
    );

    const room = useCallback((key: string) => progress.rooms[key] ?? EMPTY_ROOM, [progress.rooms]);

    const podReadyAt = useMemo(() => {
        if (!progress.lastPodClaimAt) return null;
        const readyAt = progress.lastPodClaimAt + DAILY_POD_COOLDOWN_MS;
        return readyAt > Date.now() ? readyAt : null;
    }, [progress.lastPodClaimAt]);

    const architectLevel = useMemo(() => architectLevelForXp(progress.architectXp), [progress.architectXp]);

    const isPlotClaimed = useCallback((plotId: string) => progress.claimedPlots.includes(plotId), [progress.claimedPlots]);

    const value: GameContextValue = {
        progress,
        isReady,
        isUnlocked,
        room,
        podReadyAt,

        addStars: (amount) => update((p) => ({ ...p, stars: Math.max(0, p.stars + amount) })),

        unlockPlayset: (key) => {
            const def = PLAYSETS_BY_KEY[key];
            const current = progressRef.current;
            if (!def || current.unlocked.includes(key) || def.unlockCost === 0) return true;
            if (current.stars < def.unlockCost) return false;
            update((p) => ({ ...p, stars: p.stars - def.unlockCost, unlocked: [...p.unlocked, key] }));
            void mirrorUnlock(key);
            return true;
        },

        unlockPack: (keys, cost) => {
            const current = progressRef.current;
            const missing = keys.filter((k) => !current.unlocked.includes(k) && (PLAYSETS_BY_KEY[k]?.unlockCost ?? 0) > 0);
            if (missing.length === 0) return true;
            if (current.stars < cost) return false;
            update((p) => ({ ...p, stars: p.stars - cost, unlocked: [...p.unlocked, ...missing] }));
            missing.forEach((k) => void mirrorUnlock(k));
            return true;
        },

        architectLevel,
        isPlotClaimed,

        claimPlot: (plotId, currency) => {
            const plot = LAND_PLOTS_BY_ID[plotId];
            const current = progressRef.current;
            if (!plot || current.claimedPlots.includes(plotId)) return true;
            if (architectLevelForXp(current.architectXp) < plot.requiredLevel) return false;
            const cost = currency === 'stars' ? plot.costStars : plot.costDust;
            if (current[currency] < cost) return false;
            update((p) => ({
                ...p,
                [currency]: p[currency] - cost,
                claimedPlots: [...p.claimedPlots, plotId],
                architectXp: p.architectXp + CLAIM_PLOT_XP,
            }));
            void mirrorPlotClaim(plotId);
            return true;
        },

        deployBlueprint: (plotId, blueprintId, currency) => {
            const blueprint = STRUCTURE_BLUEPRINTS_BY_ID[blueprintId];
            const current = progressRef.current;
            if (!blueprint || !current.claimedPlots.includes(plotId)) return false;
            const cost = currency === 'stars' ? blueprint.costStars : blueprint.costDust;
            if (current[currency] < cost) return false;
            update((p) => ({
                ...p,
                [currency]: p[currency] - cost,
                plotBlueprints: { ...p.plotBlueprints, [plotId]: blueprintId },
                architectXp: p.architectXp + DEPLOY_BLUEPRINT_XP,
            }));
            void mirrorBlueprintDeploy(plotId, blueprintId);
            return true;
        },

        grantRandomPets: (count, cost) => {
            const current = progressRef.current;
            if (current.stars < cost) return null;
            const unseen = PETS.filter((pet) => !current.pets.includes(pet.id));
            const picks: PetDef[] = [];
            const pool = [...unseen];
            while (picks.length < count && pool.length > 0) {
                picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
            }
            const dupes = count - picks.length;
            update((p) => ({
                ...p,
                stars: p.stars - cost,
                pets: [...p.pets, ...picks.map((x) => x.id)],
                dust: p.dust + dupes * DUPLICATE_DUST,
                equippedPet: p.equippedPet ?? picks[0]?.id ?? null,
            }));
            return picks;
        },

        visitPlayset: (key) => {
            const existing = progressRef.current.rooms[key];
            const isFirst = !existing || existing.visits === 0;
            updateRoom(key, (r) => ({ ...r, visits: r.visits + 1 }), false);
            update((p) => ({ ...p, lastPlaysetKey: key, stars: p.stars + (isFirst ? FIRST_VISIT_REWARD : 0) }));
            return isFirst ? FIRST_VISIT_REWARD : 0;
        },

        setRoomProps: (key, props) => updateRoom(key, (r) => ({ ...r, props })),

        // Not mirrored to Supabase — Minni's spot in a room is a cosmetic, purely local
        // touch, not something worth a network round trip like props/routines are.
        setMinniPosition: (key, x, y) => updateRoom(key, (r) => ({ ...r, minniX: x, minniY: y }), false),

        toggleRoutineTask: (key, taskId) =>
            updateRoom(key, (r) => {
                if (r.badgeClaimed) return r;
                const done = r.routineDone.includes(taskId)
                    ? r.routineDone.filter((t) => t !== taskId)
                    : [...r.routineDone, taskId];
                return { ...r, routineDone: done };
            }),

        claimRoutineBadge: (key) => {
            const def = PLAYSETS_BY_KEY[key];
            const r = progressRef.current.rooms[key] ?? EMPTY_ROOM;
            if (!def || r.badgeClaimed) return false;
            const allDone = def.routine.tasks.every((t) => r.routineDone.includes(t.id));
            if (!allDone) return false;
            updateRoom(key, (room) => ({ ...room, badgeClaimed: true }));
            update((p) => ({ ...p, stars: p.stars + ROUTINE_BADGE_REWARD }));
            return true;
        },

        pullGacha: () => {
            const current = progressRef.current;
            if (current.stars < GACHA_COST) return null;
            // Weighted: legendary is rare, but a first pull always lands something new so
            // the very first orb is exciting rather than a duplicate.
            const weights: Record<PetDef['rarity'], number> = { common: 6, rare: 3, legendary: 1 };
            const pool = PETS.flatMap((pet) => Array<PetDef>(weights[pet.rarity]).fill(pet));
            const unseen = pool.filter((pet) => !current.pets.includes(pet.id));
            const source = unseen.length > 0 && current.pets.length === 0 ? unseen : pool;
            const pet = source[Math.floor(Math.random() * source.length)];
            const isNew = !current.pets.includes(pet.id);
            update((p) => ({
                ...p,
                stars: p.stars - GACHA_COST,
                pets: isNew ? [...p.pets, pet.id] : p.pets,
                dust: isNew ? p.dust : p.dust + DUPLICATE_DUST,
                equippedPet: p.equippedPet ?? pet.id,
            }));
            return { pet, isNew };
        },

        claimDailyPod: () => {
            if (podReadyAt) return false;
            update((p) => ({ ...p, stars: p.stars + DAILY_POD_REWARD, lastPodClaimAt: Date.now() }));
            return true;
        },

        equipPet: (petId) => update((p) => ({ ...p, equippedPet: petId })),

        setExplorerName: (name) => update((p) => ({ ...p, explorerName: name.trim() || 'Zippy Star' })),

        resetProgress: async () => {
            if (uid) await clearProgress(uid);
            setProgress({ ...INITIAL_PROGRESS });
        },
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used inside GameProvider');
    return ctx;
}

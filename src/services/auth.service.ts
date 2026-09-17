import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import type { UserProfile } from '../types';

const PROFILE_KEY = '@mmw:profile';

function rowToProfile(row: any): UserProfile {
    return {
        uid: row.id,
        displayName: row.display_name,
        email: row.email ?? undefined,
        isGuest: row.is_guest ?? false,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    };
}

async function saveProfileLocally(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function getLocalProfile(): Promise<UserProfile | null> {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error || !data) return null;
    return rowToProfile(data);
}

// Guest play, upgradeable later — same pattern as Cards-and-Chaos/Sports Booking App.
// Supabase anonymous auth still creates a real auth.users row, so the `handle_new_user`
// trigger fires and seeds a profile + starter Minni + starter locations/items for them.
export async function signInAsGuest(displayName: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInAnonymously({
        options: { data: { display_name: displayName, is_guest: true } },
    });
    if (error || !data.user) throw error ?? new Error('Guest sign-in failed.');

    const profile = await getUserProfile(data.user.id);
    if (!profile) throw new Error('Profile was not created for guest sign-in.');
    await saveProfileLocally(profile);
    return profile;
}

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName, is_guest: false } },
    });
    if (error || !data.user) throw error ?? new Error('Registration failed.');

    const profile = await getUserProfile(data.user.id);
    if (!profile) throw new Error('Profile was not created for this account.');
    await saveProfileLocally(profile);
    return profile;
}

export async function signInWithEmail(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw error ?? new Error('Sign-in failed.');

    const profile = await getUserProfile(data.user.id);
    if (!profile) throw new Error('No profile found for this account.');
    await saveProfileLocally(profile);
    return profile;
}

export async function signOut(): Promise<void> {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(PROFILE_KEY);
}

export function subscribeToAuth(callback: (userId: string | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
}

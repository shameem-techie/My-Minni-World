import React, { createContext, useContext, useEffect, useState } from 'react';
import { getLocalProfile, getUserProfile, subscribeToAuth } from '../services/auth.service';
import type { UserProfile } from '../types';

interface AuthContextValue {
    user: UserProfile | null;
    isLoading: boolean;
    setUser: (u: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isLoading: true,
    setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let settled = false;
        const finish = (profile: UserProfile | null) => {
            if (!settled) {
                settled = true;
                setUser(profile);
                setIsLoading(false);
            }
        };

        const unsub = subscribeToAuth(async (userId) => {
            if (userId) {
                // A signed-in session whose profile fetch fails (offline) still gets the cached
                // profile — otherwise Play Now would mint a brand-new guest and lose progress.
                const profile = (await getUserProfile(userId)) ?? (await getLocalProfile());
                finish(profile);
            } else {
                const local = await getLocalProfile();
                finish(local);
            }
        });

        return unsub;
    }, []);

    return <AuthContext.Provider value={{ user, isLoading, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}

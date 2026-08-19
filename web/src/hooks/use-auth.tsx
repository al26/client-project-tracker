import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthUser } from "@/services/auth-api";

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isVerified: boolean;
    refresh: () => Promise<void>;
    login: (input: {
        email: string;
        password: string;
        remember?: boolean;
    }) => Promise<void>;
    register: (input: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    const refresh = useCallback(async () => {
        try {
            setUser(await authApi.currentUser());
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchUser = async () => {
            try {
                const user = await authApi.currentUser();
                if (!cancelled) {
                    setUser(user);
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void fetchUser();

        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isLoading,
            isAuthenticated: user !== null,
            isVerified: user?.email_verified_at != null,
            refresh,
            setUser,
            login: async (input) => setUser(await authApi.login(input)),
            register: async (input) => setUser(await authApi.register(input)),
            logout: async () => {
                await authApi.logout();
                queryClient.clear(); // Drop stale per-user cache when switching accounts
                setUser(null);
            },
        }),
        [user, isLoading, refresh, queryClient],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
}

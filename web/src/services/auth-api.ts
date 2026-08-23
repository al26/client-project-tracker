/**
 * Laravel Sanctum auth layer (Bearer token).
 *
 * Set VITE_API_BASE_URL to your Laravel app origin (e.g. http://localhost:8000)
 * and every call below hits the standard Sanctum API endpoints:
 *   POST /api/login, /api/register, /api/logout
 *   GET  /api/user
 *
 * While the base URL is empty, a local mock (localStorage) is used so the UI
 * is fully clickable before the backend exists.
 */
import { API_BASE_URL, USE_MOCK } from "./api";
import { authToken } from "./auth-token";

export interface AuthUser {
    id: string | number;
    name: string;
    email: string;
    email_verified_at: string | null;
}

export class AuthError extends Error {
    status: number;
    errors: Record<string, string[]>;
    constructor(
        message: string,
        status: number,
        errors: Record<string, string[]> = {},
    ) {
        super(message);
        this.name = "AuthError";
        this.status = status;
        this.errors = errors;
    }
}

const MOCK_KEY = "cpt.auth.user";
const MOCK_USERS_KEY = "cpt.auth.users";

type AuthPayload = { token: string; user: AuthUser };

async function call<T>(
    path: string,
    options: {
        method?: "GET" | "POST" | "PUT" | "DELETE";
        body?: unknown;
    } = {},
): Promise<T> {
    const { method = "GET", body } = options;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(authToken.get()
                ? { Authorization: `Bearer ${authToken.get()}` }
                : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        let errors: Record<string, string[]> = {};
        try {
            const data = (await response.json()) as {
                message?: string;
                errors?: Record<string, string[]>;
            };
            if (data?.message) message = data.message;
            if (data?.errors) errors = data.errors;
        } catch {
            /* no JSON body */
        }
        throw new AuthError(message, response.status, errors);
    }

    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
}

function persistAuth(payload: AuthPayload) {
    authToken.set(payload.token);
}

/* ---------------------------------- mock ---------------------------------- */

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

type MockRecord = AuthUser & { password: string };

function mockUsers(): MockRecord[] {
    if (typeof localStorage === "undefined") return [];
    try {
        const raw = localStorage.getItem(MOCK_USERS_KEY);
        const parsed = raw ? (JSON.parse(raw) as MockRecord[]) : [];
        if (parsed.length) return parsed;
    } catch {
        /* ignore */
    }
    const seed: MockRecord[] = [
        {
            id: 1,
            name: "Demo User",
            email: "demo@example.com",
            password: "password",
            email_verified_at: new Date().toISOString(),
        },
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(seed));
    return seed;
}

function saveMockUsers(users: MockRecord[]) {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function setMockSession(user: AuthUser | null) {
    if (typeof localStorage === "undefined") return;
    if (user) localStorage.setItem(MOCK_KEY, JSON.stringify(user));
    else localStorage.removeItem(MOCK_KEY);
}

function getMockSession(): AuthUser | null {
    if (typeof localStorage === "undefined") return null;
    try {
        const raw = localStorage.getItem(MOCK_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        return null;
    }
}

/* ---------------------------------- api ----------------------------------- */

export const authApi = {
    usingMock: USE_MOCK,

    async currentUser(): Promise<AuthUser | null> {
        if (USE_MOCK) {
            await delay(150);
            return getMockSession();
        }
        if (!authToken.get()) return null;
        try {
            const response = await call<{ data: AuthUser }>("/api/user");
            return response.data;
        } catch (error) {
            if (error instanceof AuthError && error.status === 401) {
                authToken.clear();
                return null;
            }
            throw error;
        }
    },

    async login(input: {
        email: string;
        password: string;
        remember?: boolean;
    }): Promise<AuthUser> {
        if (USE_MOCK) {
            await delay();
            const found = mockUsers().find(
                (u) =>
                    u.email.toLowerCase() === input.email.toLowerCase() &&
                    u.password === input.password,
            );
            if (!found)
                throw new AuthError(
                    "These credentials do not match our records.",
                    422,
                );
            const user: AuthUser = {
                id: found.id,
                name: found.name,
                email: found.email,
                email_verified_at: found.email_verified_at ?? null,
            };
            setMockSession(user);
            return user;
        }
        const response = await call<{ data: AuthPayload }>("/api/login", {
            method: "POST",
            body: input,
        });
        persistAuth(response.data);
        return response.data.user;
    },

    async register(input: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<AuthUser> {
        if (USE_MOCK) {
            await delay();
            const users = mockUsers();
            if (
                users.some(
                    (u) => u.email.toLowerCase() === input.email.toLowerCase(),
                )
            ) {
                throw new AuthError(
                    "That email address is already registered.",
                    422,
                );
            }
            const record: MockRecord = {
                id: crypto.randomUUID(),
                name: input.name,
                email: input.email,
                password: input.password,
                email_verified_at: null,
            };
            saveMockUsers([...users, record]);
            const user: AuthUser = {
                id: record.id,
                name: record.name,
                email: record.email,
                email_verified_at: null,
            };
            setMockSession(user);
            return user;
        }
        const response = await call<{ data: AuthPayload }>("/api/register", {
            method: "POST",
            body: input,
        });
        persistAuth(response.data);
        return response.data.user;
    },

    async logout(): Promise<void> {
        if (USE_MOCK) {
            await delay(200);
            setMockSession(null);
            return;
        }
        try {
            await call<void>("/api/logout", { method: "POST" });
        } finally {
            authToken.clear();
        }
    },

    async forgotPassword(email: string): Promise<void> {
        if (USE_MOCK) {
            await delay();
            return;
        }
        await call<void>("/api/forgot-password", {
            method: "POST",
            body: { email },
        });
    },

    async resetPassword(input: {
        token: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<void> {
        if (USE_MOCK) {
            await delay();
            const users = mockUsers();
            saveMockUsers(
                users.map((u) =>
                    u.email.toLowerCase() === input.email.toLowerCase()
                        ? { ...u, password: input.password }
                        : u,
                ),
            );
            return;
        }
        await call<void>("/api/reset-password", {
            method: "POST",
            body: input,
        });
    },

    async updateProfile(input: {
        name: string;
        email: string;
    }): Promise<AuthUser> {
        if (USE_MOCK) {
            await delay();
            const current = getMockSession();
            if (!current) throw new AuthError("Not authenticated.", 401);
            const updated: AuthUser = { ...current, ...input };
            saveMockUsers(
                mockUsers().map((u) =>
                    String(u.id) === String(current.id)
                        ? { ...u, ...input }
                        : u,
                ),
            );
            setMockSession(updated);
            return updated;
        }
        await call<void>("/api/user/profile-information", {
            method: "PUT",
            body: input,
        });
        const response = await call<{ data: AuthUser }>("/api/user");
        return response.data;
    },

    async updatePassword(input: {
        current_password: string;
        password: string;
        password_confirmation: string;
    }): Promise<void> {
        if (USE_MOCK) {
            await delay();
            const current = getMockSession();
            if (!current) throw new AuthError("Not authenticated.", 401);
            const users = mockUsers();
            const record = users.find(
                (u) => String(u.id) === String(current.id),
            );
            if (!record || record.password !== input.current_password) {
                throw new AuthError("The provided password is incorrect.", 422);
            }
            saveMockUsers(
                users.map((u) =>
                    String(u.id) === String(current.id)
                        ? { ...u, password: input.password }
                        : u,
                ),
            );
            return;
        }
        await call<void>("/api/user/password", { method: "PUT", body: input });
    },

    async sendVerification(): Promise<void> {
        if (USE_MOCK) {
            await delay();
            return;
        }
        await call<void>("/api/email/verification-notification", {
            method: "POST",
        });
    },

    async verifyOtp(token: string): Promise<AuthUser> {
        if (USE_MOCK) {
            await delay();
            const current = getMockSession();
            if (!current) throw new AuthError("Not authenticated.", 401);
            const updated: AuthUser = {
                ...current,
                email_verified_at: new Date().toISOString(),
            };
            setMockSession(updated);
            return updated;
        }
        const response = await call<{ data: AuthUser }>("/api/email/verify", {
            method: "POST",
            body: { token },
        });
        return response.data;
    },

    async verifyMagicLink(token: string): Promise<AuthUser> {
        if (USE_MOCK) {
            await delay();
            const current = getMockSession();
            if (!current) throw new AuthError("Not authenticated.", 401);
            const updated: AuthUser = {
                ...current,
                email_verified_at: new Date().toISOString(),
            };
            setMockSession(updated);
            return updated;
        }
        const response = await call<{ data: AuthUser }>(
            "/api/email/verify-magic",
            {
                method: "POST",
                body: { token },
            },
        );
        return response.data;
    },

    async resendVerification(email: string): Promise<void> {
        if (USE_MOCK) {
            await delay();
            return;
        }
        await call<void>("/api/email/verification-notification/resend", {
            method: "POST",
            body: { email },
        });
    },
};

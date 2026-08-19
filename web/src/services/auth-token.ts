const TOKEN_KEY = "cpt.auth.token";

export const authToken = {
    get(): string | null {
        if (typeof localStorage === "undefined") return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    set(token: string): void {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(TOKEN_KEY, token);
    },

    clear(): void {
        if (typeof localStorage === "undefined") return;
        localStorage.removeItem(TOKEN_KEY);
    },
};

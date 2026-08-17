import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../lib/api";
import { AuthContext } from "./AuthContext";
import type { User, AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const me = await api<User>("/api/auth/me");
                setUser(me);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);

    async function login(userName: string, password: string) {
        await api("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ userName, password}),
        });
        const me = await api<User>("/api/auth/me");
        setUser(me);
    }

    async function logout() {
        await api("/api/auth/logout", { method: "POST" });
        setUser(null);
    }

    const value: AuthContextValue = {
        user, 
        isAuthenticated: user !== null,
        loading, 
        login, 
        logout, 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
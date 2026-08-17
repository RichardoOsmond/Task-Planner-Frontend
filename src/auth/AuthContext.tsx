import { createContext, useContext } from "react";

export type User = {
    userName: string;
    email: string;
};

export type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userName: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
import { create } from 'zustand'

type AuthState = {
    account: Account | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean

    login: (account: Account, accessToken: string, refreshToken: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    account: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    login: (account, accessToken, refreshToken) =>
        set({ account, accessToken, refreshToken, isAuthenticated: true }),

    logout: () =>
        set({ account: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
}))

import { create } from 'zustand'

type SafeAccount = Omit<Account, 'password'>

type AuthState = {
    account: SafeAccount | null
    isAuthInitialized: boolean,

    setAccount: (account: SafeAccount | null) => void
    login: (
        account: SafeAccount,
        accessToken: string,
        refreshToken: string,
    ) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    account: null,
    isAuthInitialized: false,

    setAccount: (account) =>
        set({
            account,
            isAuthInitialized: true,
        }),

    login: (account, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        set({
            account,
            isAuthInitialized: true,
        })
    },

    logout: () => {
        localStorage.clear()
        set({
            account: null,
            isAuthInitialized: true,
        })
    },
}))

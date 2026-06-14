import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth as authClient } from '@/lib/auth'
import type { User, AuthSession } from '@shared/auth'

interface AuthState {
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    if (!authClient.isConfigured) {
      setState((s) => ({ ...s, isLoading: false }))
      return
    }

    authClient.getSession().then(({ session }) => {
      setState({
        session,
        user: session?.user ?? null,
        isAuthenticated: session?.user != null,
        isLoading: false,
      })
    })

    const unsubscribe = authClient.onAuthStateChange((_event, session) => {
      setState({
        session,
        user: session?.user ?? null,
        isAuthenticated: session?.user != null,
        isLoading: false,
      })
    })

    return unsubscribe
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

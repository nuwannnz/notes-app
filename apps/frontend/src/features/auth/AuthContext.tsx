import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getCurrentUser,
  signOut as amplifySignOut,
  fetchAuthSession,
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'

interface AuthUser {
  userId: string
  email: string
}

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser()
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken
      const email = idToken?.payload?.email as string ?? ''
      setUser({ userId: currentUser.userId, email })
      setIsAuthenticated(true)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUser()

    const unsubscribe = Hub.listen('auth', ({ payload }: { payload: { event: string } }) => {
      switch (payload.event) {
        case 'signedIn':
          loadUser()
          break
        case 'signedOut':
          setUser(null)
          setIsAuthenticated(false)
          setIsLoading(false)
          break
      }
    })

    return unsubscribe
  }, [])

  async function signOut() {
    await amplifySignOut()
  }

  async function getIdToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.idToken?.toString() ?? null
    } catch {
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, signOut, getIdToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

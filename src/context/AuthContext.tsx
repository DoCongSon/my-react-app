import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

export type AuthContextType = {
  user: User | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

if (import.meta.env.DEV) {
  AuthContext.displayName = 'AuthContext'
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pendingAuthAction = useRef(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser)
      if (!pendingAuthAction.current) {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const loginWithGoogle = async () => {
    pendingAuthAction.current = true
    setLoading(true)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        await signOut(auth)
        throw new Error('Unable to establish session with backend.')
      }
    } catch (err) {
      await signOut(auth)
      pendingAuthAction.current = false
      setLoading(false)
      throw err instanceof Error ? err : new Error('Failed to login.')
    }

    pendingAuthAction.current = false
    setLoading(false)
  }

  const logout = async () => {
    let logoutError: Error | null = null

    try {
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to terminate session on backend.')
      }
    } catch (err) {
      logoutError = err instanceof Error ? err : new Error('Failed to logout.')
    } finally {
      await signOut(auth)
      pendingAuthAction.current = false
      setLoading(false)
    }

    if (logoutError) {
      throw logoutError
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      logout,
    }),
    [loading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

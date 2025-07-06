import { create } from 'zustand'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  initAuth: () => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      })
    })
  },

  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      set({
        user: userCredential.user,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  logout: async () => {
    try {
      await signOut(auth)
      set({
        user: null,
        isAuthenticated: false,
      })
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },
})) 
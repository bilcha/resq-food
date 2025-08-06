import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  setAuthToken,
  removeAuthToken,
  authApi,
  Business,
} from '../lib/offline-api';

interface AuthState {
  user: User | null;
  business: Business | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchBusinessProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  business: null,
  isLoading: true,
  isAuthenticated: false,

  initAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);

          // Fetch business profile when user is authenticated
          try {
            const businessProfile = await authApi.getProfile();
            set({
              user,
              business: businessProfile,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.error('Error fetching business profile:', error);
            set({
              user,
              business: null,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error getting ID token:', error);
          set({
            user: null,
            business: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        removeAuthToken();
        set({
          user: null,
          business: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });
  },

  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Immediately get and set the Firebase ID token
      const token = await userCredential.user.getIdToken();
      setAuthToken(token);

      // Fetch business profile
      try {
        const businessProfile = await authApi.getProfile();
        set({
          user: userCredential.user,
          business: businessProfile,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Error fetching business profile:', error);
        set({
          user: userCredential.user,
          business: null,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Immediately get and set the Firebase ID token
      const token = await userCredential.user.getIdToken();
      setAuthToken(token);

      set({
        user: userCredential.user,
        business: null, // Business profile will be created separately during registration flow
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({
        user: null,
        business: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  fetchBusinessProfile: async () => {
    try {
      const businessProfile = await authApi.getProfile();
      set({ business: businessProfile });
    } catch (error) {
      console.error('Error fetching business profile:', error);
      set({ business: null });
    }
  },
}));

import { create } from 'zustand';
import { User } from 'firebase/auth';
import { authService } from '../firebase/authService';
import { firestoreService } from '../firebase/firestoreService';
import { createEmptyUserProfile, useFitnessStore } from './useFitnessStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  unsubscribeAuth: (() => void) | null;

  initializeAuthListener: () => void;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,
  error: null,
  unsubscribeAuth: null,

  initializeAuthListener: () => {
    if (get().unsubscribeAuth) return;

    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      set({ isLoading: true, error: null });

      if (!firebaseUser) {
        useFitnessStore.getState().clearUserData();
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
        return;
      }

      try {
        await useFitnessStore
          .getState()
          .initUserData(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);
        set({
          user: firebaseUser,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
      } catch (e: any) {
        useFitnessStore.getState().clearUserData();
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: e?.message || 'Could not initialize your session.',
        });
      }
    });

    set({ unsubscribeAuth: unsubscribe });
  },

  signIn: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.signIn(email, pass);
      if (!user) {
        set({ isLoading: false });
        return false;
      }

      await useFitnessStore.getState().initUserData(user.uid, user.email, user.displayName);
      set({ user, isAuthenticated: true, isInitialized: true, isLoading: false });
      return true;
    } catch (e: any) {
      useFitnessStore.getState().clearUserData();
      set({ error: e.message || 'Failed to sign in', isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  signUp: async (email, pass, name) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.signUp(email, pass);
      if (!user) {
        set({ isLoading: false });
        return false;
      }

      const profile = createEmptyUserProfile(user.uid, email, name);
      await firestoreService.createUserProfile(profile);
      useFitnessStore.getState().setUser(profile);

      set({ user, isAuthenticated: true, isInitialized: true, isLoading: false });
      return true;
    } catch (e: any) {
      useFitnessStore.getState().clearUserData();
      try {
        await authService.signOut();
      } catch {
        // Keep the original sign-up/profile creation error visible.
      }
      set({ error: e.message || 'Failed to sign up', isLoading: false });
      return false;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.signOut();
      useFitnessStore.getState().clearUserData();
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to sign out', isLoading: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

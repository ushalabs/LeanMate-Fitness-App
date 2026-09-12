import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

export const authService = {
  async signUp(email: string, pass: string): Promise<User | null> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      return cred.user;
    } catch (err: any) {
      throw new Error(authService.formatError(err.code || err.message));
    }
  },

  async signIn(email: string, pass: string): Promise<User | null> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      return cred.user;
    } catch (err: any) {
      throw new Error(authService.formatError(err.code || err.message));
    }
  },

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err: any) {
      throw new Error(authService.formatError(err.code || err.message));
    }
  },

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      throw new Error(authService.formatError(err.code || err.message));
    }
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  formatError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify your credentials.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  },
};

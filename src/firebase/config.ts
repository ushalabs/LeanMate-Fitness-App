import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const requiredEnv = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingEnv = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnv.length > 0) {
  console.warn(`Missing Firebase environment variables: ${missingEnv.join(', ')}`);
}

const firebaseConfig: Record<keyof typeof requiredEnv, string> = {
  apiKey: requiredEnv.apiKey || '',
  authDomain: requiredEnv.authDomain || '',
  projectId: requiredEnv.projectId || '',
  storageBucket: requiredEnv.storageBucket || '',
  messagingSenderId: requiredEnv.messagingSenderId || '',
  appId: requiredEnv.appId || '',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : (() => {
        try {
          return initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
        } catch {
          return getAuth(app);
        }
      })();

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

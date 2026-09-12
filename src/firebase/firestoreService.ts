import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  startAfter,
  documentId,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile, WeightEntry } from '../types/user';
import { DailyCalorieLog } from '../types/nutrition';
import { WorkoutLog, WorkoutSplit } from '../types/training';
import { GoalPeriod } from '../types/goal';

export type UserProfilePatch = Partial<Omit<UserProfile, 'uid' | 'createdAt'>>;

const userDoc = (uid: string) => doc(db, 'users', uid);

const withoutUndefined = <T extends Record<string, unknown>>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;

// Only plain JSON workout data passes through this; preserve Firebase sentinels elsewhere.
const cleanWorkoutData = (value: unknown): any => {
  if (Array.isArray(value)) return value.map(cleanWorkoutData);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [k, cleanWorkoutData(v)])
  );
  return value;
};

export const firestoreService = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(userDoc(uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    const now = new Date().toISOString();
    await setDoc(userDoc(profile.uid), withoutUndefined({
      ...profile,
      createdAt: profile.createdAt || now,
      updatedAt: now,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    }));
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await setDoc(
      userDoc(profile.uid),
      withoutUndefined({
        ...profile,
        updatedAt: new Date().toISOString(),
        updatedAtServer: serverTimestamp(),
      }),
      { merge: true }
    );
  },

  async updateUserProfile(uid: string, patch: UserProfilePatch): Promise<void> {
    await setDoc(
      userDoc(uid),
      withoutUndefined({
        ...patch,
        updatedAt: new Date().toISOString(),
        updatedAtServer: serverTimestamp(),
      }),
      { merge: true }
    );
  },

  async saveWeightEntry(uid: string, entry: WeightEntry): Promise<void> {
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', uid, 'weights', entry.id), withoutUndefined({ ...entry }));
    batch.set(
      userDoc(uid),
      {
        currentWeight: entry.weight,
        updatedAt: new Date().toISOString(),
        updatedAtServer: serverTimestamp(),
      },
      { merge: true }
    );
    await batch.commit();
  },

  async getWeightEntries(uid: string): Promise<WeightEntry[]> {
    const q = query(collection(db, 'users', uid, 'weights'), orderBy('recordedAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WeightEntry);
  },

  async saveCalorieLog(uid: string, log: DailyCalorieLog): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'calories', log.date), withoutUndefined({ ...log }), { merge: true });
  },

  async getCalorieLogs(uid: string, maxCount = 30): Promise<DailyCalorieLog[]> {
    const q = query(collection(db, 'users', uid, 'calories'), orderBy('date', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DailyCalorieLog);
  },

  async deleteCalorieLog(uid: string, dateStr: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'calories', dateStr));
  },

  async saveWorkoutLog(uid: string, workout: WorkoutLog): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'workouts', workout.id), cleanWorkoutData(workout), { merge: true });
  },

  async getWorkoutHistoryPage(uid: string, cursor?: QueryDocumentSnapshot) {
    const q = query(collection(db, 'users', uid, 'workouts'), orderBy(documentId()),
      ...(cursor ? [startAfter(cursor)] : []), limit(200));
    const snap = await getDocs(q);
    return {
      workouts: snap.docs.map((d) => ({ ...d.data(), id: d.id } as WorkoutLog)),
      cursor: snap.docs[snap.docs.length - 1],
      hasMore: snap.size === 200,
    };
  },

  async getWorkoutLogs(uid: string, maxCount = 60): Promise<WorkoutLog[]> {
    const q = query(collection(db, 'users', uid, 'workouts'), orderBy('date', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WorkoutLog);
  },

  async saveCustomSplit(uid: string, split: WorkoutSplit): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'customSplits', split.id), withoutUndefined({ ...split }), { merge: true });
  },

  async getCustomSplits(uid: string): Promise<WorkoutSplit[]> {
    const q = query(collection(db, 'users', uid, 'customSplits'), orderBy('updatedAt', 'desc'), limit(5));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WorkoutSplit);
  },

  async saveGoalPeriod(uid: string, period: GoalPeriod): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'goalPeriods', period.id), withoutUndefined({ ...period }), { merge: true });
  },

  async saveGoalPeriods(uid: string, periods: GoalPeriod[]): Promise<void> {
    const batch = writeBatch(db);
    periods.forEach((period) => {
      batch.set(doc(db, 'users', uid, 'goalPeriods', period.id), withoutUndefined({ ...period }), { merge: true });
    });
    await batch.commit();
  },

  async getGoalPeriods(uid: string): Promise<GoalPeriod[]> {
    const q = query(collection(db, 'users', uid, 'goalPeriods'), orderBy('startDate', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as GoalPeriod);
  },

  subscribeToCalorieLogs(uid: string, callback: (logs: DailyCalorieLog[]) => void) {
    const q = query(collection(db, 'users', uid, 'calories'), orderBy('date', 'desc'), limit(35));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => d.data() as DailyCalorieLog));
    });
  },

  subscribeToWorkouts(uid: string, callback: (workouts: WorkoutLog[]) => void) {
    const q = query(collection(db, 'users', uid, 'workouts'), orderBy('date', 'desc'), limit(60));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => d.data() as WorkoutLog));
    });
  },
};

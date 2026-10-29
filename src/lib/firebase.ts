import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export { onAuthStateChanged };
export type { FirebaseUser };
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction, CategoryBudget, SavingsGoal, UserProfile } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with configured custom database ID (CRITICAL: Required for this instance)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Test initial connection to Firestore
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode. Please verify network connectivity.');
    }
  }
}
testFirestoreConnection();

// Google Sign-In via popup (allowed in web iframe)
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Sign-Out
export async function logOutFirebase(): Promise<void> {
  await signOut(auth);
}

// Convert Firebase User to App UserProfile
export function mapFirebaseUserToProfile(user: FirebaseUser): UserProfile {
  return {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
    email: user.email || '',
    avatarUrl: user.photoURL || undefined,
    currency: 'MAD',
    createdAt: new Date().toISOString(),
    incomes: [],
    expenses: [],
  };
}

// Firestore Error Handler helper conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------- FIRESTORE SYNC HELPERS -----------------

// Subscribe to User Transactions in real-time
export function subscribeToTransactions(
  userId: string,
  onData: (txs: Transaction[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${userId}/transactions`;
  const q = query(collection(db, path), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((d) => {
        txs.push(d.data() as Transaction);
      });
      onData(txs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      if (onError) onError(err);
    }
  );
}

// Save (create or update) transaction
export async function saveTransactionToFirestore(userId: string, tx: Transaction): Promise<void> {
  const path = `users/${userId}/transactions`;
  try {
    await setDoc(doc(db, path, tx.id), tx);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${tx.id}`);
  }
}

// Delete transaction
export async function deleteTransactionFromFirestore(userId: string, txId: string): Promise<void> {
  const path = `users/${userId}/transactions`;
  try {
    await deleteDoc(doc(db, path, txId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${txId}`);
  }
}

// Subscribe to User Custom Categories in real-time
export function subscribeToCategories(
  userId: string,
  onData: (cats: CategoryBudget[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${userId}/categories`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const cats: CategoryBudget[] = [];
      snapshot.forEach((d) => {
        cats.push(d.data() as CategoryBudget);
      });
      onData(cats);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      if (onError) onError(err);
    }
  );
}

// Save Category to Firestore
export async function saveCategoryToFirestore(userId: string, cat: CategoryBudget): Promise<void> {
  const path = `users/${userId}/categories`;
  try {
    await setDoc(doc(db, path, cat.id), cat);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${cat.id}`);
  }
}

// Delete Category from Firestore
export async function deleteCategoryFromFirestore(userId: string, catId: string): Promise<void> {
  const path = `users/${userId}/categories`;
  try {
    await deleteDoc(doc(db, path, catId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${catId}`);
  }
}

// Subscribe to User Savings Goals in real-time
export function subscribeToSavingsGoals(
  userId: string,
  onData: (goals: SavingsGoal[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${userId}/savingsGoals`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const goals: SavingsGoal[] = [];
      snapshot.forEach((d) => {
        goals.push(d.data() as SavingsGoal);
      });
      onData(goals);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      if (onError) onError(err);
    }
  );
}

// Save Savings Goal to Firestore
export async function saveSavingsGoalToFirestore(userId: string, goal: SavingsGoal): Promise<void> {
  const path = `users/${userId}/savingsGoals`;
  try {
    await setDoc(doc(db, path, goal.id), goal);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${goal.id}`);
  }
}

// Delete Savings Goal from Firestore
export async function deleteSavingsGoalFromFirestore(userId: string, goalId: string): Promise<void> {
  const path = `users/${userId}/savingsGoals`;
  try {
    await deleteDoc(doc(db, path, goalId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${goalId}`);
  }
}

// Sync user profile document
export async function saveUserProfileToFirestore(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const path = `users`;
  try {
    await setDoc(doc(db, path, userId), {
      ...profile,
      id: userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${userId}`);
  }
}

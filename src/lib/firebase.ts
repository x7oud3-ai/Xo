import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInstance;
try {
  authInstance = getAuth(app);
} catch (e) {
  try {
    authInstance = initializeAuth(app, { persistence: browserLocalPersistence });
  } catch (err) {
    authInstance = initializeAuth(app, { persistence: inMemoryPersistence });
  }
}

export const auth = authInstance;
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);

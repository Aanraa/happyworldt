import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const config = {
  apiKey: 'AIzaSyAuCu49rNeTFTXDGx4fvRLB4y-osRi2HlE',
  authDomain: 'happyworld-57729.firebaseapp.com',
  projectId: 'happyworld-57729',
  storageBucket: 'happyworld-57729.firebasestorage.app',
  messagingSenderId: '648346247876',
  appId: '1:648346247876:web:d98b9a2ec5ca7c1b585f91',
  measurementId: 'G-3531J7C3E1',
};
export const firebaseConfigured = Object.values(config).every(Boolean);
const app = getApps().length ? getApp() : initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

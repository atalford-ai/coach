import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4hNbD2u_NYjxWysIjwDXFaII7BaF8w-M",
  authDomain: "equitysystems-d0381.firebaseapp.com",
  projectId: "equitysystems-d0381",
  storageBucket: "equitysystems-d0381.firebasestorage.app",
  messagingSenderId: "931542784586",
  appId: "1:931542784586:web:b83736dc75bf2c3f1aa4b3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

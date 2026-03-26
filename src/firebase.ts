import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, Timestamp, getDocFromServer, increment, orderBy, limit } from 'firebase/firestore';

import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    // Attempt to get a document from the server to verify connection
    // Using 'stats/global' which is publicly readable in firestore.rules
    await getDocFromServer(doc(db, 'stats', 'global'));
    console.log("Firestore connection successful.");
  } catch (error: any) {
    if (error.message?.includes('the client is offline')) {
      console.error("Firestore Error: The client is offline.");
      console.error("Troubleshooting steps:");
      console.error("1. Ensure the Firestore API is enabled in the Google Cloud Console for project:", firebaseConfig.projectId);
      console.error("2. Ensure a Firestore database has been created (either '(default)' or a named one).");
      console.error("3. If using a named database, ensure the 'firestoreDatabaseId' is provided in the configuration.");
      console.error("4. Check if the API Key has the necessary permissions to access Firestore.");
    } else if (error.message?.includes('Missing or insufficient permissions')) {
      console.warn("Firestore Connection: Permissions restricted, but client is online.");
    } else {
      console.error("Firestore Connection Test Error:", error.message);
    }
  }
}
testConnection();

export { signInWithPopup, signOut, collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, Timestamp, increment, orderBy, limit };

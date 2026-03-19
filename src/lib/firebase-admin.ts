import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth as _getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _app: App | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;

function ensureApp(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
  );
  _app = initializeApp({ credential: cert(serviceAccount) });
  return _app;
}

export function getAdminDb(): Firestore {
  if (_db) return _db;
  ensureApp();
  _db = getFirestore();
  return _db;
}

export function getAdminAuth(): Auth {
  if (_auth) return _auth;
  ensureApp();
  _auth = _getAuth();
  return _auth;
}

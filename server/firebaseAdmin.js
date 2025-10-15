import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    // Uses GOOGLE_APPLICATION_CREDENTIALS env to locate serviceAccount
  });
}
export const db = admin.firestore();

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth, db, googleProvider, storage, getOrCreateRecaptcha } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ---------- Email/Password ----------
export async function signupEmailPassword({ email, password, displayName, role = 'Buyer' }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  const userRef = doc(db, 'users', cred.user.uid);
  await setDoc(userRef, {
    uid: cred.user.uid,
    email,
    displayName: displayName || email.split('@')[0],
    role,
    walletBalance: 0,
    createdAt: serverTimestamp(),
    photoURL: '',
    country: '',
  });
  return cred.user; // user is auto-logged in
}

export async function loginEmailPassword(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ---------- Google ----------
export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  // Ensure Firestore doc exists
  const refDoc = doc(db, 'users', user.uid);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    await setDoc(refDoc, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      role: 'Buyer',
      walletBalance: 0,
      createdAt: serverTimestamp(),
      country: '',
    });
  }
  return user;
}

// ---------- Phone ----------
export async function sendPhoneLoginCode(phoneNumber, recaptchaContainerId = 'recaptcha-container') {
  const appVerifier = getOrCreateRecaptcha(recaptchaContainerId);
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return confirmationResult; // you'll store it in component state
}

// Verify SMS code:
export async function confirmPhoneCode(confirmationResult, code) {
  const { user } = await confirmationResult.confirm(code);
  // Ensure Firestore doc:
  const refDoc = doc(db, 'users', user.uid);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    await setDoc(refDoc, {
      uid: user.uid,
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      displayName: user.phoneNumber || 'User',
      photoURL: user.photoURL || '',
      role: 'Buyer',
      walletBalance: 0,
      createdAt: serverTimestamp(),
      country: '',
    });
  }
  return user;
}

// ---------- Profile Photo Upload (Storage) ----------
export async function uploadProfilePhoto(uid, file) {
  const storageRef = ref(storage, `avatars/${uid}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  // Update user doc
  await updateDoc(doc(db, 'users', uid), { photoURL: url });
  // Update auth profile (optional)
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { photoURL: url });
  }
  return url;
}

// ---------- Logout ----------
export async function logout() {
  await signOut(auth);
}

// ---------- Passkeys / Biometrics (scaffold) ----------
export function browserSupportsPasskeys() {
  return !!(window.PublicKeyCredential && typeof window.PublicKeyCredential === 'function');
}
// NOTE: Implement passkeys later when your Firebase project is configured.
// For now this function is a no-op to keep UI happy.
export async function signInWithPasskey() {
  if (!browserSupportsPasskeys()) throw new Error('Passkeys not supported on this device.');
  // TODO: wire WebAuthn / Passkeys with your backend or Firebase-supported flow.
  throw new Error('Passkey sign-in not configured yet.');
}

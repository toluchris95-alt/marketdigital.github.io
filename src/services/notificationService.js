import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export async function sendNotification({ uid, title, message, type }) {
  return addDoc(collection(db, "notifications"), {
    uid,
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
}

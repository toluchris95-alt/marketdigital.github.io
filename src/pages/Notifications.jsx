import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export default function Notifications() {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!currentUser) return;
      const q = query(
        collection(db, "notifications"),
        where("uid", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchNotes();
  }, [currentUser]);

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Notifications</h2>
      {notes.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className={`p-3 rounded border ${
                n.read ? "bg-gray-100 dark:bg-gray-700" : "bg-green-50 dark:bg-gray-700"
              }`}
            >
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(n.createdAt?.seconds * 1000).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

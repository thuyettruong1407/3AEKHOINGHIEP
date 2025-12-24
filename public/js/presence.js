import { db } from './config.js';
import { doc, updateDoc, onSnapshot, collection, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const initPresence = (uid) => {
    const userRef = doc(db, "users", uid);
    updateDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() });
    window.addEventListener('beforeunload', () => updateDoc(userRef, { isOnline: false }));
};

export const subscribeOnlineCount = (cb) => {
    const q = query(collection(db, "users"), where("isOnline", "==", true));
    return onSnapshot(q, (snap) => cb(snap.size));
};
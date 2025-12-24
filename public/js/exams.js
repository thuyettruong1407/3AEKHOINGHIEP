import { db } from './config.js';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const subscribeExams = (cb) => {
    const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        const exams = [];
        snap.forEach(doc => exams.push({ id: doc.id, ...doc.data() }));
        cb(exams);
    });
};

export const createExam = async (data) => await addDoc(collection(db, "exams"), { ...data, createdAt: new Date().toISOString() });
export const deleteExam = async (id) => await deleteDoc(doc(db, "exams", id));
export const saveResult = async (data) => await addDoc(collection(db, "results"), { ...data, submittedAt: new Date().toISOString() });
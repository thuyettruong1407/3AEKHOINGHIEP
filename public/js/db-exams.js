import { db } from './config.js';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- GIÁO VIÊN ---
export const createExam = async (examData) => {
    const data = {
        ...examData,
        createdAt: new Date().toISOString(),
        status: 'open'
    };
    await addDoc(collection(db, "exams"), data);
};

export const deleteExam = async (id) => {
    await deleteDoc(doc(db, "exams", id));
};

// --- REALTIME LISTENER ---
export const subscribeExams = (callback) => {
    // Sắp xếp đề mới nhất lên đầu
    const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const exams = [];
        snapshot.forEach(doc => exams.push({id: doc.id, ...doc.data()}));
        callback(exams);
    });
};

// --- HỌC SINH ---
export const submitExamResult = async (resultData) => {
    return await addDoc(collection(db, "results"), {
        ...resultData,
        submittedAt: new Date().toISOString()
    });
};

export const getMyResults = (studentId, callback) => {
    const q = query(collection(db, "results"), where("studentId", "==", studentId));
    return onSnapshot(q, (snapshot) => {
        const results = [];
        snapshot.forEach(doc => results.push(doc.data()));
        callback(results);
    });
};
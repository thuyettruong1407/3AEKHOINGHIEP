// Sử dụng phiên bản 10.7.1 ổn định
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CẤU HÌNH CỦA BẠN (PROJECT: ne-c75ef) ---
const firebaseConfig = {
    apiKey: "AIzaSyA1P2rReI1ko5jFk-jZ0rEdj4NGzOmwtXM",
    authDomain: "ne-c75ef.firebaseapp.com",
    projectId: "ne-c75ef",
    storageBucket: "ne-c75ef.firebasestorage.app",
    messagingSenderId: "608704764426",
    appId: "1:608704764426:web:4f17d555b51b5b1d431df3",
    measurementId: "G-W417S8JFLV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Danh sách môn học (Demo 3 môn chính)
export const SUBJECTS = [
    { id: "Toan", name: "Toán Học" },
    { id: "Van", name: "Ngữ Văn" },
    { id: "Anh", name: "Tiếng Anh" }
];
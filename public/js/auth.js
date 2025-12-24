import { auth, db } from './config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Đăng nhập
export const loginUser = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
};

// Đăng ký (Có bắt lỗi ghi DB)
export const registerUser = async (email, password, role, fullname) => {
    // 1. Tạo User Authentication
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    
    // 2. Ghi thông tin vào Firestore
    try {
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: role,
            name: fullname,
            createdAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("Lỗi ghi DB:", e);
        throw new Error("Không thể lưu thông tin. Vui lòng kiểm tra Firestore Rules!");
    }
    return user;
};

export const logoutUser = () => signOut(auth);

export const getUserRole = async (uid) => {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        return snap.exists() ? snap.data() : null;
    } catch (e) {
        console.error("Lỗi lấy Role:", e);
        return null;
    }
};
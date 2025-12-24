import { db } from './config.js';
import { doc, updateDoc, arrayUnion, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const checkAndAwardBadges = async (userId, score, timeSpentPercent) => {
    const userRef = doc(db, "users", userId);
    const newBadges = [];

    // Logic: Điểm cao
    if (score >= 9) newBadges.push("hoc_than"); // Học thần
    
    // Logic: Làm bài siêu tốc (dưới 50% thời gian)
    if (timeSpentPercent < 0.5 && score >= 8) newBadges.push("toc_do");

    // Logic: Chăm chỉ (Demo: Cứ nộp bài là được tính, thực tế cần đếm số bài)
    newBadges.push("cham_chi");

    if (newBadges.length > 0) {
        // Update Firestore (arrayUnion giúp không trùng lặp)
        await updateDoc(userRef, {
            badges: arrayUnion(...newBadges)
        });
    }
    return newBadges;
};

export const getBadgeIcon = (code) => {
    const map = {
        "hoc_than": "👑",
        "toc_do": "⚡",
        "cham_chi": "🐝"
    };
    return map[code] || "🏅";
};
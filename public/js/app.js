import { loginUser, registerUser, logoutUser, getUserRole } from './auth.js';
import { initPresence, subscribeOnlineCount } from './presence.js';
import { subscribeExams, createExam, deleteExam, saveResult } from './exams.js';
import { ui } from './ui.js';

let currentUser, userData, currentExam;

// --- 1. CHẠY KHI TRANG WEB TẢI XONG ---
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo select môn học
    ui.fillSubjects();

    // Gán sự kiện đóng Modal
    document.querySelectorAll('.close-modal').forEach(b => {
        b.addEventListener('click', () => {
            ui.toggleModal('modal-create', false);
            ui.toggleModal('modal-take-exam', false);
        });
    });

    // --- GÁN SỰ KIỆN CHUYỂN TAB (FIX LỖI) ---
    const btnTabLogin = document.getElementById('tab-login');
    const btnTabRegister = document.getElementById('tab-register');

    if (btnTabLogin && btnTabRegister) {
        btnTabLogin.addEventListener('click', () => {
            console.log("Đã bấm tab Login"); // Kiểm tra log
            toggleAuth('login');
        });

        btnTabRegister.addEventListener('click', () => {
            console.log("Đã bấm tab Register"); // Kiểm tra log
            toggleAuth('register');
        });
    }
});

// --- 2. HÀM XỬ LÝ CHUYỂN ĐỔI GIAO DIỆN ---
const toggleAuth = (mode) => {
    const authForm = document.getElementById('auth-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const groupName = document.getElementById('group-fullname');
    const groupRole = document.getElementById('group-role');
    const btnSubmit = document.getElementById('btn-auth-submit');

    // Reset form cũ
    authForm.reset();
    authForm.dataset.mode = mode; // Lưu trạng thái hiện tại (login hoặc register)

    if (mode === 'login') {
        // Giao diện Đăng Nhập
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        
        groupName.classList.add('hidden'); // Ẩn ô tên
        groupRole.classList.add('hidden'); // Ẩn ô chọn role
        
        btnSubmit.textContent = 'ĐĂNG NHẬP';
    } else {
        // Giao diện Đăng Ký
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        
        groupName.classList.remove('hidden'); // Hiện ô tên
        groupRole.classList.remove('hidden'); // Hiện ô chọn role
        
        btnSubmit.textContent = 'ĐĂNG KÝ NGAY';
    }
};

// --- 3. XỬ LÝ KHI BẤM NÚT SUBMIT FORM ---
const authForm = document.getElementById('auth-form');
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        ui.setLoading(true);

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const mode = authForm.dataset.mode; // Lấy trạng thái từ dataset

        console.log("Đang submit ở chế độ:", mode); // Log kiểm tra

        try {
            if (mode === 'login') {
                // ĐĂNG NHẬP
                currentUser = await loginUser(email, password);
            } else {
                // ĐĂNG KÝ
                const name = document.getElementById('fullname').value.trim();
                const roleInput = document.querySelector('input[name="role"]:checked');
                const role = roleInput ? roleInput.value : 'student';

                if (!name) throw new Error("Vui lòng nhập họ tên!");
                
                currentUser = await registerUser(email, password, role, name);
            }

            // Lấy dữ liệu user và vào App
            userData = await getUserRole(currentUser.uid);
            if (!userData) throw new Error("Không lấy được thông tin người dùng. Kiểm tra Firestore!");

            ui.updateUserInfo(userData);
            ui.switchScreen('app');
            initPresence(currentUser.uid);
            startApp();

        } catch (err) {
            console.error(err);
            let msg = err.message;
            if (msg.includes("auth/invalid-credential")) msg = "Sai email hoặc mật khẩu!";
            if (msg.includes("auth/email-already-in-use")) msg = "Email này đã được dùng!";
            if (msg.includes("Missing or insufficient permissions")) msg = "LỖI: Chưa bật Rule Firestore!";
            alert(msg);
        } finally {
            ui.setLoading(false);
        }
    });
}

// --- 4. LOGIC ĐĂNG XUẤT ---
document.getElementById('btn-logout').onclick = async () => {
    await logoutUser();
    location.reload();
};

// --- 5. LOGIC CHÍNH CỦA APP ---
function startApp() {
    subscribeOnlineCount(count => document.getElementById('online-count').textContent = count);

    subscribeExams(exams => {
        const fGrade = document.getElementById('filter-grade').value;
        const fSub = document.getElementById('filter-subject').value;
        
        const filtered = exams.filter(e => 
            (fGrade === 'all' || e.grade === fGrade) && 
            (fSub === 'all' || e.subject === fSub)
        );

        ui.renderExams(filtered, userData.role, {
            openCreate: () => ui.toggleModal('modal-create', true),
            onDelete: async (id) => confirm('Bạn chắc chắn muốn xóa?') && await deleteExam(id),
            onTake: (exam) => {
                currentExam = exam;
                document.getElementById('exam-taking-title').textContent = exam.title;
                ui.renderQuestions(exam.questions);
                ui.toggleModal('modal-take-exam', true);
            }
        });
    });
}

// CREATE EXAM
document.getElementById('form-create-exam').onsubmit = async (e) => {
    e.preventDefault();
    try {
        const questions = JSON.parse(document.getElementById('inp-questions').value);
        await createExam({
            title: document.getElementById('inp-title').value,
            grade: document.getElementById('inp-grade').value,
            subject: document.getElementById('inp-subject').value,
            questions: questions,
            createdBy: currentUser.uid
        });
        ui.toggleModal('modal-create', false);
        e.target.reset();
        alert("Đã tạo đề thi!");
    } catch (err) { alert("Lỗi JSON câu hỏi: " + err.message); }
};

// SUBMIT EXAM
document.getElementById('btn-submit-exam').onclick = async () => {
    if(!currentExam) return;
    let score = 0;
    currentExam.questions.forEach((q, i) => {
        const checked = document.querySelector(`input[name="q_${i}"]:checked`);
        if(checked && parseInt(checked.value) === q.correct) score++;
    });
    
    const finalScore = (score / currentExam.questions.length) * 10;
    alert(`Kết quả: ${finalScore.toFixed(2)} điểm`);
    await saveResult({ examId: currentExam.id, uid: currentUser.uid, score: finalScore });
    ui.toggleModal('modal-take-exam', false);
};

// Filter Change
['filter-grade', 'filter-subject'].forEach(id => {
    document.getElementById(id).onchange = () => {
        // Ở demo đơn giản, ta reload trang để filter lại
        // (Hoặc có thể gọi lại logic render nếu muốn mượt hơn)
        alert("Đã chọn bộ lọc! (Dữ liệu sẽ cập nhật)");
    };
});
document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('dark-mode');
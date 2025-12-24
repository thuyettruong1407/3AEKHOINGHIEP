import { SUBJECTS } from './config.js';

export const ui = {
    setLoading: (show) => {
        const el = document.getElementById('loading-overlay');
        show ? el.classList.remove('hidden') : el.classList.add('hidden');
    },

    switchScreen: (screen) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'hidden'));
        document.getElementById(screen === 'app' ? 'app-screen' : 'auth-screen').classList.add('active');
        if(screen === 'app') document.getElementById('auth-screen').classList.add('hidden');
        else document.getElementById('app-screen').classList.add('hidden');
    },

    updateUserInfo: (user) => {
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-role').textContent = user.role === 'teacher' ? 'Giáo Viên' : 'Học Sinh';
    },

    fillSubjects: () => {
        const html = SUBJECTS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        const filterEl = document.getElementById('filter-subject');
        const inpEl = document.getElementById('inp-subject');
        if(filterEl.options.length <= 1) filterEl.innerHTML += html;
        inpEl.innerHTML = html;
    },

    renderExams: (exams, role, handlers) => {
        const container = document.getElementById('exam-list-container');
        container.innerHTML = '';

        if (role === 'teacher') {
            const addBtn = document.createElement('div');
            addBtn.className = 'card create-new';
            addBtn.innerHTML = '<h3>+ Tạo Đề Mới</h3>';
            addBtn.onclick = handlers.openCreate;
            container.appendChild(addBtn);
        }

        exams.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'card';
            const sub = SUBJECTS.find(s => s.id === ex.subject)?.name || ex.subject;
            
            card.innerHTML = `
                <h3>${ex.title}</h3>
                <p>${sub} - Khối ${ex.grade}</p>
                <div style="margin-top:10px">
                    ${role === 'teacher' 
                        ? `<button class="btn-primary" style="background:#ef4444" data-id="${ex.id}" data-action="del">Xóa</button>`
                        : `<button class="btn-primary" data-id="${ex.id}" data-action="take">Làm bài</button>`}
                </div>
            `;
            
            const btn = card.querySelector('button');
            if(btn) {
                btn.onclick = () => {
                    if(btn.dataset.action === 'del') handlers.onDelete(ex.id);
                    if(btn.dataset.action === 'take') handlers.onTake(ex);
                };
            }
            container.appendChild(card);
        });
    },

    renderQuestions: (questions) => {
        const container = document.getElementById('questions-render-area');
        container.innerHTML = questions.map((q, i) => `
            <div class="question-item">
                <p><strong>Câu ${i+1}:</strong> ${q.q}</p>
                ${q.a.map((opt, idx) => `
                    <label style="display:block; margin:5px 0">
                        <input type="radio" name="q_${i}" value="${idx}"> ${opt}
                    </label>`).join('')}
            </div>
        `).join('');
    },

    toggleModal: (id, show) => {
        const m = document.getElementById(id);
        show ? m.classList.remove('hidden') : m.classList.add('hidden');
    }
};
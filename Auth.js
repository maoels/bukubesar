// ==========================================
// FILE: Auth.js
// FUNGSI: Autentikasi & Routing
// ==========================================

const Auth = {
    checkAuth: () => {
        const userStr = localStorage.getItem('fin_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            Auth.showApp(user);
        } else {
            Auth.showAuth();
        }
    },

    toggleView: (view) => {
        const loginCard = document.getElementById('login-card');
        const regCard = document.getElementById('register-card');
        if(view === 'register') {
            loginCard.classList.add('hidden');
            regCard.classList.remove('hidden');
        } else {
            regCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
        }
    },

    showAuth: () => {
        document.getElementById('app').classList.add('hidden');
        document.getElementById('app').classList.remove('opacity-100');
        document.getElementById('auth-container').classList.remove('hidden');
    },

    showApp: (user) => {
        document.getElementById('auth-container').classList.add('hidden');
        const appWrapper = document.getElementById('app');
        appWrapper.classList.remove('hidden');
        setTimeout(() => appWrapper.classList.add('opacity-100'), 50);
        
        document.getElementById('user-greeting').textContent = `Halo, ${user.Nama}`;
        Auth.renderSidebar(user.Role);
        
        if (typeof resetInactivityTimer === 'function') resetInactivityTimer();
        
        const defaultPage = (user.Role === 'Admin' || user.Role === 'Administrator') ? 'dashboard' : 'ledger';
        Router.navigate(defaultPage);
    },

    renderSidebar: (role) => {
        const navContainer = document.getElementById('sidebar-nav');
        let menus = [];

        if (role === 'Admin' || role === 'Administrator') {
            menus = [
                { id: 'dashboard', icon: 'fa-chart-pie', text: 'Dashboard' },
                { id: 'analisis', icon: 'fa-chart-line', text: 'Analisis' },
                { id: 'users', icon: 'fa-users-cog', text: 'Atur Pengguna' },
                { id: 'profile', icon: 'fa-user-circle', text: 'Profile' }
            ];
        } else {
            menus = [
                { id: 'ledger', icon: 'fa-book', text: 'Buku Besar' },
                { id: 'rekap', icon: 'fa-calendar-alt', text: 'Rekap Tahunan' },
                { id: 'report', icon: 'fa-file-invoice', text: 'Laporan' },
                { id: 'profile', icon: 'fa-user-circle', text: 'Profile' }
            ];
        }

        // Terdapat atribut title="${m.text}" yang akan memunculkan tooltip bawaan saat menu dicollapse
        navContainer.innerHTML = menus.map(m => `
            <a href="#" onclick="Router.navigate('${m.id}')" title="${m.text}" class="flex items-center gap-4 px-5 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-gray-700 transition-colors font-medium">
                <div class="w-6 flex justify-center flex-shrink-0"><i class="fas ${m.icon} text-lg"></i></div>
                <span class="sidebar-text transition-opacity duration-300 ${Utils.isSidebarCollapsed ? 'hidden opacity-0' : ''}">${m.text}</span>
            </a>
        `).join('');
    },

    login: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-login');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memproses...`;
        btn.disabled = true;

        try {
            const user = await Utils.fetchAPI('login', {
                username: document.getElementById('login-username').value,
                password: document.getElementById('login-password').value
            });
            localStorage.setItem('fin_user', JSON.stringify(user));
            Utils.showToast(`Berhasil login sebagai ${user.Nama}`);
            Auth.showApp(user);
        } catch (error) {} finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    register: async (e) => {
        e.preventDefault();
        const pw = document.getElementById('reg-password').value;
        const pwConfirm = document.getElementById('reg-password-confirm').value;

        if (pw !== pwConfirm) { Utils.showToast("Password tidak cocok!", "error"); return; }
        const btn = document.getElementById('btn-register');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mendaftar...`;
        btn.disabled = true;

        try {
            await Utils.fetchAPI('register', {
                nama: document.getElementById('reg-nama').value, email: document.getElementById('reg-email').value,
                username: document.getElementById('reg-username').value, password: pw
            });
            Utils.showToast("Pendaftaran berhasil! Menunggu aktifasi.", "success");
            document.getElementById('register-form').reset();
            Auth.toggleView('login');
        } catch (error) {} finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    logout: () => {
        localStorage.removeItem('fin_user');
        if (typeof inactivityTimer !== 'undefined') clearTimeout(inactivityTimer);
        document.getElementById('login-form').reset();
        Auth.showAuth();
        Utils.showToast("Berhasil logout", "info");
    }
};

document.getElementById('login-form').addEventListener('submit', Auth.login);
document.getElementById('register-form').addEventListener('submit', Auth.register);
window.addEventListener('DOMContentLoaded', Auth.checkAuth);

const Router = {
    navigate: (pageId) => {
        const titles = { dashboard: 'Dashboard Analitik', users: 'Manajemen Pengguna', ledger: 'Buku Besar Transaksi',
            report: 'Laporan Keuangan', analisis: 'Analisis Keuangan', profile: 'Pengaturan Profil', rekap: 'Rekapitulasi Tahunan' };
        document.getElementById('page-title').textContent = titles[pageId] || 'Halaman';
        
        switch(pageId) {
            case 'dashboard': if (typeof Dashboard !== 'undefined') Dashboard.render(); break;
            case 'users': if (typeof Users !== 'undefined') Users.render(); break;
            case 'ledger': if (typeof Ledger !== 'undefined') Ledger.render(); break;
            case 'report': if (typeof Report !== 'undefined') Report.render(); break;
            case 'analisis': if (typeof Analisis !== 'undefined') Analisis.render(); break;
            case 'profile': if (typeof Profile !== 'undefined') Profile.render(); break;
            case 'rekap': if (typeof Rekap !== 'undefined') Rekap.render(); break;
            default: document.getElementById('content-area').innerHTML = `<div class="h-full flex items-center justify-center text-gray-400">Pembaruan sistem.</div>`;
        }
    }
};
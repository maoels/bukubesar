// ==========================================
// FILE: Main.js
// FUNGSI: Config Global (URL Tersamar), Utility, Token & Responsive Table
// ==========================================

const _k1 = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5";
const _k2 = "Y2J3YmRmelhEcjdydDR3WlhkUzNJY3VvbVJNbzJvZGN4VlY3YXdI";
const _k3 = "V1RJeVNQcU1MdC11MEd2U0tReEhpcG9SYkJxejBQUS9leGU=";

const AppConfig = {
    get API_URL() {
        return atob(_k1 + _k2 + _k3);
    },
    INACTIVITY_LIMIT_MS: 10 * 60 * 1000 // 10 Menit
};

const Utils = {
    // --- LOGIC TOGGLE SIDEBAR DESKTOP ---
    isSidebarCollapsed: false,
    toggleSidebar: () => {
        Utils.isSidebarCollapsed = !Utils.isSidebarCollapsed;
        const sidebar = document.getElementById('sidebar');
        const title = document.getElementById('sidebar-title');
        const logoutText = document.getElementById('sidebar-logout-text');
        const icon = document.getElementById('sidebar-toggle-icon');
        const navTexts = document.querySelectorAll('.sidebar-text');
        
        if (Utils.isSidebarCollapsed) {
            sidebar.classList.replace('w-64', 'w-20');
            title.classList.add('opacity-0');
            logoutText.classList.add('opacity-0');
            navTexts.forEach(t => t.classList.add('opacity-0'));
            
            setTimeout(() => {
                title.classList.add('hidden');
                logoutText.classList.add('hidden');
                navTexts.forEach(t => t.classList.add('hidden'));
            }, 150);
            icon.classList.add('rotate-180');
        } else {
            sidebar.classList.replace('w-20', 'w-64');
            title.classList.remove('hidden');
            logoutText.classList.remove('hidden');
            navTexts.forEach(t => t.classList.remove('hidden'));
            
            setTimeout(() => {
                title.classList.remove('opacity-0');
                logoutText.classList.remove('opacity-0');
                navTexts.forEach(t => t.classList.remove('opacity-0'));
            }, 50);
            icon.classList.remove('rotate-180');
        }
    },

    // --- LOGIC MENU HAMBURGER MOBILE ---
    toggleMobileMenu: () => {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('mobile-backdrop');
        if (!sidebar) return;

        if (Utils.isSidebarCollapsed) {
            Utils.toggleSidebar();
        }

        const isClosed = sidebar.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebar.classList.remove('-translate-x-full');
            if (backdrop) backdrop.classList.remove('hidden');
        } else {
            Utils.closeMobileMenu();
        }
    },

    closeMobileMenu: () => {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('mobile-backdrop');
        if (sidebar) sidebar.classList.add('-translate-x-full');
        if (backdrop) backdrop.classList.add('hidden');
    },

    showToast: (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return; 

        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
            error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
            info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
        };
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };

        toast.className = `flex items-center p-4 border rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${colors[type]}`;
        toast.innerHTML = `<i class="fas ${icons[type]} mr-3 text-lg"></i> <span class="font-medium">${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => { toast.classList.remove('translate-x-full', 'opacity-0'); }, 10);
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => { toast.remove(); }, 300);
        }, 3000);
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    },
    
    fetchAPI: async (action, data = {}) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('fin_user') || '{}');
            
            const response = await fetch(AppConfig.API_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: action, 
                    token: currentUser.token || '', 
                    data: data 
                })
            });
            const result = await response.json();

            if (result.code === 401) {
                localStorage.removeItem('fin_user');
                if (typeof Auth !== 'undefined') Auth.showAuth();
                throw new Error(result.message);
            }

            if (result.code !== 200) throw new Error(result.message);
            return result.data;
        } catch (error) {
            Utils.showToast(error.message, 'error');
            throw error;
        }
    }
};

// ==========================================
// OTOMATISASI SCROLL HORIZONTAL TABEL DI SEMUA HALAMAN
// ==========================================
function initResponsiveTables() {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    const wrapTables = () => {
        contentArea.querySelectorAll('table').forEach(table => {
            const parent = table.parentElement;
            if (parent && !parent.classList.contains('table-container') && !parent.classList.contains('overflow-x-auto')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-container w-full overflow-x-auto';
                parent.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    };

    const observer = new MutationObserver(wrapTables);
    observer.observe(contentArea, { childList: true, subtree: true });
}

// ==========================================
// SESSION & INACTIVITY MANAGER
// ==========================================
let inactivityTimer;

function resetInactivityTimer() {
    if(!localStorage.getItem('fin_user')) return;
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        Utils.showToast('Sesi Anda telah berakhir karena tidak ada aktivitas (10 Menit).', 'info');
        if (typeof Auth !== 'undefined') Auth.logout();
    }, AppConfig.INACTIVITY_LIMIT_MS);
}

['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        if (themeToggle) themeToggle.checked = true;
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggle) themeToggle.checked = false;
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initResponsiveTables();
});

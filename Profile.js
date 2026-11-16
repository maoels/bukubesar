// ==========================================
// FILE: Profile.js
// FUNGSI: UI Pengaturan Profil & Ganti Password
// ==========================================

const Profile = {
    render: () => {
        const container = document.getElementById('content-area');
        const user = JSON.parse(localStorage.getItem('fin_user'));

        let html = `
            <div class="max-w-2xl mx-auto">
                <!-- Card Header -->
                <div class="bg-gradient-to-r from-primary to-indigo-600 rounded-t-xl p-8 text-center relative overflow-hidden">
                    <div class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white rounded-full opacity-10"></div>
                    <div class="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full mx-auto flex items-center justify-center text-4xl text-white mb-3 shadow-lg border-2 border-white/30">
                        <i class="fas fa-user"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-white mb-1">Pengaturan Profil</h2>
                    <p class="text-indigo-100 text-sm">Role Anda saat ini: <span class="font-semibold bg-white/20 px-2 py-0.5 rounded-full">${user.Role}</span></p>
                </div>

                <!-- Form Profil -->
                <div class="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg border-x border-b border-gray-100 dark:border-gray-700 p-8">
                    <form id="profile-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium mb-1">Nama Lengkap</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fas fa-id-card text-gray-400"></i></div>
                                    <input type="text" id="prof-nama" value="${user.Nama}" required class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-900/50 dark:text-white transition-colors">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Username</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fas fa-at text-gray-400"></i></div>
                                    <input type="text" id="prof-username" value="${user.Username}" required class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-900/50 dark:text-white transition-colors">
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Email Anda</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="fas fa-envelope text-gray-400"></i></div>
                                <input type="email" id="prof-email" value="${user.Email || ''}" required class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-900/50 dark:text-white transition-colors">
                            </div>
                        </div>

                        <hr class="border-gray-200 dark:border-gray-700 my-6">

                        <div>
                            <h4 class="font-semibold text-gray-800 dark:text-white mb-4"><i class="fas fa-lock mr-2 text-gray-400"></i> Ganti Password</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
                                <i class="fas fa-info-circle text-yellow-500 mr-1"></i> Biarkan kosong jika Anda tidak ingin mengubah password saat ini.
                            </p>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Password Lama</label>
                                    <input type="password" id="prof-old-pass" placeholder="Masukkan password saat ini" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-transparent dark:text-white">
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Password Baru</label>
                                        <input type="password" id="prof-new-pass" placeholder="Minimal 6 karakter" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-transparent dark:text-white">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Ulangi Password Baru</label>
                                        <input type="password" id="prof-confirm-pass" placeholder="Ulangi password baru" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-transparent dark:text-white">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="pt-4 flex justify-end">
                            <button type="submit" id="btn-save-profile" class="bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                                <i class="fas fa-save"></i> Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        container.innerHTML = html;
        document.getElementById('profile-form').addEventListener('submit', Profile.saveData);
    },

    saveData: async (e) => {
        e.preventDefault();
        
        const oldPass = document.getElementById('prof-old-pass').value;
        const newPass = document.getElementById('prof-new-pass').value;
        const confirmPass = document.getElementById('prof-confirm-pass').value;

        // Validasi Logika Password
        if (newPass !== "" || oldPass !== "") {
            if (oldPass === "") {
                Utils.showToast("Anda harus memasukkan Password Lama untuk mengganti password.", "error");
                document.getElementById('prof-old-pass').focus();
                return;
            }
            if (newPass === "") {
                Utils.showToast("Password Baru tidak boleh kosong jika Anda ingin menggantinya.", "error");
                document.getElementById('prof-new-pass').focus();
                return;
            }
            if (newPass !== confirmPass) {
                Utils.showToast("Password Baru dan Ulangi Password tidak cocok!", "error");
                document.getElementById('prof-confirm-pass').focus();
                return;
            }
        }

        const btn = document.getElementById('btn-save-profile');
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
        btn.disabled = true;

        const user = JSON.parse(localStorage.getItem('fin_user'));
        
        const payload = {
            id: user.ID,
            nama: document.getElementById('prof-nama').value,
            email: document.getElementById('prof-email').value,
            username: document.getElementById('prof-username').value,
            oldPassword: oldPass,
            newPassword: newPass
        };

        try {
            // Panggil API (fungsi updateProfile di Api.gs sudah disiapkan)
            const updatedUser = await Utils.fetchAPI('updateProfile', payload);

            //properti token lama tetap dipertahankan di localStorage
            updatedUser.token = user.token;

            // Perbarui data local storage agar nama di header berubah
            localStorage.setItem('fin_user', JSON.stringify(updatedUser));
            
            // Perbarui sapaan di header
            document.getElementById('user-greeting').textContent = `Halo, ${updatedUser.Nama}`;
            
            Utils.showToast('Profil berhasil diperbarui!', 'success');
            
            // Kosongkan field password setelah sukses
            document.getElementById('prof-old-pass').value = '';
            document.getElementById('prof-new-pass').value = '';
            document.getElementById('prof-confirm-pass').value = '';
            
        } catch (error) {
            // Error handling sudah diatur oleh Utils.fetchAPI (misal salah password lama)
        } finally {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    }
};

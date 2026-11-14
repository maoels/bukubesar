// ==========================================
// FILE: Users.js
// FUNGSI: UI Atur Pengguna (Administrator)
// ==========================================

const Users = {
    allData: [],
    filteredData: [],
    currentPage: 1,
    perPage: 10,

    render: async () => {
        const container = document.getElementById('content-area');
        container.innerHTML = `<div class="flex items-center justify-center h-full text-primary"><i class="fas fa-circle-notch fa-spin text-4xl"></i></div>`;
        
        try {
            Users.allData = await Utils.fetchAPI('getUsers');
            Users.filteredData = [...Users.allData]; 
            Users.buildUI(container);
        } catch (error) {
            container.innerHTML = `<div class="text-red-500 text-center mt-10">Gagal memuat Data Pengguna: ${error.message}</div>`;
        }
    },

    buildUI: (container) => {
        let html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                
                <div class="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <select id="user-limit" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="10" ${Users.perPage==10?'selected':''}>10</option>
                            <option value="25" ${Users.perPage==25?'selected':''}>25</option>
                            <option value="100" ${Users.perPage==100?'selected':''}>100</option>
                            <option value="all" ${Users.perPage==='all'?'selected':''}>Semua</option>
                        </select>
                        <span class="text-sm text-gray-500">Data per halaman</span>
                    </div>
                    
                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <div class="relative w-full sm:w-64">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><i class="fas fa-search text-gray-400"></i></div>
                            <input type="text" id="user-search" placeholder="Cari nama/username..." class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        </div>
                        <button onclick="Users.openModal('add')" class="bg-primary hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                            <i class="fas fa-plus mr-1"></i> Tambah
                        </button>
                    </div>
                </div>

                <div class="table-container">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-600 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                                <th class="px-6 py-4">No</th>
                                <th class="px-6 py-4 min-w-[150px]">Nama Lengkap</th>
                                <th class="px-6 py-4 min-w-[200px]">Email</th>
                                <th class="px-6 py-4">Username</th>
                                <th class="px-6 py-4">Role</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4 text-center min-w-[180px]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="user-table-body">
                            <!-- Rows -->
                        </tbody>
                    </table>
                </div>

                <div class="p-4 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4" id="user-pagination">
                </div>
            </div>

            <!-- Modal Form (Hidden) -->
            <div id="user-modal" class="fixed inset-0 z-50 hidden bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center transition-opacity">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-95 transition-transform" id="user-modal-content">
                    <div class="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 class="text-lg font-bold" id="user-modal-title">Tambah Pengguna</h3>
                        <button onclick="Users.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <form id="user-form" class="p-6 space-y-4">
                        <input type="hidden" id="form-user-id">
                        <div><label class="block text-sm font-medium mb-1">Nama</label><input type="text" id="form-user-nama" required class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white"></div>
                        <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="form-user-email" required class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white"></div>
                        <div><label class="block text-sm font-medium mb-1">Username</label><input type="text" id="form-user-username" required class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white"></div>
                        
                        <div id="password-group"><label class="block text-sm font-medium mb-1">Password</label><input type="password" id="form-user-password" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white" placeholder="Kosongkan jika tidak diubah"></div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Role</label>
                                <select id="form-user-role" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white">
                                    <option value="User" class="dark:bg-gray-800">User</option>
                                    <option value="Admin" class="dark:bg-gray-800">Administrator</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Status</label>
                                <select id="form-user-status" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white">
                                    <option value="Aktif" class="dark:bg-gray-800">Aktif</option>
                                    <option value="Menunggu" class="dark:bg-gray-800">Menunggu</option>
                                    <option value="Nonaktif" class="dark:bg-gray-800">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                        <div class="pt-4 flex justify-end gap-3">
                            <button type="button" onclick="Users.closeModal()" class="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium">Batal</button>
                            <button type="submit" id="btn-save-user" class="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        container.innerHTML = html;
        Users.renderTable();

        document.getElementById('user-limit').addEventListener('change', (e) => {
            Users.perPage = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
            Users.currentPage = 1;
            Users.renderTable();
        });

        document.getElementById('user-search').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            Users.filteredData = Users.allData.filter(u => 
                u.Nama.toLowerCase().includes(query) || 
                u.Username.toLowerCase().includes(query) ||
                u.Email.toLowerCase().includes(query)
            );
            Users.currentPage = 1;
            Users.renderTable();
        });

        document.getElementById('user-form').addEventListener('submit', Users.saveUser);
    },

    renderTable: () => {
        const tbody = document.getElementById('user-table-body');
        
        let displayData = Users.filteredData;
        const totalRows = displayData.length;
        
        if (Users.perPage !== 'all') {
            const start = (Users.currentPage - 1) * Users.perPage;
            displayData = displayData.slice(start, start + Users.perPage);
        }

        // PERBAIKAN WARNA ZEBRA STRIPPED ADA DI BARIS DI BAWAH INI
        tbody.innerHTML = displayData.map((u, i) => {
            const num = Users.perPage === 'all' ? i + 1 : ((Users.currentPage - 1) * Users.perPage) + i + 1;
            const statusColor = u.Status === 'Aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' : 
                                u.Status === 'Menunggu' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
            const roleColor = u.Role === 'Admin' ? 'text-primary font-semibold dark:text-indigo-400' : 'dark:text-gray-200';

            return `
            <tr class="${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200">
                <td class="px-6 py-4 font-medium">${num}</td>
                <td class="px-6 py-4 font-medium">${u.Nama}</td>
                <td class="px-6 py-4">${u.Email}</td>
                <td class="px-6 py-4">@${u.Username}</td>
                <td class="px-6 py-4 ${roleColor}">${u.Role}</td>
                <td class="px-6 py-4"><span class="px-2.5 py-1 text-xs font-medium rounded-full ${statusColor}">${u.Status}</span></td>
                <td class="px-6 py-4 text-center">
                    <button onclick='Users.openModal("edit", ${JSON.stringify(u).replace(/'/g, "'")})' title="Edit Pengguna" class="text-blue-500 hover:text-blue-400 p-2"><i class="fas fa-edit"></i></button>
                    <button onclick="Users.resetPassword('${u.ID}')" title="Reset Password ke 123456" class="text-yellow-500 hover:text-yellow-400 p-2"><i class="fas fa-key"></i></button>
                    <button onclick="Users.deleteUser('${u.ID}')" title="Hapus Pengguna" class="text-red-500 hover:text-red-400 p-2"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
            `;
        }).join('') || `<tr><td colspan="7" class="px-6 py-10 text-center text-gray-500">Tidak ada data ditemukan</td></tr>`;

        Users.renderPagination(totalRows);
    },

    renderPagination: (totalRows) => {
        const pagContainer = document.getElementById('user-pagination');
        if (Users.perPage === 'all') {
            pagContainer.innerHTML = `<span class="text-sm text-gray-500 dark:text-gray-400">Menampilkan semua ${totalRows} data</span>`;
            return;
        }

        const totalPages = Math.ceil(totalRows / Users.perPage);
        const start = (Users.currentPage - 1) * Users.perPage + 1;
        const end = Math.min(Users.currentPage * Users.perPage, totalRows);
        
        let html = `<span class="text-sm text-gray-500 dark:text-gray-400">Menampilkan <span class="font-semibold text-gray-900 dark:text-white">${totalRows === 0 ? 0 : start} - ${end}</span> dari <span class="font-semibold text-gray-900 dark:text-white">${totalRows}</span> data</span>`;
        
        let btns = `<div class="inline-flex rounded-md shadow-sm">
            <button onclick="Users.changePage(${Users.currentPage - 1})" ${Users.currentPage === 1 ? 'disabled' : ''} class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700">Prev</button>
            <button onclick="Users.changePage(${Users.currentPage + 1})" ${Users.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} class="px-3 py-1.5 text-sm font-medium bg-white border-y border-r border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700">Next</button>
        </div>`;

        pagContainer.innerHTML = html + btns;
    },

    changePage: (newPage) => {
        Users.currentPage = newPage;
        Users.renderTable();
    },

    openModal: (mode, data = null) => {
        const modal = document.getElementById('user-modal');
        const form = document.getElementById('user-form');
        form.reset();

        if (mode === 'add') {
            document.getElementById('user-modal-title').textContent = 'Tambah Pengguna';
            document.getElementById('form-user-id').value = '';
            document.getElementById('form-user-password').setAttribute('required', 'true');
            document.getElementById('password-group').classList.remove('hidden');
        } else {
            document.getElementById('user-modal-title').textContent = 'Edit Pengguna';
            document.getElementById('form-user-id').value = data.ID;
            document.getElementById('form-user-nama').value = data.Nama;
            document.getElementById('form-user-email').value = data.Email;
            document.getElementById('form-user-username').value = data.Username;
            document.getElementById('form-user-role').value = data.Role;
            document.getElementById('form-user-status').value = data.Status;
            
            document.getElementById('form-user-password').removeAttribute('required');
            document.getElementById('password-group').classList.add('hidden'); 
        }

        modal.classList.remove('hidden');
        setTimeout(() => document.getElementById('user-modal-content').classList.remove('scale-95'), 10);
    },

    closeModal: () => {
        document.getElementById('user-modal-content').classList.add('scale-95');
        setTimeout(() => document.getElementById('user-modal').classList.add('hidden'), 200);
    },

    saveUser: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-user');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        btn.disabled = true;

        const id = document.getElementById('form-user-id').value;
        const action = id ? 'updateUser' : 'addUser';
        
        const payload = {
            id: id,
            nama: document.getElementById('form-user-nama').value,
            email: document.getElementById('form-user-email').value,
            username: document.getElementById('form-user-username').value,
            role: document.getElementById('form-user-role').value,
            status: document.getElementById('form-user-status').value,
            password: document.getElementById('form-user-password').value 
        };

        try {
            await Utils.fetchAPI(action, payload);
            Utils.showToast(id ? 'Data pengguna diubah' : 'Pengguna baru ditambahkan');
            Users.closeModal();
            Users.render();
        } catch (error) {} finally {
            btn.innerHTML = `Simpan`;
            btn.disabled = false;
        }
    },

    resetPassword: async (id) => {
        if(!confirm("Anda yakin ingin mereset password pengguna ini ke default (123456)?")) return;
        
        try {
            await Utils.fetchAPI('resetPassword', { id: id });
            Utils.showToast('Password berhasil di-reset menjadi 123456');
        } catch (error) {}
    },

    deleteUser: async (id) => {
        if(!confirm("PERINGATAN: Menghapus pengguna bersifat permanen. Lanjutkan?")) return;
        
        try {
            await Utils.fetchAPI('deleteUser', { id: id });
            Utils.showToast('Pengguna dihapus', 'info');
            Users.render();
        } catch (error) {}
    }
};
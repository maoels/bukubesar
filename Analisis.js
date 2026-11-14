// ==========================================
// FILE: Analisis.js
// FUNGSI: UI Analisis Transaksi (Khusus Admin)
// ==========================================

const Analisis = {
    usersList: [],
    trxData: [],
    
    render: async () => {
        const container = document.getElementById('content-area');
        container.innerHTML = `<div class="flex items-center justify-center h-full text-primary"><i class="fas fa-circle-notch fa-spin text-4xl"></i></div>`;
        
        try {
            // Ambil daftar pengguna untuk dropdown filter
            Analisis.usersList = await Utils.fetchAPI('getUsers');
            Analisis.buildUI(container);
        } catch (error) {
            container.innerHTML = `<div class="text-red-500 text-center mt-10">Gagal memuat halaman: ${error.message}</div>`;
        }
    },

    buildUI: (container) => {
        let html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                <h3 class="font-semibold text-gray-700 dark:text-gray-200 mb-4"><i class="fas fa-search-dollar mr-2"></i> Filter Analisis Keuangan</h3>
                <form id="analisis-filter-form" class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div>
                        <label class="block text-sm font-medium mb-1">Pilih Pengguna</label>
                        <select id="filter-analisis-user" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white">
                            <option value="ALL">-- Semua Pengguna --</option>
                            ${Analisis.usersList.map(u => `<option value="${u.ID}">${u.Nama} (@${u.Username})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Dari Tanggal</label>
                        <input type="date" id="filter-analisis-start" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white [color-scheme:light_dark]">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Sampai Tanggal</label>
                        <input type="date" id="filter-analisis-end" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white [color-scheme:light_dark]">
                    </div>
                    <div>
                        <button type="submit" id="btn-proses-analisis" class="w-full bg-primary hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-sync-alt"></i> Tampilkan Data
                        </button>
                    </div>
                </form>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden" id="analisis-result-container">
                <div class="p-10 text-center text-gray-400">
                    <i class="fas fa-chart-area text-4xl mb-3"></i>
                    <p>Pilih filter dan klik Tampilkan Data untuk memulai analisis.</p>
                </div>
            </div>
        `;

        container.innerHTML = html;
        
        // Set default filter ke bulan ini
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        document.getElementById('filter-analisis-start').value = firstDay;
        document.getElementById('filter-analisis-end').value = lastDay;

        document.getElementById('analisis-filter-form').addEventListener('submit', Analisis.processData);
    },

    processData: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-proses-analisis');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memproses...`;
        btn.disabled = true;

        const userId = document.getElementById('filter-analisis-user').value;
        const startDate = document.getElementById('filter-analisis-start').value;
        const endDate = document.getElementById('filter-analisis-end').value;
        const currentUser = JSON.parse(localStorage.getItem('fin_user'));

        try {
            // Karena rolenya Admin, backend akan mereturn semua transaksi
            const allTrx = await Utils.fetchAPI('getTransactions', { userId: currentUser.ID, role: currentUser.Role });
            
            // Filter by Date Range & User (Jika bukan ALL)
            Analisis.trxData = allTrx.filter(t => {
                let matchDate = t.Tanggal >= startDate && t.Tanggal <= endDate;
                let matchUser = userId === 'ALL' ? true : t.UserID === userId;
                return matchDate && matchUser;
            });
            
            Analisis.renderTableResult();
        } catch (error) {} finally {
            btn.innerHTML = `<i class="fas fa-sync-alt"></i> Tampilkan Data`;
            btn.disabled = false;
        }
    },

    renderTableResult: () => {
        const container = document.getElementById('analisis-result-container');
        let totalDebit = 0;
        let totalKredit = 0;

        let rowsHTML = Analisis.trxData.map((t, i) => {
            const isDebit = t.Jenis === 'Debit';
            const nominal = parseFloat(t.Nominal);
            if (isDebit) totalDebit += nominal; else totalKredit += nominal;

            return `
            <tr class="${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} border-b dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <td class="px-6 py-3 whitespace-nowrap">${t.Tanggal}</td>
                <td class="px-6 py-3 font-medium text-primary dark:text-indigo-400">@${t.Username}</td>
                <td class="px-6 py-3">${t.Keterangan}</td>
                <td class="px-6 py-3 text-right font-medium text-green-600 dark:text-green-400">${isDebit ? Utils.formatCurrency(nominal) : '-'}</td>
                <td class="px-6 py-3 text-right font-medium text-red-600 dark:text-red-400">${!isDebit ? Utils.formatCurrency(nominal) : '-'}</td>
            </tr>
            `;
        }).join('');

        if (Analisis.trxData.length === 0) {
            rowsHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-500">Tidak ada data transaksi yang cocok dengan filter.</td></tr>`;
        }

        container.innerHTML = `
            <div class="p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                <h3 class="font-semibold text-gray-700 dark:text-gray-200">Hasil Analisis</h3>
                <span class="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full font-medium">Total: ${Analisis.trxData.length} Transaksi</span>
            </div>
            <div class="table-container">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs text-gray-600 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            <th class="px-6 py-4 w-32">Tanggal</th>
                            <th class="px-6 py-4 w-40">User</th>
                            <th class="px-6 py-4">Keterangan</th>
                            <th class="px-6 py-4 text-right w-40">Debit</th>
                            <th class="px-6 py-4 text-right w-40">Kredit</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                    <tfoot class="bg-gray-100 dark:bg-gray-900 font-bold text-gray-800 dark:text-white border-t dark:border-gray-700">
                        <tr>
                            <td colspan="3" class="px-6 py-4 text-right uppercase">Akumulasi Total:</td>
                            <td class="px-6 py-4 text-right text-green-600 dark:text-green-400">${Utils.formatCurrency(totalDebit)}</td>
                            <td class="px-6 py-4 text-right text-red-600 dark:text-red-400">${Utils.formatCurrency(totalKredit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }
};
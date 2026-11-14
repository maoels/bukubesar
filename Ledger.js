// ==========================================
// FILE: Ledger.js
// FUNGSI: UI Buku Besar (Cards Total, Filter Bulan & Tahun)
// ==========================================

const Ledger = {
    allData: [],
    filteredData: [],
    selectedMonth: new Date().getMonth(), // Default bulan berjalan (0 - 11)
    selectedYear: new Date().getFullYear(), // Default tahun berjalan
    searchQuery: '',
    currentPage: 1,
    perPage: 10,
    chartInstance: null,

    monthNames: [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ],

    render: async () => {
        const container = document.getElementById('content-area');
        container.innerHTML = `<div class="flex items-center justify-center h-full text-primary"><i class="fas fa-circle-notch fa-spin text-4xl"></i></div>`;
        try {
            const user = JSON.parse(localStorage.getItem('fin_user'));
            Ledger.allData = await Utils.fetchAPI('getTransactions', { userId: user.ID, role: user.Role });
            Ledger.buildUI(container);
        } catch (error) {
            container.innerHTML = `<div class="text-red-500 text-center mt-10">Gagal memuat Buku Besar: ${error.message}</div>`;
        }
    },

    buildUI: (container) => {
        const currentYear = new Date().getFullYear();
        const yearOptions = [];
        for (let y = currentYear + 1; y >= currentYear - 5; y--) {
            yearOptions.push(`<option value="${y}" ${y === Ledger.selectedYear ? 'selected' : ''}>${y}</option>`);
        }

        const monthOptions = Ledger.monthNames.map((name, idx) => 
            `<option value="${idx}" ${idx === Ledger.selectedMonth ? 'selected' : ''}>${name}</option>`
        ).join('');

        let html = `
            <!-- Filter Bulan & Tahun -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold">
                    <i class="fas fa-filter text-primary"></i>
                    <span>Periode Buku Besar</span>
                </div>
                <div class="flex items-center gap-3 w-full sm:w-auto">
                    <select id="ledger-month-filter" class="w-full sm:w-40 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary focus:border-primary p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        ${monthOptions}
                    </select>
                    <select id="ledger-year-filter" class="w-full sm:w-28 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary focus:border-primary p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        ${yearOptions.join('')}
                    </select>
                </div>
            </div>

            <!-- Cards Total Debit & Total Kredit -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full opacity-50"></div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Debit (<span id="label-periode-debit">${Ledger.monthNames[Ledger.selectedMonth]} ${Ledger.selectedYear}</span>)</p>
                    <h3 id="ledger-total-debit" class="text-2xl font-bold text-gray-800 dark:text-white">Rp 0</h3>
                    <div class="mt-3 text-xs font-medium text-green-600 dark:text-green-400"><i class="fas fa-arrow-down mr-1"></i> Pemasukan</div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full opacity-50"></div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Kredit (<span id="label-periode-kredit">${Ledger.monthNames[Ledger.selectedMonth]} ${Ledger.selectedYear}</span>)</p>
                    <h3 id="ledger-total-kredit" class="text-2xl font-bold text-gray-800 dark:text-white">Rp 0</h3>
                    <div class="mt-3 text-xs font-medium text-red-600 dark:text-red-400"><i class="fas fa-arrow-up mr-1"></i> Pengeluaran</div>
                </div>
            </div>

            <!-- Grafik & Tombol Catat Transaksi -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">Grafik Transaksi Anda (<span id="ledger-chart-year-label">${Ledger.selectedYear}</span>)</h3>
                    <div class="relative h-48 w-full"><canvas id="ledgerChart"></canvas></div>
                </div>
                
                <div class="bg-gradient-to-br from-primary to-indigo-600 rounded-xl p-6 shadow-sm text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <i class="fas fa-wallet text-4xl mb-3"></i>
                    <h3 class="font-semibold text-lg mb-1">Catat Transaksi</h3>
                    <p class="text-xs text-indigo-100 mb-4">Tambahkan catatan debit atau kredit baru</p>
                    <button onclick="Ledger.openModal('add')" class="bg-white text-primary hover:bg-gray-50 px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors w-full">
                        <i class="fas fa-plus mr-2"></i> Tambah Data
                    </button>
                </div>
            </div>

            <!-- Tabel Daftar Transaksi -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 class="font-semibold text-gray-700 dark:text-gray-200">Daftar Transaksi (<span id="label-tabel-periode">${Ledger.monthNames[Ledger.selectedMonth]} ${Ledger.selectedYear}</span>)</h3>
                    <div class="relative w-full sm:w-64">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><i class="fas fa-search text-gray-400"></i></div>
                        <input type="text" id="ledger-search" value="${Ledger.searchQuery}" placeholder="Cari keterangan / jenis..." class="bg-white border border-gray-300 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    </div>
                </div>
                <div class="table-container">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-600 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                                <th class="px-6 py-4">Tanggal</th>
                                <th class="px-6 py-4">Jenis</th>
                                <th class="px-6 py-4">Keterangan</th>
                                <th class="px-6 py-4 text-right">Nominal</th>
                                <th class="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="ledger-table-body"></tbody>
                    </table>
                </div>
                <div class="p-4 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4" id="ledger-pagination"></div>
            </div>

            <!-- Modal Form -->
            <div id="ledger-modal" class="fixed inset-0 z-50 hidden bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center transition-opacity">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-95 transition-transform" id="ledger-modal-content">
                    <div class="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 class="text-lg font-bold" id="ledger-modal-title">Catat Transaksi</h3>
                        <button onclick="Ledger.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <form id="ledger-form" class="p-6 space-y-4">
                        <input type="hidden" id="form-trx-id">
                        <div>
                            <label class="block text-sm font-medium mb-1">Tanggal</label>
                            <input type="date" id="form-trx-tanggal" required class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white [color-scheme:light_dark]">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Jenis</label>
                                <select id="form-trx-jenis" required class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white">
                                    <option value="Debit" class="dark:bg-gray-800">Debit (Pemasukan)</option>
                                    <option value="Kredit" class="dark:bg-gray-800">Kredit (Pengeluaran)</option>
                                </select>
                            </div>
                            <div><label class="block text-sm font-medium mb-1">Nominal (Rp)</label><input type="number" id="form-trx-nominal" required min="1" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white"></div>
                        </div>
                        <div><label class="block text-sm font-medium mb-1">Keterangan</label><textarea id="form-trx-keterangan" required rows="2" class="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent dark:text-white"></textarea></div>
                        <div class="pt-4 flex justify-end gap-3">
                            <button type="button" onclick="Ledger.closeModal()" class="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Batal</button>
                            <button type="submit" id="btn-save-trx" class="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        container.innerHTML = html;

        Ledger.applyFilters(true);
        Ledger.renderChart(Ledger.selectedYear);

        document.getElementById('ledger-form').addEventListener('submit', Ledger.saveTransaction);

        // Event Listener Filter Bulan
        document.getElementById('ledger-month-filter').addEventListener('change', (e) => {
            Ledger.selectedMonth = parseInt(e.target.value);
            Ledger.applyFilters(true);
        });

        // Event Listener Filter Tahun
        document.getElementById('ledger-year-filter').addEventListener('change', (e) => {
            Ledger.selectedYear = parseInt(e.target.value);
            document.getElementById('ledger-chart-year-label').textContent = Ledger.selectedYear;
            Ledger.applyFilters(true);
            Ledger.renderChart(Ledger.selectedYear);
        });

        // Event Listener Pencarian
        document.getElementById('ledger-search').addEventListener('input', (e) => {
            Ledger.searchQuery = e.target.value.toLowerCase();
            Ledger.applyFilters(true);
        });
    },

    applyFilters: (resetPage = false) => {
        if (resetPage) Ledger.currentPage = 1;

        const periodText = `${Ledger.monthNames[Ledger.selectedMonth]} ${Ledger.selectedYear}`;
        document.getElementById('label-periode-debit').textContent = periodText;
        document.getElementById('label-periode-kredit').textContent = periodText;
        document.getElementById('label-tabel-periode').textContent = periodText;

        // 1. Filter data sesuai Bulan & Tahun terpilih
        const periodData = Ledger.allData.filter(t => {
            const d = new Date(t.Tanggal);
            if (isNaN(d.getTime())) return false;
            return d.getMonth() === Ledger.selectedMonth && d.getFullYear() === Ledger.selectedYear;
        });

        // 2. Hitung Total Debit & Kredit pada periode terpilih untuk Card
        let totalDebit = 0;
        let totalKredit = 0;
        periodData.forEach(t => {
            const nominal = parseFloat(t.Nominal) || 0;
            if (t.Jenis === 'Debit') totalDebit += nominal;
            else if (t.Jenis === 'Kredit') totalKredit += nominal;
        });

        document.getElementById('ledger-total-debit').textContent = Utils.formatCurrency(totalDebit);
        document.getElementById('ledger-total-kredit').textContent = Utils.formatCurrency(totalKredit);

        // 3. Terapkan pencarian teks pada data bulan & tahun terpilih
        if (Ledger.searchQuery) {
            Ledger.filteredData = periodData.filter(t =>
                String(t.Keterangan).toLowerCase().includes(Ledger.searchQuery) ||
                String(t.Jenis).toLowerCase().includes(Ledger.searchQuery)
            );
        } else {
            Ledger.filteredData = periodData;
        }

        Ledger.renderTable();
    },

    renderTable: () => {
        const tbody = document.getElementById('ledger-table-body');
        const totalRows = Ledger.filteredData.length;
        const start = (Ledger.currentPage - 1) * Ledger.perPage;
        const displayData = Ledger.filteredData.slice(start, start + Ledger.perPage);

        tbody.innerHTML = displayData.map((t, i) => {
            const isDebit = t.Jenis === 'Debit';
            
            let formattedDate = t.Tanggal;
            const d = new Date(t.Tanggal);
            if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                formattedDate = `${day}-${month}-${d.getFullYear()}`;
            }

            return `
            <tr class="${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200">
                <td class="px-6 py-4 font-medium whitespace-nowrap">${formattedDate}</td>
                <td class="px-6 py-4"><span class="px-2.5 py-1 text-xs font-medium rounded-full ${isDebit ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'}">${t.Jenis}</span></td>
                <td class="px-6 py-4 min-w-[200px]">${t.Keterangan}</td>
                <td class="px-6 py-4 text-right font-semibold ${isDebit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${Utils.formatCurrency(t.Nominal)}</td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                    <button onclick='Ledger.openModal("edit", ${JSON.stringify(t).replace(/'/g, "'")})' title="Edit" class="text-blue-500 hover:text-blue-400 p-2"><i class="fas fa-edit"></i></button>
                    <button onclick="Ledger.deleteTransaction('${t.ID}')" title="Hapus" class="text-red-500 hover:text-red-400 p-2"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
            `;
        }).join('') || `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-500">Tidak ada transaksi pada periode ${Ledger.monthNames[Ledger.selectedMonth]} ${Ledger.selectedYear}.</td></tr>`;

        Ledger.renderPagination(totalRows);
    },

    renderPagination: (totalRows) => {
        const pagContainer = document.getElementById('ledger-pagination');
        const totalPages = Math.ceil(totalRows / Ledger.perPage);
        const start = (Ledger.currentPage - 1) * Ledger.perPage + 1;
        const end = Math.min(Ledger.currentPage * Ledger.perPage, totalRows);
        
        pagContainer.innerHTML = `
            <span class="text-sm text-gray-500 dark:text-gray-400">Menampilkan <span class="font-semibold text-gray-900 dark:text-white">${totalRows === 0 ? 0 : start} - ${end}</span> dari <span class="font-semibold text-gray-900 dark:text-white">${totalRows}</span> record</span>
            <div class="inline-flex rounded-md shadow-sm">
                <button onclick="Ledger.changePage(${Ledger.currentPage - 1})" ${Ledger.currentPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600">Prev</button>
                <button onclick="Ledger.changePage(${Ledger.currentPage + 1})" ${Ledger.currentPage >= totalPages || totalPages === 0 ? 'disabled' : ''} class="px-3 py-1.5 text-sm font-medium bg-white border-y border-r border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600">Next</button>
            </div>
        `;
    },

    changePage: (newPage) => { Ledger.currentPage = newPage; Ledger.renderTable(); },

    renderChart: (year) => {
        const ctx = document.getElementById('ledgerChart').getContext('2d');
        if (Ledger.chartInstance) Ledger.chartInstance.destroy();

        let chartDebit = Array(12).fill(0); let chartKredit = Array(12).fill(0);
        Ledger.allData.forEach(t => {
            let d = new Date(t.Tanggal);
            if (!isNaN(d.getTime()) && d.getFullYear() === year) {
                if (t.Jenis === 'Debit') chartDebit[d.getMonth()] += parseFloat(t.Nominal) || 0;
                else chartKredit[d.getMonth()] += parseFloat(t.Nominal) || 0;
            }
        });

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';

        Ledger.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'],
                datasets: [
                    { label: 'Debit', data: chartDebit, borderColor: '#10b981', backgroundColor: '#10b98120', tension: 0.4, fill: true },
                    { label: 'Kredit', data: chartKredit, borderColor: '#ef4444', backgroundColor: '#ef444420', tension: 0.4, fill: true }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor } } }, scales: { y: { grid: { color: isDark ? '#374151' : '#e5e7eb' }, ticks: { color: textColor } }, x: { grid: { display: false }, ticks: { color: textColor } } } }
        });
    },

    openModal: (mode, data = null) => {
        const modal = document.getElementById('ledger-modal');
        document.getElementById('ledger-form').reset();
        
        if (mode === 'add') {
            document.getElementById('ledger-modal-title').textContent = 'Catat Transaksi';
            document.getElementById('form-trx-id').value = '';
            document.getElementById('form-trx-tanggal').value = new Date().toISOString().split('T')[0];
        } else {
            document.getElementById('ledger-modal-title').textContent = 'Edit Transaksi';
            document.getElementById('form-trx-id').value = data.ID;
            
            let fDate = data.Tanggal;
            const d = new Date(data.Tanggal);
            if (!isNaN(d.getTime())) fDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            
            document.getElementById('form-trx-tanggal').value = fDate;
            document.getElementById('form-trx-jenis').value = data.Jenis;
            document.getElementById('form-trx-nominal').value = data.Nominal;
            document.getElementById('form-trx-keterangan').value = data.Keterangan;
        }
        
        modal.classList.remove('hidden');
        setTimeout(() => { const content = document.getElementById('ledger-modal-content'); if(content) content.classList.remove('scale-95'); }, 10);
    },

    closeModal: () => {
        const content = document.getElementById('ledger-modal-content');
        if (content) content.classList.add('scale-95');
        setTimeout(() => { const modal = document.getElementById('ledger-modal'); if (modal) modal.classList.add('hidden'); }, 200);
    },

    saveTransaction: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-trx');
        if (btn) { btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`; btn.disabled = true; }

        const user = JSON.parse(localStorage.getItem('fin_user'));
        const id = document.getElementById('form-trx-id').value;
        const payload = {
            id: id, userId: user.ID, username: user.Username,
            tanggal: document.getElementById('form-trx-tanggal').value,
            jenis: document.getElementById('form-trx-jenis').value,
            nominal: document.getElementById('form-trx-nominal').value,
            keterangan: document.getElementById('form-trx-keterangan').value
        };

        try {
            await Utils.fetchAPI(id ? 'updateTransaction' : 'addTransaction', payload);
            Utils.showToast(id ? 'Transaksi diubah' : 'Transaksi dicatat');
            Ledger.closeModal();
            setTimeout(() => { Ledger.render(); }, 250);
        } catch (error) {
            if (btn) { btn.innerHTML = `Simpan`; btn.disabled = false; }
        }
    },

    deleteTransaction: async (id) => {
        if(!confirm("Hapus transaksi ini?")) return;
        try {
            await Utils.fetchAPI('deleteTransaction', { id: id });
            Utils.showToast('Transaksi dihapus', 'info');
            Ledger.render();
        } catch (error) {}
    }
};

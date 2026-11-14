// ==========================================
// FILE: Rekap.js
// FUNGSI: UI Rekapitulasi Tahunan (Bulan per Bulan)
// ==========================================

const Rekap = {
    allData: [],
    selectedYear: new Date().getFullYear(),
    
    render: async () => {
        const container = document.getElementById('content-area');
        container.innerHTML = `<div class="flex items-center justify-center h-full text-primary"><i class="fas fa-circle-notch fa-spin text-4xl"></i></div>`;
        
        try {
            const user = JSON.parse(localStorage.getItem('fin_user'));
            // Ambil semua data user ini, proses filtering dilakukan secara lokal
            Rekap.allData = await Utils.fetchAPI('getTransactions', { userId: user.ID, role: user.Role });
            Rekap.buildUI(container);
        } catch (error) {
            container.innerHTML = `<div class="text-red-500 text-center mt-10">Gagal memuat Data: ${error.message}</div>`;
        }
    },

    buildUI: (container) => {
        let html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 class="font-semibold text-gray-700 dark:text-gray-200"><i class="fas fa-calendar-alt mr-2"></i> Rekapitulasi Tahunan</h3>
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium">Pilih Tahun:</label>
                        <select id="rekap-year-filter" class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="${Rekap.selectedYear}">${Rekap.selectedYear}</option>
                            <option value="${Rekap.selectedYear - 1}">${Rekap.selectedYear - 1}</option>
                            <option value="${Rekap.selectedYear - 2}">${Rekap.selectedYear - 2}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden" id="rekap-table-container">
                <!-- Tabel akan dirender di sini -->
            </div>
        `;

        container.innerHTML = html;
        Rekap.renderTable();

        document.getElementById('rekap-year-filter').addEventListener('change', (e) => {
            Rekap.selectedYear = parseInt(e.target.value);
            Rekap.renderTable();
        });
    },

    renderTable: () => {
        const container = document.getElementById('rekap-table-container');
        
        // Array untuk menyimpan total tiap bulan (0 = Jan, 11 = Des)
        let dataBulan = Array.from({length: 12}, () => ({ debit: 0, kredit: 0 }));
        let sumDebit = 0;
        let sumKredit = 0;

        // Filter dan Hitung Data sesuai Tahun
        Rekap.allData.forEach(t => {
            const d = new Date(t.Tanggal);
            if (!isNaN(d.getTime()) && d.getFullYear() === Rekap.selectedYear) {
                const month = d.getMonth();
                const nominal = parseFloat(t.Nominal) || 0;
                
                if (t.Jenis === 'Debit') {
                    dataBulan[month].debit += nominal;
                    sumDebit += nominal;
                } else {
                    dataBulan[month].kredit += nominal;
                    sumKredit += nominal;
                }
            }
        });

        const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        let rowsHTML = dataBulan.map((data, i) => {
            return `
            <tr class="${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200">
                <td class="px-6 py-3 font-medium">${namaBulan[i]}</td>
                <td class="px-6 py-3 text-right text-green-600 dark:text-green-400 font-medium">${Utils.formatCurrency(data.debit)}</td>
                <td class="px-6 py-3 text-right text-red-600 dark:text-red-400 font-medium">${Utils.formatCurrency(data.kredit)}</td>
            </tr>
            `;
        }).join('');

        container.innerHTML = `
            <div class="table-container">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs text-gray-600 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            <th class="px-6 py-4 w-1/3">Bulan</th>
                            <th class="px-6 py-4 w-1/3 text-right">Debit (Masuk)</th>
                            <th class="px-6 py-4 w-1/3 text-right">Kredit (Keluar)</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                    <tfoot class="bg-gray-100 dark:bg-gray-900 font-bold text-gray-800 dark:text-white border-t dark:border-gray-700">
                        <tr>
                            <td class="px-6 py-4 text-right uppercase">Total Setahun:</td>
                            <td class="px-6 py-4 text-right text-green-600 dark:text-green-400">${Utils.formatCurrency(sumDebit)}</td>
                            <td class="px-6 py-4 text-right text-red-600 dark:text-red-400">${Utils.formatCurrency(sumKredit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }
};
// ==========================================
// FILE: Report.js
// FUNGSI: UI Laporan & Cetak A4
// ==========================================

const Report = {
    reportData: [],
    startDate: '',
    endDate: '',

    render: () => {
        const container = document.getElementById('content-area');
        
        let html = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                <h3 class="font-semibold text-gray-700 dark:text-gray-200 mb-4"><i class="fas fa-filter mr-2"></i> Filter Laporan Buku Besar</h3>
                <form id="report-filter-form" class="flex flex-col sm:flex-row gap-4 items-end">
                    <div class="w-full sm:w-auto">
                        <label class="block text-sm font-medium mb-1">Dari Tanggal</label>
                        <input type="date" id="filter-start" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white [color-scheme:light_dark]">
                    </div>
                    <div class="w-full sm:w-auto">
                        <label class="block text-sm font-medium mb-1">Sampai Tanggal</label>
                        <input type="date" id="filter-end" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white [color-scheme:light_dark]">
                    </div>
                    <button type="submit" id="btn-proses-report" class="w-full sm:w-auto bg-primary hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-sync-alt"></i> Proses
                    </button>
                    <button type="button" onclick="Report.printA4()" class="w-full sm:w-auto bg-secondary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-print"></i> Cetak A4
                    </button>
                </form>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden" id="report-result-container">
                <div class="p-10 text-center text-gray-400">
                    <i class="fas fa-file-invoice text-4xl mb-3"></i>
                    <p>Silakan pilih rentang tanggal dan klik Proses untuk menampilkan laporan.</p>
                </div>
            </div>
        `;

        container.innerHTML = html;
        
        // Set default filter ke bulan ini
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        document.getElementById('filter-start').value = firstDay;
        document.getElementById('filter-end').value = lastDay;

        document.getElementById('report-filter-form').addEventListener('submit', Report.processData);
    },

    processData: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-proses-report');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memproses...`;
        btn.disabled = true;

        Report.startDate = document.getElementById('filter-start').value;
        Report.endDate = document.getElementById('filter-end').value;
        const user = JSON.parse(localStorage.getItem('fin_user'));

        try {
            const allData = await Utils.fetchAPI('getTransactions', { userId: user.ID, role: user.Role });
            
            // Filter by Date Range
            Report.reportData = allData.filter(t => {
                return t.Tanggal >= Report.startDate && t.Tanggal <= Report.endDate;
            });
            
            // Reverse agar data terlama di atas (logika laporan akuntansi)
            Report.reportData.reverse(); 
            
            Report.renderTableResult();
        } catch (error) {} finally {
            btn.innerHTML = `<i class="fas fa-sync-alt"></i> Proses`;
            btn.disabled = false;
        }
    },

    renderTableResult: () => {
        const container = document.getElementById('report-result-container');
        let totalDebit = 0;
        let totalKredit = 0;

        let rowsHTML = Report.reportData.map((t, i) => {
            const isDebit = t.Jenis === 'Debit';
            const nominal = parseFloat(t.Nominal);
            if (isDebit) totalDebit += nominal; else totalKredit += nominal;

            return `
            <tr class="${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                <td class="px-6 py-3 whitespace-nowrap">${t.Tanggal}</td>
                <td class="px-6 py-3">${t.Keterangan}</td>
                <td class="px-6 py-3 text-right font-medium">${isDebit ? Utils.formatCurrency(nominal) : '-'}</td>
                <td class="px-6 py-3 text-right font-medium">${!isDebit ? Utils.formatCurrency(nominal) : '-'}</td>
            </tr>
            `;
        }).join('');

        if (Report.reportData.length === 0) {
            rowsHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-gray-500">Tidak ada transaksi pada rentang tanggal tersebut.</td></tr>`;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs text-gray-600 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            <th class="px-6 py-4 w-32">Tanggal</th>
                            <th class="px-6 py-4">Keterangan</th>
                            <th class="px-6 py-4 text-right w-40">Debit</th>
                            <th class="px-6 py-4 text-right w-40">Kredit</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                    <tfoot class="bg-gray-100 dark:bg-gray-900 font-bold text-gray-800 dark:text-white">
                        <tr>
                            <td colspan="2" class="px-6 py-4 text-right uppercase">Total:</td>
                            <td class="px-6 py-4 text-right text-green-600 dark:text-green-400">${Utils.formatCurrency(totalDebit)}</td>
                            <td class="px-6 py-4 text-right text-red-600 dark:text-red-400">${Utils.formatCurrency(totalKredit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    },

    printA4: () => {
        if (Report.reportData.length === 0) {
            Utils.showToast("Tidak ada data untuk dicetak. Silakan klik Proses terlebih dahulu.", "error");
            return;
        }

        const user = JSON.parse(localStorage.getItem('fin_user'));
        let totalDebit = 0; let totalKredit = 0;

        let rowsHTML = Report.reportData.map((t) => {
            const isDebit = t.Jenis === 'Debit';
            const nominal = parseFloat(t.Nominal);
            if (isDebit) totalDebit += nominal; else totalKredit += nominal;

            return `
            <tr>
                <td class="text-center">${t.Tanggal}</td>
                <td>${t.Keterangan}</td>
                <td class="text-right">${isDebit ? Utils.formatCurrency(nominal) : '-'}</td>
                <td class="text-right">${!isDebit ? Utils.formatCurrency(nominal) : '-'}</td>
            </tr>
            `;
        }).join('');

        // Buka Jendela Baru untuk Print
        const printWin = window.open('', '', 'width=900,height=650');
        printWin.document.write(`
            <html>
            <head>
                <title>Cetak Buku Besar - ${user.Nama}</title>
                <style>
                    @page { size: A4; margin: 20mm; }
                    body { font-family: 'Arial', sans-serif; font-size: 12px; color: #333; }
                    .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .header h2 { margin: 0 0 5px 0; font-size: 18px; text-transform: uppercase; }
                    .header p { margin: 0; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #777; padding: 8px; }
                    th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; font-size: 11px; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .tfoot-total { font-weight: bold; background-color: #e8e8e8; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>REKAP BUKU BESAR ${user.Nama.toUpperCase()}</h2>
                    <p>PERIODE: ${Report.startDate} s/d ${Report.endDate}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th width="15%">Tanggal</th>
                            <th width="45%">Keterangan</th>
                            <th width="20%" class="text-right">Debit</th>
                            <th width="20%" class="text-right">Kredit</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                    <tr class="tfoot-total">
                        <td colspan="2" class="text-right">TOTAL</td>
                        <td class="text-right">${Utils.formatCurrency(totalDebit)}</td>
                        <td class="text-right">${Utils.formatCurrency(totalKredit)}</td>
                    </tr>
                </table>
                <div style="text-align: right; margin-top: 40px; padding-right: 20px;">
                    <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</p>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `);
        printWin.document.close();
    }
};
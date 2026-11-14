// ==========================================
// FILE: Dashboard.js
// FUNGSI: UI Dashboard Admin (Cards, Chart, Table)
// ==========================================

const Dashboard = {
    // Variabel untuk menyimpan instance chart agar bisa di-destroy saat update
    chartInstance: null,

    render: async () => {
        const container = document.getElementById('content-area');
        // Skeleton loading modern
        container.innerHTML = `<div class="flex items-center justify-center h-full text-primary"><i class="fas fa-circle-notch fa-spin text-4xl"></i></div>`;
        
        try {
            // Default filter: Tahun Berjalan
            const currentYear = new Date().getFullYear();
            const data = await Utils.fetchAPI('getDashboardData', { tahun: currentYear });
            
            Dashboard.buildUI(container, data, currentYear);
        } catch (error) {
            container.innerHTML = `<div class="text-red-500 text-center mt-10">Gagal memuat Dashboard: ${error.message}</div>`;
        }
    },

    buildUI: (container, data, selectedYear) => {
        let html = `
            <!-- Filter Tahun -->
            <div class="flex justify-end mb-6">
                <div class="relative">
                    <select id="dash-year-filter" class="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm">
                        <option value="${selectedYear}">${selectedYear}</option>
                        <option value="${selectedYear - 1}">${selectedYear - 1}</option>
                        <option value="${selectedYear - 2}">${selectedYear - 2}</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500"><i class="fas fa-chevron-down text-xs"></i></div>
                </div>
            </div>

            <!-- Top Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-50"></div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Pengguna Aktif</p>
                    <h3 class="text-3xl font-bold text-gray-800 dark:text-white">${data.totalUsers}</h3>
                    <div class="mt-4 text-blue-500"><i class="fas fa-users"></i></div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full opacity-50"></div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Debit (${selectedYear})</p>
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${Utils.formatCurrency(data.totalDebit)}</h3>
                    <div class="mt-4 text-green-500"><i class="fas fa-arrow-down"></i> Pemasukan</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full opacity-50"></div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Kredit (${selectedYear})</p>
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${Utils.formatCurrency(data.totalKredit)}</h3>
                    <div class="mt-4 text-red-500"><i class="fas fa-arrow-up"></i> Pengeluaran</div>
                </div>
            </div>

            <!-- Middle Section: Chart & Top Users -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <!-- Chart Area (Memanjang) -->
                <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 class="font-semibold mb-4 text-gray-700 dark:text-gray-200">Statistik Debit & Kredit (${selectedYear})</h3>
                    <div class="relative h-64 w-full">
                        <canvas id="dashboardChart"></canvas>
                    </div>
                </div>
                
                <!-- Top Users Area -->
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
                    <h3 class="font-semibold text-gray-700 dark:text-gray-200">Peringkat Pengguna</h3>
                    <div class="p-4 rounded-lg bg-green-50 border border-green-100 dark:bg-green-900/10 dark:border-green-800/30 flex items-center justify-between">
                        <div>
                            <p class="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider mb-1">Debit Terbanyak</p>
                            <p class="font-bold text-gray-800 dark:text-gray-100">${data.topDebitUser.nama || 'Belum Ada'}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-green-600 dark:text-green-400">${Utils.formatCurrency(data.topDebitUser.total || 0)}</p>
                        </div>
                    </div>
                    
                    <div class="p-4 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-800/30 flex items-center justify-between">
                        <div>
                            <p class="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider mb-1">Kredit Terbanyak</p>
                            <p class="font-bold text-gray-800 dark:text-gray-100">${data.topKreditUser.nama || 'Belum Ada'}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-red-600 dark:text-red-400">${Utils.formatCurrency(data.topKreditUser.total || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Section: Recent Tables -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Tabel 10 Debit Terbaru -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 class="font-semibold text-gray-700 dark:text-gray-200">10 Debit Terbaru</h3>
                    </div>
                    <div class="table-container">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-gray-600 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                                <tr><th class="px-4 py-3">Tanggal</th><th class="px-4 py-3">User</th><th class="px-4 py-3 text-right">Nominal</th></tr>
                            </thead>
                            <tbody>
                                ${data.recentDebit.map((d, i) => `
                                <tr class="${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td class="px-4 py-3 whitespace-nowrap">${d.tanggal}</td>
                                    <td class="px-4 py-3 truncate max-w-[120px]">${d.username}</td>
                                    <td class="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">${Utils.formatCurrency(d.nominal)}</td>
                                </tr>`).join('') || `<tr><td colspan="3" class="px-4 py-6 text-center text-gray-500">Tidak ada data</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Tabel 10 Kredit Terbaru -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div class="p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 class="font-semibold text-gray-700 dark:text-gray-200">10 Kredit Terbaru</h3>
                    </div>
                    <div class="table-container">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-gray-600 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                                <tr><th class="px-4 py-3">Tanggal</th><th class="px-4 py-3">User</th><th class="px-4 py-3 text-right">Nominal</th></tr>
                            </thead>
                            <tbody>
                                ${data.recentKredit.map((d, i) => `
                                <tr class="${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td class="px-4 py-3 whitespace-nowrap">${d.tanggal}</td>
                                    <td class="px-4 py-3 truncate max-w-[120px]">${d.username}</td>
                                    <td class="px-4 py-3 text-right font-medium text-red-600 dark:text-red-400">${Utils.formatCurrency(d.nominal)}</td>
                                </tr>`).join('') || `<tr><td colspan="3" class="px-4 py-6 text-center text-gray-500">Tidak ada data</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Render Chart.js
        Dashboard.renderChart(data.chartData);

        // Event Listener untuk Filter Tahun
        document.getElementById('dash-year-filter').addEventListener('change', async (e) => {
            const newYear = e.target.value;
            container.innerHTML = `<div class="flex items-center justify-center h-full text-primary"><i class="fas fa-circle-notch fa-spin text-4xl"></i></div>`;
            const newData = await Utils.fetchAPI('getDashboardData', { tahun: newYear });
            Dashboard.buildUI(container, newData, newYear);
        });
    },

    renderChart: (chartData) => {
        const ctx = document.getElementById('dashboardChart').getContext('2d');
        
        // Hancurkan chart lama jika ada (agar tidak tumpang tindih saat filter tahun diubah)
        if (Dashboard.chartInstance) {
            Dashboard.chartInstance.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? '#374151' : '#e5e7eb';

        Dashboard.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
                datasets: [
                    {
                        label: 'Debit',
                        data: chartData.debit,
                        backgroundColor: '#10b981', // Emerald 500
                        borderRadius: 4,
                        barPercentage: 0.6
                    },
                    {
                        label: 'Kredit',
                        data: chartData.kredit,
                        backgroundColor: '#ef4444', // Red 500
                        borderRadius: 4,
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: textColor } },
                    tooltip: {
                        callbacks: {
                            label: (context) => context.dataset.label + ': ' + Utils.formatCurrency(context.raw)
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: gridColor }, 
                        ticks: { color: textColor, callback: (value) => value / 1000 + 'k' } // Singkat ribuan
                    },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                }
            }
        });
    }
};
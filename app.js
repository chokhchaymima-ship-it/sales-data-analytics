document.addEventListener('DOMContentLoaded', function () {
    if (typeof DASHBOARD_DATA === 'undefined') {
        console.error('DASHBOARD_DATA is not defined!');
        return;
    }

    // 1. Render KPI
    const kpi = DASHBOARD_DATA.KPI;
    if (kpi) {
        const elRev = document.getElementById('kpi-rev');
        if (elRev) elRev.innerText = '฿' + (kpi.TotalRevenue / 1000000).toFixed(2) + 'M';

        const elOrders = document.getElementById('kpi-orders');
        if (elOrders) elOrders.innerText = kpi.TotalOrders.toLocaleString();

        const elAov = document.getElementById('kpi-aov');
        if (elAov) elAov.innerText = '฿' + kpi.AOV.toLocaleString();

        const elDeliv = document.getElementById('kpi-deliv');
        if (elDeliv) elDeliv.innerText = kpi.AvgDeliveryDays + ' วัน';

        const elRating = document.getElementById('kpi-rating');
        if (elRating) elRating.innerText = kpi.AvgRating + ' / 5.0';

        const elEx = document.getElementById('kpi-ex');
        if (elEx) elEx.innerText = kpi.TotalExcluded.toLocaleString() + ' (' + kpi.ExcludedPercent + '%)';
    }

    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        return;
    }

    // Chart.js default font
    Chart.defaults.font.family = "'Prompt', sans-serif";

    // 2. Monthly Trend Chart
    const monthlyMonths = DASHBOARD_DATA.Monthly.map(m => m.Month);
    const monthlyRevs = DASHBOARD_DATA.Monthly.map(m => m.Revenue);
    const monthlyOrders = DASHBOARD_DATA.Monthly.map(m => m.Orders);

    const canvasMonthly = document.getElementById('monthlyChart');
    let monthlyChart = null;
    if (canvasMonthly) {
        monthlyChart = new Chart(canvasMonthly.getContext('2d'), {
            type: 'line',
            data: {
                labels: monthlyMonths,
                datasets: [{
                    label: 'ยอดขายสุทธิ (บาท)',
                    data: monthlyRevs,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#4f46e5',
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (c) {
                                return ' ยอดขาย: ฿' + Number(c.raw).toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (v) { return '฿' + (v / 1000).toLocaleString() + 'k'; }
                        },
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } }
                    }
                }
            }
        });

        // Toggle Monthly Metric
        const btnRev = document.getElementById('btn-chart-rev');
        const btnOrders = document.getElementById('btn-chart-orders');

        if (btnRev && btnOrders) {
            btnRev.addEventListener('click', function () {
                btnRev.className = "px-3 py-1 bg-white text-slate-900 font-medium rounded-md shadow-sm";
                btnOrders.className = "px-3 py-1 text-slate-600 hover:text-slate-900 font-medium rounded-md";
                monthlyChart.data.datasets[0].label = 'ยอดขายสุทธิ (บาท)';
                monthlyChart.data.datasets[0].data = monthlyRevs;
                monthlyChart.data.datasets[0].borderColor = '#4f46e5';
                monthlyChart.data.datasets[0].backgroundColor = 'rgba(79, 70, 229, 0.08)';
                monthlyChart.options.scales.y.ticks.callback = function (v) { return '฿' + (v / 1000).toLocaleString() + 'k'; };
                monthlyChart.options.plugins.tooltip.callbacks.label = function (c) { return ' ยอดขาย: ฿' + Number(c.raw).toLocaleString(); };
                monthlyChart.update();
            });

            btnOrders.addEventListener('click', function () {
                btnOrders.className = "px-3 py-1 bg-white text-slate-900 font-medium rounded-md shadow-sm";
                btnRev.className = "px-3 py-1 text-slate-600 hover:text-slate-900 font-medium rounded-md";
                monthlyChart.data.datasets[0].label = 'จำนวนออเดอร์';
                monthlyChart.data.datasets[0].data = monthlyOrders;
                monthlyChart.data.datasets[0].borderColor = '#059669';
                monthlyChart.data.datasets[0].backgroundColor = 'rgba(5, 150, 105, 0.08)';
                monthlyChart.options.scales.y.ticks.callback = function (v) { return v.toLocaleString(); };
                monthlyChart.options.plugins.tooltip.callbacks.label = function (c) { return ' ออเดอร์: ' + Number(c.raw).toLocaleString() + ' รายการ'; };
                monthlyChart.update();
            });
        }
    }

    // 3. Channel Chart (Donut)
    const canvasChannel = document.getElementById('channelChart');
    if (canvasChannel) {
        const channelLabels = DASHBOARD_DATA.ByChannel.map(c => c.Channel);
        const channelRevs = DASHBOARD_DATA.ByChannel.map(c => c.Revenue);
        new Chart(canvasChannel.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: channelLabels,
                datasets: [{
                    data: channelRevs,
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12 } },
                    tooltip: {
                        callbacks: {
                            label: function (c) {
                                const val = Number(c.raw);
                                const total = channelRevs.reduce((a, b) => a + b, 0);
                                const pct = ((val / total) * 100).toFixed(1);
                                return ' ' + c.label + ': ฿' + val.toLocaleString() + ' (' + pct + '%)';
                            }
                        }
                    }
                },
                cutout: '62%'
            }
        });
    }

    // 4. Category Chart (Bar)
    const canvasCategory = document.getElementById('categoryChart');
    if (canvasCategory) {
        const catLabels = DASHBOARD_DATA.ByCategory.map(c => c.Category);
        const catRevs = DASHBOARD_DATA.ByCategory.map(c => c.Revenue);
        new Chart(canvasCategory.getContext('2d'), {
            type: 'bar',
            data: {
                labels: catLabels,
                datasets: [{
                    label: 'ยอดขาย (บาท)',
                    data: catRevs,
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (c) { return ' ยอดขาย: ฿' + Number(c.raw).toLocaleString(); }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: function (v) { return '฿' + (v / 1000).toLocaleString() + 'k'; } },
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });
    }

    // 5. Region Chart (Horizontal Bar)
    const canvasRegion = document.getElementById('regionChart');
    if (canvasRegion) {
        const regionLabels = DASHBOARD_DATA.ByRegion.map(r => r.Region);
        const regionRevs = DASHBOARD_DATA.ByRegion.map(r => r.Revenue);
        new Chart(canvasRegion.getContext('2d'), {
            type: 'bar',
            data: {
                labels: regionLabels,
                datasets: [{
                    data: regionRevs,
                    backgroundColor: ['#0284c7', '#0d9488', '#16a34a', '#eab308', '#ea580c'],
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: function (c) { return ' ฿' + Number(c.raw).toLocaleString(); } }
                    }
                },
                scales: {
                    x: {
                        ticks: { callback: function (v) { return '฿' + (v / 1000).toLocaleString() + 'k'; } },
                        grid: { color: '#f1f5f9' }
                    },
                    y: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }

    // 6. Payment Chart (Pie)
    const canvasPayment = document.getElementById('paymentChart');
    if (canvasPayment) {
        const payLabels = DASHBOARD_DATA.ByPayment.map(p => p.Payment);
        const payOrders = DASHBOARD_DATA.ByPayment.map(p => p.Orders);
        new Chart(canvasPayment.getContext('2d'), {
            type: 'pie',
            data: {
                labels: payLabels,
                datasets: [{
                    data: payOrders,
                    backgroundColor: ['#2563eb', '#38bdf8', '#34d399', '#fbbf24', '#f87171'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: function (c) {
                                const val = Number(c.raw);
                                const total = payOrders.reduce((a, b) => a + b, 0);
                                const pct = ((val / total) * 100).toFixed(1);
                                return ' ' + c.label + ': ' + val.toLocaleString() + ' (' + pct + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // 7. Excluded Reasons Chart (Bar)
    const canvasExcluded = document.getElementById('excludedChart');
    if (canvasExcluded) {
        new Chart(canvasExcluded.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['หน้าร้านนอกเวลา', 'หน้าร้าน + COD', 'ยกเลิก + มีวันส่ง', 'อายุ < 20 บัตรเครดิต'],
                datasets: [{
                    data: [501, 402, 364, 294],
                    backgroundColor: '#f43f5e',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: function (c) { return ' จำนวน: ' + Number(c.raw) + ' รายการ'; } }
                    }
                },
                scales: {
                    x: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    y: { grid: { display: false }, ticks: { font: { size: 9 } } }
                }
            }
        });
    }

    // 8. Render Sample Table
    const tbody = document.getElementById('tableBody');
    const tableCount = document.getElementById('tableCount');
    const searchInput = document.getElementById('searchInput');
    const channelFilter = document.getElementById('channelFilter');

    if (typeof SAMPLE_ROWS !== 'undefined' && tbody) {
        function renderTable(data) {
            tbody.innerHTML = '';
            data.forEach(function (r) {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

                let statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800">สำเร็จ</span>';
                if (r['สถานะ'] === 'ยกเลิก') statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] bg-rose-100 text-rose-800">ยกเลิก</span>';
                if (r['สถานะ'] === 'คืนสินค้า') statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-800">คืนสินค้า</span>';

                tr.innerHTML =
                    '<td class="px-3 py-2 font-mono font-medium text-indigo-600">' + (r['รหัสคำสั่งซื้อ'] || '') + '</td>' +
                    '<td class="px-3 py-2 text-slate-500">' + (r['วันที่สั่งซื้อ'] || '') + ' ' + (r['เวลาสั่งซื้อ'] || '') + '</td>' +
                    '<td class="px-3 py-2">' + (r['รหัสลูกค้า'] || '') + ' (' + (r['อายุ'] || '') + '/' + (r['เพศ'] || '') + ')</td>' +
                    '<td class="px-3 py-2">' + (r['จังหวัด'] || '') + ' <span class="text-slate-400">(' + (r['ภาค'] || '') + ')</span></td>' +
                    '<td class="px-3 py-2">' + (r['ช่องทางการขาย'] || '') + '</td>' +
                    '<td class="px-3 py-2 font-medium text-slate-800">' + (r['ชื่อสินค้า'] || '') + '</td>' +
                    '<td class="px-3 py-2 text-right">' + (r['จำนวน'] || '') + '</td>' +
                    '<td class="px-3 py-2 text-right font-semibold text-slate-900">฿' + Number(r['ยอดรวมสุทธิ'] || 0).toLocaleString() + '</td>' +
                    '<td class="px-3 py-2 text-slate-600">' + (r['วิธีชำระเงิน'] || '') + '</td>' +
                    '<td class="px-3 py-2 text-center">' + statusBadge + '</td>';
                tbody.appendChild(tr);
            });
            if (tableCount) {
                tableCount.innerText = 'แสดง ' + data.length + ' รายการ (จากตัวอย่าง 100 รายการ)';
            }
        }

        renderTable(SAMPLE_ROWS);

        function filterTable() {
            const term = (searchInput ? searchInput.value : '').toLowerCase().trim();
            const channel = channelFilter ? channelFilter.value : '';

            const filtered = SAMPLE_ROWS.filter(function (r) {
                const matchChannel = !channel || r['ช่องทางการขาย'] === channel;
                const matchTerm = !term ||
                    (r['รหัสคำสั่งซื้อ'] && r['รหัสคำสั่งซื้อ'].toLowerCase().includes(term)) ||
                    (r['ชื่อสินค้า'] && r['ชื่อสินค้า'].toLowerCase().includes(term)) ||
                    (r['จังหวัด'] && r['จังหวัด'].toLowerCase().includes(term)) ||
                    (r['รหัสลูกค้า'] && r['รหัสลูกค้า'].toLowerCase().includes(term));
                return matchChannel && matchTerm;
            });
            renderTable(filtered);
        }

        if (searchInput) searchInput.addEventListener('input', filterTable);
        if (channelFilter) channelFilter.addEventListener('change', filterTable);
    }
});

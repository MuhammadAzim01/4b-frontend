import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NotificationBell from '../components/ui/NotificationBell';

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        inventoryValue: 0,
        monthlyRevenue: 0,
        productionOutput: 0,
        activeShipments: 0
    });

    // Production Graph Data
    const [graphFilter, setGraphFilter] = useState('6months'); // 6months, year, month, custom
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [graphData, setGraphData] = useState([]); // { label, production, sales }

    // Alert Data
    const [criticalAlerts, setCriticalAlerts] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                // Parallel Fetch
                const [inventoryRes, invoicesRes, productionRes, productsRes] = await Promise.all([
                    fetchWithAuth('inventory/items/?page_size=1000'),
                    fetchWithAuth('distributors/invoices/?page_size=3000'),
                    fetchWithAuth('production/runs/?page_size=1000'),
                    fetchWithAuth('warehouse/products/?page_size=1000') // For valuation
                ]);

                // 1. Inventory Value (Raw Materials + Finished Goods)
                const rawMaterials = inventoryRes.results || [];
                const products = productsRes.results || [];

                const rawValue = rawMaterials.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * 500), 0); // Est price 500 if missing
                const prodValue = products.reduce((sum, p) => sum + (parseFloat(p.stock_quantity || 0) * (parseFloat(p.price) || 100)), 0);
                const totalInventoryValue = rawValue + prodValue;

                // 2. Monthly Revenue
                const invoices = invoicesRes.results || [];
                const now = new Date();
                const currentMonthRevenue = invoices
                    .filter(inv => {
                        const d = new Date(inv.created_at);
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && (inv.status === 'paid' || inv.status === 'completed');
                    })
                    .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

                // 3. Production Output (This Month)
                const runs = productionRes.results || [];
                const currentMonthOutput = runs
                    .filter(r => {
                        const d = new Date(r.start_time);
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && r.status === 'completed';
                    })
                    .reduce((sum, r) => sum + parseFloat(r.quantity_produced || 0), 0);

                // 4. Active Shipments (Pending Invoices)
                const pendingShipments = invoices.filter(inv => inv.status === 'pending').length;


                // --- Graph Data Generation ---
                let labels = [];
                let grouping = 'month'; // 'month' or 'day'

                const getDaysArray = (s, e) => {
                    for (var a = [], d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) { a.push(new Date(d)); }
                    return a;
                };

                const getMonthsArray = (s, e) => {
                    // Logic for months 
                    // Simplified: for 6months/year we handle manually below
                };

                if (graphFilter === 'month') {
                    // Daily breakdown for current month
                    grouping = 'day';
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    labels = getDaysArray(startOfMonth, endOfMonth).map(d => ({
                        label: d.getDate().toString(),
                        date: d
                    }));
                } else if (graphFilter === 'custom' && startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 45) {
                        grouping = 'day';
                        labels = getDaysArray(start, end).map(d => ({
                            label: `${d.getDate()}/${d.getMonth() + 1}`,
                            date: d
                        }));
                    } else {
                        grouping = 'month';
                        // Generate months between range
                        const d = new Date(start);
                        while (d <= end) {
                            labels.push({
                                label: d.toLocaleString('default', { month: 'short' }),
                                month: d.getMonth(),
                                year: d.getFullYear()
                            });
                            d.setMonth(d.getMonth() + 1);
                        }
                    }
                } else if (graphFilter === 'year') {
                    grouping = 'month';
                    for (let i = 11; i >= 0; i--) {
                        const d = new Date();
                        d.setMonth(now.getMonth() - i);
                        labels.push({
                            month: d.getMonth(),
                            year: d.getFullYear(),
                            label: d.toLocaleString('default', { month: 'short' })
                        });
                    }
                } else {
                    // Default 6 months
                    grouping = 'month';
                    for (let i = 5; i >= 0; i--) {
                        const d = new Date();
                        d.setMonth(now.getMonth() - i);
                        labels.push({
                            month: d.getMonth(),
                            year: d.getFullYear(),
                            label: d.toLocaleString('default', { month: 'short' })
                        });
                    }
                }

                const chartData = labels.map(l => {
                    let salesMatch = false;
                    let prodMatch = false;

                    const monthSales = invoices
                        .filter(inv => {
                            const d = new Date(inv.created_at);
                            if (grouping === 'month') {
                                return d.getMonth() === l.month && d.getFullYear() === l.year && (inv.status === 'paid' || inv.status === 'completed');
                            } else {
                                // Day matching
                                return d.getDate() === l.date.getDate() && d.getMonth() === l.date.getMonth() && d.getFullYear() === l.date.getFullYear() && (inv.status === 'paid' || inv.status === 'completed');
                            }
                        })
                        .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

                    const monthProdUnits = runs
                        .filter(r => {
                            const d = new Date(r.start_time);
                            if (grouping === 'month') {
                                return d.getMonth() === l.month && d.getFullYear() === l.year && r.status === 'completed';
                            } else {
                                return d.getDate() === l.date.getDate() && d.getMonth() === l.date.getMonth() && r.status === 'completed' && d.getFullYear() === l.date.getFullYear();
                            }
                        })
                        .reduce((sum, r) => sum + parseFloat(r.quantity_produced || 0), 0);

                    return {
                        label: l.label,
                        sales: monthSales,
                        production: monthProdUnits * 200 // Scaling
                    };
                });

                // Normalize
                const maxVal = Math.max(...chartData.map(d => Math.max(d.sales, d.production)));
                const normalizedChart = chartData.map(d => ({
                    ...d,
                    salesHt: maxVal > 0 ? (d.sales / maxVal) * 100 : 0,
                    prodHt: maxVal > 0 ? (d.production / maxVal) * 100 : 0
                }));

                setGraphData(normalizedChart);


                // --- Alerts Widget ---
                const lowStock = rawMaterials
                    .filter(i => parseFloat(i.quantity) < 20)
                    .map(i => ({ type: 'stock', msg: `Low Stock: ${i.name}`, time: 'Now' }))
                    .slice(0, 3);

                setCriticalAlerts(lowStock);

                setMetrics({
                    inventoryValue: totalInventoryValue,
                    monthlyRevenue: currentMonthRevenue,
                    productionOutput: currentMonthOutput,
                    activeShipments: pendingShipments
                });

            } catch (err) {
                console.error("Dashboard Load Error", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (graphFilter === 'custom' && (!startDate || !endDate)) {
            // Wait for dates
        } else {
            loadDashboardData();
        }

    }, [graphFilter, startDate, endDate]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    if (isLoading && graphFilter !== 'custom') return <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background">
            <header className="flex items-center justify-between px-8 py-6 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Operations Dashboard</h2>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        AD
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-6 px-8 py-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <DashboardCard title="Total Inventory Value" value={formatCurrency(metrics.inventoryValue)} icon="inventory_2" color="blue" />
                    <DashboardCard title="Monthly Revenue" value={formatCurrency(metrics.monthlyRevenue)} icon="payments" color="green" />
                    <DashboardCard title="Production Output" value={`${metrics.productionOutput.toLocaleString()} Units`} icon="precision_manufacturing" color="purple" />
                    <DashboardCard title="Pending Shipments" value={metrics.activeShipments} icon="local_shipping" color="orange" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Chart Section */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Production vs Sales</h3>
                            <div className="flex items-center gap-2">
                                {graphFilter === 'custom' && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-1 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                        <span className="text-slate-500">-</span>
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-1 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                    </div>
                                )}
                                <select
                                    value={graphFilter}
                                    onChange={(e) => setGraphFilter(e.target.value)}
                                    className="rounded-lg border-gray-300 bg-gray-50 text-sm py-1 px-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="month">This Month</option>
                                    <option value="6months">Last 6 Months</option>
                                    <option value="year">This Year</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex h-64 items-end gap-4 border-b border-gray-200 pb-4 dark:border-gray-800 mt-4 overflow-x-auto">
                            <div className="flex w-full min-w-[300px] items-end justify-between gap-2 md:gap-4 px-2">
                                {graphData.length > 0 ? graphData.map((d, i) => (
                                    <div key={i} className="flex flex-1 flex-col items-center gap-2 group relative min-w-[20px]">
                                        <div className="flex w-full items-end justify-center gap-0.5 md:gap-1 h-48">
                                            <div
                                                style={{ height: `${d.prodHt}%` }}
                                                className="w-2 md:w-5 rounded-t-sm bg-blue-500 opacity-80 hover:opacity-100 transition-all"
                                                title={`Production: ${d.production}`}
                                            ></div>
                                            <div
                                                style={{ height: `${d.salesHt}%` }}
                                                className="w-2 md:w-5 rounded-t-sm bg-green-500 opacity-80 hover:opacity-100 transition-all"
                                                title={`Sales: ${d.sales}`}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 rotate-0 truncate w-full text-center">{d.label}</span>
                                    </div>
                                )) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data for selected period</div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Production (Val Est.)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Sales Value</span>
                            </div>
                        </div>
                    </div>

                    {/* Alert Widget */}
                    <div className="col-span-1 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Alerts</h3>
                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px]">
                            {criticalAlerts.length > 0 ? criticalAlerts.map((alert, idx) => (
                                <div key={idx} className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                        <span className="material-symbols-outlined text-sm">warning</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{alert.msg}</p>
                                        <p className="text-xs text-gray-500 mt-1">Action needed immediately</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500 text-center py-4">No critical alerts. Operations normal.</p>
                            )}
                        </div>
                        <button className="mt-auto w-full py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition">View All Notifications</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardCard = ({ title, value, icon, color }) => (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
        <div className="flex items-center gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-${color}-100 text-${color}-600`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <p className="font-medium text-gray-600 dark:text-gray-400">{title}</p>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
);

export default Dashboard;

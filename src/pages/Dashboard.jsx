import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NotificationBell from '../components/ui/NotificationBell';

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        total_inventory_value: 0,
        monthly_revenue: 0,
        monthly_production_output: 0,
        total_waste_count: 0,
        waste_materials: [],
        pending_invoices_count: 0,
        low_stock_alerts: { total: 0, inventory: 0, products: 0 },
        top_distributors: []
    });

    // Production vs Sales Graph Data
    const [graphFilter, setGraphFilter] = useState('6months');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [graphData, setGraphData] = useState([]);

    // Alerts Data
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        if (graphFilter === 'custom' && (!startDate || !endDate)) {
            return;
        }
        loadGraphData();
    }, [graphFilter, startDate, endDate]);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const [metricsRes, alertsRes] = await Promise.all([
                fetchWithAuth('dashboard/metrics/'),
                fetchWithAuth('dashboard/alerts/')
            ]);

            setMetrics(metricsRes?.data || metricsRes || {});
            setAlerts((alertsRes?.data?.alerts || alertsRes?.alerts || []).slice(0, 5));
        } catch (err) {
            console.error("Dashboard Load Error", err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadGraphData = async () => {
        try {
            const params = new URLSearchParams({ period: graphFilter });
            if (graphFilter === 'custom' && startDate && endDate) {
                params.append('start_date', startDate);
                params.append('end_date', endDate);
            }

            const graphRes = await fetchWithAuth(`dashboard/production-vs-sales/?${params.toString()}`);
            const data = graphRes?.data?.data || graphRes?.data || [];
            
            // Normalize for chart display
            const maxVal = Math.max(
                ...data.map(d => Math.max(parseFloat(d.production || 0), parseFloat(d.sales || 0)))
            );
            
            const normalized = data.map(d => ({
                label: d.label,
                production: parseFloat(d.production || 0),
                sales: parseFloat(d.sales || 0),
                prodHt: maxVal > 0 ? (parseFloat(d.production || 0) / maxVal) * 100 : 0,
                salesHt: maxVal > 0 ? (parseFloat(d.sales || 0) / maxVal) * 100 : 0
            }));

            setGraphData(normalized);
        } catch (err) {
            console.error("Graph Load Error", err);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'red';
            case 'medium': return 'orange';
            case 'low': return 'yellow';
            default: return 'gray';
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

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
                </div>
            </header>

            <div className="flex flex-col gap-6 px-8 py-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <DashboardCard
                        title="Total Inventory Value"
                        value={formatCurrency(metrics.total_inventory_value)}
                        icon="inventory_2"
                        color="blue"
                        subtitle="Raw materials + Finished products"
                    />
                    <DashboardCard
                        title="Monthly Revenue"
                        value={formatCurrency(metrics.monthly_revenue)}
                        icon="payments"
                        color="green"
                        subtitle="Actual received amounts"
                    />
                    <DashboardCard
                        title="Production Output"
                        value={`${parseFloat(metrics.monthly_production_output || 0).toLocaleString()} Units`}
                        icon="precision_manufacturing"
                        color="purple"
                        subtitle="This month"
                    />
                    <DashboardCard
                        title="Total Waste"
                        value={`${parseFloat(metrics.total_waste_count || 0).toFixed(1)} Units`}
                        icon="delete"
                        color="orange"
                        subtitle={`${metrics.waste_materials?.length || 0} materials`}
                    />
                </div>

                {/* Second Row: Alerts & Stats */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pending Invoices</h3>
                            <span className="material-symbols-outlined text-red-600">receipt_long</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.pending_invoices_count}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">With outstanding balance</p>
                    </div>

                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Low Stock Alerts</h3>
                            <span className="material-symbols-outlined text-yellow-600">warning</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.low_stock_alerts?.total || 0}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                            {metrics.low_stock_alerts?.inventory || 0} inventory, {metrics.low_stock_alerts?.products || 0} products
                        </p>
                    </div>

                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Critical Alerts</h3>
                            <span className="material-symbols-outlined text-red-600">priority_high</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{alerts.length}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Require immediate attention</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Production vs Sales Chart */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Production vs Sales</h3>
                            <div className="flex items-center gap-2">
                                {graphFilter === 'custom' && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            className="p-1 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white text-xs"
                                        />
                                        <span className="text-slate-500">-</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="p-1 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white text-xs"
                                        />
                                    </div>
                                )}
                                <select
                                    value={graphFilter}
                                    onChange={(e) => setGraphFilter(e.target.value)}
                                    className="rounded-lg border-gray-300 bg-gray-50 text-sm py-1.5 px-3 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                className="w-2 md:w-5 rounded-t-sm bg-purple-500 opacity-80 hover:opacity-100 transition-all"
                                                title={`Production: ${d.production} units`}
                                            ></div>
                                            <div
                                                style={{ height: `${d.salesHt}%` }}
                                                className="w-2 md:w-5 rounded-t-sm bg-green-500 opacity-80 hover:opacity-100 transition-all"
                                                title={`Sales: ${d.sales} units`}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 rotate-0 truncate w-full text-center">
                                            {d.label}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                        No data for selected period
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-purple-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Production (Units)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Sales (Units)</span>
                            </div>
                        </div>
                    </div>

                    {/* Critical Alerts Widget */}
                    <div className="col-span-1 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Critical Alerts</h3>
                        <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
                            {alerts.length > 0 ? alerts.map((alert, idx) => {
                                const color = getSeverityColor(alert.severity);
                                return (
                                    <div key={idx} className={`flex gap-3 p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-200 dark:border-${color}-800`}>
                                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400`}>
                                            <span className="material-symbols-outlined text-sm">
                                                {alert.type === 'low_stock' || alert.type === 'low_stock_product' ? 'inventory' :
                                                 alert.type === 'high_due' ? 'account_balance_wallet' :
                                                 'manufacturing'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                                                {alert.title}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {alert.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No critical alerts. Operations normal.
                                </p>
                            )}
                        </div>
                        <button className="mt-auto w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                            View All Alerts
                        </button>
                    </div>
                </div>

                {/* Waste Materials Breakdown */}
                {metrics.waste_materials && metrics.waste_materials.length > 0 && (
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-600">delete</span>
                            Waste Materials Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {metrics.waste_materials.map((material, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="font-semibold text-slate-900 dark:text-white">{material.name}</p>
                                    <p className="text-2xl font-bold text-orange-600 mt-2">
                                        {parseFloat(material.quantity).toFixed(2)} {material.unit}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                        From {material.count} batch{material.count !== 1 ? 'es' : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Distributors */}
                {metrics.top_distributors && metrics.top_distributors.length > 0 && (
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">star</span>
                            Top Distributors by Revenue
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {metrics.top_distributors.map((distributor, idx) => (
                                <div key={distributor.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                                {distributor.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-gray-400">{distributor.area}</p>
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(distributor.revenue)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                        Balance: {formatCurrency(distributor.balance)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DashboardCard = ({ title, value, icon, color, subtitle }) => (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
        <div className="flex items-center gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <p className="font-medium text-gray-600 dark:text-gray-400 text-sm">{title}</p>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
);

export default Dashboard;

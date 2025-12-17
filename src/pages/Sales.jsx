import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Sales = () => {
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [dateFilter, setDateFilter] = useState('month'); // 'month', 'year', 'custom', 'all'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [distributorFilter, setDistributorFilter] = useState('all');
    const [productFilter, setProductFilter] = useState('all');

    // Raw Data
    const [rawData, setRawData] = useState({
        invoices: [],
        products: []
    });

    // Valid Lists for Dropdowns
    const [availableDistributors, setAvailableDistributors] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);

    // Metrics
    const [metrics, setMetrics] = useState({
        revenue: 0,
        unitsSold: 0,
        netProfit: 0,
        margin: 0,
        avgOrderValue: 0,
        distributorSales: [],
        topProducts: [],
        transactions: []
    });

    // Report
    const [showReportModal, setShowReportModal] = useState(false);
    const reportRef = useRef(null);

    // 1. Fetch Data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [invoicesRes, productsRes] = await Promise.all([
                    fetchWithAuth('distributors/invoices/?page_size=3000'),
                    fetchWithAuth('warehouse/products/?page_size=1000')
                ]);

                const invoices = invoicesRes.results || [];
                const products = productsRes.results || [];

                // Extract Unique Options
                const distSet = new Set();
                const prodSet = new Set();

                invoices.forEach(inv => {
                    if (inv.distributor_name) distSet.add(inv.distributor_name);
                    const items = Array.isArray(inv.items) ? inv.items : [];
                    items.forEach(item => {
                        if (item.product_name) prodSet.add(item.product_name);
                    });
                });

                setAvailableDistributors(Array.from(distSet).sort());
                setAvailableProducts(Array.from(prodSet).sort());

                setRawData({ invoices, products });
            } catch (error) {
                console.error("Failed to load sales data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // 2. Calculate Metrics on Filter Change
    useEffect(() => {
        if (isLoading && !rawData.invoices.length) return;

        const { invoices } = rawData;

        // Date Filtering
        const isWithinDateRange = (dateStr) => {
            if (!dateStr) return false;
            const d = new Date(dateStr);
            const now = new Date();
            if (dateFilter === 'all') return true;
            if (dateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (dateFilter === 'year') return d.getFullYear() === now.getFullYear();
            if (dateFilter === 'custom' && startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                return d >= start && d <= end;
            }
            return true;
        };

        const filteredInvoices = invoices.filter(inv => {
            const dateMatch = isWithinDateRange(inv.created_at);
            const statusMatch = (inv.status === 'paid' || inv.status === 'completed');

            // Distributor Filter
            const distMatch = distributorFilter === 'all' || inv.distributor_name === distributorFilter;

            // Product Filter (Need to check if invoice contains the product)
            // If filtering by product, we only include invoices that contain it, 
            // BUT metrics calculation needs to be more granular.
            // For boolean filter here, we check constraint.
            let productMatch = true;
            if (productFilter !== 'all') {
                const items = Array.isArray(inv.items) ? inv.items : [];
                productMatch = items.some(item => item.product_name === productFilter);
            }

            return dateMatch && statusMatch && distMatch && productMatch;
        });

        // -- Aggregation --
        let totalRevenue = 0;
        let totalUnits = 0;
        let totalCost = 0;

        const distMap = {};
        const prodMap = {};

        filteredInvoices.forEach(inv => {
            // If product filter is active, we ONLY sum up the lines for that product
            const items = Array.isArray(inv.items) ? inv.items : [];
            let invRevenue = 0;

            items.forEach(item => {
                const name = item.product_name || "Unknown Product";

                // If product filter is applied, skip non-matching items
                if (productFilter !== 'all' && name !== productFilter) return;

                const qty = parseFloat(item.quantity || 0);
                const rev = parseFloat(item.amount || (qty * item.unit_price) || 0);

                totalUnits += qty;
                invRevenue += rev;

                // Product Stats
                if (!prodMap[name]) prodMap[name] = { quantity: 0, revenue: 0 };
                prodMap[name].quantity += qty;
                prodMap[name].revenue += rev;

                // Simple Cost Est (70% of rev = 30% margin default)
                totalCost += (rev * 0.7);
            });

            // For distributor map, we add the calculated revenue for this invoice (filtered or full)
            if (invRevenue > 0) {
                const distName = inv.distributor_name || "Unknown Distributor";
                distMap[distName] = (distMap[distName] || 0) + invRevenue;
            }

            totalRevenue += invRevenue;
        });

        const netProfit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        const avgOrderValue = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;

        // Rankings
        const distributorSales = Object.entries(distMap)
            .map(([name, amount]) => ({
                name,
                amount,
                percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount);

        const topProducts = Object.entries(prodMap)
            .map(([name, data]) => ({
                name,
                quantity: data.quantity,
                revenue: data.revenue
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // Recent Transactions: Show filtered invoices, but total_amount should reflect filter?
        // Usually transaction list shows the Invoice Total. 
        // Showing "Invoice Total" might be confusing if we filtered by product (Total > filtered amount).
        // Decision: Show the invoice, but maybe add a note or just show total invoice amount.
        const transactions = filteredInvoices
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 50);

        setMetrics({
            revenue: totalRevenue,
            unitsSold: totalUnits,
            netProfit,
            margin,
            avgOrderValue,
            distributorSales,
            topProducts,
            transactions
        });

    }, [rawData, dateFilter, startDate, endDate, distributorFilter, productFilter, isLoading]);

    // -- Utils --
    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    const formatDate = (d) => new Date(d).toLocaleDateString();

    const handleGenerateReport = () => setShowReportModal(true);

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const finalWidth = pdfWidth - 20;
            const finalHeight = (imgHeight * finalWidth) / imgWidth;
            pdf.addImage(imgData, 'PNG', 10, 10, finalWidth, finalHeight);
            pdf.save(`4B_Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            setShowReportModal(false);
        } catch (err) {
            console.error("PDF Fail", err);
        }
    };

    const getReportTitle = () => {
        let title = "Sales Performance Report";
        if (distributorFilter !== 'all') title = `Sales Report: ${distributorFilter}`;
        else if (productFilter !== 'all') title = `Sales Report: ${productFilter}`;
        return title;
    };

    const getRangeText = () => {
        let text = dateFilter === 'month' ? 'Current Month' : dateFilter === 'year' ? 'Current Year' : dateFilter === 'custom' ? `${formatDate(startDate)}-${formatDate(endDate)}` : 'All Time';
        if (productFilter !== 'all') text += ` • Product: ${productFilter}`;
        return text;
    };

    if (isLoading && !rawData.invoices.length) {
        return <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales & Reports</h1>
                        <p className="text-slate-500">Comprehensive sales analysis and reporting.</p>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <div className="flex flex-wrap items-center gap-3 justify-end w-full">
                            {/* Date Filter */}
                            <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 p-1">
                                {['month', 'year', 'all', 'custom'].map(f => (
                                    <button key={f} onClick={() => setDateFilter(f)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded capitalize ${dateFilter === f ? 'bg-slate-100 dark:bg-slate-700 font-bold' : 'text-slate-500'}`}>
                                        {f === 'all' ? 'All Time' : f}
                                    </button>
                                ))}
                            </div>
                            {dateFilter === 'custom' && (
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200">
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs border-none bg-transparent" />
                                    <span>-</span>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs border-none bg-transparent" />
                                </div>
                            )}
                            <button onClick={handleGenerateReport} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">
                                <span className="material-symbols-outlined">description</span> Generate Report
                            </button>
                        </div>

                        {/* Secondary Filters */}
                        <div className="flex flex-wrap items-center gap-3 justify-end w-full">
                            <select
                                value={distributorFilter}
                                onChange={(e) => setDistributorFilter(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Distributors</option>
                                {availableDistributors.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>

                            <select
                                value={productFilter}
                                onChange={(e) => setProductFilter(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Products</option>
                                {availableProducts.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <KPICard title="Total Revenue" value={formatCurrency(metrics.revenue)} icon="payments" color="blue" />
                    <KPICard title="Units Sold" value={metrics.unitsSold.toLocaleString()} icon="inventory_2" color="orange" />
                    <KPICard title="Net Profit (Est.)" value={formatCurrency(metrics.netProfit)} icon="account_balance" color="green" />
                    <KPICard title="Avg Order Value" value={formatCurrency(metrics.avgOrderValue)} icon="shopping_cart" color="purple" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Distributor Sales */}
                    <div className="lg:col-span-2 bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Sales by Distributor</h3>
                        <div className="space-y-4">
                            {metrics.distributorSales.slice(0, 5).map((d, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700 dark:text-gray-300">{d.name}</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(d.amount)} ({d.percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${d.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                            {metrics.distributorSales.length === 0 && <p className="text-slate-400 text-sm">No sales data available.</p>}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Top Products</h3>
                        <div className="space-y-3">
                            {metrics.topProducts.map((p, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-none">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-white">{p.name}</p>
                                        <p className="text-xs text-slate-500">{p.quantity} units</p>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(p.revenue)}</span>
                                </div>
                            ))}
                            {metrics.topProducts.length === 0 && <p className="text-slate-400 text-sm">No product data available.</p>}
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 dark:text-gray-400">
                            <thead className="text-xs bg-slate-50 dark:bg-gray-800 uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Distributor</th>
                                    <th className="px-6 py-3">Items</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.transactions.map((t, i) => (
                                    <tr key={i} className="border-b border-slate-100 dark:border-gray-700">
                                        <td className="px-6 py-4">{formatDate(t.created_at)}</td>
                                        <td className="px-6 py-4 font-medium">{t.distributor_name}</td>
                                        <td className="px-6 py-4 max-w-xs truncate">
                                            {Array.isArray(t.items) ? t.items.map(it => `${it.product_name} x${it.quantity}`).join(', ') : 'Items data unavailable'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(t.total_amount)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full uppercase">{t.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {metrics.transactions.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No transactions found for peroid.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sales Report Preview</h2>
                            <button onClick={() => setShowReportModal(false)} className="p-2 rounded-full hover:bg-slate-100">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
                            <div ref={reportRef} className="bg-white text-slate-900 p-[40px] shadow-lg mx-auto max-w-[210mm] min-h-[297mm]" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                                {/* Report Header */}
                                <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
                                    <h1 className="text-3xl font-black text-slate-900 mb-2">4B-Food & Beverages</h1>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{getReportTitle()}</p>
                                    <p className="text-slate-400 text-xs mt-1">{getRangeText()} • Generated {new Date().toLocaleDateString()}</p>
                                </div>

                                {/* Summary Grid */}
                                <div className="grid grid-cols-4 gap-4 mb-8">
                                    <ReportStat label="Revenue" value={formatCurrency(metrics.revenue)} />
                                    <ReportStat label="Units Sold" value={metrics.unitsSold.toLocaleString()} />
                                    <ReportStat label="Net Profit" value={formatCurrency(metrics.netProfit)} />
                                    <ReportStat label="Margin" value={metrics.margin.toFixed(1) + '%'} />
                                </div>

                                {/* Distributor Breakdown */}
                                <h3 className="text-sm font-bold uppercase border-b border-slate-200 pb-2 mb-4 mt-8">Distributor Performance</h3>
                                <table className="w-full text-sm mb-8">
                                    <thead>
                                        <tr className="text-left text-slate-500 border-b border-slate-200">
                                            <th className="pb-2">Distributor</th>
                                            <th className="pb-2 text-right">Revenue</th>
                                            <th className="pb-2 text-right">Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.distributorSales.map((d, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                <td className="py-2">{d.name}</td>
                                                <td className="py-2 text-right font-medium">{formatCurrency(d.amount)}</td>
                                                <td className="py-2 text-right text-slate-500">{d.percentage.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Top Products */}
                                <h3 className="text-sm font-bold uppercase border-b border-slate-200 pb-2 mb-4 mt-8">Top Selling Products</h3>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500 border-b border-slate-200">
                                            <th className="pb-2">Product</th>
                                            <th className="pb-2 text-right">Units</th>
                                            <th className="pb-2 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.topProducts.slice(0, 10).map((p, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                <td className="py-2">{p.name}</td>
                                                <td className="py-2 text-right">{p.quantity}</td>
                                                <td className="py-2 text-right font-medium">{formatCurrency(p.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-16 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
                                    CONFIDENTIAL • INTERNAL USE ONLY • 4B-Food & Beverages
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-white">
                            <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Close</button>
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                <span className="material-symbols-outlined">download</span> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 bg-${color}-100 text-${color}-600 rounded-lg`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">{title}</h3>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
);

const ReportStat = ({ label, value }) => (
    <div className="bg-slate-50 p-4 rounded border border-slate-100 text-center">
        <p className="text-xs text-slate-500 uppercase font-bold mb-1">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
);

export default Sales;

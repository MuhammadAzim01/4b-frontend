import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Financials = () => {
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [dateFilter, setDateFilter] = useState('month'); // 'month', 'year', 'custom', 'all'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Raw Data (Fetched Once)
    const [rawData, setRawData] = useState({
        invoices: [],
        expenses: [],
        rawMaterials: [],
        finishedGoods: []
    });

    // Calculated Metrics
    const [metrics, setMetrics] = useState({
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        margin: 0,
        assets: 0,
        receivables: 0,
        cashFlow: 0,
        cashInHand: 0
    });

    // Report Modal State
    const [showReportModal, setShowReportModal] = useState(false);
    const reportRef = useRef(null);

    // Initial Data Fetch (Runs once)
    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [invoicesRes, expensesRes, rawMaterialsRes, finishedGoodsRes] = await Promise.all([
                    fetchWithAuth('distributors/invoices/?page_size=3000'),
                    fetchWithAuth('expenses/?page_size=3000'),
                    fetchWithAuth('inventory/items/?page_size=1000'),
                    fetchWithAuth('warehouse/products/?page_size=1000')
                ]);

                setRawData({
                    invoices: invoicesRes.results || [],
                    expenses: expensesRes.results || [],
                    rawMaterials: rawMaterialsRes.results || [],
                    finishedGoods: finishedGoodsRes.results || []
                });
            } catch (error) {
                console.error("Failed to load financial data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Filter Logic (Runs when filters or data change)
    useEffect(() => {
        // If still loading or no data yet (and not meant to be empty), simplified check
        if (isLoading && !rawData.invoices.length && !rawData.expenses.length) return;

        const { invoices, expenses, rawMaterials, finishedGoods } = rawData;

        // Helper to check date range
        const isWithinRange = (dateStr) => {
            if (!dateStr) return false;
            const d = new Date(dateStr);
            const now = new Date();

            if (dateFilter === 'all') return true;
            if (dateFilter === 'month') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            if (dateFilter === 'year') {
                return d.getFullYear() === now.getFullYear();
            }
            if (dateFilter === 'custom' && startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                return d >= start && d <= end;
            }
            return true;
        };

        // --- CUMULATIVE METRICS (All Time) ---
        const allTimeRevenue = invoices
            .filter(inv => inv.status === 'paid' || inv.status === 'completed')
            .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

        const allTimeExpenses = expenses
            .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

        const cashInHand = allTimeRevenue - allTimeExpenses;

        const currentReceivables = invoices
            .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
            .reduce((sum, inv) => sum + parseFloat(inv.balance_due || inv.total_amount || 0), 0);

        const rawMatValue = rawMaterials.reduce((sum, item) => {
            return sum + (parseFloat(item.available_quantity || 0) * parseFloat(item.available_price || 0));
        }, 0);

        const finishedGoodsValue = finishedGoods.reduce((sum, item) => {
            return sum + (parseFloat(item.stock_quantity || 0) * (parseFloat(item.price || item.unit_price) || 100));
        }, 0);
        const totalAssets = rawMatValue + finishedGoodsValue;

        // --- PERIOD METRICS (Filtered) ---
        const filteredInvoices = invoices.filter(inv => isWithinRange(inv.created_at));
        const filteredExpenses = expenses.filter(exp => isWithinRange(exp.date || exp.created_at));

        const periodRevenue = filteredInvoices
            .filter(inv => inv.status === 'paid' || inv.status === 'completed')
            .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

        const periodExpenses = filteredExpenses
            .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

        const periodNetProfit = periodRevenue - periodExpenses;
        const periodMargin = periodRevenue > 0 ? (periodNetProfit / periodRevenue) * 100 : 0;

        setMetrics({
            revenue: periodRevenue,
            expenses: periodExpenses,
            netProfit: periodNetProfit,
            margin: periodMargin,
            assets: totalAssets,
            receivables: currentReceivables,
            cashFlow: periodNetProfit,
            cashInHand: cashInHand
        });

    }, [rawData, dateFilter, startDate, endDate, isLoading]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleGenerateReport = () => {
        setShowReportModal(true);
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            // Adjust to full width of PDF
            const finalWidth = pdfWidth - 20; // 10mm margin L/R
            const finalHeight = (imgHeight * finalWidth) / imgWidth;

            pdf.addImage(imgData, 'PNG', 10, 10, finalWidth, finalHeight);
            pdf.save(`4B_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);

            setShowReportModal(false);
        } catch (err) {
            console.error("PDF generation failed:", err);
            // alert("Failed to generate PDF. Please try again."); // Removed alert for cleaner UX, can use toast if available
        }
    };

    if (isLoading && !rawData.invoices.length) { // Initial load only
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Helper for Range Text
    const getRangeText = () => {
        if (dateFilter === 'custom' && startDate && endDate) return `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
        if (dateFilter === 'month') return 'Current Month';
        if (dateFilter === 'year') return 'Current Year';
        return 'All Time';
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Header with Tools */}
                <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Financials Overview</h1>
                        <p className="text-slate-500 dark:text-gray-400">Real-time financial performance indicators.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Filters */}
                        <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                            {['month', 'year', 'all', 'custom'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setDateFilter(f)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${dateFilter === f
                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    {f === 'all' ? 'All Time' : f}
                                </button>
                            ))}
                        </div>

                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="text-xs border-none bg-transparent outline-none text-slate-700 dark:text-white"
                                />
                                <span className="text-slate-300">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-xs border-none bg-transparent outline-none text-slate-700 dark:text-white"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleGenerateReport}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-lg">description</span>
                            Generate Report
                        </button>
                    </div>
                </div>

                {/* Primary Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Revenue */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">Total Revenue</h3>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.revenue)}</p>
                        <p className="text-xs text-slate-400 mt-1">In selected period</p>
                    </div>

                    {/* Net Profit */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${metrics.netProfit >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">Net Profit</h3>
                        </div>
                        <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                            {formatCurrency(metrics.netProfit)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">In selected period</p>
                    </div>

                    {/* Margin */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg">
                                <span className="material-symbols-outlined">percent</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">Profit Margin</h3>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.margin.toFixed(1)}%</p>
                        <p className="text-xs text-slate-400 mt-1">In selected period</p>
                    </div>

                    {/* Cash In Hand (Cumulative) */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 ring-1 ring-green-100 dark:ring-green-900">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-lg">
                                <span className="material-symbols-outlined">savings</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-600 dark:text-gray-300">Cash in Hand</h3>
                        </div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(metrics.cashInHand)}</p>
                        <p className="text-xs text-slate-400 mt-1">Cumulative Liquid Cash</p>
                    </div>
                </div>

                {/* Secondary Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Expenses Breakdown */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Total Expenses</h3>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.expenses)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-4">
                            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500">Recorded operational expenses in period.</p>
                    </div>

                    {/* Assets Value */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Asset Valuation</h3>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.assets)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-4">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500">Approximate value of Current Inventory.</p>
                    </div>

                    {/* Receivables */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Unpaid Invoices</h3>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.receivables)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-4">
                            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-xs text-slate-500">Total Outstanding Debt (Receivables).</p>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Report Preview</h2>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950">
                            {/* Report Content Reference */}
                            <div
                                ref={reportRef}
                                className="bg-white text-slate-900 p-[40px] shadow-lg mx-auto max-w-[210mm] min-h-[297mm]"
                                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                            >
                                {/* HEADER */}
                                <div className="text-center border-b-2 border-slate-100 pb-6 mb-8">
                                    <h1 className="text-3xl font-black text-blue-700 mb-2">4B-Food & Beverages</h1>
                                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Financial Performance Report</p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Period: {getRangeText()} • Generated: {new Date().toLocaleDateString()}
                                    </p>
                                </div>

                                {/* SECTION 1: EXECUTIVE SUMMARY */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold uppercase text-slate-800 border-l-4 border-blue-600 pl-3 mb-4">
                                        Executive Summary
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Revenue</p>
                                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.revenue)}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Expenses</p>
                                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.expenses)}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Net Profit</p>
                                            <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(metrics.netProfit)}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Profit Margin</p>
                                            <p className="text-2xl font-bold text-slate-900">{metrics.margin.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: LIQUIDITY & ASSETS */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold uppercase text-slate-800 border-l-4 border-blue-600 pl-3 mb-4">
                                        Liquidity & Assets (Snapshot)
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 border-b border-slate-100">
                                            <span className="text-slate-600 font-medium">Cash in Hand (Cumulative)</span>
                                            <span className="text-slate-900 font-bold text-lg">{formatCurrency(metrics.cashInHand)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 border-b border-slate-100">
                                            <span className="text-slate-600 font-medium">Current Assets Valuation</span>
                                            <span className="text-slate-900 font-bold text-lg">{formatCurrency(metrics.assets)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 border-b border-slate-100">
                                            <span className="text-slate-600 font-medium">Outstanding Receivables</span>
                                            <span className="text-slate-900 font-bold text-lg">{formatCurrency(metrics.receivables)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="mt-16 pt-6 border-t border-slate-100 text-center">
                                    <p className="text-xs text-slate-400">
                                        This document is generated automatically by the 4B-Food & Beverages Management System.
                                    </p>
                                    <p className="text-[10px] text-slate-300 mt-1">CONFIDENTIAL • INTERNAL USE ONLY</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                            >
                                <span className="material-symbols-outlined text-lg">download</span>
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Financials;

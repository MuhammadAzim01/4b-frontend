import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Sales = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Filters
    const [dateFilter, setDateFilter] = useState('month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedDistributor, setSelectedDistributor] = useState('');
    const [distributors, setDistributors] = useState([]);

    // Data States
    const [metrics, setMetrics] = useState({
        total_revenue: 0,
        units_sold: 0,
        net_profit: 0,
        avg_order_value: 0,
        period_start: '',
        period_end: ''
    });
    const [topProducts, setTopProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [transactionPage, setTransactionPage] = useState(1);
    const [transactionPagination, setTransactionPagination] = useState({
        total_pages: 1,
        count: 0,
        current_page: 1
    });

    // Report modal state
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState(null);
    const reportRef = useRef(null);

    // Fetch distributors on mount
    useEffect(() => {
        fetchDistributors();
    }, []);

    // Fetch data when filters change
    useEffect(() => {
        fetchData();
    }, [dateFilter, startDate, endDate, transactionPage, selectedDistributor]);

    const fetchDistributors = async () => {
        try {
            const response = await fetchWithAuth('distributors/?page_size=1000');
            setDistributors(response?.data?.results || []);
        } catch (error) {
            console.error('Failed to fetch distributors:', error);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams({ period: dateFilter });
            if (dateFilter === 'custom' && startDate && endDate) {
                params.append('start_date', startDate);
                params.append('end_date', endDate);
            }
            if (selectedDistributor) {
                params.append('distributor_id', selectedDistributor);
            }

            const paramsString = params.toString();

            // Fetch all three endpoints in parallel
            const [metricsRes, topProductsRes, transactionsRes] = await Promise.all([
                fetchWithAuth(`sales-stats/metrics/?${paramsString}`),
                fetchWithAuth(`sales-stats/top-products/?${paramsString}&limit=10`),
                fetchWithAuth(`sales-stats/transactions/?${paramsString}&page=${transactionPage}&page_size=10`)
            ]);

            console.log('API Responses:', { metricsRes, topProductsRes, transactionsRes });

            // Set states - fetchWithAuth returns {data: ..., status: ...}
            // Access .data property from response
            setMetrics(metricsRes?.data || {});
            setTopProducts(Array.isArray(topProductsRes?.data) ? topProductsRes.data : []);
            setTransactions(transactionsRes?.data?.results || []);
            setTransactionPagination({
                total_pages: transactionsRes?.data?.total_pages || 1,
                count: transactionsRes?.data?.count || 0,
                current_page: transactionsRes?.data?.current_page || 1
            });
        } catch (error) {
            console.error('Failed to fetch sales data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportReport = async () => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams({ period: dateFilter });
            if (dateFilter === 'custom' && startDate && endDate) {
                params.append('start_date', startDate);
                params.append('end_date', endDate);
            }
            if (selectedDistributor) {
                params.append('distributor_id', selectedDistributor);
            }

            // Fetch comprehensive report (no pagination)
            const response = await fetchWithAuth(`sales-stats/report/?${params.toString()}`);
            console.log('Report data:', response);
            setReportData(response?.data || null);
            setShowReportModal(true);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
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

            const finalWidth = pdfWidth - 20;
            const finalHeight = (imgHeight * finalWidth) / imgWidth;

            pdf.addImage(imgData, 'PNG', 10, 10, finalWidth, finalHeight);
            pdf.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);

            setShowReportModal(false);
        } catch (err) {
            console.error('PDF generation failed:', err);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            maximumFractionDigits: 0
        }).format(parseFloat(amount) || 0);
    };

    const getRangeText = () => {
        if (dateFilter === 'custom' && startDate && endDate) {
            return `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
        }
        if (dateFilter === 'month') return 'Current Month';
        if (dateFilter === 'year') return 'Current Year';
        return 'All Time';
    };

    if (isLoading && transactions.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales & Reports</h1>
                        <p className="text-slate-500 dark:text-gray-400">Track sales performance and export comprehensive reports.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Distributor Filter */}
                        <select
                            value={selectedDistributor}
                            onChange={(e) => setSelectedDistributor(e.target.value)}
                            className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Distributors</option>
                            {distributors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name} - {d.area}
                                </option>
                            ))}
                        </select>

                        {/* Date Filter Buttons */}
                        <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                            {['month', 'year', 'all', 'custom'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setDateFilter(f)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                                        dateFilter === f
                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    {f === 'all' ? 'All Time' : f}
                                </button>
                            ))}
                        </div>

                        {/* Custom Date Range */}
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

                        {/* Export Button */}
                        <button
                            onClick={handleExportReport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-lg">
                                {isExporting ? 'hourglass_empty' : 'download'}
                            </span>
                            {isExporting ? 'Exporting...' : 'Export Report'}
                        </button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">Total Revenue</h3>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatCurrency(metrics.total_revenue)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{getRangeText()}</p>
                    </div>

                    {/* Units Sold */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg">
                                <span className="material-symbols-outlined">shopping_cart</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">Units Sold</h3>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {parseInt(metrics.units_sold || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{getRangeText()}</p>
                    </div>

                    {/* Net Profit */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                                parseFloat(metrics.net_profit || 0) >= 0 
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">Net Profit</h3>
                        </div>
                        <p className={`text-2xl font-bold ${
                            parseFloat(metrics.net_profit || 0) >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'
                        }`}>
                            {formatCurrency(metrics.net_profit)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{getRangeText()}</p>
                    </div>

                    {/* Avg Order Value */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">Avg Order Value</h3>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatCurrency(metrics.avg_order_value)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{getRangeText()}</p>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">star</span>
                            Top Products
                        </h3>
                        
                        {topProducts.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-8">No products sold in this period</p>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {topProducts.map((product, index) => (
                                    <div 
                                        key={product.product_id}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {product.product_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {product.order_count} orders
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {parseFloat(product.total_quantity_sold).toFixed(0)} units
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatCurrency(product.total_revenue)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">receipt_long</span>
                            All Transactions
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">
                            Sales (debit/income), Expenses (credit), and Inventory purchases (credit)
                        </p>
                        
                        {transactions.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-8">No transactions in this period</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Invoice #</th>
                                                <th className="px-3 py-2 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Distributor</th>
                                                <th className="px-3 py-2 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Date</th>
                                                <th className="px-3 py-2 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Type</th>
                                                <th className="px-3 py-2 text-xs font-medium uppercase text-slate-700 dark:text-gray-300 text-right">Total</th>
                                                <th className="px-3 py-2 text-xs font-medium uppercase text-slate-700 dark:text-gray-300 text-right">Paid</th>
                                                <th className="px-3 py-2 text-xs font-medium uppercase text-slate-700 dark:text-gray-300 text-right">Due</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((txn) => {
                                                const isDebit = txn.type === 'sale';
                                                const isCredit = txn.type === 'expense' || txn.type === 'inventory';
                                                
                                                return (
                                                    <tr
                                                        key={txn.id}
                                                        className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
                                                    >
                                                        <td className="px-3 py-3">
                                                            <span className={`font-mono text-xs font-medium ${
                                                                isDebit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {txn.reference}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <div>
                                                                <p className="font-medium text-slate-900 dark:text-white text-xs">{txn.party}</p>
                                                                <p className="text-xs text-slate-500 dark:text-gray-400">{txn.area}</p>
                                                                {txn.description && (
                                                                    <p className="text-xs text-slate-400 dark:text-gray-500 italic">{txn.description}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-slate-500 dark:text-gray-400">
                                                            {new Date(txn.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                txn.type === 'sale' 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                    : txn.type === 'expense'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                            }`}>
                                                                {txn.type === 'sale' ? txn.payment_type : txn.type}
                                                            </span>
                                                        </td>
                                                        <td className={`px-3 py-3 text-right font-mono ${
                                                            isDebit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {isDebit ? '+' : '-'}Rs. {parseFloat(txn.amount).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-3 text-right font-mono text-green-600 dark:text-green-400">
                                                            Rs. {parseFloat(txn.amount_paid).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-3 text-right font-mono text-red-600 dark:text-red-400">
                                                            Rs. {parseFloat(txn.balance_due).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination */}
                                {transactionPagination.total_pages > 1 && (
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <button
                                            onClick={() => setTransactionPage(prev => Math.max(1, prev - 1))}
                                            disabled={transactionPage === 1}
                                            className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            Page {transactionPage} of {transactionPagination.total_pages}
                                        </span>
                                        <button
                                            onClick={() => setTransactionPage(prev => Math.min(transactionPagination.total_pages, prev + 1))}
                                            disabled={transactionPage === transactionPagination.total_pages}
                                            className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* PDF Report Modal */}
            {showReportModal && reportData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-background-dark rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sales Report Preview</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">download</span>
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div ref={reportRef} className="p-8 bg-white">
                            {/* Report Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Sales Report</h1>
                                <p className="text-slate-600">
                                    {reportData?.metrics?.period_start && reportData?.metrics?.period_end ? (
                                        `${new Date(reportData.metrics.period_start).toLocaleDateString()} - ${new Date(reportData.metrics.period_end).toLocaleDateString()}`
                                    ) : 'N/A'}
                                </p>
                            </div>

                            {/* Metrics Section */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b-2 border-blue-600 pb-2">Summary Metrics</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(reportData?.metrics?.total_revenue || 0)}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-600 mb-1">Units Sold</p>
                                        <p className="text-2xl font-bold text-slate-900">{parseInt(reportData?.metrics?.units_sold || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-600 mb-1">Net Profit</p>
                                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(reportData?.metrics?.net_profit || 0)}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-600 mb-1">Avg Order Value</p>
                                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(reportData?.metrics?.avg_order_value || 0)}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-600 mb-1">Period Expenses</p>
                                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(reportData?.period_expenses || 0)}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-600 mb-1">Inventory Purchases</p>
                                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(reportData?.inventory_purchases || 0)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Top Products Table */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b-2 border-blue-600 pb-2">Top Products</h2>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="px-4 py-2 text-left font-semibold text-slate-900">#</th>
                                            <th className="px-4 py-2 text-left font-semibold text-slate-900">Product Name</th>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-900">Quantity Sold</th>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-900">Revenue</th>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-900">Orders</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(reportData?.top_products || []).map((product, index) => (
                                            <tr key={product.product_id} className="border-b border-slate-200">
                                                <td className="px-4 py-2 text-slate-900">{index + 1}</td>
                                                <td className="px-4 py-2 text-slate-900">{product.product_name}</td>
                                                <td className="px-4 py-2 text-right text-slate-900">{parseFloat(product.total_quantity_sold).toFixed(0)}</td>
                                                <td className="px-4 py-2 text-right text-slate-900">{formatCurrency(product.total_revenue)}</td>
                                                <td className="px-4 py-2 text-right text-slate-900">{product.order_count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Transactions Table */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b-2 border-blue-600 pb-2">All Transactions</h2>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="px-4 py-2 text-left font-semibold text-slate-900">Reference</th>
                                            <th className="px-4 py-2 text-left font-semibold text-slate-900">Party/Description</th>
                                            <th className="px-4 py-2 text-left font-semibold text-slate-900">Type</th>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-900">Amount</th>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-900">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(reportData?.transactions || []).map((txn) => {
                                            const isDebit = txn.type === 'sale';
                                            return (
                                                <tr key={txn.id} className="border-b border-slate-200">
                                                    <td className="px-4 py-2 text-slate-900">{txn.reference}</td>
                                                    <td className="px-4 py-2 text-slate-900">
                                                        <strong>{txn.party}</strong>
                                                        {txn.description && (
                                                            <>
                                                                <br />
                                                                <span className="text-xs text-slate-600">{txn.description}</span>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-slate-900 capitalize">{txn.type}</td>
                                                    <td className={`px-4 py-2 text-right font-mono ${
                                                        isDebit ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {isDebit ? '+' : '-'}Rs. {parseFloat(txn.amount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-slate-900">{new Date(txn.date).toLocaleDateString()}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer */}
                            <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-200">
                                Generated on {new Date().toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;



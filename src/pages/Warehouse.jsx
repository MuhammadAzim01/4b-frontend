import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProductModal from '../components/CreateProductModal';
import AddStockModal from '../components/AddStockModal';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getAuthStatus } from '../utils/auth';
import { openPrintWindow, fetchAllPages } from '../utils/printWindow';
import { generateWarehouseLedgerHtml } from '../utils/warehouseLedgerPrint';
import { generateWarehouseStockHtml } from '../utils/warehouseStockPrint';
import { toast } from 'sonner';

const Warehouse = () => {
    const navigate = useNavigate();
    const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
    const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockProduct, setStockProduct] = useState(null);
    const addStockProductIdRef = useRef(null);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Date Filters
    const [filterType, setFilterType] = useState('month'); // 'week', 'month', 'custom', 'as_of'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [asOfDate, setAsOfDate] = useState('');

    // Ledger Filters
    const [ledgerFilterType, setLedgerFilterType] = useState('month');
    const [ledgerStartDate, setLedgerStartDate] = useState('');
    const [ledgerEndDate, setLedgerEndDate] = useState('');
    const [ledgerTxType, setLedgerTxType] = useState('all'); // 'all', 'in', 'out'
    const [isPrintingLedger, setIsPrintingLedger] = useState(false);
    const [isPrintingAllStock, setIsPrintingAllStock] = useState(false);

    const { role } = getAuthStatus()?.user || {};
    const isAdmin = role === 'admin';

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Construct Query Params
    const getQueryParams = () => {
        let params = `?page=${page}&page_size=${pageSize}&search=${debouncedSearch}`;

        if (filterType === 'as_of') {
            if (asOfDate) params += `&date=${asOfDate}`;
        } else {
            params += `&date_range=${filterType}`;
            if (filterType === 'custom') {
                if (customStartDate) params += `&start_date=${customStartDate}`;
                if (customEndDate) params += `&end_date=${customEndDate}`;
            }
        }
        return params;
    };

    const getPrintQueryParams = () => {
        let params = `?page_size=1000&search=${debouncedSearch}`;

        if (filterType === 'as_of') {
            if (asOfDate) params += `&date=${asOfDate}`;
        } else {
            params += `&date_range=${filterType}`;
            if (filterType === 'custom') {
                if (customStartDate) params += `&start_date=${customStartDate}`;
                if (customEndDate) params += `&end_date=${customEndDate}`;
            }
        }
        return params;
    };

    // Fetch Products
    const { data: productsData, isFetching: isProductsLoading, refetch: refetchProducts } = useFetchQuery({
        url: `warehouse/products/${getQueryParams()}`,
        queryKey: ['products', page, debouncedSearch, filterType, customStartDate, customEndDate, asOfDate],
        fetchFunction: fetchWithAuth,
        keepPreviousData: true,
    });

    // Create product mutation
    const createProductMutation = useCreateUpdateMutation({
        url: 'production/products/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Product created successfully',
        onErrorMessage: 'Failed to create product',
        onSuccess: () => {
            setIsCreateProductModalOpen(false);
            refetchProducts();
        },
    });

    const addStockMutation = useCreateUpdateMutation({
        url: () => `warehouse/products/${addStockProductIdRef.current}/add-stock/`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Stock added successfully',
        onErrorMessage: 'Failed to add stock',
        onSuccess: () => {
            setIsAddStockModalOpen(false);
            setStockProduct(null);
            addStockProductIdRef.current = null;
            refetchProducts();
        },
    });

    // Fetch Ledger for selected product
    const getLedgerQueryParams = () => {
        if (!selectedProduct) return null;
        let params = `warehouse/transactions/?item=${selectedProduct.id}`;

        params += `&date_range=${ledgerFilterType}`;
        if (ledgerFilterType === 'custom') {
            if (ledgerStartDate) params += `&start_date=${ledgerStartDate}`;
            if (ledgerEndDate) params += `&end_date=${ledgerEndDate}`;
        }

        if (ledgerTxType !== 'all') {
            params += `&transaction_type=${ledgerTxType}`;
        }

        return params;
    };

    const { data: ledgerData, isFetching: isLedgerLoading } = useFetchQuery({
        url: getLedgerQueryParams(),
        queryKey: ['product_ledger', selectedProduct?.id, ledgerFilterType, ledgerStartDate, ledgerEndDate, ledgerTxType],
        fetchFunction: fetchWithAuth,
        enabled: !!selectedProduct,
    });

    const handleViewLedgerClick = (product) => {
        setSelectedProduct(product);
        // Reset ledger filters to default on open
        setLedgerFilterType('month');
        setLedgerTxType('all');
        setLedgerStartDate('');
        setLedgerEndDate('');
        setIsLedgerModalOpen(true);
    };

    const handleCreateProduct = (productData) => {
        createProductMutation.mutate(JSON.stringify(productData));
    };

    const handleAddStockClick = (product) => {
        setStockProduct(product);
        addStockProductIdRef.current = product.id;
        setIsAddStockModalOpen(true);
    };

    const handleAddStock = ({ quantity, notes }) => {
        addStockMutation.mutate(JSON.stringify({ quantity, notes }));
    };

    const handlePrintLedger = async () => {
        if (!selectedProduct) return;

        setIsPrintingLedger(true);
        try {
            let params = `warehouse/transactions/?item=${selectedProduct.id}`;
            params += `&date_range=${ledgerFilterType}`;
            if (ledgerFilterType === 'custom') {
                if (ledgerStartDate) params += `&start_date=${ledgerStartDate}`;
                if (ledgerEndDate) params += `&end_date=${ledgerEndDate}`;
            }
            if (ledgerTxType !== 'all') {
                params += `&transaction_type=${ledgerTxType}`;
            }

            const transactions = await fetchAllPages(fetchWithAuth, params);
            const html = generateWarehouseLedgerHtml({
                product: selectedProduct,
                transactions,
                filterType: ledgerFilterType,
                startDate: ledgerStartDate,
                endDate: ledgerEndDate,
                txType: ledgerTxType,
            });
            openPrintWindow(html);
        } catch {
            toast.error('Failed to prepare ledger for printing');
        } finally {
            setIsPrintingLedger(false);
        }
    };

    const handlePrintAllStock = async () => {
        setIsPrintingAllStock(true);
        try {
            const allProducts = await fetchAllPages(
                fetchWithAuth,
                `warehouse/products/${getPrintQueryParams()}`
            );
            const html = generateWarehouseStockHtml({
                products: allProducts,
                filterType,
                asOfDate,
                startDate: customStartDate,
                endDate: customEndDate,
            });
            openPrintWindow(html);
        } catch (error) {
            console.error("Failed to print warehouse stock:", error);
            toast.error('Failed to prepare warehouse stock report for printing');
        } finally {
            setIsPrintingAllStock(false);
        }
    };

    const products = productsData?.results || [];
    const totalPages = Math.ceil((productsData?.count || 0) / pageSize);

    return (
        <div className="flex-1 flex-col overflow-y-auto p-8 bg-slate-50 dark:bg-background">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">Finished Goods - Warehouse Management</h1>
                    <p className="text-slate-500 dark:text-gray-400 text-base font-normal leading-normal">Real-time inventory levels and immutable transaction ledger.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrintAllStock}
                        disabled={isPrintingAllStock}
                        className="flex h-10 items-center justify-center gap-x-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-background-dark px-4 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined text-base">print</span>
                        <p className="text-sm font-medium">{isPrintingAllStock ? 'Preparing...' : 'Print Stock Report'}</p>
                    </button>
                    <button
                        onClick={() => setIsCreateProductModalOpen(true)}
                        className="flex h-10 items-center justify-center gap-x-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-background-dark px-4 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-base">add_box</span>
                        <p className="text-sm font-medium">New Product</p>
                    </button>
                </div>
            </div>

            {/* Filters / Toolbar */}
            <div className="flex flex-col gap-4 pb-6 border-b border-slate-200 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 h-9 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none w-64"
                        />
                    </div>

                    {/* Filter Presets */}
                    <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-slate-300 dark:border-gray-700 p-1">
                        {[
                            { id: 'week', label: 'Last 7 Days' },
                            { id: 'month', label: 'This Month' },
                            { id: 'custom', label: 'Custom Range' },
                            { id: 'as_of', label: 'Stock As Of' }
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setFilterType(filter.id)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === filter.id
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conditional Inputs based on Filter Type */}
                {filterType === 'custom' && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-500">From:</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-eva-blue"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-500">To:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-eva-blue"
                            />
                        </div>
                    </div>
                )}

                {filterType === 'as_of' && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                        <label className="text-sm text-slate-500">View Stock As Of:</label>
                        <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            className="h-9 px-3 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-eva-blue"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                )}
            </div>

            {/* Product Cards */}
            {isProductsLoading && !products.length ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
                    <p>No products found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {products.map((product) => (
                        <div key={product.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">{product.name}</h2>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">SKU: {product.sku || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleAddStockClick(product)}
                                            className="text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-1 hover:underline group"
                                        >
                                            <span className="material-symbols-outlined text-base">add_circle</span>
                                            Add Stock
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleViewLedgerClick(product)}
                                        className="text-primary font-medium text-sm flex items-center gap-1 hover:underline group"
                                    >
                                        View Ledger
                                        <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 rounded-lg p-5 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800">
                                <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">
                                    {filterType === 'as_of' && asOfDate
                                        ? `Stock on ${new Date(asOfDate).toLocaleDateString()}`
                                        : 'Total Stock on Hand'}
                                </p>
                                <p className="text-slate-900 dark:text-white text-3xl font-bold">
                                {product.pack_size ? (product.stock_quantity / product.pack_size).toFixed(2): '0.00'} Pack <span className="text-xl font-medium text-slate-500">{product.stock_quantity} {product.unit || 'Units'}</span>
                                </p>
                                {/* Display Period Stats if available */}
                                {product.period_production > 0 && (
                                    <p className="text-[#198754] text-sm font-medium">
                                        +{(product.period_production / product.pack_size).toFixed(2)} Pack {product.period_production} units Produced
                                    </p>
                                )}
                                {product.period_adjustments > 0 && (
                                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                        +{product.period_adjustments} units Added manually
                                    </p>
                                )}
                                {product.period_sales > 0 && (
                                    <p className="text-[#DC3545] text-sm font-medium">
                                        -{product.period_sales} Sold
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 rounded-lg border border-slate-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 font-medium text-slate-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 rounded-lg border border-slate-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* View Ledger Modal */}
            {isLedgerModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        Product Ledger
                                        <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{selectedProduct.name}</span>
                                    </h3>
                                </div>
                                <button onClick={() => setIsLedgerModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                    {['week', 'month', 'custom'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setLedgerFilterType(type)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${ledgerFilterType === type
                                                ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white'
                                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                }`}
                                        >
                                            {type === 'week' ? 'Last 7 Days' : type === 'month' ? 'This Month' : 'Custom'}
                                        </button>
                                    ))}
                                </div>

                                {ledgerFilterType === 'custom' && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={ledgerStartDate}
                                            onChange={(e) => setLedgerStartDate(e.target.value)}
                                            className="h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input
                                            type="date"
                                            value={ledgerEndDate}
                                            onChange={(e) => setLedgerEndDate(e.target.value)}
                                            className="h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                        />
                                    </div>
                                )}

                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                                <select
                                    value={ledgerTxType}
                                    onChange={(e) => setLedgerTxType(e.target.value)}
                                    className="h-8 pl-2 pr-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-1 focus:ring-eva-blue"
                                >
                                    <option value="all">All Types</option>
                                    <option value="in">Stock In (Production & Manual)</option>
                                    <option value="out">Sales Only (OUT)</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-0 overflow-y-auto flex-1">
                            {isLedgerLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <LoadingSpinner />
                                </div>
                            ) : !ledgerData?.results?.length ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                                    <p>No transactions found for this selection</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Date & Time</th>
                                            <th className="px-6 py-4 font-semibold">Reference ID</th>
                                            <th className="px-6 py-4 font-semibold">Info</th>
                                            <th className="px-6 py-4 font-semibold">Type</th>
                                            <th className="px-6 py-4 font-semibold text-right">In</th>
                                            <th className="px-6 py-4 font-semibold text-right">Out</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {ledgerData.results.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-slate-900 dark:text-white">
                                                    <div className="font-medium">{new Date(txn.transaction_date).toLocaleDateString()}</div>
                                                    <div className="text-xs text-slate-500">{new Date(txn.transaction_date).toLocaleTimeString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {txn.transaction_type === 'in' && !String(txn.id).startsWith('ADJ-') ? (
                                                        <button
                                                            onClick={() => navigate(`/${role}/production/${txn.id}`)}
                                                            className="text-slate-900 dark:text-white font-mono text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400 underline decoration-dotted hover:decoration-solid cursor-pointer"
                                                        >
                                                            {txn.id}
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-900 dark:text-white font-mono text-sm font-semibold">{txn.id}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                                    {txn.reference_info}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase
                                                        ${txn.transaction_type === 'in' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                        {txn.transaction_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-medium font-mono">
                                                    {txn.transaction_type === 'in' ? `+${Math.abs(txn.quantity).toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-medium font-mono">
                                                    {txn.transaction_type === 'out' ? `-${Math.abs(txn.quantity).toLocaleString()}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-900 rounded-b-xl">
                            <button
                                onClick={handlePrintLedger}
                                disabled={isPrintingLedger || isLedgerLoading}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-eva-blue hover:bg-blue-800 text-white shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-base">print</span>
                                {isPrintingLedger ? 'Preparing...' : 'Print Ledger'}
                            </button>
                            <button onClick={() => setIsLedgerModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all focus:ring-2 focus:ring-slate-200">Close Ledger</button>
                        </div>
                    </div>
                </div>
            )}

            <CreateProductModal
                isOpen={isCreateProductModalOpen}
                onClose={() => setIsCreateProductModalOpen(false)}
                onCreate={handleCreateProduct}
            />

            <AddStockModal
                isOpen={isAddStockModalOpen}
                onClose={() => {
                    setIsAddStockModalOpen(false);
                    setStockProduct(null);
                    addStockProductIdRef.current = null;
                }}
                onAdd={handleAddStock}
                product={stockProduct}
                isLoading={addStockMutation.isLoading}
            />
        </div>
    );
};

export default Warehouse;

import React, { useState, useEffect } from 'react';
import CreateProductModal from '../components/CreateProductModal';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Warehouse = () => {
    const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
    const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

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

    // Fetch Products
    const { data: productsData, isFetching: isProductsLoading, refetch: refetchProducts } = useFetchQuery({
        url: `production/products/${getQueryParams()}`,
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

    // Fetch Ledger for selected product
    // Ledger shares the same date filters or can be overridden. 
    // Usually ledger needs the same context as the summary card.
    const getLedgerQueryParams = () => {
        if (!selectedProduct) return null;
        let params = `inventory/transactions/?item=${selectedProduct.id}`;

        if (filterType === 'as_of') {
            // For ledger, 'as_of' might mean 'transactions up to this date'
            if (asOfDate) params += `&end_date=${asOfDate}`;
        } else {
            params += `&date_range=${filterType}`;
            if (filterType === 'custom') {
                if (customStartDate) params += `&start_date=${customStartDate}`;
                if (customEndDate) params += `&end_date=${customEndDate}`;
            }
        }
        return params;
    };

    const { data: ledgerData, isFetching: isLedgerLoading } = useFetchQuery({
        url: getLedgerQueryParams(),
        queryKey: ['product_ledger', selectedProduct?.id, filterType, customStartDate, customEndDate, asOfDate],
        fetchFunction: fetchWithAuth,
        enabled: !!selectedProduct,
    });

    const handleViewLedgerClick = (product) => {
        setSelectedProduct(product);
        setIsLedgerModalOpen(true);
    };

    const handleCreateProduct = (productData) => {
        createProductMutation.mutate(JSON.stringify(productData));
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
                                <button
                                    onClick={() => handleViewLedgerClick(product)}
                                    className="text-primary font-medium text-sm flex items-center gap-1 hover:underline group"
                                >
                                    View Ledger
                                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                            <div className="flex flex-col gap-2 rounded-lg p-5 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800">
                                <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">
                                    {filterType === 'as_of' && asOfDate
                                        ? `Stock on ${new Date(asOfDate).toLocaleDateString()}`
                                        : 'Total Stock on Hand'}
                                </p>
                                <p className="text-slate-900 dark:text-white text-3xl font-bold">
                                    {product.stock_quantity || 0} <span className="text-xl font-medium text-slate-500">{product.unit || 'Units'}</span>
                                </p>
                                {/* Display Period Stats if available */}
                                {product.period_production > 0 && (
                                    <p className="text-[#198754] text-sm font-medium">
                                        +{product.period_production} Produced
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
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    Product Ledger
                                    <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{selectedProduct.name}</span>
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {filterType === 'week' ? 'Last 7 Days' :
                                        filterType === 'month' ? 'This Month' :
                                            filterType === 'as_of' ? `Up to ${asOfDate}` :
                                                'Transaction History'}
                                </p>
                            </div>
                            <button onClick={() => setIsLedgerModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-0 overflow-y-auto flex-1">
                            {isLedgerLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <LoadingSpinner />
                                </div>
                            ) : !ledgerData?.results?.length ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                                    <p>No transactions found for this period</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Date</th>
                                            <th className="px-6 py-4 font-semibold">Transaction ID</th>
                                            <th className="px-6 py-4 font-semibold">Type</th>
                                            <th className="px-6 py-4 font-semibold text-right">In</th>
                                            <th className="px-6 py-4 font-semibold text-right">Out</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {ledgerData.results.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                                                    {new Date(txn.transaction_date || txn.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                                    #{txn.id.slice(0, 8).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                                        ${txn.transaction_type === 'in' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {txn.transaction_type || 'Transaction'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-green-600 font-medium font-mono">
                                                    {txn.transaction_type === 'in' || txn.quantity > 0 ? `+${Math.abs(txn.quantity).toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-red-600 font-medium font-mono">
                                                    {txn.transaction_type === 'out' || txn.quantity < 0 ? `-${Math.abs(txn.quantity).toLocaleString()}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900 rounded-b-xl">
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
        </div>
    );
};

export default Warehouse;

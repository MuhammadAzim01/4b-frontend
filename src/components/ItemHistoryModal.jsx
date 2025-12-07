import React, { useState } from 'react';
import { fetchWithAuth } from '../utils/fetchApis';
import { useFetchQuery } from '../hooks/useFetchQuery';
import LoadingSpinner from './ui/LoadingSpinner';

const ItemHistoryModal = ({ isOpen, onClose, itemName, role }) => {
    const { data, isFetching, isError, error } = useFetchQuery({
        url: `inventory/transactions/?item=${itemName}&status=approve`,
        queryKey: [`transactions-${itemName}`],
        fetchFunction: fetchWithAuth,
        enabled: !!itemName && isOpen,
    });

    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [startDateTime, endDateTime, supplierFilter]);

    if (!isOpen || !itemName) return null;

    const rawHistory = data?.results || [];

    const filteredHistory = rawHistory.filter(entry => {
        const entryDate = new Date(entry.transaction_date);

        // Start Date/Time Filter
        if (startDateTime) {
            const start = new Date(startDateTime);
            if (entryDate < start) return false;
        }

        // End Date/Time Filter
        if (endDateTime) {
            const end = new Date(endDateTime);
            if (entryDate > end) return false;
        }

        // Supplier Filter
        if (supplierFilter) {
            const supplierName = entry.supplier?.name?.toLowerCase() || '';
            if (!supplierName.includes(supplierFilter.toLowerCase())) return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
    const currentItems = filteredHistory.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{itemName}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Stock History</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-eva-blue text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title="Filter History"
                        >
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                        <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">From</label>
                                <input
                                    type="datetime-local"
                                    value={startDateTime}
                                    onChange={(e) => setStartDateTime(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">To</label>
                                <input
                                    type="datetime-local"
                                    value={endDateTime}
                                    onChange={(e) => setEndDateTime(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Supplier Name</label>
                                <input
                                    type="text"
                                    value={supplierFilter}
                                    onChange={(e) => setSupplierFilter(e.target.value)}
                                    placeholder="Filter by supplier..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                            {(startDateTime || endDateTime || supplierFilter) && (
                                <button
                                    onClick={() => {
                                        setStartDateTime('');
                                        setEndDateTime('');
                                        setSupplierFilter('');
                                    }}
                                    className="px-4 py-2.5 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6">
                    {isFetching ? (
                        <div className="flex justify-center items-center h-48">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            {rawHistory.length === 0 ? "No history available for this item." : "No records match your filters."}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:bg-background-dark dark:border-gray-700">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-gray-800">
                                    <tr className="border-b border-slate-200 dark:border-gray-700">
                                        <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Date</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Supplier</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Quantity</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Note</th>
                                        {role === 'admin' && (
                                            <>
                                                <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Unit Price</th>
                                                <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Total Cost</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                    {currentItems.map((entry) => (
                                        <tr key={entry.id}>
                                            <td className="px-4 py-3 text-slate-900 dark:text-white text-sm">
                                                {new Date(entry?.transaction_date).toLocaleDateString()}
                                                <span className="block text-xs text-slate-500">{new Date(entry?.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-sm">{entry.supplier?.name || '-'}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-sm">{entry.quantity}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-sm italic">{entry.notes || '-'}</td>
                                            {role === 'admin' && (
                                                <>
                                                    <td className="px-4 py-3 text-slate-900 dark:text-white text-sm font-medium">₹{entry?.unit_cost}</td>
                                                    <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-sm">₹{(entry.quantity * entry.unit_cost).toFixed(2)}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {filteredHistory.length > 0 && (
                            <span>
                                Showing <span className="font-medium text-slate-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredHistory.length)}</span> of <span className="font-medium text-slate-900 dark:text-white">{filteredHistory.length}</span> results
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${currentPage === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                        >
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${currentPage === totalPages || totalPages === 0 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                        >
                            Next
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                    <button onClick={onClose} className="ml-4 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ItemHistoryModal;

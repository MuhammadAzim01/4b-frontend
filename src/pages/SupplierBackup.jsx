import React, { useState } from 'react';
import { toast } from 'sonner';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchWithAuth } from '../utils/fetchApis';
import { getAuthStatus } from '../utils/auth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AddSupplierModal from '../components/AddSupplierModal';

const Suppliers = () => {
    const [activeTab, setActiveTab] = useState('history');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [transactionPage, setTransactionPage] = useState(1);

    const { user } = getAuthStatus();
    const isAdmin = user?.role === 'admin';

    // Fetch suppliers
    const { data: suppliersData, isFetching: loadingSuppliers, refetch: refetchSuppliers } = useFetchQuery({
        url: `inventory/suppliers/?search=${searchQuery}`,
        queryKey: ['suppliers', searchQuery],
        fetchFunction: fetchWithAuth,
    });

    // Fetch transactions for selected supplier
    // Assuming endpoint: inventory/transactions/?supplier={id}
    const getTransactionUrl = () => {
        if (!selectedSupplier) return null;
        let url = `inventory/transactions/?supplier=${selectedSupplier.id}&page=${transactionPage}&page_size=10`;
        // Assuming we can filter by pending/completed or purchase? The prompt asked for "paid amount, pending amount"
        // Transactions usually have this info.
        return url;
    };

    const getInvoiceUrl = () => {
        if (!selectedSupplier) return null;
        let url = `inventory/invoices/?supplier=${selectedSupplier.id}&page=${transactionPage}&page_size=10`;
        if (activeTab === 'sales') url += '&transaction_type=sale';
        if (activeTab === 'payments') url += '&transaction_type=payment';
        return url;
    };

    const { data: transactionsData, isFetching: loadingTransactions } = useFetchQuery({
        url: getInvoiceUrl(),
        queryKey: ['supplier_transactions', selectedSupplier?.id, transactionPage],
        fetchFunction: fetchWithAuth,
        enabled: !!selectedSupplier,
    });

    // Add supplier mutation
    const addSupplierMutation = useCreateUpdateMutation({
        url: 'inventory/suppliers/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Supplier added successfully',
        onErrorMessage: 'Failed to add supplier',
        onSuccess: () => {
            refetchSuppliers();
            setIsAddModalOpen(false);
        },
    });

    const suppliers = suppliersData?.results || [];
    const transactions = transactionsData?.results || [];

    const handleAddSupplier = (formData) => {
        addSupplierMutation.mutate(JSON.stringify(formData));
    };

    const handleSelectSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setTransactionPage(1);
    };

    // Derived stats from supplier object if available, or just display static/calculated
    // Note: Supplier object from `inventory/suppliers/` might have `balance`, `total_purchased` etc.
    // I am assuming the API returns a `balance` field similar to distributors.

    return (
        <div className="flex-1 overflow-y-auto p-8 xl:p-10">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Supplier Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 h-10 px-4 text-sm font-bold text-white rounded-lg bg-eva-blue hover:bg-blue-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Add Supplier</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Supplier List */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white dark:bg-background-dark p-4 rounded-lg border border-slate-200 dark:border-gray-700">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                className="w-full rounded-lg pl-10 h-10 bg-eva-off-white border-none dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-eva-blue outline-none text-sm"
                                placeholder="Search suppliers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-background-dark rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
                        {loadingSuppliers ? (
                            <div className="p-8 flex items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : suppliers.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                                <p>No suppliers found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-slate-700 dark:text-gray-300 text-xs font-medium uppercase">Name</th>
                                        <th className="px-4 py-3 text-slate-700 dark:text-gray-300 text-xs font-medium uppercase">Phone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map((supplier) => (
                                        <tr
                                            key={supplier.id}
                                            onClick={() => handleSelectSupplier(supplier)}
                                            className={`border-b border-slate-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${selectedSupplier?.id === supplier.id ? 'bg-eva-blue/10 dark:bg-eva-blue/20' : ''
                                                }`}
                                        >
                                            <td className="px-4 py-3 text-slate-900 dark:text-gray-200 text-sm font-medium">{supplier.name}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">{supplier.phone || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Column: Supplier Details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {!selectedSupplier ? (
                        <div className="bg-white dark:bg-background-dark p-12 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">person_search</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a Supplier</h3>
                            <p className="text-slate-500 dark:text-slate-400">Choose a supplier from the list to view details and transactions</p>
                        </div>
                    ) : (
                        <>
                            {/* Supplier Info Card */}
                            <div className="bg-white dark:bg-background-dark p-6 rounded-lg border border-slate-200 dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedSupplier.name}</h2>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Contact Person</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedSupplier.contact_person || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Phone</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedSupplier.phone || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Email</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedSupplier.email || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Address</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedSupplier.address || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Balance Section - Assuming backend provides this or we might need to calculate it from transactions if not available */}
                                    <div className="text-right">
                                        {/* Placeholder for balance, update if backend provides explicit field */}
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Payable</p>
                                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                            {/* Assuming 'balance' field is present and positive means we owe them */}
                                            Rs. {Math.abs(Number(selectedSupplier.balance || 0)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transactions Section */}
                            <div className="bg-white dark:bg-background-dark rounded-lg border border-slate-200 dark:border-gray-700">
                                <div className="p-4 border-b border-slate-200 dark:border-gray-700">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Transaction History</h3>
                                </div>

                                <div className="p-6">
                                    {loadingTransactions ? (
                                        <div className="py-12 flex items-center justify-center">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Date</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Item</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Quantity</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300 text-right">Total Cost</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300 text-right">Paid</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300 text-right">Pending</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="px-4 py-12 text-center text-slate-400">
                                                                No transactions found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        transactions.map((t) => (
                                                            <tr
                                                                key={t.id}
                                                                className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
                                                            >
                                                                <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{new Date(t.transaction_date).toLocaleDateString()}</td>
                                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{t.item?.name || t.item_name}</td>
                                                                <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{t.quantity}</td>
                                                                <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">
                                                                    Rs. {(Number(t.quantity) * Number(t.unit_cost)).toFixed(2)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-mono text-green-600 dark:text-green-400">
                                                                    Rs. {Number(t.amount_paid || 0).toFixed(2)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-mono text-red-600 dark:text-red-400">
                                                                    Rs. {Number(t.pending_amount || 0).toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Pagination Controls */}
                                    {!loadingTransactions && transactionsData && transactionsData.count > 0 && (
                                        <div className="mt-4 flex items-center justify-between px-4">
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                Showing {((transactionPage - 1) * 10) + 1} to {Math.min(transactionPage * 10, transactionsData.count)} of {transactionsData.count} transactions
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                                                    disabled={!transactionsData.previous}
                                                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">chevron_left</span>
                                                </button>
                                                <div className="flex items-center px-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Page {transactionPage} of {Math.ceil(transactionsData.count / 10)}
                                                </div>
                                                <button
                                                    onClick={() => setTransactionPage(p => p + 1)}
                                                    disabled={!transactionsData.next}
                                                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">chevron_right</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <AddSupplierModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddSupplier}
            />
        </div>
    );
};

export default Suppliers;

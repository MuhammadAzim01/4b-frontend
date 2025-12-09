import React, { useState } from 'react';
import { toast } from 'sonner';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AddDistributorModal from '../components/AddDistributorModal';
import CreateInvoiceModal from '../components/CreateInvoiceModal';

const Distributors = () => {
    const [activeTab, setActiveTab] = useState('history');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedDistributor, setSelectedDistributor] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [invoicePage, setInvoicePage] = useState(1);

    // Fetch distributors
    const { data: distributorsData, isFetching: loadingDistributors, refetch: refetchDistributors } = useFetchQuery({
        url: `distributors/?search=${searchQuery}`,
        queryKey: ['distributors', searchQuery],
        fetchFunction: fetchWithAuth,
    });

    // Fetch invoices for selected distributor
    const getInvoiceUrl = () => {
        if (!selectedDistributor) return null;
        let url = `distributors/invoices/?distributor=${selectedDistributor.id}&page=${invoicePage}&page_size=5`;
        if (activeTab === 'sales') url += '&transaction_type=sale';
        if (activeTab === 'payments') url += '&transaction_type=payment';
        return url;
    };

    const { data: invoicesData, isFetching: loadingInvoices, refetch: refetchInvoices } = useFetchQuery({
        url: getInvoiceUrl(),
        queryKey: ['invoices', selectedDistributor?.id, invoicePage, activeTab],
        fetchFunction: fetchWithAuth,
        enabled: !!selectedDistributor,
    });

    // Add distributor mutation
    const addDistributorMutation = useCreateUpdateMutation({
        url: 'distributors/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Distributor added successfully',
        onErrorMessage: 'Failed to add distributor',
        onSuccess: () => {
            refetchDistributors();
            setIsAddModalOpen(false);
        },
    });

    // Create invoice mutation
    const createInvoiceMutation = useCreateUpdateMutation({
        url: 'distributors/invoices/create/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Invoice created successfully',
        onErrorMessage: 'Failed to create invoice',
        onSuccess: async () => {
            await refetchInvoices();
            await refetchDistributors();
            // Update selected distributor with fresh data
            const updatedDistributor = distributorsData?.results?.find(d => d.id === selectedDistributor?.id);
            if (updatedDistributor) {
                setSelectedDistributor(updatedDistributor);
            }
            setIsInvoiceModalOpen(false);
        },
    });

    const distributors = distributorsData?.results || [];
    const invoices = invoicesData?.results || [];

    const handleAddDistributor = (formData) => {
        addDistributorMutation.mutate(JSON.stringify(formData));
    };

    const handleCreateInvoice = (payload) => {
        createInvoiceMutation.mutate(JSON.stringify(payload));
    };

    const handleSelectDistributor = (distributor) => {
        setSelectedDistributor(distributor);
        setInvoicePage(1);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setInvoicePage(1);
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 xl:p-10">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Distributor Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 h-10 px-4 text-sm font-bold text-white rounded-lg bg-eva-blue hover:bg-blue-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Add Distributor</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Distributor List */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white dark:bg-background-dark p-4 rounded-lg border border-slate-200 dark:border-gray-700">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                className="w-full rounded-lg pl-10 h-10 bg-eva-off-white border-none dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-eva-blue outline-none text-sm"
                                placeholder="Search distributors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-background-dark rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
                        {loadingDistributors ? (
                            <div className="p-8 flex items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : distributors.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                                <p>No distributors found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-slate-700 dark:text-gray-300 text-xs font-medium uppercase">Name</th>
                                        <th className="px-4 py-3 text-slate-700 dark:text-gray-300 text-xs font-medium uppercase">Area</th>
                                        <th className="px-4 py-3 text-right text-slate-700 dark:text-gray-300 text-xs font-medium uppercase">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {distributors.map((distributor) => (
                                        <tr
                                            key={distributor.id}
                                            onClick={() => handleSelectDistributor(distributor)}
                                            className={`border-b border-slate-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                                                selectedDistributor?.id === distributor.id ? 'bg-eva-blue/10 dark:bg-eva-blue/20' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3 text-slate-900 dark:text-gray-200 text-sm font-medium">{distributor.name}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">{distributor.area}</td>
                                            <td className={`px-4 py-3 text-right text-sm font-mono ${
                                                parseFloat(distributor.balance) < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                            }`}>
                                                ₹{parseFloat(distributor.balance).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Column: Distributor Details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {!selectedDistributor ? (
                        <div className="bg-white dark:bg-background-dark p-12 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">person_search</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a Distributor</h3>
                            <p className="text-slate-500 dark:text-slate-400">Choose a distributor from the list to view details and invoices</p>
                        </div>
                    ) : (
                        <>
                            {/* Distributor Info Card */}
                            <div className="bg-white dark:bg-background-dark p-6 rounded-lg border border-slate-200 dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedDistributor.name}</h2>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                selectedDistributor.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {selectedDistributor.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Area</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedDistributor.area}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Contact</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedDistributor.contact_no}</p>
                                            </div>
                                            {selectedDistributor.email && (
                                                <div>
                                                    <p className="text-slate-500 dark:text-slate-400">Email</p>
                                                    <p className="font-medium text-slate-900 dark:text-white">{selectedDistributor.email}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Address</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{selectedDistributor.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current Balance</p>
                                        <p className={`text-3xl font-bold ${
                                            parseFloat(selectedDistributor.balance) < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            ₹{Math.abs(parseFloat(selectedDistributor.balance)).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {parseFloat(selectedDistributor.balance) < 0 ? 'They Owe Us' : 'We Owe Them'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setIsInvoiceModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-eva-blue rounded-lg hover:bg-blue-800 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">receipt_long</span>
                                        Create Invoice
                                    </button>
                                </div>
                            </div>

                            {/* Invoices Section */}
                            <div className="bg-white dark:bg-background-dark rounded-lg border border-slate-200 dark:border-gray-700">
                                <div className="border-b border-slate-200 dark:border-gray-700">
                                    <div className="flex gap-4 px-6">
                                        <button
                                            onClick={() => handleTabChange('history')}
                                            className={`py-4 px-2 text-sm font-semibold border-b-2 transition-colors ${
                                                activeTab === 'history'
                                                    ? 'border-eva-blue text-eva-blue'
                                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                            }`}
                                        >
                                            All Transactions
                                        </button>
                                        <button
                                            onClick={() => handleTabChange('sales')}
                                            className={`py-4 px-2 text-sm font-semibold border-b-2 transition-colors ${
                                                activeTab === 'sales'
                                                    ? 'border-eva-blue text-eva-blue'
                                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                            }`}
                                        >
                                            Sales
                                        </button>
                                        <button
                                            onClick={() => handleTabChange('payments')}
                                            className={`py-4 px-2 text-sm font-semibold border-b-2 transition-colors ${
                                                activeTab === 'payments'
                                                    ? 'border-eva-blue text-eva-blue'
                                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                            }`}
                                        >
                                            Payments
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {loadingInvoices ? (
                                        <div className="py-12 flex items-center justify-center">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Invoice #</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Date</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300">Type</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300 text-right">Total</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300 text-right">Paid</th>
                                                        <th className="px-4 py-3 text-xs font-medium uppercase text-slate-700 dark:text-gray-300 text-right">Due</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {invoices.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="px-4 py-12 text-center text-slate-400">
                                                                No invoices found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        invoices.map((invoice) => (
                                                            <tr key={invoice.id} className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                                                                <td className="px-4 py-3 font-mono text-xs text-eva-blue font-medium">{invoice.invoice_number}</td>
                                                                <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{new Date(invoice.created_at).toLocaleDateString()}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                        invoice.transaction_type === 'sale' 
                                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                                                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                    }`}>
                                                                        {invoice.transaction_type === 'sale' ? 'Sale' : 'Payment'} - {invoice.payment_type}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">₹{parseFloat(invoice.total_amount).toFixed(2)}</td>
                                                                <td className="px-4 py-3 text-right font-mono text-green-600 dark:text-green-400">₹{parseFloat(invoice.amount_paid).toFixed(2)}</td>
                                                                <td className="px-4 py-3 text-right font-mono text-red-600 dark:text-red-400">₹{parseFloat(invoice.balance_due).toFixed(2)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Pagination Controls */}
                                    {!loadingInvoices && invoicesData && invoicesData.count > 0 && (
                                        <div className="mt-4 flex items-center justify-between px-4">
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                Showing {((invoicePage - 1) * 5) + 1} to {Math.min(invoicePage * 5, invoicesData.count)} of {invoicesData.count} invoices
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setInvoicePage(p => Math.max(1, p - 1))}
                                                    disabled={!invoicesData.previous}
                                                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Previous page"
                                                >
                                                    <span className="material-symbols-outlined text-base">chevron_left</span>
                                                </button>
                                                <div className="flex items-center px-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Page {invoicePage} of {Math.ceil(invoicesData.count / 5)}
                                                </div>
                                                <button
                                                    onClick={() => setInvoicePage(p => p + 1)}
                                                    disabled={!invoicesData.next}
                                                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Next page"
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

            <AddDistributorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddDistributor}
            />

            <CreateInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                onCreate={handleCreateInvoice}
                selectedDistributor={selectedDistributor}
            />
        </div>
    );
};

export default Distributors;

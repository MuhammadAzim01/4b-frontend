import React, { useState } from 'react';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'sonner';
import AddDistributorModal from '../components/AddDistributorModal';

const Bottles = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isAddDistributorModalOpen, setIsAddDistributorModalOpen] = useState(false);

    const [selectedDistributor, setSelectedDistributor] = useState(null);
    const [returnQuantity, setReturnQuantity] = useState('');
    const [returnNote, setReturnNote] = useState('');

    // Mock History Data (since backend endpoint might not exist yet)
    // In production: fetch `distributors/${selectedDistributor.id}/logs/?type=bottle`
    const { data: historyData, isFetching: loadingHistory } = useFetchQuery({
        url: selectedDistributor ? `distributors/${selectedDistributor.id}/bottles/history/` : null, // Hypothetical endpoint
        queryKey: ['bottle-history', selectedDistributor?.id],
        fetchFunction: fetchWithAuth,
        enabled: !!selectedDistributor && isHistoryModalOpen
    });

    // Fetch Inventory for Bottle Stats
    const { data: inventoryData, isFetching: loadingInventory } = useFetchQuery({
        url: 'inventory/items/?category=returnable_assets',
        queryKey: ['inventory', 'returnable_assets'],
        fetchFunction: fetchWithAuth,
    });

    const { data: rawMaterialsData } = useFetchQuery({
        url: 'inventory/items/?category=raw_materials',
        queryKey: ['inventory', 'raw_materials'],
        fetchFunction: fetchWithAuth,
    });

    // Fetch Distributors
    const { data: distributorsData, isFetching: loadingDistributors, refetch: refetchDistributors } = useFetchQuery({
        // Assuming distributors endpoint now returns bottle_balance or likely we need to calculate/fetch it
        // For now, using standard distributors endpoint. 
        // In a real scenario, we might need ?include_bottle_stats=true
        url: `distributors/?search=${searchQuery}&page_size=100`,
        queryKey: ['distributors', searchQuery],
        fetchFunction: fetchWithAuth,
    });

    // Mutation for Bottle Return
    const returnBottlesMutation = useCreateUpdateMutation({
        url: 'distributors/bottles/return/', // Assumed endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Bottles returned successfully',
        onErrorMessage: 'Failed to record return',
        onSuccess: () => {
            refetchDistributors();
            setIsReturnModalOpen(false);
            setReturnQuantity('');
            setReturnNote('');
            setSelectedDistributor(null);
        },
    });

    const handleReturnClick = (distributor) => {
        setSelectedDistributor(distributor);
        setIsReturnModalOpen(true);
    };

    const handleHistoryClick = (distributor) => {
        setSelectedDistributor(distributor);
        setIsHistoryModalOpen(true);
    };

    // Add Distributor Mutation
    const createDistributorMutation = useCreateUpdateMutation({
        url: 'distributors/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Distributor added successfully',
        onErrorMessage: 'Failed to add distributor',
        onSuccess: () => {
            setIsAddDistributorModalOpen(false);
            refetchDistributors();
        },
    });

    const handleAddDistributor = (data) => {
        createDistributorMutation.mutate(JSON.stringify(data));
    };

    const handleSubmitReturn = (e) => {
        e.preventDefault();
        if (!selectedDistributor || !returnQuantity) return;

        returnBottlesMutation.mutate(JSON.stringify({
            distributor_id: selectedDistributor.id,
            quantity: parseInt(returnQuantity),
            notes: returnNote
        }));
    };

    // Calculate Stats
    const emptyBottles = inventoryData?.results?.find(item => item.name.toLowerCase().includes('19l') || item.name.toLowerCase().includes('bottle'))?.available_quantity || 0;

    // Assuming filled bottles are products. Searching for "19L" products in some way? 
    // Actually the user said "19L botttles in our inverntory (empty)". 
    // We can just show the returnable assets count.

    const distributors = distributorsData?.results || [];
    const totalBottlesWithCustomers = distributors.reduce((sum, d) => sum + (d.bottles_pending_return || 0), 0);

    return (
        <div className="flex-1 overflow-y-auto p-8 xl:p-10">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">19L Bottle Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Track empty bottles, customer holdings, and returns</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg material-symbols-outlined">recycling</span>
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Empty In Stock</h3>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{emptyBottles}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="p-2 bg-orange-100 text-orange-600 rounded-lg material-symbols-outlined">person_pin_circle</span>
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">With Customers</h3>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{totalBottlesWithCustomers}</p>
                        <p className="text-xs text-orange-500 mt-1 font-medium">To be returned</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="p-2 bg-green-100 text-green-600 rounded-lg material-symbols-outlined">inventory_2</span>
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Production</h3>
                        </div>
                        {/* Placeholder for now if we don't have filled stats easily */}
                        <p className="text-3xl font-black text-slate-900 dark:text-white">--</p>
                        <p className="text-xs text-green-500 mt-1 font-medium">Filled Bottles (Approx)</p>
                    </div>
                </div>
            </div>

            {/* Distributors Table */}
            <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Bottle Balances</h2>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Search customer..."
                            />
                        </div>
                        <button
                            onClick={() => setIsAddDistributorModalOpen(true)}
                            className="bg-eva-blue text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-lg">person_add</span> Add New
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Customer Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Area</th>
                                <th className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">Bottles With Them</th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                            {loadingDistributors ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            ) : distributors.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        No distributors found.
                                    </td>
                                </tr>
                            ) : (
                                distributors.map((distributor) => (
                                    <tr key={distributor.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {distributor.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-gray-400">
                                            {distributor.area}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${(distributor.bottles_pending_return || 0) > 0
                                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {distributor.bottles_pending_return || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleHistoryClick(distributor)}
                                                className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mr-4"
                                            >
                                                History
                                            </button>
                                            <button
                                                onClick={() => handleReturnClick(distributor)}
                                                className="text-sm font-bold text-eva-blue hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!(distributor.bottles_pending_return > 0)}
                                            >
                                                Record Return
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Return Modal */}
            {isReturnModalOpen && selectedDistributor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Record Bottle Return</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">For {selectedDistributor.name}</p>

                        <form onSubmit={handleSubmitReturn} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Number of Bottles Returned
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedDistributor.bottles_pending_return || 9999}
                                    value={returnQuantity}
                                    onChange={(e) => setReturnQuantity(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-eva-blue outline-none"
                                    placeholder="Enter quantity"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Max returnable: {selectedDistributor.bottles_pending_return || 0}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={returnNote}
                                    onChange={(e) => setReturnNote(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-eva-blue outline-none resize-none h-24"
                                    placeholder="Any damage notes or remarks..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-bold text-white bg-eva-blue rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={returnBottlesMutation.isPending}
                                >
                                    {returnBottlesMutation.isPending ? 'Processing...' : 'Confirm Return'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryModalOpen && selectedDistributor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bottle History</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Log for {selectedDistributor.name}</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-0 overflow-y-auto flex-1">
                            {loadingHistory ? (
                                <div className="p-8"><LoadingSpinner /></div>
                            ) : (!historyData?.results || historyData.results.length === 0) ? (
                                <div className="p-8 text-center text-slate-500">No history found.</div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                                            <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Action</th>
                                            <th className="px-6 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Quantity</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Balance Impact</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                        {historyData.results.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-gray-800/50">
                                                <td className="px-6 py-3 text-slate-500">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                                                    {log.type === 'sale' ? 'Bottle Sale' : 'Bottle Return'}
                                                    {log.notes && <p className="text-xs text-slate-400 font-normal">{log.notes}</p>}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${log.type === 'sale'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {log.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono font-bold">
                                                    {log.type === 'sale' ? '+' : '-'}{log.quantity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <AddDistributorModal
                isOpen={isAddDistributorModalOpen}
                onClose={() => setIsAddDistributorModalOpen(false)}
                onSave={handleAddDistributor}
            />
        </div>
    );
};

export default Bottles;

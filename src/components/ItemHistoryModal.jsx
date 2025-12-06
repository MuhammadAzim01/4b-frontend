import { fetchWithAuth } from '../utils/fetchApis';
import { useFetchQuery } from '../hooks/useFetchQuery';

const ItemHistoryModal = ({ isOpen, onClose, itemName, role }) => {
    const { data, isFetching, isError, error } = useFetchQuery({
        url: `inventory/transactions/?item=${itemName}&status=approve`,
        queryKey: [`transactions-${itemName}`],
        fetchFunction: fetchWithAuth,
        enabled: !!itemName && isOpen,
    });

    if (!isOpen || !itemName) return null;

    const stockHistory = data?.results || [];
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{itemName}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Stock History</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            No history available for this item.
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
                                    {stockHistory.map((entry) => (
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

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ItemHistoryModal;

import React, { useState, useEffect } from 'react';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchWithAuth } from '../utils/fetchApis';

const AdjustmentModal = ({ isOpen, onClose, entry, item, role }) => {
    const [formData, setFormData] = useState({
        quantity: '',
        value: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen && entry) {
            setFormData({
                quantity: '',
                value: entry.unit_cost || '',
                notes: ''
            });
        }
    }, [isOpen, entry]);

    const addAdjustmentMutation = useCreateUpdateMutation({
        url: `inventory/transactions/`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Adjustment Successfully Added',
        onErrorMessage: 'Failed to Add Adjustment',
        onSuccess: () => {
            onClose();
            // Optionally refresh parent data
            // window.location.reload(); // Or let React Query handle invalidation
        },
    });

    if (!isOpen || !entry) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        // Construct payload
        // Assuming we verify key names with backend requirements. 
        // Using common sense naming for now as user didn't specify backend schema.
        const payload = {
            item: item.id,
            quantity: Number(formData.quantity),
            parent_transaction: entry.id, // Linking to the specific transaction
            transaction_type: 'adjustment', // Explicitly marking as adjustment
            notes: formData.notes
        };

        addAdjustmentMutation.mutate(JSON.stringify(payload));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Adjustment Entry</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Item:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Supplier:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{entry.supplier?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Original Date:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{new Date(entry.transaction_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Remaining Qty:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{entry.remaining_quantity}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adjustment Quantity</label>
                        <p className="text-xs text-slate-500 mb-2">Use negative values to reduce stock (e.g., -5).</p>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note (Optional)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition resize-none"
                            placeholder="Reason for adjustment..."
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={addAdjustmentMutation.isLoading}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-eva-blue hover:bg-blue-800 text-white disabled:opacity-50"
                    >
                        {addAdjustmentMutation.isLoading ? 'Saving...' : 'Confirm Adjustment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustmentModal;

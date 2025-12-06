import React, { useState } from 'react';

import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchWithAuth } from '../utils/fetchApis';

const ApprovalModal = ({ isOpen, onClose, entry }) => {
    const [unitValue, setUnitValue] = useState('');

    const approveTransactionMutation = useCreateUpdateMutation({
        url: `inventory/transactions/${entry?.id}/`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: "Transaction Successfully Approved",
        onErrorMessage: "Failed to Approve Transaction",
        onSuccess: () => {
            setTimeout(() => {
                window.location.reload();
            }, 500);
            onClose();
        },
    });
    
    const handleSubmit = () => {
        approveTransactionMutation.mutate(JSON.stringify({ unit_cost: Number(unitValue) }));
    };
    
    if (!isOpen || !entry) return null;

    const totalCost = (entry.quantity * Number(unitValue)).toFixed(2);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Approve Stock</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Item</p>
                        <p className="font-medium text-slate-900 dark:text-white">{entry.item.name}</p>
                        <div className="mt-2 flex justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Quantity</p>
                                <p className="font-medium text-slate-900 dark:text-white">{entry.quantity} {entry.item.unit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Supplier</p>
                                <p className="font-medium text-slate-900 dark:text-white">{entry.supplier?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Cost</label>
                        <input
                            type="number"
                            value={unitValue}
                            onChange={(e) => setUnitValue(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Cost</label>
                        <input
                            type="text"
                            readOnly
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            value={`₹${totalCost}`}
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white">Approve & Add</button>
                </div>
            </div>
        </div>
    );
};

export default ApprovalModal;

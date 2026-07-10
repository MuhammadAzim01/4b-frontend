import React, { useState, useEffect } from 'react';

const AddStockModal = ({ isOpen, onClose, onAdd, product, isLoading }) => {
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setQuantity('');
            setNotes('');
        }
    }, [isOpen, product?.id]);

    if (!isOpen || !product) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!quantity || parseFloat(quantity) <= 0) return;
        onAdd({
            quantity: parseFloat(quantity),
            notes: notes.trim(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Stock</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Product:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{product.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Current Stock:</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {product.stock_quantity} {product.unit || 'units'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Quantity to Add <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="number"
                            min="0.01"
                            step="any"
                            value={quantity}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || parseFloat(val) > 0) setQuantity(val);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            placeholder={`Enter quantity in ${product.unit || 'units'}`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="2"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                            placeholder="Reason for stock addition..."
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !quantity}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Adding...' : 'Add Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStockModal;

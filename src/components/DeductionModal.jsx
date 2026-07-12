import React, { useState, useEffect } from 'react';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';
import { toast } from 'sonner';

const DeductionModal = ({ isOpen, onClose }) => {
    const [items, setItems] = useState([{ id: Date.now(), itemId: '', quantity: '', note: '', search: '' }]);
    const [globalNote, setGlobalNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch all raw materials once on modal load
    const { data } = useFetchQuery({
        url: `inventory/items/?category=raw_materials&page_size=1000`,
        queryKey: ['items', 'raw_materials_all'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
    });

    const rawMaterials = data?.results || [];

    useEffect(() => {
        if (isOpen) {
            setItems([{ id: Date.now(), itemId: '', quantity: '', note: '', search: '' }]);
            setGlobalNote('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddRow = () => {
        setItems([...items, { id: Date.now(), itemId: '', quantity: '', note: '', search: '' }]);
    };

    const handleRemoveRow = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleRowChange = (id, field, value) => {
        setItems(items.map(item => {
            if (item.id === id) {
                // If selection changes, reset search text to empty or update search
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleSubmit = async () => {
        // Validate all rows
        for (let i = 0; i < items.length; i++) {
            const row = items[i];
            if (!row.itemId) {
                alert(`Please select a raw material for row ${i + 1}`);
                return;
            }
            if (!row.quantity || Number(row.quantity) <= 0) {
                alert(`Please enter a valid quantity greater than 0 for row ${i + 1}`);
                return;
            }
            const selectedItem = rawMaterials.find(item => item.id === Number(row.itemId));
            if (selectedItem && Number(selectedItem.available_quantity) < Number(row.quantity)) {
                alert(`Insufficient stock for ${selectedItem.name}. Only ${selectedItem.available_quantity} available.`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const promises = items.map(row => {
                const noteParts = [globalNote, row.note].filter(Boolean).join(' - ');
                const payload = {
                    item: Number(row.itemId),
                    supplier: "Internal Consumption",
                    quantity: -Number(row.quantity),
                    notes: noteParts || "Direct stock deduction"
                };
                return fetchWithAuth('inventory/transactions/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            });

            await Promise.all(promises);
            toast.success("Stock Deducted Successfully");
            onClose();
            setTimeout(() => {
                window.location.reload();
            }, 300);
        } catch (error) {
            console.error("Deduction error:", error);
            toast.error(error.message || "Failed to Deduct Stock");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Deduct Stock / Use Raw Materials</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="space-y-3">
                        {items.map((row, index) => {
                            const selectedInOtherRows = items
                                .filter(item => item.id !== row.id && item.itemId)
                                .map(item => Number(item.itemId));
                            
                            const filteredOptions = rawMaterials.filter(option => {
                                const matchesSearch = option.name.toLowerCase().includes((row.search || '').toLowerCase());
                                const isSelectedElsewhere = selectedInOtherRows.includes(option.id);
                                return matchesSearch && !isSelectedElsewhere;
                            });

                            return (
                                <div key={row.id} className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg space-y-3 relative bg-slate-50/50 dark:bg-slate-800/10 animate-in fade-in duration-200">
                                    {items.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveRow(row.id)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                            title="Remove item"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 md:pt-0">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Search Material</label>
                                            <input
                                                type="text"
                                                value={row.search || ''}
                                                onChange={(e) => handleRowChange(row.id, 'search', e.target.value)}
                                                placeholder="Type to search..."
                                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Select Raw Material</label>
                                            <select
                                                required
                                                value={row.itemId}
                                                onChange={(e) => handleRowChange(row.id, 'itemId', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition text-sm"
                                            >
                                                <option value="">Select Raw Material</option>
                                                {row.itemId && !filteredOptions.some(o => o.id === Number(row.itemId)) && (() => {
                                                    const selectedObj = rawMaterials.find(o => o.id === Number(row.itemId));
                                                    return selectedObj ? (
                                                        <option key={selectedObj.id} value={selectedObj.id}>
                                                            {selectedObj.name} (Avl: {selectedObj.available_quantity} {selectedObj.unit})
                                                        </option>
                                                    ) : null;
                                                })()}
                                                {filteredOptions.map(item => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name} (Avl: {item.available_quantity} {item.unit})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Quantity</label>
                                            <input
                                                required
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={row.quantity}
                                                onChange={(e) => handleRowChange(row.id, 'quantity', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Item Note / Reason</label>
                                            <input
                                                type="text"
                                                value={row.note}
                                                onChange={(e) => handleRowChange(row.id, 'note', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition text-sm"
                                                placeholder="e.g. wastage, direct use"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleAddRow}
                        className="flex items-center gap-1 text-xs font-bold text-eva-blue hover:text-blue-800 transition-colors pt-2"
                    >
                        <span className="material-symbols-outlined text-sm">add</span> Add Another Item
                    </button>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Global Note / Reason (Optional)</label>
                        <textarea
                            value={globalNote}
                            onChange={(e) => setGlobalNote(e.target.value)}
                            rows="2"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition resize-none"
                            placeholder="Reason for deduction (e.g. general wastage, direct usage)..."
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? 'Deducting...' : 'Confirm Deduction'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeductionModal;

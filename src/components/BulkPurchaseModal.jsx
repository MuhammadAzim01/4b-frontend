import React, { useState, useEffect } from 'react';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';

const BulkPurchaseModal = ({ isOpen, onClose, role }) => {
    const [supplier, setSupplier] = useState('');
    const [isCustomSupplier, setIsCustomSupplier] = useState(false);
    const [customSupplierName, setCustomSupplierName] = useState('');
    const [items, setItems] = useState([{ id: Date.now(), item: '', quantity: '', unit_cost: '' }]);
    const [amountPaid, setAmountPaid] = useState('');
    const [category, setCategory] = useState('raw_materials');
    const [note, setNote] = useState('');

    // Fetch Suppliers
    const { data: suppliersResult } = useFetchQuery({
        url: `inventory/suppliers/`,
        queryKey: ['suppliers'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
    });
    const suppliers = suppliersResult?.results || [];

    // Fetch Items based on category
    const { data: itemsResult } = useFetchQuery({
        url: `inventory/items/?category=${category}&page_size=100`, // increased page size for dropdown
        queryKey: ['items', category],
        fetchFunction: fetchWithAuth,
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
    });
    const availableItems = itemsResult?.results || [];

    const bulkTransactionMutation = useCreateUpdateMutation({
        url: 'inventory/bulk-transactions/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Bulk Transaction Successfully Added',
        onErrorMessage: 'Failed to Add Bulk Transaction',
        onSuccess: () => {
            setTimeout(() => {
                window.location.reload();
            }, 300);
        },
    });

    // Calculations
    const calculateTotalCost = () => {
        return items.reduce((acc, curr) => {
            return acc + (Number(curr.quantity || 0) * Number(curr.unit_cost || 0));
        }, 0);
    };

    const totalCost = calculateTotalCost();
    const pendingAmount = Math.max(0, totalCost - Number(amountPaid || 0));

    // Handlers
    const handleSupplierChange = (e) => {
        const val = e.target.value;
        if (val === 'others') {
            setSupplier('');
            setIsCustomSupplier(true);
        } else {
            setSupplier(val);
            setIsCustomSupplier(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), item: '', quantity: '', unit_cost: '' }]);
    };

    const handleRemoveItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const handleItemChange = (id, field, value) => {
        const newItems = items.map(i => {
            if (i.id === id) {
                // validation for numbers
                if ((field === 'quantity' || field === 'unit_cost') && value !== '' && parseFloat(value) < 0) {
                    return i;
                }
                return { ...i, [field]: value };
            }
            return i;
        });
        setItems(newItems);
    };

    const handleSubmit = () => {
        // Validate
        if (!supplier && !customSupplierName) {
            alert("Please select a supplier");
            return;
        }

        const validItems = items.filter(i => i.item && Number(i.quantity) > 0);
        if (validItems.length === 0) {
            alert("Please add at least one valid item");
            return;
        }

        const payload = {
            supplier: isCustomSupplier ? customSupplierName : supplier, // Handle backend expectation for supplier name vs ID?
            // Assuming backend can handle name if custom, or needs ID. 
            // PurchaseModal uses ID for existing, but sends name if custom? 
            // Standard PurchaseModal: `supplier: formData.supplier` which is name if custom, ID if selected.

            items: validItems.map(i => ({
                item: i.item,
                quantity: Number(i.quantity),
                unit_cost: Number(i.unit_cost)
            })),
            amount_paid: Number(amountPaid || 0),
            notes: note,
            transaction_type: "sale"
        };

        // Note: If backend requires 'supplier' to be an ID integer, 'others' logic might fail if it sends a string.
        // In PurchaseModal logic: `supplier: formData.supplier`.
        // If 'others', `formData.supplier` is the text name. 
        // So backend must handle mixed ID/Name or validation. safely assuming same behavior here.

        bulkTransactionMutation.mutate(JSON.stringify(payload));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bulk Purchase Stock</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Header Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                            >
                                <option value="raw_materials">Raw Materials</option>
                                <option value="plant_assets">Plant Assets</option>
                                <option value="returnable_assets">Returnable Assets</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
                            <div className="flex gap-2">
                                <select
                                    value={isCustomSupplier ? 'others' : supplier}
                                    onChange={handleSupplierChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                    <option value="others">Others (Custom)</option>
                                </select>
                                {isCustomSupplier && (
                                    <input
                                        type="text"
                                        value={customSupplierName}
                                        onChange={(e) => setCustomSupplierName(e.target.value)}
                                        placeholder="Supplier Name"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-slate-900 dark:text-white">Items</h4>
                            <button
                                onClick={handleAddItem}
                                className="text-sm text-eva-blue hover:underline flex items-center gap-1 font-medium"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Add Item
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-2">Item</th>
                                        <th className="px-4 py-2 w-32">Quantity</th>
                                        {role === 'admin' && <th className="px-4 py-2 w-32">Unit Cost</th>}
                                        {role === 'admin' && <th className="px-4 py-2 w-32 text-right">Total</th>}
                                        <th className="px-4 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {items.map((row, index) => (
                                        <tr key={row.id}>
                                            <td className="p-3">
                                                <select
                                                    value={row.item}
                                                    onChange={(e) => handleItemChange(row.id, 'item', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 focus:ring-1 focus:ring-eva-blue outline-none"
                                                >
                                                    <option value="">Select Item</option>
                                                    {availableItems.map(item => (
                                                        <option key={item.id} value={item.id}>{item.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={row.quantity}
                                                    onChange={(e) => handleItemChange(row.id, 'quantity', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 focus:ring-1 focus:ring-eva-blue outline-none"
                                                    placeholder="0"
                                                />
                                            </td>
                                            {role === 'admin' && (
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.unit_cost}
                                                        onChange={(e) => handleItemChange(row.id, 'unit_cost', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 focus:ring-1 focus:ring-eva-blue outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                            )}
                                            {role === 'admin' && (
                                                <td className="p-3 text-right font-medium text-slate-900 dark:text-white">
                                                    {(Number(row.quantity || 0) * Number(row.unit_cost || 0)).toFixed(2)}
                                                </td>
                                            )}
                                            <td className="p-3 text-center">
                                                {items.length > 1 && (
                                                    <button
                                                        onClick={() => handleRemoveItem(row.id)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary & Payment */}
                    {role === 'admin' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note (Optional)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition resize-none"
                                    placeholder="Invoice details, etc..."
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                    <span>Total Invoice Value:</span>
                                    <span className="font-bold text-xl">Rs. {totalCost.toFixed(2)}</span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount Paid (Rs.)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={amountPaid}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) setAmountPaid(val);
                                        }}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 flex justify-between items-center">
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">Pending Amount</span>
                                    <span className={`font-bold text-lg ${pendingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        Rs. {pendingAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 rounded-lg text-sm font-bold bg-eva-blue text-white hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/20"
                    >
                        Confirm Bulk Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkPurchaseModal;

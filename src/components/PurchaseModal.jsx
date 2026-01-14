import React, { useState } from 'react';

import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';

const PurchaseModal = ({ isOpen, onClose, role, onOpenCreateModal }) => {
    const [formData, setFormData] = useState({
        name: '',
        supplier: '',
        quantity: '',
        unitValue: '',
        category: 'raw_materials',
        note: '',
        amountPaid: ''
    });
    const [isCustomSupplier, setIsCustomSupplier] = useState(false);
    const [itemSearch, setItemSearch] = useState('');

    const addItemTransactionMutation = useCreateUpdateMutation({
        url: `inventory/transactions/`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Transaction Successfully Added',
        onErrorMessage: 'Failed to Add Transaction',
        onSuccess: () => {
            setTimeout(() => {
                window.location.reload();
            }, 300);
        },
    });
    // Filter items based on selected category
    const { data, isFetching, isError, error } = useFetchQuery({
        url: `inventory/items/?category=${formData.category}&search=${itemSearch}`,
        queryKey: ['items', formData.category, itemSearch],
        fetchFunction: fetchWithAuth,
        enabled: !!formData.category && isOpen,
        staleTime: 5 * 60 * 1000,
    });

    const { data: suppliersResult } = useFetchQuery({
        url: `inventory/suppliers/`,
        queryKey: ['suppliers'],
        fetchFunction: fetchWithAuth,
        enabled: !!formData.category && isOpen,
        staleTime: 5 * 60 * 1000,
    });



    const suppliers = suppliersResult?.results || [];

    const categoryItems = data?.results.map(item => ({ id: item.id, name: item.name })) || [];

    if (!isOpen) return null;


    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'category') {
            setFormData(prev => ({ ...prev, [name]: value, name: '' }));
        } else if (name === 'itemSelect') {
            if (value === 'others') {
                onClose();
                if (onOpenCreateModal) {
                    onOpenCreateModal();
                }
            } else {
                setFormData(prev => ({ ...prev, name: value }));
            }
        } else if (name === 'quantity' || name === 'unitValue' || name === 'amountPaid') {
            // Prevent negative values
            if (value === '' || parseFloat(value) >= 0) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSupplierChange = (e) => {
        const { name, value } = e.target;
        if (name === 'supplierSelect') {
            if (value === 'others') {
                setFormData(prev => ({ ...prev, supplier: '' }));
                setIsCustomSupplier(true);
            } else {
                setIsCustomSupplier(false);
                setFormData(prev => ({ ...prev, supplier: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = () => {
        const newItem = {
            item: formData.name,
            supplier: formData.supplier,
            quantity: Number(formData.quantity),
            unit_cost: role === 'admin' ? Number(formData.unitValue) : 0,
            amount_paid: role === 'admin' ? (formData.amountPaid ? Number(formData.amountPaid) : 0) : 0,
            pending_amount: role === 'admin' ? (Number(totalCost) - (formData.amountPaid ? Number(formData.amountPaid) : 0)).toFixed(2) : 0,
            notes: formData.note
        };

        addItemTransactionMutation.mutate(JSON.stringify(newItem));
        onClose();
    };

    const totalCost = (Number(formData.quantity) * Number(formData.unitValue)).toFixed(2);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Stock</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Type</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                        >
                            <option value="raw_materials">Raw Materials</option>
                            <option value="plant_assets">Plant Assets</option>
                            <option value="returnable_assets">Returnable Assets</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
                        {/* Search Input for Items */}
                        <input
                            type="text"
                            value={itemSearch}
                            onChange={(e) => setItemSearch(e.target.value)}
                            placeholder="Search item..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition mb-2 text-sm"
                        />
                        <select
                            name="itemSelect"
                            onChange={handleChange}
                            value={formData.name}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition mb-2"
                        >
                            <option value="">Select Item</option>
                            {categoryItems.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                            <option value="others">Others (Custom)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
                        <select
                            name="supplierSelect"
                            onChange={handleSupplierChange}
                            value={isCustomSupplier ? 'others' : formData.supplier}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition mb-2"
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                            <option value="others">Others (Custom)</option>
                        </select>
                        {isCustomSupplier && (
                            <input
                                type="text"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleSupplierChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                placeholder="Enter supplier name"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                min={0}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                placeholder="0"
                            />
                        </div>
                        {role === 'admin' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Cost (Rs.)</label>
                                <input
                                    type="number"
                                    name="unitValue"
                                    value={formData.unitValue}
                                    min={0}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                    </div>

                    {role === 'admin' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount Paid (Rs.)</label>
                                <input
                                    type="number"
                                    name="amountPaid"
                                    value={formData.amountPaid}
                                    min={0}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Amount</span>
                                    <span className={`block text-lg font-bold ${(Number(totalCost) - (formData.amountPaid ? Number(formData.amountPaid) : 0)) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        Rs. {(Number(totalCost) - (formData.amountPaid ? Number(formData.amountPaid) : 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {role === 'admin' && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Total Cost:</span>
                                <span className="font-bold text-slate-900 dark:text-white">Rs. {totalCost}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note (Optional)</label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition resize-none"
                            placeholder="Add any additional details..."
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white">
                        {role === 'accountant' ? 'Add to Pending' : 'Confirm Purchase'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseModal;

import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';

const PurchaseModal = ({ isOpen, onClose, role }) => {
    const { addStockRequest, addDirectStock, inventoryItems } = useInventory();
    const [formData, setFormData] = useState({
        name: '',
        supplier: '',
        quantity: '',
        unitValue: '',
        category: 'raw_materials',
        note: ''
    });
    const [isCustomItem, setIsCustomItem] = useState(false);

    if (!isOpen) return null;

    // Filter items based on selected category
    const categoryItems = inventoryItems.filter(item => item.category === formData.category);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'category') {
            setFormData(prev => ({ ...prev, [name]: value, name: '' }));
            setIsCustomItem(false);
        } else if (name === 'itemSelect') {
            if (value === 'others') {
                setIsCustomItem(true);
                setFormData(prev => ({ ...prev, name: '' }));
            } else {
                setIsCustomItem(false);
                setFormData(prev => ({ ...prev, name: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = () => {
        const newItem = {
            name: formData.name,
            supplier: formData.supplier,
            quantity: Number(formData.quantity),
            unitValue: role === 'admin' ? Number(formData.unitValue) : 0,
            unit: 'units', // Default unit for now
            category: formData.category,
            note: formData.note
        };

        if (role === 'admin') {
            addDirectStock(newItem);
            alert('Stock purchased successfully!');
        } else {
            addStockRequest(newItem);
            alert('Stock request added to pending list.');
        }
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
                        <select
                            name="itemSelect"
                            onChange={handleChange}
                            value={isCustomItem ? 'others' : formData.name}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition mb-2"
                        >
                            <option value="">Select Item</option>
                            {categoryItems.map(item => (
                                <option key={item.id} value={item.name}>{item.name}</option>
                            ))}
                            <option value="others">Others (Custom)</option>
                        </select>

                        {isCustomItem && (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                placeholder="Enter custom item name"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
                        <input
                            type="text"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                            placeholder="Enter supplier name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                placeholder="0"
                            />
                        </div>
                        {role === 'admin' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Cost (₹)</label>
                                <input
                                    type="number"
                                    name="unitValue"
                                    value={formData.unitValue}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                    </div>

                    {role === 'admin' && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Total Cost:</span>
                                <span className="font-bold text-slate-900 dark:text-white">₹{totalCost}</span>
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

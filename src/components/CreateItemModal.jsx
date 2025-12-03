import React, { useState } from 'react';

import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchWithAuth } from '../utils/fetchApis';
import { useInventory } from '../context/InventoryContext';

const CreateItemModal = ({ isOpen, onClose }) => {
    const { addNewItem } = useInventory();

    const addItemMutation = useCreateUpdateMutation({
        url: `inventory/items/`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Item Successfully Added',
        onErrorMessage: 'Failed to Add Item',
        onSuccess: () => {
            setTimeout(() => {
                window.location.reload();
            }, 300);
        },
    });
    const [formData, setFormData] = useState({
        name: '',
        category: 'raw_materials',
        unit: 'units',
        description: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.name) {
            alert('Item name is required');
            return;
        }
        addNewItem(formData);
        addItemMutation.mutate(JSON.stringify(formData));
        alert('New item created successfully!');
        setFormData({
            name: '',
            category: 'raw_materials',
            unit: 'units',
            description: ''
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Item</h3>
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
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                            placeholder="Enter item name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                        >
                            <option value="units">Units</option>
                            <option value="kg">Kg</option>
                            <option value="L">Liters</option>
                            <option value="m">Meters</option>
                            <option value="pcs">Pieces</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition resize-none"
                            placeholder="Add description..."
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-lg text-sm font-semibold bg-eva-blue hover:bg-blue-800 text-white">
                        Create Item
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateItemModal;

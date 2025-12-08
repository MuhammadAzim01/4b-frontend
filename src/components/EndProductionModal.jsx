
import React, { useState } from 'react';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';

const EndProductionModal = ({ isOpen, onClose, onEnd, runData }) => {
    const [productId, setProductId] = useState('');
    const [outputQuantity, setOutputQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [wasteItems, setWasteItems] = useState([]);

    // Fetch products (finished goods)
    const { data } = useFetchQuery({
        url: 'production/products/',
        queryKey: ['products'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen,
    });

    const products = data?.results || [];

    const handleAddWaste = () => {
        setWasteItems([...wasteItems, { id: Date.now(), materialId: '', quantity: '' }]);
    };

    const handleRemoveWaste = (id) => {
        setWasteItems(wasteItems.filter(m => m.id !== id));
    };

    // Get max waste quantity for a material (cannot exceed quantity_used)
    const getMaxWasteQuantity = (materialId) => {
        const material = runData?.raw_materials?.find(m => m.raw_material.toString() === materialId);
        return material ? parseFloat(material.quantity_used) : 0;
    };

    const handleWasteChange = (id, field, value) => {
        if (field === 'quantity') {
            const wasteItem = wasteItems.find(w => w.id === id);
            if (wasteItem && wasteItem.materialId) {
                const maxWaste = getMaxWasteQuantity(wasteItem.materialId);
            
                if (value !== '' && (parseFloat(value) < 0 || parseFloat(value) > maxWaste)) {
                    return;
                }
            } else if (value !== '' && parseFloat(value) < 0) {
                return;
            }
        }
        setWasteItems(wasteItems.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleMaxWaste = (id, materialId) => {
        const material = runData?.raw_materials?.find(m => m.raw_material.toString() === materialId);
        if (material) {
            handleWasteChange(id, 'quantity', material.quantity_used);
        }
    };

    // Get available materials for waste (not already selected)
    const getAvailableWasteMaterials = (currentMaterialId) => {
        const selectedIds = wasteItems.map(w => w.materialId).filter(id => id !== currentMaterialId);
        return runData?.raw_materials?.filter(item => 
            !selectedIds.includes(item.raw_material.toString())
        ) || [];
    };

    const handleOutputQuantityChange = (value) => {
        // Prevent negative values for output quantity
        if (value !== '' && parseFloat(value) < 0) {
            return;
        }
        setOutputQuantity(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const wasteSummary = wasteItems
            .filter(w => w.materialId && w.quantity)
            .map(w => {
                const material = runData?.raw_materials?.find(m => m.raw_material.toString() === w.materialId);
                return { 
                    materialId: w.materialId, 
                    quantity: w.quantity,
                    name: material ? material.raw_material_name : 'Unknown'
                };
            });

        onEnd({
            productId,
            outputQuantity,
            waste: wasteSummary,
            notes
        });
    };

    if (!isOpen || !runData) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Production Run</h2>
                        <p className="text-sm text-slate-500">Batch: <span className="font-mono text-slate-700 dark:text-slate-300">{runData?.batch_number}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Output Section */}
                    <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-800">
                        <h3 className="text-sm font-bold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined">inventory_2</span>
                            Production Output
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Finished Good</label>
                                <select
                                    required
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-green-500 outline-none text-slate-900 dark:text-white"
                                >
                                    <option value="">Select Product</option>
                                    {products?.map(product => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Quantity Produced</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="Qty"
                                    min="0.01"
                                    step="0.01"
                                    value={outputQuantity}
                                    onChange={(e) => handleOutputQuantityChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-green-500 outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Waste Section */}
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-800">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
                                <span className="material-symbols-outlined">delete_outline</span>
                                Waste / Scrap
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddWaste}
                                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Add Waste Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {wasteItems.map((field) => {
                                const availableMaterials = getAvailableWasteMaterials(field.materialId);
                                const maxWaste = getMaxWasteQuantity(field.materialId);
                                
                                return (
                                    <div key={field.id} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <select
                                                value={field.materialId}
                                                onChange={(e) => handleWasteChange(field.id, 'materialId', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
                                            >
                                                <option value="">Select Material</option>
                                                {availableMaterials.map(item => (
                                                    <option key={item.raw_material} value={item.raw_material}>
                                                        {item.raw_material_name} (Used: {item.quantity_used})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                min="0"
                                                step="1"
                                                max={maxWaste}
                                                value={field.quantity}
                                                onChange={(e) => handleWasteChange(field.id, 'quantity', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        {field.materialId && (
                                            <button
                                                type="button"
                                                onClick={() => handleMaxWaste(field.id, field.materialId)}
                                                className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-600"
                                                title="Use maximum quantity used"
                                            >
                                                MAX
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveWaste(field.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about this production run..."
                            rows="3"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Complete Run
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EndProductionModal;

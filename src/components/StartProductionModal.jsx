
import React, { useState } from 'react';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from './ui/LoadingSpinner';


const StartProductionModal = ({ isOpen, onClose, onStart }) => {
    const [activeTab, setActiveTab] = useState('water_pet'); // 'water_pet' or 'bottle_blowing'
    const [materials, setMaterials] = useState([{ id: Date.now(), materialId: '', quantity: '' }]);

    const { data: rawMaterials, isFetching } = useFetchQuery({
        url: 'inventory/items/?category=raw_materials',
        queryKey: ['raw_materials'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen,
    });

    const { data: returnableAssets, isFetching: isFetchingAssets } = useFetchQuery({
        url: 'inventory/items/?category=returnable_assets',
        queryKey: ['returnable_assets'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen,
    });

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Reset to single material row when switching tabs
        setMaterials([{ id: Date.now(), materialId: '', quantity: '' }]);
    };

    const handleAddMaterial = () => {
        setMaterials([...materials, { id: Date.now(), materialId: '', quantity: '' }]);
    };

    const handleRemoveMaterial = (id) => {
        if (materials.length > 1) {
            setMaterials(materials.filter(m => m.id !== id));
        }
    };

    // Combine raw materials and returnable assets
    const allMaterials = [
        ...(rawMaterials?.results || []),
        ...(returnableAssets?.results || [])
    ];

    // Get max quantity for a material
    const getMaxQuantity = (materialId) => {
        const material = allMaterials.find(item => item.id.toString() === materialId);
        return material ? parseFloat(material.available_quantity) : 0;
    };

    const handleMaterialChange = (id, field, value) => {
        if (field === 'quantity') {
            // Get the material to check max quantity
            const material = materials.find(m => m.id === id);
            if (material && material.materialId) {
                const maxQty = getMaxQuantity(material.materialId);
                // Prevent negative and values exceeding max
                if (value !== '' && (parseFloat(value) < 0 || parseFloat(value) > maxQty)) {
                    return;
                }
            } else if (value !== '' && parseFloat(value) < 0) {
                // If no material selected yet, just prevent negative
                return;
            }
        }
        setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleMaxClick = (id, materialId) => {
        const material = allMaterials.find(item => item.id.toString() === materialId);
        if (material) {
            handleMaterialChange(id, 'quantity', material.available_quantity);
        }
    };

    // Get available materials (not already selected and has quantity > 0)
    const getAvailableMaterials = (currentMaterialId) => {
        if (activeTab == 'bottle_blowing') {
            return rawMaterials?.results?.filter(item =>
                item.name.includes('Preform') && parseFloat(item.available_quantity) > 0
            ) || [];
        }

        const selectedIds = materials.map(m => m.materialId).filter(id => id !== currentMaterialId);

        // Return both raw materials and returnable assets
        // We can group them in the select using <optgroup> if needed, but for now flat list is fine
        return allMaterials.filter(item =>
            !selectedIds.includes(item.id.toString()) && parseFloat(item.available_quantity) > 0
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onStart(materials, activeTab == 'bottle_blowing');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Start New Production Run</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-6 pt-4">
                    <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => handleTabChange('water_pet')}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'water_pet'
                                ? 'border-eva-blue text-eva-blue'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                }`}
                        >
                            Water Pet Production
                        </button>
                        <button
                            onClick={() => handleTabChange('bottle_blowing')}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'bottle_blowing'
                                ? 'border-eva-blue text-eva-blue'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                }`}
                        >
                            Bottle Blowing
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-slate-900 dark:text-white">Raw Materials Used</label>
                            {activeTab === 'water_pet' && (
                                <button
                                    type="button"
                                    onClick={handleAddMaterial}
                                    className="text-xs font-bold text-eva-blue hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span> Add Material
                                </button>
                            )}
                        </div>

                        {materials.map((field, index) => {
                            const availableMaterials = getAvailableMaterials(field.materialId);
                            const maxQty = getMaxQuantity(field.materialId);

                            return (
                                <div key={field.id} className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <select
                                            required
                                            value={field.materialId}
                                            onChange={(e) => handleMaterialChange(field.id, 'materialId', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                        >
                                            <option value="">Select Material</option>
                                            {isFetching ? (
                                                <option disabled>Loading...</option>
                                            ) : (
                                                availableMaterials.map(item => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name} (Avl: {item.available_quantity})
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <input
                                            required
                                            type="number"
                                            placeholder="Qty"
                                            min="1"
                                            step="1"
                                            max={maxQty}
                                            value={field.quantity}
                                            onChange={(e) => handleMaterialChange(field.id, 'quantity', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    {field.materialId && (
                                        <button
                                            type="button"
                                            onClick={() => handleMaxClick(field.id, field.materialId)}
                                            className="px-3 py-2 text-xs font-bold text-eva-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-eva-blue"
                                            title="Use maximum available"
                                        >
                                            MAX
                                        </button>
                                    )}
                                    {materials.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMaterial(field.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
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
                            className="px-4 py-2 text-sm font-bold text-white bg-eva-blue rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">play_arrow</span>
                            Start Production
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default StartProductionModal;

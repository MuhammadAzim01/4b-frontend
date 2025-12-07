
import React, { useState } from 'react';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from './ui/LoadingSpinner';


const StartProductionModal = ({ isOpen, onClose, onStart }) => {
    const [materials, setMaterials] = useState([{ id: Date.now(), materialId: '', quantity: '' }]);
    const [shouldPrint, setShouldPrint] = useState(true);

    const { data: rawMaterials, isFetching } = useFetchQuery({
        url: 'inventory/items/?category=raw_materials',
        queryKey: ['raw_materials'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen,
    });

    const handleAddMaterial = () => {
        setMaterials([...materials, { id: Date.now(), materialId: '', quantity: '' }]);
    };

    const handleRemoveMaterial = (id) => {
        if (materials.length > 1) {
            setMaterials(materials.filter(m => m.id !== id));
        }
    };

    const handleMaterialChange = (id, field, value) => {
        setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Enrich materials with name for display/printing
        const enrichedMaterials = materials.map(m => {
            const item = rawMaterials?.results?.find(r => r.id.toString() === m.materialId);
            return {
                ...m,
                name: item ? item.name : 'Unknown Material'
            };
        });

        onStart(enrichedMaterials, shouldPrint);
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

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-slate-900 dark:text-white">Raw Materials Used</label>
                            <button
                                type="button"
                                onClick={handleAddMaterial}
                                className="text-xs font-bold text-eva-blue hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Add Material
                            </button>
                        </div>

                        {materials.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-start">
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
                                            rawMaterials?.results?.map(item => (
                                                <option key={item.id} value={item.id}>{item.name} (Avl: {item.available_quantity})</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div className="w-32">
                                    <input
                                        required
                                        type="number"
                                        placeholder="Qty"
                                        value={field.quantity}
                                        onChange={(e) => handleMaterialChange(field.id, 'quantity', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                    />
                                </div>
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
                        ))}
                    </div>



                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={shouldPrint}
                                onChange={(e) => setShouldPrint(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-eva-blue focus:ring-eva-blue"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Print Job Sheet / Invoice</span>
                        </label>

                        <div className="flex gap-3">
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
                                {shouldPrint ? <span className="material-symbols-outlined text-lg">print</span> : <span className="material-symbols-outlined text-lg">play_arrow</span>}
                                {shouldPrint ? "Start & Print" : "Start Run"}
                            </button>
                        </div>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default StartProductionModal;

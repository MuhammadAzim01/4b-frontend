
import React, { useState } from 'react';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';

const EndProductionModal = ({ isOpen, onClose, onEnd, runData }) => {
    const [outputItem, setOutputItem] = useState('');
    const [outputQuantity, setOutputQuantity] = useState('');

    // Waste tracking - potentially multiple waste items
    const [wasteItems, setWasteItems] = useState([{ id: Date.now(), materialId: '', quantity: '' }]);

    // Fetch finished goods for output selection
    const { data: finishedGoods } = useFetchQuery({
        url: 'inventory/items/?category=plant_assets', // Assuming finished goods are here or we need a new category. prompt implies 'Finished Good'
        // Actually, per prompt "End good produced". I will assume standard items for now or maybe 'returnable_assets' or just all items?
        // Let's stick to 'plant_assets' or just query all items if category isn't clear.
        // Re-reading: "end good produced". In a real app this might be a specific category 'Finished Goods'. 
        // For now I'll use 'plant_assets' as a placeholder or maybe just fetch all items. 
        // Let's use 'raw_materials' for waste selection (usually waste is raw material scrap).
        queryKey: ['finished_goods'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen,
    });

    // Reuse raw materials query for waste selection
    const { data: rawMaterials } = useFetchQuery({
        url: 'inventory/items/?category=raw_materials',
        queryKey: ['raw_materials'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen,
    });

    const handleAddWaste = () => {
        setWasteItems([...wasteItems, { id: Date.now(), materialId: '', quantity: '' }]);
    };

    const handleRemoveWaste = (id) => {
        setWasteItems(wasteItems.filter(m => m.id !== id));
    };

    const handleWasteChange = (id, field, value) => {
        setWasteItems(wasteItems.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: Output cannot exceed input.
        // Assumes 1 unit of product requires at least 1 unit of input material (simplest 1:1 case).
        // Find the limiting factor (material with lowest quantity) or just sum them? 
        // User request: "if i start the run for 50 material i cannot produced 51 or more with it".
        // This implies for a single material run. For multi-material, usually the main material triggers the limit.
        // Let's take the sum of inputs vs sum of outputs? Or check against each input?
        // Safest assumption given "50 material -> 51 produced" example: Total Output <= Total Input 
        // OR more strictly: Output <= Input for EACH unit. 
        // Let's assume the user means the Total Count of the main material. 
        // We actually track 'quantity' in 'runData.materials'.

        // Let's sum up all input quantities from the run data
        const totalInput = runData?.materials?.reduce((acc, m) => acc + parseInt(m.quantity || 0), 0) || 0;
        const totalOutput = parseInt(outputQuantity || 0);

        if (totalOutput > totalInput) {
            alert(`Error: Output quantity (${totalOutput}) cannot exceed total input quantity (${totalInput}).`);
            return;
        }

        const wasteSummary = wasteItems
            .filter(w => w.materialId && w.quantity) // Filter out empty entries
            .map(w => {
                const item = rawMaterials?.results?.find(r => r.id.toString() === w.materialId);
                return { ...w, name: item ? item.name : 'Unknown' };
            });

        const outputItemName = finishedGoods?.results?.find(r => r.id.toString() === outputItem)?.name || 'Unknown Item';

        onEnd({
            outputItem,
            outputItemName,
            outputQuantity,
            waste: wasteSummary
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Production Run</h2>
                        <p className="text-sm text-slate-500">Run ID: <span className="font-mono text-slate-700 dark:text-slate-300">{runData?.id}</span></p>
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
                                    value={outputItem}
                                    onChange={(e) => setOutputItem(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-green-500 outline-none text-slate-900 dark:text-white"
                                >
                                    <option value="">Select Item</option>
                                    <option value="1">Water Bottle - 500ml</option>
                                    <option value="2">Water Bottle - 1L</option>
                                    {/* Hardcoding options for now as I don't have a dedicated finished goods endpoint confirmed */}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Quantity Produced</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="Qty"
                                    value={outputQuantity}
                                    onChange={(e) => setOutputQuantity(e.target.value)}
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
                            {wasteItems.map((field) => (
                                <div key={field.id} className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <select
                                            value={field.materialId}
                                            onChange={(e) => handleWasteChange(field.id, 'materialId', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
                                        >
                                            <option value="">Select Material</option>
                                            {rawMaterials?.results?.map(item => (
                                                <option key={item.id} value={item.id}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            value={field.quantity}
                                            onChange={(e) => handleWasteChange(field.id, 'quantity', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveWaste(field.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
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

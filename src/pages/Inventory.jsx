import React, { useState } from 'react';

const Inventory = () => {
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('raw_materials');

    const handlePurchaseClick = () => {
        setIsPurchaseModalOpen(true);
    };

    const handleConfirmPurchase = () => {
        setIsPurchaseModalOpen(false);
        alert('Stock purchase order created successfully!');
    };

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
                {/* PageHeading */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        Inventory Management
                    </h1>
                    <button
                        className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-eva-blue text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-800 transition-colors">
                        <span className="material-symbols-outlined text-base">add</span>
                        <span className="truncate">Create New Item</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="pb-3 border-b border-slate-200 dark:border-gray-700">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('raw_materials')}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'raw_materials' ? 'border-b-eva-blue text-eva-blue' : 'border-b-transparent text-slate-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                        >
                            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Raw Materials</p>
                        </button>
                        <button
                            onClick={() => setActiveTab('plant_assets')}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'plant_assets' ? 'border-b-eva-blue text-eva-blue' : 'border-b-transparent text-slate-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                        >
                            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Plant Assets</p>
                        </button>
                        <button
                            onClick={() => setActiveTab('returnable_assets')}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'returnable_assets' ? 'border-b-eva-blue text-eva-blue' : 'border-b-transparent text-slate-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                        >
                            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Returnable Assets</p>
                        </button>
                    </div>
                </div>

                {/* ToolBar */}
                <div className="flex justify-between items-center gap-2 py-4">
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                className="pl-10 pr-4 py-2 h-10 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition w-64"
                                placeholder="Search item..." type="text" />
                        </div>
                        <button
                            className="flex items-center gap-2 p-2 h-10 text-slate-900 dark:text-gray-300 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-background-dark hover:bg-slate-50 dark:hover:bg-gray-800">
                            <span className="material-symbols-outlined">filter_list</span>
                            <span className="text-sm">Filter</span>
                        </button>
                    </div>
                    <button
                        onClick={handlePurchaseClick}
                        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-eva-blue text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-blue-800 transition-colors">
                        <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                        <span className="truncate">Purchase Stock</span>
                    </button>
                </div>

                {/* Table */}
                <div className="mt-2">
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:bg-background-dark dark:border-gray-700">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-gray-800">
                                <tr className="border-b border-slate-200 dark:border-gray-700">
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Item Name</th>
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Current Quantity</th>
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Unit Value</th>
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Total Value</th>
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                <tr>
                                    <td className="h-[72px] px-4 py-2 text-slate-900 dark:text-white text-sm">PET Preforms (1L)</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">150,000 units</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹0.85</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹127,500.00</td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">In Stock</span>
                                    </td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <button className="font-medium text-eva-blue hover:underline">Adjustment Entry</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="h-[72px] px-4 py-2 text-slate-900 dark:text-white text-sm">Bottle Caps</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">450,000 units</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹0.15</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹67,500.00</td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">In Stock</span>
                                    </td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <button className="font-medium text-eva-blue hover:underline">Adjustment Entry</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="h-[72px] px-4 py-2 text-slate-900 dark:text-white text-sm">Labels (EVA Brand)</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">85,000 units</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹0.30</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹25,500.00</td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">In Stock</span>
                                    </td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <button className="font-medium text-eva-blue hover:underline">Adjustment Entry</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="h-[72px] px-4 py-2 text-slate-900 dark:text-white text-sm">Cardboard Boxes</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">4,800 units</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹12.50</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹60,000.00</td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Low Stock</span>
                                    </td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <button className="font-medium text-eva-blue hover:underline">Adjustment Entry</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="h-[72px] px-4 py-2 text-slate-900 dark:text-white text-sm">Purified Water</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">50,000 L</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹1.20</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹60,000.00</td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">In Stock</span>
                                    </td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <button className="font-medium text-eva-blue hover:underline">Adjustment Entry</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="h-[72px] px-4 py-2 text-slate-900 dark:text-white text-sm">CO2 Cylinder</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">12 units</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹1,500.00</td>
                                    <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹18,000.00</td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Out of Stock</span>
                                    </td>
                                    <td className="h-[72px] px-4 py-2 text-sm">
                                        <button className="font-medium text-eva-blue hover:underline">Adjustment Entry</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Purchase Stock Modal */}
            {isPurchaseModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Stock</h3>
                            <button onClick={() => setIsPurchaseModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
                                <select className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary">
                                    <option>PET Preforms (1L)</option>
                                    <option>Bottle Caps</option>
                                    <option>Labels (EVA Brand)</option>
                                    <option>Cardboard Boxes</option>
                                    <option>Purified Water</option>
                                    <option>CO2 Cylinder</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
                                <input type="text" className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" placeholder="Enter supplier name" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                                    <input type="number" className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Cost</label>
                                    <input type="number" className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Cost</label>
                                <input type="text" readOnly className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed" value="$0.00" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <button onClick={() => setIsPurchaseModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                            <button onClick={handleConfirmPurchase} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white">Confirm Purchase</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;

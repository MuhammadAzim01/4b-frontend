import React, { useState } from 'react';
import CreateProductModal from '../components/CreateProductModal';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchWithAuth } from '../utils/fetchApis';

const Warehouse = () => {
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
    const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);

    // Create product mutation
    const createProductMutation = useCreateUpdateMutation({
        url: 'production/products/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Product created successfully',
        onErrorMessage: 'Failed to create product',
        onSuccess: () => {
            setIsCreateProductModalOpen(false);
        },
    });

    const handleNewEntryClick = () => {
        setIsEntryModalOpen(true);
    };

    const handleViewLedgerClick = () => {
        setIsLedgerModalOpen(true);
    };

    const handleConfirmEntry = () => {
        setIsEntryModalOpen(false);
        alert('Production entry added successfully!');
    };

    const handleCreateProduct = (productData) => {
        createProductMutation.mutate(JSON.stringify(productData));
    };

    return (
        <div className="flex-1 flex-col overflow-y-auto p-8">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">Finished Goods - Warehouse Management</h1>
                    <p className="text-slate-500 dark:text-gray-400 text-base font-normal leading-normal">Real-time inventory levels and immutable transaction ledger.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreateProductModalOpen(true)}
                        className="flex h-10 items-center justify-center gap-x-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-background-dark px-4 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-base">add_box</span>
                        <p className="text-sm font-medium">New Product</p>
                    </button>
                    <button
                        className="flex h-10 items-center justify-center gap-x-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-background-dark px-4 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-base">download</span>
                        <p className="text-sm font-medium">Export</p>
                    </button>
                    <button
                        onClick={handleNewEntryClick}
                        className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-primary text-white px-4 hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined text-base">add</span>
                        <p className="text-sm font-medium">New Entry</p>
                    </button>
                </div>
            </div>

            {/* Chips / Global Filters */}
            <div className="flex gap-2 pb-6 border-b border-slate-200 dark:border-gray-800">
                <button
                    className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 pl-4 pr-3 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Last 7 Days</p>
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                </button>
                <button
                    className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/10 text-primary border border-primary/20 pl-4 pr-3">
                    <p className="text-sm font-semibold leading-normal">This Month</p>
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                </button>
                <button
                    className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 pl-4 pr-3 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Last 90 Days</p>
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                </button>
                <button
                    className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 pl-4 pr-3 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Custom Range</p>
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                </button>
            </div>

            {/* SKU Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* SKU Card 1: Water Pats - 500ml */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Water Pats - 500ml</h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400">SKU: WP-500ML</p>
                        </div>
                        <button onClick={handleViewLedgerClick} className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
                            View Ledger
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 rounded-lg p-5 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800">
                        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Total Stock on Hand</p>
                        <p className="text-slate-900 dark:text-white text-3xl font-bold">8,450 <span className="text-xl font-medium text-slate-500">Units</span></p>
                        <p className="text-[#198754] text-sm font-medium">+2,100 Units this week</p>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-base font-semibold mb-3 text-slate-900 dark:text-white">Recent Transactions</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 dark:text-gray-400 uppercase bg-slate-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3" scope="col">Transaction</th>
                                        <th className="px-4 py-3" scope="col">Source</th>
                                        <th className="px-4 py-3 text-right" scope="col">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">#TXN789B1</div>
                                            <div className="text-xs text-slate-500 dark:text-gray-400">Apr 15, 2024</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-gray-300">Production</td>
                                        <td className="px-4 py-3 font-medium text-right text-[#198754]">+ 5,000</td>
                                    </tr>
                                    <tr className="border-b dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">#TXN789B0</div>
                                            <div className="text-xs text-slate-500 dark:text-gray-400">Apr 14, 2024</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-gray-300">Distributor</td>
                                        <td className="px-4 py-3 font-medium text-right text-[#DC3545]">- 1,250</td>
                                    </tr>
                                    <tr className="border-b dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">#TXN789A9</div>
                                            <div className="text-xs text-slate-500 dark:text-gray-400">Apr 13, 2024</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-gray-300">Distributor</td>
                                        <td className="px-4 py-3 font-medium text-right text-[#DC3545]">- 850</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* SKU Card 2: Water Pats - 1.5 Litre */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Water Pats - 1.5 Litre</h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400">SKU: WP-1500ML</p>
                        </div>
                        <button onClick={handleViewLedgerClick} className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
                            View Ledger
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 rounded-lg p-5 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800">
                        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Total Stock on Hand</p>
                        <p className="text-slate-900 dark:text-white text-3xl font-bold">4,210 <span className="text-xl font-medium text-slate-500">Units</span></p>
                        <p className="text-[#198754] text-sm font-medium">+1,500 Units this week</p>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-base font-semibold mb-3 text-slate-900 dark:text-white">Recent Transactions</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 dark:text-gray-400 uppercase bg-slate-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3" scope="col">Transaction</th>
                                        <th className="px-4 py-3" scope="col">Source</th>
                                        <th className="px-4 py-3 text-right" scope="col">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">#TXN654C2</div>
                                            <div className="text-xs text-slate-500 dark:text-gray-400">Apr 15, 2024</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-gray-300">Production</td>
                                        <td className="px-4 py-3 font-medium text-right text-[#198754]">+ 2,000</td>
                                    </tr>
                                    <tr className="border-b dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">#TXN654C1</div>
                                            <div className="text-xs text-slate-500 dark:text-gray-400">Apr 14, 2024</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-gray-300">Distributor</td>
                                        <td className="px-4 py-3 font-medium text-right text-[#DC3545]">- 500</td>
                                    </tr>
                                    <tr className="border-b dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">#TXN654C0</div>
                                            <div className="text-xs text-slate-500 dark:text-gray-400">Apr 12, 2024</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-gray-300">Production</td>
                                        <td className="px-4 py-3 font-medium text-right text-[#198754]">+ 1,500</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* SKU Card 3: 19 Litre Bottles */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-background-dark p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">19 Litre Bottles</h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400">SKU: WB-19L</p>
                        </div>
                        <button onClick={handleViewLedgerClick} className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
                            View Ledger
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 rounded-lg p-5 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800">
                        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Total Stock on Hand</p>
                        <p className="text-slate-900 dark:text-white text-3xl font-bold">1,150 <span className="text-xl font-medium text-slate-500">Units</span></p>
                        <p className="text-[#DC3545] text-sm font-medium">-250 Units this week</p>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-base font-semibold mb-3 text-slate-900 dark:text-white">Recent Transactions</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 dark:text-gray-400 uppercase bg-slate-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3" scope="col">Transaction</th>
                                        <th className="px-4 py-3" scope="col">Source</th>
                                        <th className="px-4 py-3 text-right" scope="col">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">#TXN432D5</div>
                                            <div className="text-xs text-slate-500 dark:text-gray-400">Apr 15, 2024</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-gray-300">Distributor</td>
                                        <td className="px-4 py-3 font-medium text-right text-[#DC3545]">- 400</td>
                                    </tr>
                                    <tr className="border-b dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">#TXN432D4</div>
                                            <div className="text-xs text-slate-500 dark:text-gray-400">Apr 13, 2024</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-gray-300">Production</td>
                                        <td className="px-4 py-3 font-medium text-right text-[#198754]">+ 500</td>
                                    </tr>
                                    <tr className="border-b dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">#TXN432D3</div>
                                            <div className="text-xs text-slate-500 dark:text-gray-400">Apr 11, 2024</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-gray-300">Distributor</td>
                                        <td className="px-4 py-3 font-medium text-right text-[#DC3545]">- 350</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Entry Modal */}
            {isEntryModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Production Entry</h3>
                            <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product</label>
                                <select className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary">
                                    <option>Water Pats - 500ml</option>
                                    <option>Water Pats - 1.5 Litre</option>
                                    <option>19 Litre Bottles</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Batch Number</label>
                                <input type="text" className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" placeholder="e.g., BATCH-2023-001" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity Produced</label>
                                    <input type="number" className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                    <input type="date" className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <button onClick={() => setIsEntryModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                            <button onClick={handleConfirmEntry} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white">Add Entry</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Ledger Modal */}
            {isLedgerModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Product Ledger</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Detailed transaction history</p>
                            </div>
                            <button onClick={() => setIsLedgerModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Transaction ID</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-right">In</th>
                                        <th className="px-4 py-3 text-right">Out</th>
                                        <th className="px-4 py-3 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    <tr>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">2023-10-25</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">#TXN-001</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">Production</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-medium">+5,000</td>
                                        <td className="px-4 py-3 text-right text-slate-500">-</td>
                                        <td className="px-4 py-3 text-right text-slate-900 dark:text-white font-bold">5,000</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">2023-10-26</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">#TXN-002</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">Distributor Sale</td>
                                        <td className="px-4 py-3 text-right text-slate-500">-</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-medium">-1,000</td>
                                        <td className="px-4 py-3 text-right text-slate-900 dark:text-white font-bold">4,000</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">2023-10-27</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">#TXN-003</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">Production</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-medium">+2,500</td>
                                        <td className="px-4 py-3 text-right text-slate-500">-</td>
                                        <td className="px-4 py-3 text-right text-slate-900 dark:text-white font-bold">6,500</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">2023-10-28</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">#TXN-004</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">Distributor Sale</td>
                                        <td className="px-4 py-3 text-right text-slate-500">-</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-medium">-500</td>
                                        <td className="px-4 py-3 text-right text-slate-900 dark:text-white font-bold">6,000</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button onClick={() => setIsLedgerModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Close</button>
                        </div>
                    </div>
                </div>
            )}

            <CreateProductModal
                isOpen={isCreateProductModalOpen}
                onClose={() => setIsCreateProductModalOpen(false)}
                onCreate={handleCreateProduct}
            />
        </div>
    );
};

export default Warehouse;

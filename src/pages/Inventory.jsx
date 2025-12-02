import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import PurchaseModal from '../components/PurchaseModal';
import ApprovalModal from '../components/ApprovalModal';
import ItemHistoryModal from '../components/ItemHistoryModal';

import CreateItemModal from '../components/CreateItemModal';

const Inventory = () => {
    const { inventoryItems, pendingItems } = useInventory();
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [approvalItem, setApprovalItem] = useState(null);
    const [historyItemName, setHistoryItemName] = useState(null);
    const [activeTab, setActiveTab] = useState('raw_materials');
    const [role, setRole] = useState('accountant'); // Default fallback

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setRole(user.role);
        }
    }, []);

    const handlePurchaseClick = () => {
        setIsPurchaseModalOpen(true);
    };

    const handleCreateClick = () => {
        setIsCreateModalOpen(true);
    };

    const handleApproveClick = (item) => {
        setApprovalItem(item);
    };

    const handleItemClick = (itemName) => {
        setHistoryItemName(itemName);
    };

    const filteredInventory = inventoryItems.filter(item => item.category === activeTab);
    const filteredPending = pendingItems.filter(item => item.category === activeTab);

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
                {/* PageHeading */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        Inventory Management
                    </h1>
                    <button
                        onClick={handleCreateClick}
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

                {/* Pending Approvals (Admin Only) */}
                {role === 'admin' && filteredPending.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">pending_actions</span>
                            Pending Approvals
                        </h2>
                        <div className="overflow-hidden rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800">
                            <table className="w-full text-left">
                                <thead className="bg-orange-100 dark:bg-orange-900/20">
                                    <tr className="border-b border-orange-200 dark:border-orange-800">
                                        <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Item Name</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Quantity</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Supplier</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Date</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-orange-200 dark:divide-orange-800">
                                    {filteredPending.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 text-slate-900 dark:text-white text-sm">{item.name}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-sm">{item.quantity} {item.unit}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-sm">{item.supplier || '-'}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-gray-400 text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <button
                                                    onClick={() => handleApproveClick(item)}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-eva-blue text-white hover:bg-blue-800 transition-colors"
                                                >
                                                    Approve & Price
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Main Inventory Table */}
                <div className="mt-2">
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:bg-background-dark dark:border-gray-700">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-gray-800">
                                <tr className="border-b border-slate-200 dark:border-gray-700">
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Item Name</th>
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Current Quantity</th>
                                    {role === 'admin' && (
                                        <>
                                            {/* Unit Value Removed */}
                                            <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Total Value</th>
                                        </>
                                    )}
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                {filteredInventory.map((item) => (
                                    <tr key={item.id}>
                                        <td className="h-[72px] px-4 py-2 text-slate-900 dark:text-white text-sm">
                                            <button
                                                onClick={() => handleItemClick(item.name)}
                                                className="font-bold text-eva-blue hover:underline text-left"
                                            >
                                                {item.name}
                                            </button>
                                        </td>
                                        <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">{item.quantity} {item.unit}</td>
                                        {role === 'admin' && (
                                            <>
                                                {/* Unit Value Removed */}
                                                <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">₹{item.totalValue.toLocaleString()}</td>
                                            </>
                                        )}
                                        <td className="h-[72px] px-4 py-2 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${item.status === 'In Stock' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                                        item.status === 'Out of Stock' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="h-[72px] px-4 py-2 text-sm">
                                            <button className="font-medium text-eva-blue hover:underline">Adjustment Entry</button>
                                        </td>
                                    </tr>
                                ))}
                                {/* Show pending items for accountant in the main list as requested, but maybe with a different status?
                                    The prompt said "when an entry is added it should show in the list on the inventory page".
                                    I'll add them here for Accountant view with "Pending" status and hidden price.
                                */}
                                {role === 'accountant' && filteredPending.map((item) => (
                                    <tr key={item.id} className="bg-slate-50/50 dark:bg-slate-800/50">
                                        <td className="h-[72px] px-4 py-2 text-slate-900 dark:text-white text-sm">
                                            {item.name}
                                            <span className="ml-2 text-xs text-orange-500 font-medium">(Pending)</span>
                                        </td>
                                        <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-gray-400 text-sm">{item.quantity} {item.unit}</td>
                                        {/* Pricing columns hidden for accountant */}
                                        <td className="h-[72px] px-4 py-2 text-sm">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                Pending Approval
                                            </span>
                                        </td>
                                        <td className="h-[72px] px-4 py-2 text-sm">
                                            <span className="text-slate-400 italic text-xs">Awaiting Admin</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PurchaseModal
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                role={role}
            />

            <CreateItemModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <ApprovalModal
                isOpen={!!approvalItem}
                onClose={() => setApprovalItem(null)}
                item={approvalItem}
            />

            <ItemHistoryModal
                isOpen={!!historyItemName}
                onClose={() => setHistoryItemName(null)}
                itemName={historyItemName}
                role={role}
            />
        </div>
    );
};

export default Inventory;

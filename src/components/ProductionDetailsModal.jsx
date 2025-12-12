
import React from 'react';
import { getAuthStatus } from '../utils/auth';

const ProductionDetailsModal = ({ isOpen, onClose, run }) => {
    const wastage = run?.raw_materials?.filter(m => m.quantity_wasted > 0);
    const returnedItems = run?.raw_materials?.filter(m => m.quantity_returned > 0);
    const { role } = getAuthStatus().user;

    if (!isOpen || !run) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Production Details</h2>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                ${run.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800'}`}>
                                {run.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-mono">Batch: {run.batch_number}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Timeline & Efficiency Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Timeline</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Started</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(run.start_date).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{run.end_date ? new Date(run.end_date).toLocaleString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        {role == 'admin' && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Cost Summary</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Cost</span>
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                        ${parseFloat(run.total_cost || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Section */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-blue-500">input</span>
                            Input: Raw Materials
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3">Material Name</th>
                                        <th className="px-4 py-3 text-right">Quantity Used</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {run.raw_materials?.map((m, idx) => (
                                        <tr key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                                            <td className="px-4 py-3 text-slate-900 dark:text-white">{m.raw_material_name}</td>
                                            <td className="px-4 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">{m.quantity_used}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Output & Waste Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-green-500">output</span>
                                Output: Finished Goods
                            </h3>
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-green-800 dark:text-green-400 font-semibold uppercase">Product</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{run.product_name || 'N/A'}</p>
                                    </div>
                                    <div className="h-px bg-green-200 dark:bg-green-800/50"></div>
                                    <div className="flex justify-between items-baseline">
                                        <p className="text-xs text-green-800 dark:text-green-400 font-semibold uppercase">Total Produced</p>
                                        <p className="text-2xl font-black text-green-600 dark:text-green-400">{run.product_quantity || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            {/* Returned Items Section */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-blue-500">assignment_return</span>
                                    Returned to Inventory
                                </h3>
                                {returnedItems && returnedItems.length > 0 ? (
                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30 overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-blue-100/50 dark:bg-blue-900/20 text-xs text-blue-800 dark:text-blue-400 uppercase">
                                                <tr>
                                                    <th className="px-4 py-2">Material</th>
                                                    <th className="px-4 py-2 text-right">Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {returnedItems.map((r, idx) => (
                                                    <tr key={idx} className="border-b last:border-0 border-blue-100 dark:border-blue-800/30">
                                                        <td className="px-4 py-2 text-slate-900 dark:text-white">{r.raw_material_name}</td>
                                                        <td className="px-4 py-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{r.quantity_returned}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-100 dark:border-slate-700 text-center text-slate-400">
                                        <span className="material-symbols-outlined mb-1">info</span>
                                        <p className="text-sm">No returned items</p>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-red-500">delete_outline</span>
                                Waste / Scrap
                            </h3>
                            {wastage && wastage.length > 0 ? (
                                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-red-100/50 dark:bg-red-900/20 text-xs text-red-800 dark:text-red-400 uppercase">
                                            <tr>
                                                <th className="px-4 py-2">Material</th>
                                                <th className="px-4 py-2 text-right">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wastage.map((w, idx) => (
                                                <tr key={idx} className="border-b last:border-0 border-red-100 dark:border-red-800/30">
                                                    <td className="px-4 py-2 text-slate-900 dark:text-white">{w.raw_material_name}</td>
                                                    <td className="px-4 py-2 text-right font-mono font-bold text-red-600 dark:text-red-400">{w.quantity_wasted}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-100 dark:border-slate-700 text-center text-slate-400">
                                    <span className="material-symbols-outlined mb-1">check_circle</span>
                                    <p className="text-sm">No recorded waste</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductionDetailsModal;

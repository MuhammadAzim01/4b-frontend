import React from 'react';

const Production = () => {
    return (
        <div className="flex-1 overflow-y-auto p-8 xl:p-10">
            {/* PageHeading */}
            <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Production Module</h1>
                <button
                    className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-bold text-white rounded-lg bg-primary hover:bg-primary/90 transition-colors">
                    <span className="material-symbols-outlined text-base">add</span>
                    <span className="truncate">Start New Production Run</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Input Form */}
                <div className="lg:col-span-1">
                    <div className="p-6 bg-white dark:bg-background-dark rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight mb-6">Start a New Production Run</h2>
                        <form className="space-y-5">
                            <label className="flex flex-col">
                                <p className="text-sm font-medium pb-2 text-slate-900 dark:text-white">Raw Materials Used</p>
                                <select
                                    className="w-full rounded-lg text-slate-900 bg-white border-slate-200 dark:border-gray-700 focus:ring-primary focus:border-primary dark:bg-background-dark dark:text-white">
                                    <option>Select Material</option>
                                    <option>PET Preforms (PCO 1881)</option>
                                    <option>HDPE Caps (28mm)</option>
                                    <option>Printed Labels (BOPP)</option>
                                </select>
                            </label>
                            <label className="flex flex-col">
                                <p className="text-sm font-medium pb-2 text-slate-900 dark:text-white">Quantity Consumed</p>
                                <input
                                    className="w-full rounded-lg text-slate-900 bg-white border-slate-200 dark:border-gray-700 focus:ring-primary focus:border-primary dark:bg-background-dark dark:text-white"
                                    placeholder="e.g., 500" type="number" />
                            </label>
                            <div className="border-t border-slate-200 dark:border-gray-700 my-4"></div>
                            <label className="flex flex-col">
                                <p className="text-sm font-medium pb-2 text-slate-900 dark:text-white">Output Generated</p>
                                <select
                                    className="w-full rounded-lg text-slate-900 bg-white border-slate-200 dark:border-gray-700 focus:ring-primary focus:border-primary dark:bg-background-dark dark:text-white">
                                    <option>Select Finished Good</option>
                                    <option>Water Bottle - 500ml</option>
                                    <option>Water Bottle - 1L</option>
                                    <option>Water Bottle - 1.5L</option>
                                </select>
                            </label>
                            <label className="flex flex-col">
                                <p className="text-sm font-medium pb-2 text-slate-900 dark:text-white">Quantity Produced</p>
                                <input
                                    className="w-full rounded-lg text-slate-900 bg-white border-slate-200 dark:border-gray-700 focus:ring-primary focus:border-primary dark:bg-background-dark dark:text-white"
                                    placeholder="e.g., 500" type="number" />
                            </label>
                            <div className="border-t border-slate-200 dark:border-gray-700 my-4"></div>
                            <div className="flex flex-col">
                                <p className="text-sm font-medium pb-2 text-slate-900 dark:text-white">Calculated Cost of Production</p>
                                <div
                                    className="flex items-center h-12 px-4 rounded-lg bg-gray-100 dark:bg-background-dark border border-slate-200 dark:border-gray-700">
                                    <span className="text-lg font-bold text-green-600">$125.00</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    className="h-10 px-4 text-sm font-bold text-slate-900 dark:text-white rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    type="reset">Clear</button>
                                <button
                                    className="h-10 px-4 text-sm font-bold text-white rounded-lg bg-primary hover:bg-primary/90 transition-colors"
                                    type="submit">Confirm & Start Run</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Panel: Production Logs */}
                <div className="lg:col-span-2">
                    <div className="p-6 bg-white dark:bg-background-dark rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight mb-4">Production Run History</h2>
                        <div className="relative mb-4">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                className="w-full rounded-lg pl-10 bg-white border-slate-200 dark:border-gray-700 focus:ring-primary focus:border-primary dark:bg-background-dark dark:text-white"
                                placeholder="Search by Run ID, material..." type="text" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-slate-50 dark:bg-background-dark border-b border-slate-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3" scope="col">Run ID</th>
                                        <th className="px-4 py-3" scope="col">Date/Time</th>
                                        <th className="px-4 py-3" scope="col">Raw Material</th>
                                        <th className="px-4 py-3 text-right" scope="col">Qty</th>
                                        <th className="px-4 py-3" scope="col">Finished Good</th>
                                        <th className="px-4 py-3 text-right" scope="col">Qty</th>
                                        <th className="px-4 py-3 text-right" scope="col">Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-200 dark:border-gray-700">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-white">PRD-84201</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">2023-10-27 09:15</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">PET Preforms</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">-1,000</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">Water Bottle - 500ml</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">+1,000</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">$250.00</td>
                                    </tr>
                                    <tr className="border-b border-slate-200 dark:border-gray-700">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-white">PRD-84200</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">2023-10-26 14:30</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">HDPE Caps</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">-5,000</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">Caps Applied</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">+5,000</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">$150.00</td>
                                    </tr>
                                    <tr className="border-b border-slate-200 dark:border-gray-700">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-white">PRD-84199</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">2023-10-26 11:00</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">Printed Labels</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">-2,500</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">Bottles Labeled</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">+2,500</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">$75.50</td>
                                    </tr>
                                    <tr className="border-b border-slate-200 dark:border-gray-700">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-white">PRD-84198</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">2023-10-25 16:45</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">PET Preforms</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">-500</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">Water Bottle - 1L</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">+500</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">$175.00</td>
                                    </tr>
                                    <tr className="border-b border-slate-200 dark:border-gray-700">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-white">PRD-84197</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">2023-10-25 10:05</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">PET Preforms</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-semibold">-1,000</td>
                                        <td className="px-4 py-3 text-slate-900 dark:text-white">Water Bottle - 500ml</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">+1,000</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">$250.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between pt-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Showing 1-5 of 128</span>
                            <div className="flex items-center gap-2">
                                <button
                                    className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                    disabled>
                                    <span className="material-symbols-outlined text-base">chevron_left</span>
                                </button>
                                <button
                                    className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <span className="material-symbols-outlined text-base">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Production;

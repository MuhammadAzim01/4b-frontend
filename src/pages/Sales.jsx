import React from 'react';

const Sales = () => {
    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
                {/* PageHeading */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex min-w-72 flex-col gap-1">
                        <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Sales & Reports</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-base font-normal leading-normal">Overview of sales performance and reporting.</p>
                    </div>
                    <button
                        className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span className="truncate">Generate Report</span>
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="mt-6 p-4 rounded-xl bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Chips */}
                        <div className="flex gap-3 flex-wrap flex-1">
                            <button
                                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-gray-700/50 pl-2 pr-2">
                                <span className="material-symbols-outlined text-slate-900 dark:text-gray-300 text-[20px]">calendar_today</span>
                                <p className="text-slate-900 dark:text-gray-300 text-sm font-medium leading-normal">Date Range: Last 30 Days</p>
                                <span className="material-symbols-outlined text-slate-900 dark:text-gray-300 text-[20px]">expand_more</span>
                            </button>
                            <button
                                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-gray-700/50 pl-2 pr-2">
                                <span className="material-symbols-outlined text-slate-900 dark:text-gray-300 text-[20px]">local_shipping</span>
                                <p className="text-slate-900 dark:text-gray-300 text-sm font-medium leading-normal">Distributor: All</p>
                                <span className="material-symbols-outlined text-slate-900 dark:text-gray-300 text-[20px]">expand_more</span>
                            </button>
                            <button
                                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-gray-700/50 pl-2 pr-2">
                                <span className="material-symbols-outlined text-slate-900 dark:text-gray-300 text-[20px]">inventory</span>
                                <p className="text-slate-900 dark:text-gray-300 text-sm font-medium leading-normal">Product Line: All</p>
                                <span className="material-symbols-outlined text-slate-900 dark:text-gray-300 text-[20px]">expand_more</span>
                            </button>
                            <button
                                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-gray-700/50 pl-2 pr-2">
                                <span className="material-symbols-outlined text-slate-900 dark:text-gray-300 text-[20px]">public</span>
                                <p className="text-slate-900 dark:text-gray-300 text-sm font-medium leading-normal">Region: All</p>
                                <span className="material-symbols-outlined text-slate-900 dark:text-gray-300 text-[20px]">expand_more</span>
                            </button>
                        </div>
                        {/* ButtonGroup */}
                        <div className="flex gap-3">
                            <button
                                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/20 dark:bg-primary/30 text-primary dark:text-white text-sm font-bold leading-normal tracking-[0.015em]">
                                <span className="truncate">Apply Filters</span>
                            </button>
                            <button
                                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-100 dark:bg-gray-700/50 text-slate-900 dark:text-gray-300 text-sm font-bold leading-normal tracking-[0.015em]">
                                <span className="truncate">Reset</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="mt-6">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Key Performance Indicators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <div className="p-6 rounded-xl bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700 flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Total Revenue</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">$4,295,831.52</p>
                            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                <span>12.5% vs. previous 30 days</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700 flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Units Sold</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">1,240,102</p>
                            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                <span>8.2% vs. previous 30 days</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700 flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Average Order Value</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">$346.40</p>
                            <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                <span>1.8% vs. previous 30 days</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700 flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Profit Margin</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">28.4%</p>
                            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                <span>0.5% vs. previous 30 days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sales Trends</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Revenue over the last 30 days</p>
                        <div className="mt-4 h-64 flex items-center justify-center">
                            <img alt="A line chart showing an upward trend in sales revenue over the last five weeks."
                                className="w-full h-full object-contain"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXEhvNVG1vLG7vuGg2VL643uc8iWF1_KashLbvOaDq_mCFvwWgfsaAl8olXtvxGTxl-JD0LeE7c6DTutZTZuejpoCHVJIBhkcaEWXkBqaVep0uk_fGbXUd_QbzC3-TntaByBpJyKij-9oGwr27yLj66Rp4feJDWH8uOgbo6nD9fRSChwDPQn33_CnzLllMfheJklRt-0NWvMO4fKSZt92TaGW_yx2vPandbLQvSOMv2ryxdUzyK4W28o-8JrwlnefpmZkNP3C12KFj" />
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sales by Distributor</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Contribution per partner</p>
                        <div className="mt-4 h-64 flex items-center justify-center">
                            <img alt="A pie chart showing sales distribution among partners. Distributor A has the largest share."
                                className="w-full h-full object-contain"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZG0zGh4vhfmpsWB6tb6UEs7t3cYMftv5-1Io1fdAAfk4A5ndkO7Ce8z5AiN_zkxumBwxFfCja1tXnBMge1M4zwGfBy37HMayeSZzHj-eEw6E8dkqr1MvNJAHljxUnM0FAkPztBNKBULujZNRwHMB79b2c4VkTRvPPYKHGVYdN4qOo4P3LpLVQ3YmMzarwfWxj7OWWn_XlCQg-NpxA5zjVK6sgIfjCzoqEqaBmpvloONesdv9zIS7KUtsPs0-_sr0KKXcIgK3Fcge6" />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="mt-6">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Recent Transactions</h3>
                    <div className="overflow-x-auto bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-gray-700">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-gray-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3" scope="col">Order ID</th>
                                    <th className="px-6 py-3" scope="col">Date</th>
                                    <th className="px-6 py-3" scope="col">Distributor</th>
                                    <th className="px-6 py-3" scope="col">Product</th>
                                    <th className="px-6 py-3 text-right" scope="col">Quantity</th>
                                    <th className="px-6 py-3 text-right" scope="col">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-white dark:bg-background-dark border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">#ORD-008765</td>
                                    <td className="px-6 py-4">2023-10-26</td>
                                    <td className="px-6 py-4">Global Beverages Inc.</td>
                                    <td className="px-6 py-4">EVA Spring Water 500ml</td>
                                    <td className="px-6 py-4 text-right">150 cases</td>
                                    <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-medium">$2,250.00</td>
                                </tr>
                                <tr className="bg-white dark:bg-background-dark border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">#ORD-008764</td>
                                    <td className="px-6 py-4">2023-10-26</td>
                                    <td className="px-6 py-4">Aqua Distributors</td>
                                    <td className="px-6 py-4">EVA Sparkling 1L</td>
                                    <td className="px-6 py-4 text-right">50 cases</td>
                                    <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-medium">$900.00</td>
                                </tr>
                                <tr className="bg-white dark:bg-background-dark border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">#ORD-008763</td>
                                    <td className="px-6 py-4">2023-10-25</td>
                                    <td className="px-6 py-4">Global Beverages Inc.</td>
                                    <td className="px-6 py-4">EVA Spring Water 1.5L</td>
                                    <td className="px-6 py-4 text-right">75 cases</td>
                                    <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-medium">$1,312.50</td>
                                </tr>
                                <tr className="bg-white dark:bg-background-dark border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">#CRD-001234</td>
                                    <td className="px-6 py-4">2023-10-25</td>
                                    <td className="px-6 py-4">Aqua Distributors</td>
                                    <td className="px-6 py-4">Refund: Damaged Stock</td>
                                    <td className="px-6 py-4 text-right">-5 cases</td>
                                    <td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-medium">($90.00)</td>
                                </tr>
                                <tr className="bg-white dark:bg-background-dark">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">#ORD-008762</td>
                                    <td className="px-6 py-4">2023-10-24</td>
                                    <td className="px-6 py-4">Metro Vending</td>
                                    <td className="px-6 py-4">EVA Kids Water 250ml</td>
                                    <td className="px-6 py-4 text-right">200 cases</td>
                                    <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-medium">$2,400.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;

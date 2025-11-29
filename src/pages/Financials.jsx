import React, { useState } from 'react';

const Financials = () => {
    const [activeTab, setActiveTab] = useState('pnl');

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
                {/* PageHeading & Chips */}
                <header className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Financials Overview</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-base font-normal leading-normal">High-level summaries of your company's financial health.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                            <button
                                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 px-4">
                                <p className="text-slate-800 dark:text-gray-200 text-sm font-medium leading-normal">This Quarter</p>
                                <span className="material-symbols-outlined text-slate-500 dark:text-gray-400">expand_more</span>
                            </button>
                        </div>
                        <button
                            className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]">
                            <span className="material-symbols-outlined">download</span>
                            <span className="truncate">Export</span>
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700">
                        <p className="text-slate-600 dark:text-gray-400 text-base font-medium leading-normal">Total Revenue</p>
                        <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">$1,250,450</p>
                        <p className="text-[#198754] text-sm font-medium leading-normal">+5.2% vs last quarter</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700">
                        <p className="text-slate-600 dark:text-gray-400 text-base font-medium leading-normal">Net Profit</p>
                        <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">$345,800</p>
                        <p className="text-[#198754] text-sm font-medium leading-normal">+8.1% vs last quarter</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700">
                        <p className="text-slate-600 dark:text-gray-400 text-base font-medium leading-normal">Operating Margin</p>
                        <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">27.6%</p>
                        <p className="text-[#DC3545] text-sm font-medium leading-normal">-1.5% vs last quarter</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-background-dark border border-slate-200 dark:border-gray-700">
                        <p className="text-slate-600 dark:text-gray-400 text-base font-medium leading-normal">Operating Cash Flow</p>
                        <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">$412,300</p>
                        <p className="text-[#198754] text-sm font-medium leading-normal">+12.3% vs last quarter</p>
                    </div>
                </section>

                {/* Tabs & Content */}
                <div className="flex flex-col">
                    <div className="border-b border-slate-200 dark:border-gray-700">
                        <nav aria-label="Tabs" className="-mb-px flex gap-8 px-4">
                            <button
                                onClick={() => setActiveTab('pnl')}
                                className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-bold cursor-pointer ${activeTab === 'pnl' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'}`}
                            >
                                Profit & Loss
                            </button>
                            <button
                                onClick={() => setActiveTab('bs')}
                                className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium cursor-pointer ${activeTab === 'bs' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'}`}
                            >
                                Balance Sheet
                            </button>
                            <button
                                onClick={() => setActiveTab('cf')}
                                className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium cursor-pointer ${activeTab === 'cf' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'}`}
                            >
                                Cash Flow
                            </button>
                        </nav>
                    </div>

                    {/* Profit & Loss Content */}
                    {activeTab === 'pnl' && (
                        <div className="py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Chart */}
                                <div className="lg:col-span-2 bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Revenue vs Expenses</h3>
                                    <div className="w-full h-80 bg-slate-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                        <img className="w-full h-full object-cover rounded-lg"
                                            alt="A line chart showing revenue and expenses trends over the selected quarter."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcq5VgEjYAjpApa4Gqf1HDmt9LZFP7Fv9FHq_oB3pK7tPd1h_LshzNvS-uECi4B6Fm7D_sZKy_UlDBuhRMZAEXD1L_3uIHJqtlns9oksUTmoa6oqE6Q0kw6OBYq1zHmz9L6XK2w6Lj_4J40i56qHGk1M8tA7EusnN3ml_Zh1lf0v6xoIj7XEwPUGjz8csHQ5jy5jYah8WSUyhzQdvdAc8vX-OuJAu1zLhvYh_nD_aGE8h-Ic07NKM7hl6OKIL1ZbFd377_HPcpdVUg" />
                                    </div>
                                </div>
                                {/* Data Table */}
                                <div className="lg:col-span-1 bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">P&L Summary</h3>
                                    <div className="flow-root">
                                        <div className="-mx-6 -my-2 overflow-x-auto">
                                            <div className="inline-block min-w-full py-2 align-middle sm:px-6">
                                                <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                                                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                                        <tr>
                                                            <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm font-medium text-slate-900 dark:text-white">Revenue</td>
                                                            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500 dark:text-gray-400 text-right">$1,250,450</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm font-medium text-slate-900 dark:text-white">COGS</td>
                                                            <td className="whitespace-nowrap px-3 py-3 text-sm text-[#DC3545] text-right">($725,150)</td>
                                                        </tr>
                                                        <tr className="font-bold">
                                                            <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm text-slate-900 dark:text-white">Gross Profit</td>
                                                            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 dark:text-white text-right">$525,300</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm font-medium text-slate-900 dark:text-white">OpEx</td>
                                                            <td className="whitespace-nowrap px-3 py-3 text-sm text-[#DC3545] text-right">($179,500)</td>
                                                        </tr>
                                                        <tr className="font-bold border-t-2 border-slate-300 dark:border-gray-600">
                                                            <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm text-slate-900 dark:text-white">Net Income</td>
                                                            <td className="whitespace-nowrap px-3 py-3 text-sm text-[#198754] text-right">$345,800</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Balance Sheet Content */}
                    {activeTab === 'bs' && (
                        <div className="py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Assets */}
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Assets</h3>
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                                        <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                            <tr>
                                                <td className="py-3 text-sm text-slate-900 dark:text-white">Current Assets (Cash, Inventory)</td>
                                                <td className="py-3 text-sm text-right text-slate-900 dark:text-white">$450,000</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 text-sm text-slate-900 dark:text-white">Fixed Assets (Plant, Equipment)</td>
                                                <td className="py-3 text-sm text-right text-slate-900 dark:text-white">$1,200,000</td>
                                            </tr>
                                            <tr className="font-bold bg-slate-50 dark:bg-gray-800">
                                                <td className="py-3 pl-2 text-sm text-slate-900 dark:text-white">Total Assets</td>
                                                <td className="py-3 pr-2 text-sm text-right text-slate-900 dark:text-white">$1,650,000</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* Liabilities & Equity */}
                                <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Liabilities & Equity</h3>
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                                        <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                            <tr>
                                                <td className="py-3 text-sm text-slate-900 dark:text-white">Current Liabilities</td>
                                                <td className="py-3 text-sm text-right text-slate-900 dark:text-white">$200,000</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 text-sm text-slate-900 dark:text-white">Long-term Debt</td>
                                                <td className="py-3 text-sm text-right text-slate-900 dark:text-white">$500,000</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 text-sm text-slate-900 dark:text-white">Shareholder Equity</td>
                                                <td className="py-3 text-sm text-right text-slate-900 dark:text-white">$950,000</td>
                                            </tr>
                                            <tr className="font-bold bg-slate-50 dark:bg-gray-800">
                                                <td className="py-3 pl-2 text-sm text-slate-900 dark:text-white">Total Liab. & Equity</td>
                                                <td className="py-3 pr-2 text-sm text-right text-slate-900 dark:text-white">$1,650,000</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cash Flow Content */}
                    {activeTab === 'cf' && (
                        <div className="py-6">
                            <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cash Flow Statement</h3>
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                                    <thead className="bg-slate-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-background-dark divide-y divide-slate-200 dark:divide-gray-700">
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">Net Cash from Operating Activities</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#198754]">$412,300</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">Net Cash from Investing Activities</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#DC3545]">($150,000)</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">Net Cash from Financing Activities</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#DC3545]">($50,000)</td>
                                        </tr>
                                        <tr className="bg-slate-50 dark:bg-gray-800 font-bold">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">Net Increase in Cash</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#198754]">$212,300</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Financials;

const Dashboard = () => {
    
    return (
        <div className="flex-1 overflow-y-auto">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-8 py-4 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="size-4">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" className="text-eva-blue"></path>
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">Operations Dashboard</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button
                        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCV_yp8agTHfWThTwGd7RMhpVFyTUSPX588QBau4OYx_nc09i8fQDsmyFpYfBwmSYJVMskApEENGuT-befqJGysDCm4I8lT0sBA6YfU04TnceHVnej4MXnmEHIpbuLT3dH_vWv74hTrkjkZDqdD4CA_mYU_urZVT8gp4ZFURKCEhlPjPtnSrxXLNpu5aAuYYHHYYiAcP5tkhQVrcSnXF5FCa7CMQ-_ur51ViNeluQW45aC-iRjTT28P3it9I1ws85CCqe7w9EQPU806")' }}>
                    </div>
                </div>
            </header>
            <div className="flex flex-col gap-6 px-8 py-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <span className="material-symbols-outlined">inventory_2</span>
                            </div>
                            <p className="font-medium text-gray-600 dark:text-gray-400">Total Inventory Value</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">$1,245,000</p>
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span>+12% from last month</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <p className="font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">$450,200</p>
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span>+5% vs target</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                <span className="material-symbols-outlined">precision_manufacturing</span>
                            </div>
                            <p className="font-medium text-gray-600 dark:text-gray-400">Production Output</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">85,000 Units</p>
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined text-sm">trending_down</span>
                            <span>-2% due to maintenance</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                <span className="material-symbols-outlined">local_shipping</span>
                            </div>
                            <p className="font-medium text-gray-600 dark:text-gray-400">Active Shipments</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">124</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>24 pending dispatch</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="col-span-1 lg:col-span-2 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Production vs Sales</h3>
                            <select className="rounded-lg border-gray-300 bg-gray-50 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                <option>Last 6 Months</option>
                                <option>This Year</option>
                            </select>
                        </div>
                        <div className="flex h-64 items-end gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
                            {/* Dummy Chart Bars */}
                            <div className="flex w-full items-end justify-between gap-2">
                                {[60, 75, 50, 80, 65, 90].map((h, i) => (
                                    <div key={i} className="flex w-full flex-col items-center gap-2 group">
                                        <div className="flex w-full items-end gap-1 h-48">
                                            <div style={{ height: `${h}%` }} className="w-1/2 rounded-t-sm bg-blue-500 transition-all group-hover:bg-blue-600"></div>
                                            <div style={{ height: `${h - 10}%` }} className="w-1/2 rounded-t-sm bg-green-500 transition-all group-hover:bg-green-600"></div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Production</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Sales</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-background-dark">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Alerts</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-3">
                                <div
                                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                    <span className="material-symbols-outlined">warning</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="font-medium text-gray-800 dark:text-gray-200">Low Stock Warning</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Raw Material 'Sugar A-Grade' is below safety
                                        stock.</p>
                                    <button className="mt-2 self-start text-sm font-medium text-primary hover:underline">Order Now</button>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div
                                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    <span className="material-symbols-outlined">hourglass_top</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="font-medium text-gray-800 dark:text-gray-200">Invoice Overdue</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice #2024-098 for Hydrate Co. is 3 days
                                        overdue.</p>
                                    <button className="mt-2 self-start text-sm font-medium text-primary hover:underline">Send
                                        Reminder</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer
                className="flex h-12 shrink-0 items-center justify-end border-t border-solid border-gray-200 bg-white px-8 dark:border-gray-800 dark:bg-background-dark">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-base text-green-600">verified_user</span>
                    <span>Last Verified Block: #8A3F...B9E1</span>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;

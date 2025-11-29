import React, { useState } from 'react';
import clsx from 'clsx';

const Distributors = () => {
    const [activeTab, setActiveTab] = useState('history');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const handleCreateInvoiceClick = () => {
        setIsInvoiceModalOpen(true);
    };

    const handleConfirmInvoice = () => {
        setIsInvoiceModalOpen(false);
        alert('Invoice created successfully!');
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-eva-border px-8 py-4 bg-eva-white dark:bg-background-dark dark:border-gray-700">
                <div className="flex flex-wrap justify-between gap-3">
                    <p className="text-eva-text dark:text-gray-100 text-2xl font-bold leading-tight tracking-[-0.02em]">Distributor Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-eva-off-white text-gray-600 dark:bg-gray-800 dark:text-gray-300 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-eva-off-white text-gray-600 dark:bg-gray-800 dark:text-gray-300 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCV_yp8agTHfWThTwGd7RMhpVFyTUSPX588QBau4OYx_nc09i8fQDsmyFpYfBwmSYJVMskApEENGuT-befqJGysDCm4I8lT0sBA6YfU04TnceHVnej4MXnmEHIpbuLT3dH_vWv74hTrkjkZDqdD4CA_mYU_urZVT8gp4ZFURKCEhlPjPtnSrxXLNpu5aAuYYHHYYiAcP5tkhQVrcSnXF5FCa7CMQ-_ur51ViNeluQW45aC-iRjTT28P3it9I1ws85CCqe7w9EQPU806")' }}></div>
                </div>
            </header>
            <div className="grid grid-cols-12 gap-6 p-8">
                {/* Left Column: Distributor List */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
                    <div className="bg-eva-white p-4 rounded-lg border border-eva-border dark:bg-gray-900 dark:border-gray-700">
                        <label className="flex flex-col min-w-40 h-12 w-full">
                            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                                <div className="text-gray-500 dark:text-gray-400 flex bg-eva-off-white dark:bg-gray-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-eva-text dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-eva-blue/50 border-none bg-eva-off-white dark:bg-gray-800 h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                                    placeholder="Search by Distributor Name or Area..." defaultValue=""
                                />
                            </div>
                        </label>
                    </div>
                    <div className="bg-eva-white rounded-lg border border-eva-border dark:bg-gray-900 dark:border-gray-700 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-eva-border dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-eva-text dark:text-gray-300 text-xs font-medium uppercase tracking-wider">Distributor Name</th>
                                    <th className="px-4 py-3 text-eva-text dark:text-gray-300 text-xs font-medium uppercase tracking-wider">Area</th>
                                    <th className="px-4 py-3 text-right text-eva-text dark:text-gray-300 text-xs font-medium uppercase tracking-wider">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-eva-border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                                    <td className="px-4 py-3 text-eva-text dark:text-gray-200 text-sm font-medium">AquaPure Inc.</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">North District</td>
                                    <td className="px-4 py-3 text-right text-eva-debit dark:text-eva-debit text-sm font-mono">-$12,500.00</td>
                                </tr>
                                <tr className="border-b border-eva-border dark:border-gray-800 bg-eva-blue/10 dark:bg-eva-blue/20 cursor-pointer">
                                    <td className="px-4 py-3 text-eva-blue dark:text-sky-300 text-sm font-medium">Beverage Co.</td>
                                    <td className="px-4 py-3 text-eva-blue/80 dark:text-sky-300/80 text-sm">South Bay</td>
                                    <td className="px-4 py-3 text-right text-eva-credit dark:text-eva-credit text-sm font-mono">$5,000.00</td>
                                </tr>
                                <tr className="border-b border-eva-border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                                    <td className="px-4 py-3 text-eva-text dark:text-gray-200 text-sm font-medium">Crystal Water LLC</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">East Metro</td>
                                    <td className="px-4 py-3 text-right text-eva-debit dark:text-eva-debit text-sm font-mono">-$3,200.00</td>
                                </tr>
                                <tr className="border-b border-eva-border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                                    <td className="px-4 py-3 text-eva-text dark:text-gray-200 text-sm font-medium">DrinkWell Group</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">West End</td>
                                    <td className="px-4 py-3 text-right text-eva-credit dark:text-eva-credit text-sm font-mono">$22,000.00</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                                    <td className="px-4 py-3 text-eva-text dark:text-gray-200 text-sm font-medium">FreshFlow Distributors</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">Central City</td>
                                    <td className="px-4 py-3 text-right text-eva-debit dark:text-eva-debit text-sm font-mono">-$8,800.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Right Column: Distributor Details */}
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-eva-white p-6 rounded-lg border border-eva-border dark:bg-gray-900 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-eva-text dark:text-gray-100">Beverage Co.</h2>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-eva-credit dark:bg-green-900 dark:text-green-300">Active</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: EVA-DIST-002</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateInvoiceClick}
                                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-eva-off-white dark:bg-gray-800 text-eva-text dark:text-gray-200 text-sm font-bold leading-normal tracking-[0.015em] gap-2"
                                >
                                    <span className="material-symbols-outlined text-base">receipt</span>
                                    <span className="truncate">Create Invoice</span>
                                </button>
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-eva-blue text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2">
                                    <span className="material-symbols-outlined text-base">payments</span>
                                    <span className="truncate">Receive Payment</span>
                                </button>
                            </div>
                        </div>
                        <div className="border-t border-eva-border dark:border-gray-700 mt-6 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Total Investment</p>
                                <p className="font-semibold text-eva-text dark:text-gray-200 mt-1">$250,000</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Contract Time</p>
                                <p className="font-semibold text-eva-text dark:text-gray-200 mt-1">3 years</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Contract End</p>
                                <p className="font-semibold text-eva-text dark:text-gray-200 mt-1">2026-08-15</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Current Balance</p>
                                <p className="font-semibold text-eva-credit dark:text-eva-credit mt-1">$5,000.00</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-eva-white rounded-lg border border-eva-border dark:bg-gray-900 dark:border-gray-700">
                        <div className="border-b border-eva-border dark:border-gray-700">
                            <nav aria-label="Tabs" className="flex -mb-px px-6">
                                {['history', 'details', 'contracts'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={clsx(
                                            "whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm capitalize",
                                            activeTab === tab
                                                ? "border-eva-blue text-eva-blue"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
                                        )}
                                    >
                                        {tab === 'history' ? 'Transaction History' : tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Transaction History Content */}
                        {activeTab === 'history' && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-eva-off-white dark:bg-gray-800">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Debit</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credit</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-eva-border dark:divide-gray-700">
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2023-10-26</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-eva-text dark:text-gray-200">
                                                <div>Payment Received</div>
                                                <div className="text-xs text-gray-400">#PMT-0451</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-500 dark:text-gray-400">-</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-eva-credit dark:text-eva-credit">$10,000.00</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-eva-credit dark:text-eva-credit">$5,000.00</td>
                                        </tr>
                                        {/* ... other rows ... */}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Details Content */}
                        {activeTab === 'details' && (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company Information</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Registered Address</p>
                                                <p className="text-sm text-gray-900 dark:text-white">123 Business Park, South Bay, CA 90210</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Tax ID / EIN</p>
                                                <p className="text-sm text-gray-900 dark:text-white">99-1234567</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Business License</p>
                                                <p className="text-sm text-gray-900 dark:text-white">BL-2023-8892</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Contact Person</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                                <p className="text-sm text-gray-900 dark:text-white">Robert Fox</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                                                <p className="text-sm text-gray-900 dark:text-white">Procurement Manager</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                                <p className="text-sm text-gray-900 dark:text-white">robert.fox@beverageco.com</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                                <p className="text-sm text-gray-900 dark:text-white">+1 (555) 987-6543</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Bank Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Bank Name</p>
                                                <p className="text-sm text-gray-900 dark:text-white">Chase Bank</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Account Number</p>
                                                <p className="text-sm text-gray-900 dark:text-white">**** **** **** 4589</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contracts Content */}
                        {activeTab === 'contracts' && (
                            <div className="p-6">
                                <div className="bg-eva-off-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-eva-border dark:border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Standard Distribution Agreement</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ref: CTR-2023-002</p>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Start Date</p>
                                            <p className="font-medium text-gray-900 dark:text-white">Aug 15, 2023</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">End Date</p>
                                            <p className="font-medium text-gray-900 dark:text-white">Aug 15, 2026</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Renewal Type</p>
                                            <p className="font-medium text-gray-900 dark:text-white">Automatic (1 Year)</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Terms & Conditions</h4>
                                    <div className="h-48 overflow-y-auto bg-white dark:bg-gray-900 border border-eva-border dark:border-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                        <p>1. <strong>Exclusivity:</strong> The Distributor is granted non-exclusive rights to distribute the Products in the Territory.</p>
                                        <p>2. <strong>Pricing:</strong> Prices are subject to change with 30 days prior written notice.</p>
                                        <p>3. <strong>Payment Terms:</strong> Net 30 days from the date of invoice. Late payments shall incur interest at 1.5% per month.</p>
                                        <p>4. <strong>Minimum Order Quantity (MOQ):</strong> The Distributor agrees to a minimum order of 500 units per month.</p>
                                        <p>5. <strong>Termination:</strong> Either party may terminate this agreement with 90 days written notice.</p>
                                        <p>6. <strong>Confidentiality:</strong> Both parties agree to maintain the confidentiality of proprietary information.</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-eva-blue text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                                        <span className="material-symbols-outlined text-base">download</span>
                                        Download Contract PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Invoice Modal */}
            {isInvoiceModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Invoice</h3>
                            <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Distributor</label>
                                <select className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary">
                                    <option>Beverage Co.</option>
                                    <option>AquaPure Inc.</option>
                                    <option>Crystal Water LLC</option>
                                    <option>DrinkWell Group</option>
                                    <option>FreshFlow Distributors</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Date</label>
                                <input type="date" className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Items</label>
                                <textarea className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" rows="3" placeholder="List items here..."></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Amount</label>
                                    <input type="number" className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
                                    <select className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary">
                                        <option>Net 30</option>
                                        <option>Net 60</option>
                                        <option>Immediate</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <button onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                            <button onClick={handleConfirmInvoice} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white">Create Invoice</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Distributors;

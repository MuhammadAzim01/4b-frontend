import React from 'react';

const InvoiceDetailsModal = ({ isOpen, onClose, invoice }) => {
    if (!isOpen || !invoice) return null;
    invoice = invoice?.data;
    const isSale = invoice.transaction_type === 'sale';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invoice Details</h2>
                        <p className="text-sm text-slate-500">
                            <span className="font-mono text-eva-blue">{invoice.invoice_number}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Invoice Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Distributor</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{invoice.distributor_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                                {new Date(invoice.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Transaction Type</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isSale 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            }`}>
                                {isSale ? 'Sale' : 'Payment'} - {invoice.payment_type}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created By</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{invoice.created_by_name}</p>
                        </div>
                    </div>

                    {/* Related Invoice for Payment */}
                    {!isSale && invoice.related_invoice_number && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">Payment for Invoice</p>
                            <p className="font-mono font-bold text-amber-900 dark:text-amber-300">{invoice.related_invoice_number}</p>
                        </div>
                    )}

                    {/* Items - Only for Sales */}
                    {isSale && invoice.items && invoice.items.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">inventory_2</span>
                                Products
                            </h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left pb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Product</th>
                                        <th className="text-right pb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Qty</th>
                                        <th className="text-right pb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Price</th>
                                        <th className="text-right pb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50">
                                            <td className="py-2 text-slate-900 dark:text-white">{item.product_name}</td>
                                            <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300">{item.quantity}</td>
                                            <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                                            <td className="py-2 text-right font-mono font-semibold text-slate-900 dark:text-white">₹{parseFloat(item.total_price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Payment Summary */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-700 dark:text-slate-300">Total Amount</span>
                                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">₹{parseFloat(invoice.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-700 dark:text-slate-300">Initial Payment</span>
                                <span className="text-sm font-mono font-semibold text-green-600 dark:text-green-400">₹{parseFloat(invoice.amount_paid).toFixed(2)}</span>
                            </div>
                            {isSale && invoice.payment_invoices && invoice.payment_invoices.length > 0 && (
                                <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Payment History</p>
                                    {invoice.payment_invoices.map((payment) => (
                                        <div key={payment.id} className="flex justify-between items-center text-sm mb-1">
                                            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                                {payment.invoice_number} - {new Date(payment.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="font-mono text-sm font-semibold text-green-600 dark:text-green-400">₹{parseFloat(payment.amount_paid).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-800">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Balance Due</span>
                                <span className={`text-lg font-mono font-bold ${
                                    parseFloat(invoice.balance_due) > 0 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-green-600 dark:text-green-400'
                                }`}>
                                    ₹{parseFloat(invoice.balance_due).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Notes</p>
                            <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{invoice.notes}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsModal;

import React from 'react';
import { generateInventoryInvoiceHtml } from './InventoryInvoiceTemplate';

const InventoryInvoiceDetailsModal = ({ isOpen, onClose, invoice, role }) => {
    if (!isOpen || !invoice) return null;
    invoice = invoice?.data || invoice;
    const isSale = invoice.transaction_type === 'sale';

    const totalAmount = parseFloat(invoice.total_amount || 0);
    const amountPaid = parseFloat(invoice.amount_paid || 0);
    const balanceDue = parseFloat(invoice.balance_due || Math.max(0, totalAmount - amountPaid));

    const handlePrint = () => {
        const htmlContent = generateInventoryInvoiceHtml(invoice);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inventory Invoice Details</h2>
                        <p className="text-sm text-slate-500">
                            <span className="font-mono text-eva-blue">{invoice.id}</span>
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
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Supplier</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{invoice.supplier_name || invoice.supplier?.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                                {new Date(invoice.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Transaction Type</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isSale
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                }`}>
                                {isSale ? 'Sale' : 'Payment'}{invoice.payment_method ? ` - ${invoice.payment_method}` : ''}
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

                    {/* Items - Bulk style for Sale */}
                    {isSale && invoice.items && invoice.items.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">inventory_2</span>
                                Items
                            </h3>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-2">Item</th>
                                        <th className="px-4 py-2 w-32 text-right">Quantity</th>
                                        <th className="px-4 py-2 w-32 text-right">Unit Cost</th>
                                        <th className="px-4 py-2 w-32 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {invoice.items.map((txn) => (
                                        <tr key={txn.id}>
                                            <td className="p-3 text-slate-900 dark:text-white">{txn.item?.name || '-'}</td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{txn.quantity}</td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">
                                                {txn.unit_cost !== undefined && txn.unit_cost !== null ? `Rs. ${parseFloat(txn.unit_cost).toFixed(2)}` : '-'}
                                            </td>
                                            <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                                                Rs. {((Number(txn.quantity || 0) * Number(txn.unit_cost || 0))).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Payment Summary */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-700 dark:text-slate-300">Total Amount</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">Rs. {parseFloat(invoice.total_amount).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm pt-2">
                                <span className="text-slate-700 dark:text-slate-300">
                                    Cash/Bank Payment
                                    {invoice.payment_method && <span className="ml-2 bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full">{invoice.payment_method}</span>}
                                </span>
                                <span className="font-mono font-semibold text-green-600 dark:text-green-400">Rs. {invoice.amount_paid}</span>
                            </div>

                            {isSale && invoice.payment_invoices && invoice.payment_invoices.length > 0 && (
                                <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Payment History</p>
                                    {invoice.payment_invoices.map((payment) => (
                                        <div key={payment.id} className="flex justify-between items-center text-sm mb-1">
                                            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                                {payment.id} - {new Date(payment.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="font-mono text-sm font-semibold text-green-600 dark:text-green-400">Rs. {parseFloat(payment.amount_paid).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-800">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Balance Due</span>
                                <span className={`text-lg font-mono font-bold ${parseFloat(invoice.balance_due) > 0
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                    Rs. {parseFloat(invoice.balance_due).toFixed(2)}
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

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 text-sm font-semibold text-white bg-eva-blue rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">print</span>
                        Print Invoice
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryInvoiceDetailsModal;

import React, { useEffect, useMemo, useState } from 'react';
import { fetchWithAuth } from '../utils/fetchApis';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import LoadingSpinner from './ui/LoadingSpinner';

const SupplierInvoiceApprovalModal = ({ isOpen, onClose, invoice }) => {
    const [rows, setRows] = useState([]);
    const [amountPaid, setAmountPaid] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && invoice) {
            const initRows = (invoice.items || []).map(txn => ({
                id: txn.id,
                itemName: txn.item?.name,
                quantity: txn.quantity,
                unit_cost: txn.unit_cost ?? '',
                status: txn.status,
            }));
            setRows(initRows);
            setAmountPaid('');
            setNotes('');
        }
    }, [isOpen, invoice]);

    const totalAmount = useMemo(() => {
        return rows.reduce((sum, r) => sum + (Number(r.quantity || 0) * Number(r.unit_cost || 0)), 0);
    }, [rows]);

    const paymentMutation = useCreateUpdateMutation({
        url: (body) => {
            try {
                const parsed = JSON.parse(body || '{}');
                return `inventory/invoices/approve/${parsed.invoice_id}/`;
            } catch (e) {
                console.warn('Failed to parse body for URL, falling back:', e);
                return 'inventory/invoices/approve/';
            }
        },
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Payment recorded successfully',
        onErrorMessage: 'Failed to record payment',
        onSuccess: () => {
            setTimeout(() => window.location.reload(), 300);
        },
    });

    console.log('Invoice in modal:', invoice);

    const handleUnitCostChange = (id, value) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, unit_cost: value } : r));
    };

    const approveAndSubmit = async () => {
        if (!invoice) return;
        setSubmitting(true);
        try {
            const amt = Number(amountPaid || 0);
        
            const payload = {
                invoice_id: invoice?.id,
                items: rows,
                amount_paid: amt,
                notes,
                payment_method: 'Cash',
            };
            paymentMutation.mutate(JSON.stringify(payload));
        
            onClose();
        } catch (e) {
            console.error('Approval error', e);
            setSubmitting(false);
        }
    };

    if (!isOpen || !invoice) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Approve & Price Invoice</h3>
                        <p className="text-sm text-slate-500">Invoice #{invoice.id} — {invoice.supplier_name || invoice.supplier?.name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
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
                                {rows.map(r => (
                                    <tr key={r.id}>
                                        <td className="p-3 text-slate-900 dark:text-white">{r.itemName}</td>
                                        <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{r.quantity}</td>
                                        <td className="p-3 text-right">
                                            <input
                                                type="number"
                                                min="0"
                                                value={r.unit_cost}
                                                onChange={(e) => handleUnitCostChange(r.id, e.target.value)}
                                                className="w-full px-2 py-1.5 text-right border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 focus:ring-1 focus:ring-eva-blue outline-none"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                                            Rs. {(Number(r.quantity || 0) * Number(r.unit_cost || 0)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="3"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition resize-none"
                                placeholder="Approval notes..."
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                <span>Total Invoice Value:</span>
                                <span className="font-bold text-xl">Rs. {totalAmount.toFixed(2)}</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount Paid (Rs.)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={amountPaid}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || parseFloat(val) >= 0) setAmountPaid(val);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-eva-blue focus:border-transparent outline-none transition"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                    <button
                        onClick={approveAndSubmit}
                        disabled={submitting}
                        className="px-6 py-2 rounded-lg text-sm font-bold bg-eva-blue text-white hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60"
                    >
                        {submitting ? 'Submitting...' : 'Approve & Record Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupplierInvoiceApprovalModal;

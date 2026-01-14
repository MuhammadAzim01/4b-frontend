import React, { useEffect, useMemo, useState } from 'react';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from './ui/LoadingSpinner';

const SupplierPaymentModal = ({ isOpen, onClose, supplier }) => {
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [notes, setNotes] = useState('');
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [invoiceSearch, setInvoiceSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmountPaid('');
            setPaymentMethod('Cash');
            setNotes('');
            setSelectedInvoices([]);
            setInvoiceSearch('');
        }
    }, [isOpen]);

    const { data: saleInvoicesData, isFetching: loadingInvoices } = useFetchQuery({
        url: supplier ? `inventory/invoices/pending/?supplier=${supplier.id}&page_size=100` : null,
        queryKey: ['supplier-sale-invoices', supplier?.id],
        fetchFunction: fetchWithAuth,
        enabled: isOpen && !!supplier?.id,
        staleTime: 60 * 1000,
    });

    const saleInvoices = useMemo(() => {
        const list = saleInvoicesData?.results || [];
        return list.filter(inv => parseFloat(inv.balance_due) > 0);
    }, [saleInvoicesData]);

    const filteredInvoices = useMemo(() => {
        if (!invoiceSearch) return saleInvoices;
        const q = invoiceSearch.toLowerCase();
        return saleInvoices.filter(inv =>
            inv.id.toString().includes(q) ||
            (inv.total_amount?.toString() || '').includes(q) ||
            (inv.balance_due?.toString() || '').includes(q)
        );
    }, [invoiceSearch, saleInvoices]);

    const paymentMutation = useCreateUpdateMutation({
        url: 'inventory/bulk-transactions/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Payment recorded successfully',
        onErrorMessage: 'Failed to record payment',
        onSuccess: () => {
            setTimeout(() => {
                window.location.reload();
            }, 300);
        },
    });

    const totalSelectedDue = useMemo(() => {
        return selectedInvoices.reduce((sum, id) => {
            const inv = saleInvoices.find(x => x.id === id);
            return sum + (inv ? parseFloat(inv.balance_due || 0) : 0);
        }, 0);
    }, [selectedInvoices, saleInvoices]);

    const paymentDifference = (parseFloat(amountPaid || 0) - totalSelectedDue);

    const toggleInvoice = (id) => {
        setSelectedInvoices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const amt = parseFloat(amountPaid || 0);
        if (!supplier?.id) return;
        if (isNaN(amt) || amt <= 0) return;

        const payload = {
            supplier: supplier.id,
            transaction_type: 'payment',
            amount_paid: amt,
            payment_method: paymentMethod,
            related_invoices: selectedInvoices,
            notes,
        };
        paymentMutation.mutate(JSON.stringify(payload));
        onClose();
    };

    if (!isOpen || !supplier) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Record Supplier Payment</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{supplier.name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Invoices to Pay</label>
                            {filteredInvoices.length > 0 && (
                                <span className="text-xs text-slate-500">{selectedInvoices.length} selected</span>
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder="Search by #, amount..."
                            value={invoiceSearch}
                            onChange={(e) => setInvoiceSearch(e.target.value)}
                            className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                        />

                        <div className="border border-slate-300 dark:border-slate-600 rounded-lg max-h-48 overflow-y-auto">
                            {loadingInvoices ? (
                                <div className="p-4 text-center"><LoadingSpinner size="sm" /></div>
                            ) : filteredInvoices.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">No pending invoices</div>
                            ) : (
                                filteredInvoices.map(inv => (
                                    <label key={inv.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-200 dark:border-slate-700 last:border-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedInvoices.includes(inv.id)}
                                            onChange={() => toggleInvoice(inv.id)}
                                            className="rounded"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-mono text-sm text-slate-900 dark:text-white">#{inv.id}</span>
                                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">Rs. {parseFloat(inv.balance_due).toFixed(2)} due</span>
                                            </div>
                                            <p className="text-xs text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        {selectedInvoices.length > 0 && (
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-700 dark:text-slate-300">Total Due:</span>
                                    <span className="font-bold text-red-600 dark:text-red-400">Rs. {totalSelectedDue.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Amount</label>
                        <input
                            required
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            value={amountPaid}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || parseFloat(val) >= 0) setAmountPaid(val);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                        />
                        {amountPaid && selectedInvoices.length > 0 && (
                            <p className={`mt-2 text-xs ${paymentDifference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {paymentDifference >= 0
                                    ? `Excess Rs. ${paymentDifference.toFixed(2)} will remain as credit`
                                    : `Short by Rs. ${Math.abs(paymentDifference).toFixed(2)}`}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-eva-blue rounded-lg hover:bg-blue-800">Record Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierPaymentModal;

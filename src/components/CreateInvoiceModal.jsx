import React, { useState, useEffect } from 'react';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';
import LoadingSpinner from './ui/LoadingSpinner';

const CreateInvoiceModal = ({ isOpen, onClose, onSubmit, distributor }) => {
    const [transactionType, setTransactionType] = useState('sale');
    const [paymentType, setPaymentType] = useState('credit');
    const [amountPaid, setAmountPaid] = useState('');
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ id: Date.now(), product: '', quantity: '', unitPrice: '' }]);
    const [invoiceSearch, setInvoiceSearch] = useState('');

    const { data: products, isFetching: productsLoading } = useFetchQuery({
        url: 'production/products/',
        queryKey: ['products'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen && transactionType === 'sale',
    });

    const { data: pendingInvoices, isFetching: invoicesLoading } = useFetchQuery({
        url: `distributors/invoices/pending/?distributor=${distributor?.id}`,
        queryKey: ['pending-invoices', distributor?.id],
        fetchFunction: fetchWithAuth,
        enabled: isOpen && transactionType === 'payment' && !!distributor?.id,
    });

    useEffect(() => {
        if (isOpen) {
            setTransactionType('sale');
            setPaymentType('credit');
            setAmountPaid('');
            setSelectedInvoices([]);
            setNotes('');
            setItems([{ id: Date.now(), product: '', quantity: '', unitPrice: '' }]);
            setInvoiceSearch('');
        }
    }, [isOpen]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), product: '', quantity: '', unitPrice: '' }]);
    };

    const handleRemoveItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleInvoiceToggle = (invoiceId) => {
        setSelectedInvoices(prev =>
            prev.includes(invoiceId)
                ? prev.filter(id => id !== invoiceId)
                : [...prev, invoiceId]
        );
    };

    const filteredPendingInvoices = pendingInvoices?.results?.filter(inv =>
        inv.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        inv.balance_due.toString().includes(invoiceSearch)
    ) || [];

    const totalDue = selectedInvoices.reduce((sum, invoiceId) => {
        const invoice = pendingInvoices?.results?.find(inv => inv.id === invoiceId);
        return sum + (Number(invoice?.balance_due || 0));
    }, 0);

    
    const paymentDifference = parseFloat(amountPaid || 0) - totalDue;
    
    const getTotalAmount = () => {
        if (transactionType === 'payment') {
            return parseFloat(amountPaid || 0);
        }
        return items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity || 0);
            const price = parseFloat(item.unitPrice || 0);
            return sum + (qty * price);
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (transactionType === 'sale') {
            const formattedItems = items.map(item => ({
                product: parseInt(item.product),
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unitPrice)
            }));

            onSubmit({
                distributor: distributor.id,
                transaction_type: transactionType,
                payment_type: paymentType,
                amount_paid: paymentType === 'debit' ? 0 : parseFloat(amountPaid || 0),
                items: formattedItems,
                notes
            });
        } else {
            onSubmit({
                distributor: distributor.id,
                transaction_type: transactionType,
                amount_paid: parseFloat(amountPaid),
                related_invoices: selectedInvoices,
                notes
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Invoice</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{distributor?.name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setTransactionType('sale')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${transactionType === 'sale'
                                ? 'bg-white dark:bg-slate-700 text-eva-blue shadow'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Sale
                        </button>
                        <button
                            type="button"
                            onClick={() => setTransactionType('payment')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${transactionType === 'payment'
                                ? 'bg-white dark:bg-slate-700 text-eva-blue shadow'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Payment
                        </button>
                    </div>

                    {transactionType === 'sale' ? (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Payment Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="credit"
                                            checked={paymentType === 'credit'}
                                            onChange={(e) => setPaymentType(e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Credit</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="debit"
                                            checked={paymentType === 'debit'}
                                            onChange={(e) => setPaymentType(e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Debit (Full Payment)</span>
                                    </label>
                                </div>
                                {paymentType === 'debit' && distributor?.balance > 0 && (
                                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                                        ℹ️ Available credit (₹{distributor.balance}) will be used first
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Products</label>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="text-xs font-bold text-eva-blue hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span> Add Product
                                    </button>
                                </div>
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-2 mb-2">
                                        <select
                                            required
                                            value={item.product}
                                            onChange={(e) => handleItemChange(item.id, 'product', e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                        >
                                            <option value="">Select Product</option>
                                            {products?.results?.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (Avl: {p.available_quantity})</option>
                                            ))}
                                        </select>
                                        <input
                                            required
                                            type="number"
                                            placeholder="Qty"
                                            min="0.01"
                                            step="0.01"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                            className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                        />
                                        <input
                                            required
                                            type="number"
                                            placeholder="Price"
                                            min="0.01"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                                            className="w-28 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                        />
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Amount:</span>
                                    <span className="text-lg font-bold text-eva-blue">₹{getTotalAmount().toFixed(2)}</span>
                                </div>
                            </div>

                            {paymentType === 'credit' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Paid (Partial)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Invoices to Pay</label>
                                    {filteredPendingInvoices.length > 0 && (
                                        <span className="text-xs text-slate-500">{selectedInvoices.length} selected</span>
                                    )}
                                </div>
                                
                                {pendingInvoices && pendingInvoices.length > 0 && (
                                    <input
                                        type="text"
                                        placeholder="Search invoices..."
                                        value={invoiceSearch}
                                        onChange={(e) => setInvoiceSearch(e.target.value)}
                                        className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                    />
                                )}

                                <div className="border border-slate-300 dark:border-slate-600 rounded-lg max-h-48 overflow-y-auto">
                                    {invoicesLoading ? (
                                        <div className="p-4 text-center"><LoadingSpinner size="sm" /></div>
                                    ) : filteredPendingInvoices.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            {invoiceSearch ? 'No matching invoices' : 'No pending credit invoices'}
                                        </div>
                                    ) : (
                                        filteredPendingInvoices.map(invoice => (
                                            <label
                                                key={invoice.id}
                                                className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-200 dark:border-slate-700 last:border-0"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedInvoices.includes(invoice.id)}
                                                    onChange={() => handleInvoiceToggle(invoice.id)}
                                                    className="rounded"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <span className="font-mono text-sm text-slate-900 dark:text-white">{invoice.invoice_number}</span>
                                                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">₹{invoice.balance_due} due</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">{new Date(invoice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>

                                {selectedInvoices.length > 0 && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-700 dark:text-slate-300">Total Due:</span>
                                            <span className="font-bold text-red-600 dark:text-red-400">₹{totalDue.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Amount</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                />
                                {amountPaid && selectedInvoices.length > 0 && (
                                    <p className={`mt-2 text-xs ${paymentDifference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {paymentDifference >= 0
                                            ? `✓ Excess ₹${paymentDifference.toFixed(2)} will be added to credit balance`
                                            : `⚠ Short by ₹${Math.abs(paymentDifference).toFixed(2)}`}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

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
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-bold text-white bg-eva-blue rounded-lg hover:bg-blue-800"
                        >
                            Create Invoice
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoiceModal;

import React, { useState } from 'react';
import { useFetchQuery } from '../hooks/useFetchQuery';
import { fetchWithAuth } from '../utils/fetchApis';

const CreateInvoiceModal = ({ isOpen, onClose, onCreate, selectedDistributor }) => {
    const [transactionType, setTransactionType] = useState('sale');
    const [paymentType, setPaymentType] = useState('credit');
    const [amountPaid, setAmountPaid] = useState('');
    const [relatedInvoice, setRelatedInvoice] = useState('');
    const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ id: Date.now(), product: '', quantity: '', unitPrice: '' }]);

    // Fetch available products
    const { data: productsData } = useFetchQuery({
        url: 'production/products/',
        queryKey: ['products'],
        fetchFunction: fetchWithAuth,
        enabled: isOpen && transactionType === 'sale',
    });

    // Fetch pending sale invoices for payment
    const { data: pendingInvoicesData } = useFetchQuery({
        url: selectedDistributor ? `distributors/invoices/pending/?distributor=${selectedDistributor.id}` : null,
        queryKey: ['pending-invoices', selectedDistributor?.id],
        fetchFunction: fetchWithAuth,
        enabled: isOpen && transactionType === 'payment' && !!selectedDistributor,
    });

    const products = productsData?.results || [];
    const allPendingInvoices = pendingInvoicesData?.results || [];
    
    // Filter pending invoices by search query
    const pendingInvoices = allPendingInvoices.filter(inv => 
        inv.invoice_number.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
        parseFloat(inv.balance_due).toFixed(2).includes(invoiceSearchQuery)
    );

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

    const getAvailableProducts = (currentProductId) => {
        const selectedIds = items.map(item => item.product).filter(id => id !== currentProductId);
        return products.filter(p => !selectedIds.includes(p.id.toString()));
    };

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
        
        const payload = {
            distributor: selectedDistributor?.id,
            transaction_type: transactionType,
            notes: notes,
        };

        if (transactionType === 'sale') {
            payload.payment_type = paymentType;
            payload.items = items
                .filter(item => item.product && item.quantity && item.unitPrice)
                .map(item => ({
                    product: parseInt(item.product),
                    quantity: parseFloat(item.quantity),
                    unit_price: parseFloat(item.unitPrice)
                }));
            
            // Only send amount_paid for credit type
            if (paymentType === 'credit') {
                payload.amount_paid = parseFloat(amountPaid || 0);
            }
        } else {
            // Payment is always debit
            payload.amount_paid = parseFloat(amountPaid);
            payload.related_invoice = parseInt(relatedInvoice);
        }

        onCreate(payload);
        
        // Reset form
        setTransactionType('sale');
        setPaymentType('credit');
        setAmountPaid('');
        setRelatedInvoice('');
        setInvoiceSearchQuery('');
        setNotes('');
        setItems([{ id: Date.now(), product: '', quantity: '', unitPrice: '' }]);
    };

    if (!isOpen || !selectedDistributor) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Invoice</h2>
                        <p className="text-sm text-slate-500">For: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedDistributor?.name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Transaction Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Transaction Type *
                            </label>
                            <select
                                required
                                value={transactionType}
                                onChange={(e) => {
                                    setTransactionType(e.target.value);
                                    setAmountPaid('');
                                    setRelatedInvoice('');
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                            >
                                <option value="sale">Sale</option>
                                <option value="payment">Payment</option>
                            </select>
                        </div>

                        {/* Only show payment type for sales */}
                        {transactionType === 'sale' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                    Payment Type *
                                </label>
                                <select
                                    required
                                    value={paymentType}
                                    onChange={(e) => {
                                        setPaymentType(e.target.value);
                                        setAmountPaid('');
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                >
                                    <option value="credit">Credit (Partial/Full)</option>
                                    <option value="debit">Debit (Full Payment)</option>
                                </select>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {paymentType === 'debit' ? 'Full payment after using available credit' : 'Partial payment allowed'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Select Invoice for Payment */}
                    {transactionType === 'payment' && (
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Select Sale Invoice *
                            </label>
                            
                            {/* Search Input */}
                            {allPendingInvoices.length > 3 && (
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search invoice number or amount..."
                                        value={invoiceSearchQuery}
                                        onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                    />
                                </div>
                            )}
                            
                            {/* Invoice Selector */}
                            <select
                                required
                                value={relatedInvoice}
                                onChange={(e) => setRelatedInvoice(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                size={pendingInvoices.length > 5 ? 6 : Math.max(2, pendingInvoices.length + 1)}
                            >
                                <option value="">Choose invoice to pay</option>
                                {pendingInvoices.map(invoice => (
                                    <option key={invoice.id} value={invoice.id}>
                                        {invoice.invoice_number} - Due: ₹{parseFloat(invoice.balance_due).toFixed(2)} ({new Date(invoice.created_at).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                            
                            {allPendingInvoices.length === 0 ? (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    No pending credit invoices for this distributor
                                </p>
                            ) : (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {pendingInvoices.length} of {allPendingInvoices.length} invoices shown
                                </p>
                            )}
                        </div>
                    )}

                    {/* Items Section - Only for Sales */}
                    {transactionType === 'sale' && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined">inventory_2</span>
                                    Products
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="text-xs font-bold text-eva-blue hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span> Add Product
                                </button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item) => {
                                    const availableProducts = getAvailableProducts(item.product);
                                    const selectedProduct = products.find(p => p.id.toString() === item.product);
                                    const maxQty = selectedProduct ? parseFloat(selectedProduct.available_quantity) : 0;

                                    return (
                                        <div key={item.id} className="flex gap-2 items-start">
                                            <div className="flex-1">
                                                <select
                                                    required
                                                    value={item.product}
                                                    onChange={(e) => handleItemChange(item.id, 'product', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                                >
                                                    <option value="">Select Product</option>
                                                    {availableProducts.map(product => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} (Avl: {product.available_quantity})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-28">
                                                <input
                                                    required
                                                    type="number"
                                                    placeholder="Qty"
                                                    min="0.01"
                                                    step="0.01"
                                                    max={maxQty}
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= maxQty)) {
                                                            handleItemChange(item.id, 'quantity', value);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="w-28">
                                                <input
                                                    required
                                                    type="number"
                                                    placeholder="Price"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || parseFloat(value) >= 0) {
                                                            handleItemChange(item.id, 'unitPrice', value);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Amount:</span>
                                <span className="text-lg font-bold text-eva-blue">₹{getTotalAmount().toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {/* Amount Paid - Only show for payment or credit type sale */}
                    {(transactionType === 'payment' || (transactionType === 'sale' && paymentType === 'credit')) && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Amount Paid {transactionType === 'payment' ? '*' : '(Optional)'}
                            </label>
                            <input
                                required={transactionType === 'payment'}
                                type="number"
                                min="0"
                                step="0.01"
                                value={amountPaid}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || parseFloat(value) >= 0) {
                                        setAmountPaid(value);
                                    }
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white"
                                placeholder={transactionType === 'payment' ? 'Enter payment amount' : 'Enter partial payment (optional)'}
                            />
                            {transactionType === 'sale' && paymentType === 'credit' && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Leave empty for full credit, or enter partial payment
                                </p>
                            )}
                            {transactionType === 'payment' && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Excess payment will be added to available balance
                                </p>
                            )}
                        </div>
                    )}

                    {/* Info for debit type sale */}
                    {transactionType === 'sale' && paymentType === 'debit' && (
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">info</span>
                                <div>
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-400">Full Payment</p>
                                    <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                                        Available credit will be used first, remaining amount will be paid in full
                                    </p>
                                    {selectedDistributor && parseFloat(selectedDistributor.balance) > 0 && (
                                        <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                                            Available Credit: ₹{parseFloat(selectedDistributor.balance).toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white resize-none"
                            placeholder="Add any notes..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-slate-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-bold text-white bg-eva-blue rounded-lg hover:bg-blue-800 transition-colors"
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

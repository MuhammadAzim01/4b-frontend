import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '../utils/fetchApis';
import { formatCurrency, formatDate } from '../lib/utils';

const Balance = () => {
    // State
    const [summary, setSummary] = useState({
        current_balance: 0,
        total_additions: 0,
        total_expenses: 0,
        total_purchases: 0,
        total_payments_received: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Filter State
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    // Form State
    const [formData, setFormData] = useState({
        transaction_type: 'addition',
        amount: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchSummary(),
                fetchTransactions()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load balance data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await fetchWithAuth('balance/summary/');
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching summary:', error);
            toast.error('Failed to load balance summary');
        }
    };

    const fetchTransactions = async () => {
        try {
            let url = 'balance/transactions/';
            const params = new URLSearchParams();
            
            if (filterType && filterType !== 'all') {
                params.append('transaction_type', filterType);
            }
            if (dateRange.start) {
                params.append('start_date', dateRange.start);
            }
            if (dateRange.end) {
                params.append('end_date', dateRange.end);
            }
            
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            const response = await fetchWithAuth(url);
            setTransactions(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        }
    };

    const handleAddBalance = async (e) => {
        e.preventDefault();
        
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            await fetchWithAuth('balance/add/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            toast.success('Balance added successfully');
            setShowAddModal(false);
            setFormData({
                transaction_type: 'addition',
                amount: '',
                description: ''
            });
            fetchData();
        } catch (error) {
            console.error('Error adding balance:', error);
            toast.error(error.message || 'Failed to add balance');
        }
    };

    const getTransactionTypeColor = (type) => {
        const colors = {
            opening: 'bg-blue-100 text-blue-800',
            addition: 'bg-green-100 text-green-800',
            expense: 'bg-red-100 text-red-800',
            purchase: 'bg-orange-100 text-orange-800',
            payment: 'bg-emerald-100 text-emerald-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getTransactionIcon = (type) => {
        const icons = {
            opening: 'account_balance',
            addition: 'add_circle',
            expense: 'remove_circle',
            purchase: 'shopping_cart',
            payment: 'payments'
        };
        return icons[type] || 'receipt';
    };

    useEffect(() => {
        fetchTransactions();
    }, [filterType, dateRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Balance Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage company cash balance</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Add Balance
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {/* Current Balance */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg col-span-1 md:col-span-3 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
                        <h3 className="text-lg font-medium opacity-90">Current Balance</h3>
                    </div>
                    <p className="text-4xl font-bold">{formatCurrency(summary.current_balance)}</p>
                </div>

                {/* Total Additions */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-green-600">add_circle</span>
                        <h3 className="text-sm font-medium text-gray-600">Total Additions</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_additions)}</p>
                </div>

                {/* Payments Received */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-emerald-600">payments</span>
                        <h3 className="text-sm font-medium text-gray-600">Payments Received</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_payments_received)}</p>
                </div>

                {/* Total Expenses */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-red-600">remove_circle</span>
                        <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_expenses)}</p>
                </div>

                {/* Total Purchases */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-orange-600">shopping_cart</span>
                        <h3 className="text-sm font-medium text-gray-600">Total Purchases</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_purchases)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="opening">Opening Balance</option>
                            <option value="addition">Balance Addition</option>
                            <option value="payment">Payments Received</option>
                            <option value="expense">Expenses</option>
                            <option value="purchase">Purchases</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setFilterType('all');
                                setDateRange({ start: '', end: '' });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance After
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created By
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">receipt_long</span>
                                        <p className="text-lg">No transactions found</p>
                                        <p className="text-sm">Add an opening balance to get started</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(transaction.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">
                                                    {getTransactionIcon(transaction.transaction_type)}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                                                    {transaction.transaction_type_display}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {transaction.description || '-'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                            {formatCurrency(transaction.balance_after)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {transaction.created_by_name || 'System'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Balance Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">Add Balance</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddBalance} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Type
                                </label>
                                <select
                                    value={formData.transaction_type}
                                    onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="opening">Opening Balance</option>
                                    <option value="addition">Balance Addition</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    {formData.transaction_type === 'opening' 
                                        ? 'Can only be set once - initial company balance'
                                        : 'Add additional funds to the balance'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter description"
                                    rows="3"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add Balance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Balance;

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const DEFAULT_CATEGORIES = [
    { id: 'rent', name: 'Rent', icon: 'home' },
    { id: 'electricity', name: 'Electricity', icon: 'bolt' },
    { id: 'water', name: 'Water', icon: 'water_drop' },
    { id: 'salary', name: 'Salary', icon: 'badge' },
    { id: 'maintenance', name: 'Maintenance', icon: 'build' },
    { id: 'transport', name: 'Transport', icon: 'local_shipping' },
    { id: 'food', name: 'Food & Beverage', icon: 'restaurant' },
    { id: 'marketing', name: 'Marketing', icon: 'campaign' },
    { id: 'other', name: 'Other', icon: 'receipt' },
];

const Expenses = () => {
    // State
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [filterDate, setFilterDate] = useState('all'); // all, today, month
    const [filterCategory, setFilterCategory] = useState('all');

    // Form State
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('other'); // Default to 'other'
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Category State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('receipt');

    // Load data on mount
    useEffect(() => {
        const savedExpenses = localStorage.getItem('expenses');
        const savedCategories = localStorage.getItem('expenseCategories');

        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedCategories) {
            let loadedCategories = JSON.parse(savedCategories);
            // Ensure 'other' exists
            if (!loadedCategories.some(c => c.id === 'other')) {
                loadedCategories.push({ id: 'other', name: 'Other', icon: 'receipt' });
            }
            // Ensure 'other' is at the end
            loadedCategories = [
                ...loadedCategories.filter(c => c.id !== 'other'),
                loadedCategories.find(c => c.id === 'other')
            ];
            setCategories(loadedCategories);
        }
    }, []);

    // Save data on change
    useEffect(() => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('expenseCategories', JSON.stringify(categories));
    }, [categories]);

    // Derived Data
    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const today = new Date();
        const isToday = expenseDate.toDateString() === today.toDateString();
        const isThisMonth = expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();

        let dateMatch = true;
        if (filterDate === 'today') dateMatch = isToday;
        if (filterDate === 'month') dateMatch = isThisMonth;

        let categoryMatch = true;
        if (filterCategory !== 'all') categoryMatch = expense.category === filterCategory;

        return dateMatch && categoryMatch;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalToday = expenses
        .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const totalMonth = expenses
        .filter(e => {
            const d = new Date(e.date);
            const today = new Date();
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        })
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const totalYear = expenses
        .filter(e => new Date(e.date).getFullYear() === new Date().getFullYear())
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Handlers
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !description) return;

        const newExpense = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            category,
            description,
            date,
            createdAt: new Date().toISOString()
        };

        setExpenses([newExpense, ...expenses]);
        toast.success('Expense added successfully');

        // Reset form
        setAmount('');
        setDescription('');
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!newCategoryName) return;

        const newCat = {
            id: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
            name: newCategoryName,
            icon: newCategoryIcon
        };

        // Check duplicates
        if (categories.some(c => c.id === newCat.id)) {
            toast.error('Category with this name already exists');
            return;
        }

        // Add before 'other'
        const otherCat = categories.find(c => c.id === 'other');
        const otherCats = categories.filter(c => c.id !== 'other');

        setCategories([...otherCats, newCat, otherCat]);
        setNewCategoryName('');
        setIsAddingCategory(false);
        toast.success('Category added');
    };

    const handleDeleteCategory = (catId, e) => {
        e.stopPropagation();
        e.preventDefault();

        if (catId === 'other') {
            toast.error("Cannot remove default 'Other' category");
            return;
        }

        if (confirm(`Remove category? This won't delete past expenses.`)) {
            setCategories(categories.filter(c => c.id !== catId));
            if (category === catId) setCategory('other');
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(val);
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 xl:p-10 bg-slate-50 dark:bg-background">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Expense Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage your daily expenses</p>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Today's Expenses</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(totalToday)}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">This Month</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(totalMonth)}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">This Year</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(totalYear)}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="xl:col-span-1 space-y-8">
                    {/* Add Expense Form */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-eva-blue">add_circle</span>
                            Add New Expense
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-eva-blue dark:text-white transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                                        className="text-xs text-eva-blue hover:underline font-medium"
                                    >
                                        {isAddingCategory ? 'Cancel' : '+ New Category'}
                                    </button>
                                </div>

                                {isAddingCategory && (
                                    <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl animate-in fade-in slide-in-from-top-1">
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                placeholder="Category Name"
                                                className="flex-1 px-3 py-1.5 text-sm rounded-lg border-none focus:ring-2 focus:ring-eva-blue"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCategory}
                                                className="px-3 py-1.5 bg-eva-blue text-white rounded-lg text-sm font-bold"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-2">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="relative group">
                                            <button
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={`w-full flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all ${category === cat.id
                                                        ? 'bg-eva-blue text-white shadow-md transform scale-105'
                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-lg mb-1">{cat.icon}</span>
                                                {cat.name}
                                            </button>

                                            {/* Delete Category Button - Protected for 'other' */}
                                            {cat.id !== 'other' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteCategory(cat.id, e)}
                                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white items-center justify-center hidden group-hover:flex shadow-md z-10 hover:bg-red-600"
                                                    title="Remove Category"
                                                >
                                                    <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-eva-blue dark:text-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-eva-blue dark:text-white transition-all resize-none"
                                    placeholder="What was this for?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-eva-blue hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Add Expense
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="xl:col-span-2">
                    <div className="bg-white dark:bg-background-dark rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>

                            <div className="flex items-center gap-2">
                                <select
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-eva-blue cursor-pointer"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="month">This Month</option>
                                </select>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-eva-blue cursor-pointer"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            {filteredExpenses.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                                    <p>No expenses found</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-gray-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                        {filteredExpenses.map(expense => (
                                            <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        <span className="material-symbols-outlined text-[14px]">
                                                            {categories.find(c => c.id === expense.category)?.icon || 'receipt'}
                                                        </span>
                                                        {categories.find(c => c.id === expense.category)?.name || expense.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                    {expense.description}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right whitespace-nowrap">
                                                    {formatCurrency(expense.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;

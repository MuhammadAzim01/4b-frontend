import React, { useState, useEffect } from 'react';

const Employee = () => {
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);

    // Employee State
    const [employees, setEmployees] = useState([
        { id: 'EVA-001', name: 'John Smith', role: 'Operations Manager', salary: '$6,500.00', department: 'Operations', email: 'john@example.com', phone: '+1 234 567 890', joinDate: '2023-01-15' },
        { id: 'EVA-002', name: 'Maria Garcia', role: 'Logistics Coordinator', salary: '$4,800.00', department: 'Logistics', email: 'maria@example.com', phone: '+1 234 567 891', joinDate: '2023-03-10' },
        { id: 'EVA-003', name: 'David Chen', role: 'Quality Assurance', salary: '$5,200.00', department: 'Operations', email: 'david@example.com', phone: '+1 234 567 892', joinDate: '2023-02-20' },
        { id: 'EVA-004', name: 'Aisha Khan', role: 'Sales Representative', salary: '$5,500.00', department: 'Sales', email: 'aisha@example.com', phone: '+1 234 567 893', joinDate: '2023-05-12' },
        { id: 'EVA-005', name: 'Fatima Al-Jamil', role: 'HR Specialist', salary: '$5,100.00', department: 'HR', email: 'fatima@example.com', phone: '+1 234 567 894', joinDate: '2023-06-01' },
    ]);

    // New Employee Form State
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        id: '',
        role: '',
        department: 'Operations',
        email: '',
        phone: '',
        salary: '',
        joinDate: ''
    });

    const handleCheckboxChange = (id) => {
        setSelectedEmployees(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const handleProcessClick = () => {
        setIsProcessModalOpen(true);
    };

    const handleConfirmProcess = () => {
        setIsProcessModalOpen(false);
        alert('Salaries processed successfully!');
        setSelectedEmployees([]);
    };

    const handleAddEmployeeClick = () => {
        setEditingEmployeeId(null);
        setNewEmployee({
            name: '', id: '', role: '', department: 'Operations', email: '', phone: '', salary: '', joinDate: ''
        });
        setIsAddEmployeeModalOpen(true);
    };

    const handleEditEmployeeClick = (employee) => {
        setEditingEmployeeId(employee.id);
        setNewEmployee({
            ...employee,
            salary: employee.salary.replace(/[^0-9.]/g, '') // Remove currency symbol for input
        });
        setIsAddEmployeeModalOpen(true);
    };

    const handleSaveEmployee = () => {
        // Basic validation
        if (!newEmployee.name || !newEmployee.id || !newEmployee.role || !newEmployee.salary) {
            alert("Please fill in Name, ID, Role, and Salary.");
            return;
        }

        const formattedSalary = newEmployee.salary.startsWith('$') ? newEmployee.salary : `$${parseFloat(newEmployee.salary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const employeeData = {
            ...newEmployee,
            salary: formattedSalary
        };

        if (editingEmployeeId) {
            setEmployees(employees.map(emp => emp.id === editingEmployeeId ? employeeData : emp));
        } else {
            setEmployees([...employees, employeeData]);
        }
        setIsAddEmployeeModalOpen(false);
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter ? emp.role.toLowerCase().includes(roleFilter.toLowerCase()) : true;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="max-w-7xl mx-auto p-8">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
                <div className="flex flex-col gap-1">
                    <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Employee & HR Management</p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">View employee details and process monthly salaries.</p>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {/* ToolBar */}
                <div className="flex justify-between items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-eva-blue text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                                placeholder="Search employees..." type="text"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddEmployeeClick}
                            className="flex items-center justify-center rounded-lg h-10 bg-white border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 gap-2 text-sm font-bold leading-normal tracking-wide min-w-0 px-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            <span className="material-symbols-outlined text-base">person_add</span>
                            <span className="truncate">Add Employee</span>
                        </button>
                        <button
                            onClick={handleProcessClick}
                            disabled={selectedEmployees.length === 0}
                            className="flex items-center justify-center rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-wide min-w-0 px-4 cursor-pointer disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400"
                        >
                            <span className="material-symbols-outlined !fill-1 text-base">account_balance_wallet</span>
                            <span className="truncate">Process Selected Salaries</span>
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-end gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Role</label>
                            <input
                                type="text"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                placeholder="Filter by role..."
                                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-eva-blue outline-none text-slate-900 dark:text-white min-w-[200px]"
                            />
                        </div>
                        {(roleFilter || searchQuery) && (
                            <button
                                onClick={() => {
                                    setRoleFilter('');
                                    setSearchQuery('');
                                }}
                                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 mb-[1px]"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Table */}
                <div className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="p-4 w-12">
                                        <input
                                            className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-primary/50 focus:ring-offset-0 focus:ring-2"
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedEmployees(employees.map(e => e.id));
                                                else setSelectedEmployees([]);
                                            }}
                                            checked={selectedEmployees.length === employees.length && employees.length > 0}
                                        />
                                    </th>
                                    <th className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Employee Name</th>
                                    <th className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Employee ID</th>
                                    <th className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Role</th>
                                    <th className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider text-right">Base Salary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400">
                                            No employees found matching your filters.
                                        </td>
                                    </tr>
                                ) : filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-4 w-12">
                                            <input
                                                className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-primary/50 focus:ring-offset-0 focus:ring-2"
                                                type="checkbox"
                                                checked={selectedEmployees.includes(employee.id)}
                                                onChange={() => handleCheckboxChange(employee.id)}
                                            />
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-pointer hover:text-eva-blue transition-colors" onClick={() => handleEditEmployeeClick(employee)}>
                                            {employee.name}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{employee.id}</td>
                                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{employee.role}</td>
                                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400 text-right">{employee.salary}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal Overlay */}
            {isProcessModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 mb-4">
                                    <span className="material-symbols-outlined text-primary !text-3xl">account_balance_wallet</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirm Salary Processing</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    You are about to process salaries for <span className="font-bold text-slate-700 dark:text-slate-200">{selectedEmployees.length} employees</span>, totaling a debit of <span className="font-bold text-red-600 dark:text-red-500">$16,500.00</span> from the company account.
                                </p>
                                <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">This action is irreversible and will be permanently recorded on the immutable ledger.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                            <button onClick={() => setIsProcessModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                            <button onClick={handleConfirmProcess} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white">Confirm & Process</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {isAddEmployeeModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingEmployeeId ? 'Edit Employee' : 'Add New Employee'}</h3>
                            <button onClick={() => setIsAddEmployeeModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        value={newEmployee.name}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employee ID *</label>
                                    <input
                                        type="text"
                                        value={newEmployee.id}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, id: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="EVA-XXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role *</label>
                                    <input
                                        type="text"
                                        value={newEmployee.role}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="e.g. Manager"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                                    <select
                                        value={newEmployee.department}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                    >
                                        <option>Operations</option>
                                        <option>Sales</option>
                                        <option>HR</option>
                                        <option>Logistics</option>
                                        <option>Production</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newEmployee.email}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={newEmployee.phone}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base Salary *</label>
                                    <input
                                        type="number"
                                        value={newEmployee.salary}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={newEmployee.joinDate}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, joinDate: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <button onClick={() => setIsAddEmployeeModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200">Cancel</button>
                            <button onClick={handleSaveEmployee} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white">{editingEmployeeId ? 'Save Changes' : 'Add Employee'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employee;

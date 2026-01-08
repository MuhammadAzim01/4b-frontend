import React, { useState, useEffect } from 'react';
import { employeeService } from '../utils/employeeService';

const Employee = () => {
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);

    // Employee State - now fetched from backend
    const [employees, setEmployees] = useState([]);

    // Show notification helper
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    // New Employee Form State
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        role: '',
        department: 'Operations',
        email: '',
        phone: '',
        salary: '',
        joinDate: ''
    });

    // Fetch employees on component mount
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await employeeService.getAll({ status: 'active' });
            console.log('Fetched employees:', response.data);
            // The response.data should be an array from the backend
            const employeeData = response.data?.results || [];
            
            // Transform backend data to frontend format
            const transformedData = employeeData.map(emp => ({
                id: emp.id,
                employeeId: emp.employee_id,
                name: emp.name,
                email: emp.email || '',
                phone: emp.phone || '',
                role: emp.role,
                department: emp.department_display || emp.department,
                salary: `$${parseFloat(emp.base_salary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                joinDate: emp.join_date || '',
                status: emp.status,
            }));
            setEmployees(transformedData);
        } catch (err) {
            setError('Failed to load employees. Please try again.');
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedEmployees(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const handleProcessClick = () => {
        setIsProcessModalOpen(true);
    };

    const handleConfirmProcess = async () => {
        try {
            setLoading(true);
            
            // Get current month and year
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            
            // Get selected employee database IDs
            const employeeIds = employees
                .filter(emp => selectedEmployees.includes(emp.id))
                .map(emp => emp.id);
            
            const response = await employeeService.processSalaries({
                employee_ids: employeeIds,
                month: month,
                year: year,
                bonus: 0,
                deductions: 0,
                notes: `Salary processed for ${month}/${year}`
            });
            
            setIsProcessModalOpen(false);
            const result = response.data || response;
            showNotification(`Successfully processed salaries for ${result.processed_count} employees. Total: $${result.total_amount}`, 'success');
            setSelectedEmployees([]);
        } catch (err) {
            showNotification(`Error: ${err.message || 'Failed to process salaries'}`, 'error');
            console.error('Error processing salaries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployeeClick = () => {
        setEditingEmployeeId(null);
        setNewEmployee({
            name: '', role: '', department: 'Operations', email: '', phone: '', salary: '', joinDate: ''
        });
        setIsAddEmployeeModalOpen(true);
    };

    const handleEditEmployeeClick = (employee) => {
        setEditingEmployeeId(employee.id);
        setNewEmployee({
            name: employee.name,
            role: employee.role,
            department: employee.department,
            email: employee.email,
            phone: employee.phone,
            salary: employee.salary.replace(/[^0-9.]/g, ''),
            joinDate: employee.joinDate,
            employeeId: employee.employeeId  // Keep for display/update
        });
        setIsAddEmployeeModalOpen(true);
    };

    const handleSaveEmployee = async () => {
        // Basic validation
        if (!newEmployee.name || !newEmployee.role || !newEmployee.salary) {
            showNotification("Please fill in Name, Role, and Salary.", 'error');
            return;
        }

        try {
            setLoading(true);
            
            // Format data for backend
            const employeeData = {
                name: newEmployee.name,
                email: newEmployee.email || null,
                phone: newEmployee.phone || null,
                role: newEmployee.role,
                department: newEmployee.department?.toLowerCase() || 'operations',
                base_salary: parseFloat(newEmployee.salary),
                join_date: newEmployee.joinDate || null,
                status: 'active'
            };
            
            // Only include employee_id when updating
            if (editingEmployeeId && newEmployee.employeeId) {
                employeeData.employee_id = newEmployee.employeeId;
            }
            
            if (editingEmployeeId) {
                // Update existing employee
                await employeeService.update(editingEmployeeId, employeeData);
                await fetchEmployees(); // Refresh list
            } else {
                // Create new employee (employee_id will be auto-generated)
                await employeeService.create(employeeData);
                await fetchEmployees(); // Refresh list
            }
            
            setIsAddEmployeeModalOpen(false);
            setError(null);
            showNotification(editingEmployeeId ? 'Employee updated successfully!' : 'Employee added successfully!', 'success');
        } catch (err) {
            showNotification(`Error: ${err.message || 'Failed to save employee'}`, 'error');
            console.error('Error saving employee:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (emp.employeeId && emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()));
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

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                    <button onClick={fetchEmployees} className="ml-auto text-sm text-red-600 dark:text-red-400 hover:underline">Retry</button>
                </div>
            )}

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
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="mt-4 text-slate-500 dark:text-slate-400">Loading employees...</p>
                        </div>
                    ) : (
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
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{employee.employeeId}</td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{employee.role}</td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400 text-right">{employee.salary}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                                    You are about to process salaries for <span className="font-bold text-slate-700 dark:text-slate-200">{selectedEmployees.length} employees</span>.
                                </p>
                                <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">This action will create expense entries and cannot be easily reversed.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                            <button 
                                onClick={() => setIsProcessModalOpen(false)} 
                                disabled={loading}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmProcess} 
                                disabled={loading}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Confirm & Process'}
                            </button>
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
                                {editingEmployeeId && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
                                        <input
                                            type="text"
                                            value={newEmployee.employeeId || ''}
                                            disabled
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                            placeholder="Auto-generated"
                                        />
                                    </div>
                                )}
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
                                        step="1"
                                        value={newEmployee.salary}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                const currentVal = parseFloat(newEmployee.salary) || 0;
                                                const newVal = e.key === 'ArrowUp' ? currentVal + 1 : Math.max(0, currentVal - 1);
                                                setNewEmployee({ ...newEmployee, salary: newVal.toString() });
                                            }
                                        }}
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
                            <button 
                                onClick={() => setIsAddEmployeeModalOpen(false)} 
                                disabled={loading}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveEmployee} 
                                disabled={loading}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : (editingEmployeeId ? 'Save Changes' : 'Add Employee')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {notification && (
                <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-sm min-w-[320px] max-w-md ${
                        notification.type === 'success' 
                            ? 'bg-green-50/95 dark:bg-green-900/95 border-green-200 dark:border-green-800'
                            : 'bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-800'
                    }`}>
                        <span className={`material-symbols-outlined text-2xl ${
                            notification.type === 'success'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                        }`}>
                            {notification.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <p className={`flex-1 text-sm font-medium ${
                            notification.type === 'success'
                                ? 'text-green-800 dark:text-green-100'
                                : 'text-red-800 dark:text-red-100'
                        }`}>
                            {notification.message}
                        </p>
                        <button
                            onClick={() => setNotification(null)}
                            className={`hover:bg-black/5 dark:hover:bg-white/5 rounded p-1 transition-colors ${
                                notification.type === 'success'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employee;

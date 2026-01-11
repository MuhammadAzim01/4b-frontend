import { fetchWithAuth } from '../utils/fetchApis';

/**
 * Employee Management API Service
 * 
 * Provides methods to interact with the employee management backend
 */

export const employeeService = {
  /**
   * Get all employees with optional filters
   * @param {Object} params - Query parameters (status, department, search, role)
   * @returns {Promise} Array of employees
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `employees/?${queryString}` : 'employees/';
    return await fetchWithAuth(url);
  },

  /**
   * Get employee by ID
   * @param {number} id - Employee ID
   * @returns {Promise} Employee object
   */
  getById: async (id) => {
    return await fetchWithAuth(`employees/${id}/`);
  },

  /**
   * Create new employee
   * @param {Object} employeeData - Employee data
   * @returns {Promise} Created employee object
   */
  create: async (employeeData) => {
    return await fetchWithAuth('employees/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
  },

  /**
   * Update existing employee
   * @param {number} id - Employee ID
   * @param {Object} employeeData - Updated employee data
   * @returns {Promise} Updated employee object
   */
  update: async (id, employeeData) => {
    return await fetchWithAuth(`employees/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
  },

  /**
   * Partially update employee
   * @param {number} id - Employee ID
   * @param {Object} employeeData - Partial employee data
   * @returns {Promise} Updated employee object
   */
  partialUpdate: async (id, employeeData) => {
    return await fetchWithAuth(`employees/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });
  },

  /**
   * Delete employee
   * @param {number} id - Employee ID
   * @returns {Promise} Empty response
   */
  delete: async (id) => {
    return await fetchWithAuth(`employees/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Process salaries for selected employees
   * @param {Object} data - { employee_ids, month, year, bonus?, deductions?, notes? }
   * @returns {Promise} Processing result
   */
  processSalaries: async (data) => {
    return await fetchWithAuth('employees/process_salaries/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * Get salary payment history for an employee
   * @param {number} id - Employee ID
   * @returns {Promise} Array of salary payments
   */
  getSalaryHistory: async (id) => {
    return await fetchWithAuth(`employees/${id}/salary_history/`);
  },

  /**
   * Get employee statistics
   * @returns {Promise} Statistics object
   */
  getStatistics: async () => {
    return await fetchWithAuth('employees/statistics/');
  },
};

export const salaryPaymentService = {
  /**
   * Get all salary payments with optional filters
   * @param {Object} params - Query parameters (employee, status, month, year)
   * @returns {Promise} Array of salary payments
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `employees/salary-payments/?${queryString}` : 'employees/salary-payments/';
    return await fetchWithAuth(url);
  },

  /**
   * Get salary payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise} Payment object
   */
  getById: async (id) => {
    return await fetchWithAuth(`employees/salary-payments/${id}/`);
  },

  /**
   * Create new salary payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise} Created payment object
   */
  create: async (paymentData) => {
    return await fetchWithAuth('employees/salary-payments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
  },

  /**
   * Update salary payment
   * @param {number} id - Payment ID
   * @param {Object} paymentData - Updated payment data
   * @returns {Promise} Updated payment object
   */
  update: async (id, paymentData) => {
    return await fetchWithAuth(`employees/salary-payments/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
  },

  /**
   * Delete salary payment
   * @param {number} id - Payment ID
   * @returns {Promise} Empty response
   */
  delete: async (id) => {
    return await fetchWithAuth(`employees/salary-payments/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Get monthly salary summary
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @returns {Promise} Summary object
   */
  getMonthlySummary: async (month, year) => {
    return await fetchWithAuth(`employees/salary-payments/monthly_summary/?month=${month}&year=${year}`);
  },
};

/**
 * Helper function to format employee data for backend
 * @param {Object} frontendData - Employee data from frontend form
 * @returns {Object} Formatted data for backend
 */
export const formatEmployeeForBackend = (frontendData) => {
  return {
    employee_id: frontendData.id || frontendData.employee_id,
    name: frontendData.name,
    email: frontendData.email || null,
    phone: frontendData.phone || null,
    role: frontendData.role,
    department: frontendData.department?.toLowerCase() || 'operations',
    base_salary: typeof frontendData.salary === 'string' 
      ? parseFloat(frontendData.salary.replace(/[^0-9.]/g, ''))
      : frontendData.salary,
    join_date: frontendData.joinDate || null,
    status: frontendData.status || 'active',
    address: frontendData.address || null,
    emergency_contact: frontendData.emergency_contact || null,
    notes: frontendData.notes || null,
  };
};

/**
 * Helper function to format backend employee data for frontend
 * @param {Object} backendData - Employee data from backend
 * @returns {Object} Formatted data for frontend
 */
export const formatEmployeeForFrontend = (backendData) => {
  return {
    id: backendData.employee_id,
    name: backendData.name,
    email: backendData.email || '',
    phone: backendData.phone || '',
    role: backendData.role,
    department: backendData.department_display || backendData.department,
    salary: `$${parseFloat(backendData.base_salary).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`,
    joinDate: backendData.join_date || '',
    status: backendData.status,
  };
};

import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';

import ProtectedRoute from './ProtectedRoutes';
import Dashboard from '../pages/Dashboard';
import Inventory from '../pages/Inventory';
import Distributors from '../pages/Distributors';
import Sales from '../pages/Sales';
import Financials from '../pages/Financials';
import Production from '../pages/Production';
import Warehouse from '../pages/Warehouse';
import Employee from '../pages/Employee';
import Expenses from '../pages/Expenses';
import Balance from '../pages/Balance';

export default function AdminRoutes() {
    return (
        <Routes>
            <Route element={<ProtectedRoute permission="admin" />}>
                <Route element={<MainLayout />}>
                    <Route path="home" element={<Dashboard />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="distributors" element={<Distributors />} />
                    <Route path="sales" element={<Sales />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="balance" element={<Balance />} />
                    <Route path="production" element={<Production />} />
                    <Route path="production/:batchNumber" element={<Production />} />
                    <Route path="warehouse" element={<Warehouse />} />
                    <Route path="employee" element={<Employee />} />
                    <Route path="*" element={<Navigate to="home" replace />} />
                </Route>
            </Route>
        </Routes>
    );
}

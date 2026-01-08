import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';

import ProtectedRoute from './ProtectedRoutes';
import Inventory from '../pages/Inventory';
import Distributors from '../pages/Distributors';
import Sales from '../pages/Sales';
import Production from '../pages/Production';
import Warehouse from '../pages/Warehouse';
import Expenses from '../pages/Expenses';

export default function AccountantRoutes() {
    return (
        <Routes>
            <Route element={<ProtectedRoute permission="accountant" />}>
                <Route element={<MainLayout />}>
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="production" element={<Production />} />
                    <Route path="distributors" element={<Distributors />} />
                    <Route path="production/:batchNumber" element={<Production />} />
                    <Route path="warehouse" element={<Warehouse />} />
                    <Route path="*" element={<Navigate to="inventory" replace />} />
                </Route>
            </Route>
        </Routes>
    );
}

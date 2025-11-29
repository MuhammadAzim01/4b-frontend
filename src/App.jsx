import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { ModalProvider } from './context/ModalContext';

// Placeholder imports - will replace with actual components
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Distributors from './pages/Distributors';
import Sales from './pages/Sales';
import Financials from './pages/Financials';
import Production from './pages/Production';
import Warehouse from './pages/Warehouse';
import Employee from './pages/Employee';

function App() {
  return (
    <ModalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="distributors" element={<Distributors />} />
            <Route path="sales" element={<Sales />} />
            <Route path="financials" element={<Financials />} />
            <Route path="production" element={<Production />} />
            <Route path="warehouse" element={<Warehouse />} />
            <Route path="employee" element={<Employee />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ModalProvider>
  );
}

export default App;

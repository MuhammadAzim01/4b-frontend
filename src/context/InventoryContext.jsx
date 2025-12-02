import React, { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const [inventoryItems, setInventoryItems] = useState(() => {
        const saved = localStorage.getItem('inventoryItems');
        let items = saved ? JSON.parse(saved) : [
            { id: 1, name: 'PET Preforms (1L)', quantity: 150000, unit: 'units', unitValue: 0.85, totalValue: 127500.00, status: 'In Stock', category: 'raw_materials' },
            { id: 2, name: 'Bottle Caps', quantity: 450000, unit: 'units', unitValue: 0.15, totalValue: 67500.00, status: 'In Stock', category: 'raw_materials' },
            { id: 3, name: 'Labels (EVA Brand)', quantity: 85000, unit: 'units', unitValue: 0.30, totalValue: 25500.00, status: 'In Stock', category: 'raw_materials' },
            { id: 4, name: 'Cardboard Boxes', quantity: 4800, unit: 'units', unitValue: 12.50, totalValue: 60000.00, status: 'Low Stock', category: 'raw_materials' },
            { id: 5, name: 'Purified Water', quantity: 50000, unit: 'L', unitValue: 1.20, totalValue: 60000.00, status: 'In Stock', category: 'raw_materials' },
            { id: 6, name: 'CO2 Cylinder', quantity: 12, unit: 'units', unitValue: 1500.00, totalValue: 18000.00, status: 'Out of Stock', category: 'returnable_assets' },
        ];
        // Ensure all items have a category (migration for existing data)
        return items.map(item => ({
            ...item,
            category: item.category || 'raw_materials'
        }));
    });

    const [pendingItems, setPendingItems] = useState(() => {
        const saved = localStorage.getItem('pendingItems');
        let items = saved ? JSON.parse(saved) : [];
        return items.map(item => ({
            ...item,
            category: item.category || 'raw_materials'
        }));
    });

    useEffect(() => {
        localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
    }, [inventoryItems]);

    useEffect(() => {
        localStorage.setItem('pendingItems', JSON.stringify(pendingItems));
    }, [pendingItems]);

    const [stockHistory, setStockHistory] = useState(() => {
        const saved = localStorage.getItem('stockHistory');
        const parsed = saved ? JSON.parse(saved) : [];

        // Seed initial history if empty or invalid
        if (!parsed || parsed.length === 0) {
            const initialHistory = [
                { id: 101, itemId: 1, itemName: 'PET Preforms (1L)', quantity: 150000, unitValue: 0.85, date: '2023-10-15T10:00:00.000Z', supplier: 'Plastico Ind.', note: 'Initial Stock' },
                { id: 102, itemId: 2, itemName: 'Bottle Caps', quantity: 450000, unitValue: 0.15, date: '2023-10-20T14:30:00.000Z', supplier: 'CapMaster', note: 'Bulk Order' },
                { id: 103, itemId: 3, itemName: 'Labels (EVA Brand)', quantity: 85000, unitValue: 0.30, date: '2023-11-01T09:15:00.000Z', supplier: 'PrintPro', note: '' },
            ];
            return initialHistory;
        }
        return parsed;
    });

    useEffect(() => {
        localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
    }, [stockHistory]);

    const addStockRequest = (item) => {
        const newItem = {
            ...item,
            id: Date.now(), // Simple ID generation
            status: 'Pending Approval',
            unitValue: 0,
            totalValue: 0,
            createdAt: new Date().toISOString()
        };
        setPendingItems(prev => [...prev, newItem]);
    };

    const approveStockRequest = (id, pricingDetails) => {
        const itemToApprove = pendingItems.find(i => i.id === id);
        if (!itemToApprove) return;

        const approvedItem = {
            ...itemToApprove,
            ...pricingDetails,
            status: 'In Stock', // Or determine based on quantity
            totalValue: itemToApprove.quantity * pricingDetails.unitValue
        };

        // Update main inventory (aggregate or add new)
        setInventoryItems(prev => {
            const existingItemIndex = prev.findIndex(i => i.name === approvedItem.name);
            if (existingItemIndex >= 0) {
                const updatedItems = [...prev];
                const existing = updatedItems[existingItemIndex];
                updatedItems[existingItemIndex] = {
                    ...existing,
                    quantity: existing.quantity + approvedItem.quantity,
                    totalValue: existing.totalValue + approvedItem.totalValue,
                    unitValue: pricingDetails.unitValue,
                    category: approvedItem.category // Update category if changed or ensure it's set
                };
                return updatedItems;
            }
            return [...prev, approvedItem];
        });

        // Add to history
        const historyEntry = {
            id: Date.now(),
            itemId: itemToApprove.id, // Or link to main inventory ID if we had a robust ID system
            itemName: itemToApprove.name,
            quantity: itemToApprove.quantity,
            unitValue: pricingDetails.unitValue,
            date: new Date().toISOString(),
            supplier: itemToApprove.supplier,
            note: itemToApprove.note
        };
        setStockHistory(prev => [historyEntry, ...prev]);

        setPendingItems(prev => prev.filter(i => i.id !== id));
    };

    const addDirectStock = (item) => {
        const newItem = {
            ...item,
            id: Date.now(),
            status: 'In Stock',
            totalValue: item.quantity * item.unitValue,
            createdAt: new Date().toISOString()
        };

        // Update main inventory
        setInventoryItems(prev => {
            const existingItemIndex = prev.findIndex(i => i.name === newItem.name);
            if (existingItemIndex >= 0) {
                const updatedItems = [...prev];
                const existing = updatedItems[existingItemIndex];
                updatedItems[existingItemIndex] = {
                    ...existing,
                    quantity: existing.quantity + newItem.quantity,
                    totalValue: existing.totalValue + newItem.totalValue,
                    unitValue: newItem.unitValue,
                    category: newItem.category
                };
                return updatedItems;
            }
            return [...prev, newItem];
        });

        // Add to history
        const historyEntry = {
            id: Date.now(),
            itemId: newItem.id,
            itemName: newItem.name,
            quantity: newItem.quantity,
            unitValue: newItem.unitValue,
            date: new Date().toISOString(),
            supplier: newItem.supplier,
            note: newItem.note
        };
        setStockHistory(prev => [historyEntry, ...prev]);
    };

    const updateItem = (id, updates) => {
        setInventoryItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const addNewItem = (item) => {
        const newItem = {
            ...item,
            id: Date.now(),
            quantity: 0,
            unitValue: 0,
            totalValue: 0,
            status: 'Out of Stock',
            createdAt: new Date().toISOString()
        };
        setInventoryItems(prev => [...prev, newItem]);
    };

    return (
        <InventoryContext.Provider value={{
            inventoryItems,
            pendingItems,
            stockHistory,
            addStockRequest,
            addDirectStock,
            approveStockRequest,
            updateItem,
            addNewItem
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

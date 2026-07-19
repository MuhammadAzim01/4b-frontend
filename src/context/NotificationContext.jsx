import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchApis';
import { getAuthStatus } from '../utils/auth';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        const { isAuthenticated } = getAuthStatus();
        if (!isAuthenticated) return;

        setLoading(true);
        const newNotifications = [];

        try {
            // 1. Fetch Inventory for Low Stock
            const itemsRes = await fetchWithAuth('inventory/items/?page_size=1000');
            const items = itemsRes.results || [];

            items.forEach(item => {
                const qty = parseFloat(item.quantity) || 0;
                // Assuming 'minimum_quantity' exists or defaulting to 10 for demo if not present
                // Need to check if item has 'minimum_quantity' field. If not, use 10.
                const minQty = item.minimum_quantity ? parseFloat(item.minimum_quantity) : 20;

                if (qty < minQty) {
                    newNotifications.push({
                        id: `stock-${item.id}`,
                        type: 'warning',
                        title: 'Low Stock Alert',
                        message: `Raw Material '${item.name}' is running low (${qty} left).`,
                        time: new Date(), // Real-time
                        link: '/inventory'
                    });
                }
            });

            // 2. Fetch Invoices for Overdue
            const invoicesRes = await fetchWithAuth('distributors/invoices/?page_size=1000');
            const invoices = invoicesRes.results || [];
            const today = new Date();

            invoices.forEach(inv => {
                if (inv.status === 'pending' || inv.status === 'overdue') {
                    // Check if actually overdue (status might be 'overdue' from backend or check date)
                    // If backend sets 'overdue', trust it. Or check due_date.
                    // Assuming generated invoices have a due date or just created_at + 30 days?
                    // For now, if status is 'overdue', alert.
                    if (inv.status === 'overdue') {
                        newNotifications.push({
                            id: `inv-${inv.id}`,
                            type: 'error',
                            title: 'Overdue Invoice',
                            message: `Invoice #${inv.invoice_number} for ${inv.distributor_name} is overdue.`,
                            time: new Date(inv.updated_at || inv.created_at),
                            link: '/sales'
                        });
                    }
                }
            });

        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
            setNotifications(newNotifications);
            setUnreadCount(newNotifications.length);
        }
    };

    // Initial Fetch & Interval
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // 5 mins
        return () => clearInterval(interval);
    }, []);

    const markAsRead = () => {
        setUnreadCount(0);
        // Could persist this state if needed
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, refresh: fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

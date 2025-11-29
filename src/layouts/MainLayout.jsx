import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useModal } from '../context/ModalContext';

const MainLayout = () => {
    const { showModal } = useModal();

    const handleGlobalClick = (e) => {
        // Logic to simulate the global click handler for buttons
        // In React, we might attach this to specific buttons or use a global capture
        // For now, we'll let individual components handle their specific actions,
        // and maybe add a global listener if needed.
        // The original script attached to all buttons.
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            const btn = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
            // Check if button has specific handler or is excluded
            if (btn.dataset.handled) return;

            // This is tricky in React because events are delegated.
            // We'll implement a helper function `handleGenericClick` to be used on buttons that need it.
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light dark:bg-background-dark">
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

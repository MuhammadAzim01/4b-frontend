import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const SidebarItem = ({ to, icon, label, activeIconStyle }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                    ? "bg-eva-blue/10 text-eva-blue"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
        >
            <span
                className={clsx("material-symbols-outlined", isActive ? "text-eva-blue" : "text-gray-700 dark:text-gray-300")}
                style={isActive && activeIconStyle ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
                {icon}
            </span>
            <p className={clsx("text-sm font-medium leading-normal", isActive ? "text-eva-blue" : "text-eva-text dark:text-gray-200")}>
                {label}
            </p>
        </Link>
    );
};

const Sidebar = () => {
    return (
        <div className="flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark w-64 p-4 shrink-0 h-screen sticky top-0">
            <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-2">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA19cb4w5kfQKaZqd74eLXLKRq7XcrjJjxEFLz3GN5IiEBr42ycMFN0kQqEaTOWh8r3wIp0ZwNHXNfy5OzAVOdj-4cXaJttk5lRmM4kDR5mGC9AXzmKZx8zQM_WxPMtW1HFP0IyscmfmQuRPcTUpPG6tiP3mgsjr-BM0Ul14ljmowE5k3ay1V8T-T5bdsGYOiKUeemun3gKx5veulaCemEr7LHiUdDsJoBeP9QYK4nh9rC-VrvHdLWcdbfrrlZZCJEp-LQ382_qWMEf")' }}
                        ></div>
                        <div className="flex flex-col">
                            <h1 className="text-slate-900 dark:text-white text-base font-medium leading-normal">EVA Ops Mgmt</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">4B Food & Beverages</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                        <SidebarItem to="/" icon="dashboard" label="Dashboard" />
                        <SidebarItem to="/inventory" icon="inventory_2" label="Inventory" />
                        <SidebarItem to="/distributors" icon="groups" label="Distributors" activeIconStyle />
                        <SidebarItem to="/sales" icon="receipt_long" label="Sales and Report" />
                        <SidebarItem to="/financials" icon="monitoring" label="Financials" />
                        <SidebarItem to="/production" icon="precision_manufacturing" label="Production" />
                        <SidebarItem to="/warehouse" icon="warehouse" label="Warehouse" />
                        <SidebarItem to="/employee" icon="badge" label="Employee & HR" activeIconStyle />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" href="#">
                        <span className="material-symbols-outlined">settings</span>
                        <p className="text-sm font-medium leading-normal">Settings</p>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" href="#">
                        <span className="material-symbols-outlined">help</span>
                        <p className="text-sm font-medium leading-normal">Help</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

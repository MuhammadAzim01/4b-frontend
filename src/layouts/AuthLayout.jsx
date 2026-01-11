import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import logo from "../assets/images/webp/4b-logo.jpeg";
import { getAuthStatus } from '../utils/auth';

export default function AuthLayout() {
    const navigate = useNavigate();

    useEffect(() => {
        const { isAuthenticated, user } = getAuthStatus();

        if (isAuthenticated) {
            navigate(`/${user.role}`);
        }
    }, [navigate]);

    return (
        <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh] p-3 lg:p-0">
            <div className="hidden lg:flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 z-0"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>

                {/* Radial Gradient */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-20%,_#3b82f615,_transparent)] z-0"></div>

                {/* Floating Elements */}
                <div className="absolute top-1/4 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-1/3 right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-700"></div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center w-full max-w-2xl">

                    {/* Glass Container for Logo */}
                    <div className="mb-12 p-8 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/10 shadow-2xl relative group">
                        {/* Glow effect behind logo */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/30 transition-all duration-700"></div>

                        <img
                            src={logo}
                            alt="4B Logo"
                            className="w-80 h-80 object-contain drop-shadow-2xl relative z-10 transform group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h2 className="text-4xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                            Welcome Back
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Experience the next generation of business operations.
                            Seamlessly manage inventory, sales, and financials in one unified platform.
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap justify-center gap-3 mt-8">
                            {['Analytics', 'Inventory', 'Finance', 'CRM'].map((item) => (
                                <span key={item} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-300 text-sm font-medium backdrop-blur-sm hover:bg-white/10 transition-colors">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center py-12 bg-background">
                <div className="mx-auto grid w-[350px] gap-6">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

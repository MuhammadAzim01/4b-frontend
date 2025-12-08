import React, { useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'sonner';

import { useFetchQuery } from '../hooks/useFetchQuery';
import { useCreateUpdateMutation } from '../hooks/useCreateUpdateMutation';
import { fetchWithAuth } from '../utils/fetchApis';
import { generateInvoiceHtml } from '../components/InvoiceTemplate';
import StartProductionModal from '../components/StartProductionModal';
import EndProductionModal from '../components/EndProductionModal';
import ProductionDetailsModal from '../components/ProductionDetailsModal';

const Production = () => {
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [currentRun, setCurrentRun] = useState(null);
    const [selectedHistoryRun, setSelectedHistoryRun] = useState(null);

    // Fetch production batches
    const { data, isFetching, isError, error, refetch } = useFetchQuery({
        url: 'production/batches/',
        queryKey: ['production-batches'],
        fetchFunction: fetchWithAuth,
        staleTime: 2 * 60 * 1000,
    });

    // Start production mutation
    const startProductionMutation = useCreateUpdateMutation({
        url: 'production/batches/start/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        fetchFunction: fetchWithAuth,
        onSuccessMessage: 'Production started successfully',
        onErrorMessage: 'Failed to start production',
        onSuccess: () => {
            refetch();
        },
    });

    const batches = data?.results || [];
    const activeRuns = batches.filter(b => b.status === 'pending');
    const history = batches.filter(b => b.status === 'completed');

    const handleStartRun = (materials) => {
        const payload = {
            raw_materials: materials.map(m => ({
                raw_material: parseInt(m.materialId),
                quantity_used: parseFloat(m.quantity)
            })),
            notes: ''
        };

        startProductionMutation.mutate(JSON.stringify(payload));
        setIsStartModalOpen(false);
    };

    const handleOpenEndModal = (run) => {
        setCurrentRun(run);
        setIsEndModalOpen(true);
    };

    const handleEndRun = async (resultData) => {
        const payload = {
            product: parseInt(resultData.productId),
            product_quantity: parseFloat(resultData.outputQuantity),
            wastage: resultData.waste.map(w => ({
                raw_material: parseInt(w.materialId),
                quantity_wasted: parseFloat(w.quantity)
            })),
            notes: resultData.notes || ''
        };

        const loadingToast = toast.loading('Completing production...');
        
        try {
            await fetchWithAuth(`production/batches/${currentRun.id}/end/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            toast.dismiss(loadingToast);
            toast.success('Production completed successfully');
            refetch();
            setIsEndModalOpen(false);
            setCurrentRun(null);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to complete production');
            console.error('Failed to end production:', error);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 xl:p-10">
            {/* PageHeading */}
            <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Production Module</h1>
                <button
                    onClick={() => setIsStartModalOpen(true)}
                    className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-bold text-white rounded-lg bg-primary hover:bg-primary/90 transition-colors bg-eva-blue" // Added bg-eva-blue explicitly if bg-primary isn't defined or we want to be safe
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span className="truncate">Start New Production Run</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Active Production Runs */}
                <div className="lg:col-span-1">
                    <div className="p-6 bg-white dark:bg-background-dark rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 h-full flex flex-col">
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Active Runs
                        </h2>

                        {isFetching ? (
                            <div className="flex-1 flex items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : activeRuns.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">factory</span>
                                <p>No production runs in progress.</p>
                                <p className="text-sm mt-2">Click "Start New Run" to begin.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeRuns.map(run => (
                                    <div key={run.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-50 to-transparent dark:from-green-900/20 -mr-4 -mt-4 rounded-bl-full"></div>

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">{run.batch_number}</h3>
                                                <p className="text-xs text-slate-500">{new Date(run.start_date).toLocaleString()}</p>
                                            </div>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">In Progress</span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Materials:</p>
                                            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                                {run.raw_materials?.map((m, idx) => (
                                                    <li key={idx} className="flex justify-between">
                                                        <span>{m.raw_material_name}</span>
                                                        <span className="font-mono text-slate-500">x{m.quantity_used}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                            <span className="font-semibold">Total Cost:</span> ₹{parseFloat(run.total_cost).toFixed(2)}
                                        </div>

                                        <button
                                            onClick={() => handleOpenEndModal(run)}
                                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white rounded-lg text-sm font-bold transition-colors"
                                        >
                                            End Run & Record Output
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Production Logs (History) */}
                <div className="lg:col-span-2">
                    <div className="p-6 bg-white dark:bg-background-dark rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight mb-4">Production Run History</h2>
                        <div className="relative mb-4">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                className="w-full rounded-lg pl-10 h-10 bg-white border-slate-200 dark:border-gray-700 focus:ring-primary focus:border-primary dark:bg-background-dark dark:text-white"
                                placeholder="Search by Run ID, material..." type="text" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-slate-50 dark:bg-background-dark border-b border-slate-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3" scope="col">Batch ID</th>
                                        <th className="px-4 py-3" scope="col">Date/Time</th>
                                        <th className="px-4 py-3" scope="col">Raw Materials</th>
                                        <th className="px-4 py-3" scope="col">Product</th>
                                        <th className="px-4 py-3 text-right" scope="col">Output Qty</th>
                                        <th className="px-4 py-3 text-center" scope="col">Efficiency</th>
                                        <th className="px-4 py-3" scope="col">Waste</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isFetching ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center">
                                                <LoadingSpinner />
                                            </td>
                                        </tr>
                                    ) : history.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                                No completed production runs yet
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((run) => (
                                            <tr
                                                key={run.id}
                                                onClick={() => {
                                                    setSelectedHistoryRun(run);
                                                    setIsDetailsModalOpen(true);
                                                }}
                                                className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-white font-medium group-hover:text-eva-blue transition-colors">{run.batch_number}</td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{new Date(run.end_date).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-slate-900 dark:text-white">
                                                    {run.raw_materials?.map(m => m.raw_material_name).join(', ')}
                                                </td>
                                                <td className="px-4 py-3 text-slate-900 dark:text-white">{run.product_name}</td>
                                                <td className="px-4 py-3 text-right text-slate-900 dark:text-white font-bold">{run.product_quantity}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                                        ${run.efficiency >= 95 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            run.efficiency >= 85 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                run.efficiency >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {run.efficiency}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {run.raw_materials?.some(m => m.quantity_wasted > 0) ? (
                                                        <div className="flex flex-col gap-1">
                                                            {run.raw_materials.filter(m => m.quantity_wasted > 0).map((m, i) => (
                                                                <span key={i} className="text-red-500 dark:text-red-400">{m.raw_material_name}: {m.quantity_wasted}</span>
                                                            ))}
                                                        </div>
                                                    ) : <span className="text-green-500">None</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <StartProductionModal
                isOpen={isStartModalOpen}
                onClose={() => setIsStartModalOpen(false)}
                onStart={handleStartRun}
            />

            <EndProductionModal
                isOpen={isEndModalOpen}
                onClose={() => setIsEndModalOpen(false)}
                runData={currentRun}
                onEnd={handleEndRun}
            />

            <ProductionDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                run={selectedHistoryRun}
            />
        </div>
    );
};

export default Production;

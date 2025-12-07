import React, { useState } from 'react';
import StartProductionModal from '../components/StartProductionModal';
import EndProductionModal from '../components/EndProductionModal';
import ProductionDetailsModal from '../components/ProductionDetailsModal';
import { generateInvoiceHtml } from '../components/InvoiceTemplate';

const Production = () => {
    // Dummy Data for History (Pre-populated) (Updated structure slightly for demo consistency if needed but keeping as is for now)
    const [history, setHistory] = useState([
        { id: 'PRD-84201', date: '2023-10-27 09:15', materials: [{ name: 'PET Preforms', quantity: 1000 }], matQty: '1,000', output: 'Water Bottle - 500ml', outQty: '1,000', efficiency: 98, Cost: '$250.00', status: 'Completed', waste: [{ name: 'PET Preforms', quantity: 20 }] },
        { id: 'PRD-84200', date: '2023-10-26 14:30', materials: [{ name: 'HDPE Caps', quantity: 5000 }], matQty: '5,000', output: 'Caps Applied', outQty: '5,000', efficiency: 95, Cost: '$150.00', status: 'Completed', waste: [{ name: 'HDPE Caps', quantity: 250 }] },
        { id: 'PRD-84199', date: '2023-10-26 11:00', materials: [{ name: 'Printed Labels', quantity: 2500 }], matQty: '2,500', output: 'Bottles Labeled', outQty: '2,500', efficiency: 88, Cost: '$75.50', status: 'Completed', waste: [{ name: 'Printed Labels', quantity: 340 }] },
    ]);

    // Active Runs State
    const [activeRuns, setActiveRuns] = useState([]);

    // Modal States
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Selection State
    const [currentRun, setCurrentRun] = useState(null);
    const [selectedHistoryRun, setSelectedHistoryRun] = useState(null);

    const handleStartRun = (materials, shouldPrint) => {
        const newRun = {
            id: `PRD-${Math.floor(Math.random() * 100000)}`,
            startDate: new Date(),
            materials: materials,
            status: 'In Progress'
        };

        // Add to active runs
        setActiveRuns([newRun, ...activeRuns]);
        setIsStartModalOpen(false);

        // Print Invoice Optional
        if (shouldPrint) {
            const invoiceHtml = generateInvoiceHtml(newRun);
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(invoiceHtml);
                printWindow.document.close();
            } else {
                alert('Popup blocked. Please allow popups to print the invoice.');
            }
        }
    };

    const handleOpenEndModal = (run) => {
        setCurrentRun(run);
        setIsEndModalOpen(true);
    };

    const handleEndRun = (resultData) => {
        const outputQty = parseInt(resultData.outputQuantity || 0);
        // Calculate total waste
        const totalWaste = resultData.waste.reduce((acc, w) => acc + parseInt(w.quantity || 0), 0);

        // Calculate Efficiency: Output / (Output + Waste) * 100
        // Avoid division by zero
        const totalProcessed = outputQty + totalWaste;
        const efficiency = totalProcessed > 0 ? Math.round((outputQty / totalProcessed) * 100) : 0;

        // Create completed entry
        const completedRun = {
            ...currentRun,
            date: currentRun.startDate.toLocaleString(),
            output: resultData.outputItemName,
            outQty: outputQty.toLocaleString(), // Format nicely
            // Format materials for table display (just showing first one + count for brevity in this simple table view)
            materials: currentRun.materials[0].name + (currentRun.materials.length > 1 ? ` +${currentRun.materials.length - 1} more` : ''),
            matQty: currentRun.materials.reduce((acc, curr) => acc + parseInt(curr.quantity || 0), 0).toLocaleString(),
            efficiency: efficiency,
            Cost: '$0.00', // Placeholder
            status: 'Completed',
            waste: resultData.waste
        };

        // Update History
        setHistory([completedRun, ...history]);

        // Remove from Active Runs
        setActiveRuns(activeRuns.filter(r => r.id !== currentRun.id));

        setIsEndModalOpen(false);
        setCurrentRun(null);
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

                        {activeRuns.length === 0 ? (
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
                                                <h3 className="font-bold text-slate-900 dark:text-white">{run.id}</h3>
                                                <p className="text-xs text-slate-500">{new Date(run.startDate).toLocaleTimeString()}</p>
                                            </div>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">In Progress</span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Materials:</p>
                                            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                                {run.materials.map((m, idx) => (
                                                    <li key={idx} className="flex justify-between">
                                                        <span>{m.name}</span>
                                                        <span className="font-mono text-slate-500">x{m.quantity}</span>
                                                    </li>
                                                ))}
                                            </ul>
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
                                        <th className="px-4 py-3" scope="col">Run ID</th>
                                        <th className="px-4 py-3" scope="col">Date/Time</th>
                                        <th className="px-4 py-3" scope="col">Raw Materials</th>
                                        <th className="px-4 py-3 text-right" scope="col">Input Qty</th>
                                        <th className="px-4 py-3" scope="col">Finished Good</th>
                                        <th className="px-4 py-3 text-right" scope="col">Output Qty</th>
                                        <th className="px-4 py-3 text-center" scope="col">Efficiency</th>
                                        <th className="px-4 py-3" scope="col">Waste</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((run, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => {
                                                setSelectedHistoryRun(run);
                                                setIsDetailsModalOpen(true);
                                            }}
                                            className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-white font-medium group-hover:text-eva-blue transition-colors">{run.id}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{run.date}</td>
                                            <td className="px-4 py-3 text-slate-900 dark:text-white">
                                                {Array.isArray(run.materials) ? run.materials.map(m => m.name).join(', ') : run.materials}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 font-semibold">{run.matQty}</td>
                                            <td className="px-4 py-3 text-slate-900 dark:text-white">{run.output}</td>
                                            <td className="px-4 py-3 text-right text-slate-900 dark:text-white font-bold">{run.outQty}</td>
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
                                                {run.waste && run.waste.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        {run.waste.map((w, i) => (
                                                            <span key={i} className="text-red-500 dark:text-red-400">{w.name}: {w.quantity}</span>
                                                        ))}
                                                    </div>
                                                ) : <span className="text-green-500">None</span>}
                                            </td>
                                        </tr>
                                    ))}
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

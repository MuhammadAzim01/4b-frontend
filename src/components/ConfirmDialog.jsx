import React from 'react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info' }) => {
    if (!isOpen) return null;

    const typeStyles = {
        info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        warning: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
        danger: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
        success: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    };

    const buttonStyles = {
        info: 'bg-eva-blue hover:bg-blue-700',
        warning: 'bg-amber-600 hover:bg-amber-700',
        danger: 'bg-red-600 hover:bg-red-700',
        success: 'bg-green-600 hover:bg-green-700'
    };

    const icons = {
        info: 'info',
        warning: 'warning',
        danger: 'error',
        success: 'check_circle'
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${typeStyles[type]} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-2xl">{icons[type]}</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${buttonStyles[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

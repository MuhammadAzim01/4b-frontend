import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const showModal = (title, message) => {
        setTitle(title);
        setMessage(message);
        setIsOpen(true);
    };

    const hideModal = () => {
        setIsOpen(false);
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={hideModal}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 mb-4">
                                    <span className="material-symbols-outlined text-primary !text-3xl">info</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{message}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-center rounded-b-xl">
                            <button onClick={hideModal} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white">Got it</button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

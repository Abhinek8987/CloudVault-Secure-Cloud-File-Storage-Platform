import React from 'react';
import { AlertTriangle, Trash2, Shield, AlertCircle, X, ShieldOff, Database } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger', isLoading = false }) => {
    if (!isOpen) return null;

    let Icon = AlertTriangle;
    let colorClass = 'text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-500';
    let btnClass = 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30';
    let btnText = 'Confirm Action';

    if (type === 'danger') {
        Icon = Trash2;
    } else if (type === 'warning') {
        Icon = AlertTriangle;
        colorClass = 'text-orange-600 bg-orange-100 dark:bg-orange-500/10 dark:text-orange-500';
        btnClass = 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/30';
    } else if (type === 'info') {
        Icon = Shield;
        colorClass = 'text-blue-600 bg-blue-100 dark:bg-blue-500/10 dark:text-blue-500';
        btnClass = 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30';
        btnText = 'Proceed';
    } else if (type === 'block') {
        Icon = ShieldOff;
        colorClass = 'text-orange-600 bg-orange-100 dark:bg-orange-500/10 dark:text-orange-500';
        btnClass = 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/30';
        btnText = 'Confirm Block';
    } else if (type === 'critical') {
        Icon = Database;
        colorClass = 'text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-500 dark:border-red-900/50';
        btnClass = 'bg-red-700 hover:bg-red-800 text-white shadow-red-600/40 font-bold';
        btnText = 'PERMANENTLY DESTROY DATA';
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={!isLoading ? onCancel : undefined}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl shrink-0 ${colorClass}`}>
                            <Icon size={24} />
                        </div>
                        <div className="pt-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button 
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${btnClass}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Executing...
                            </span>
                        ) : btnText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

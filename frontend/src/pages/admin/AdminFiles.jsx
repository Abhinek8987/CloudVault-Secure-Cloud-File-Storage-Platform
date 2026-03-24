import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Trash2, File as FileIcon, Loader2, AlertCircle, CheckCircle, Search, Calendar, Database, Filter, ChevronLeft, ChevronRight, Shield, ShieldAlert, RefreshCw } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

const AdminFiles = () => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: 'danger', action: null });
    
    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    // Unique Uploaders for Dropdown
    const uploaders = [...new Set(files.map(f => f.uploadedBy))];

    useEffect(() => {
        fetchFiles();
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchFiles = async () => {
        try {
            const response = await api.get('/admin/files');
            setFiles(response.data);
            setIsLoading(false);
        } catch (err) {
            showToast('Failed to load global files', 'error');
            setIsLoading(false);
        }
    };

    const handleVault = (file) => {
        setConfirmModal({
            isOpen: true,
            title: 'Vault Storage Record',
            message: `Are you sure you want to securely quarantine "${file.originalFilename}"?\n\nThe user will instantly lose access to the file and its payload will be encrypted into the system vault. It can be restored later.`,
            type: 'warning',
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setActionLoading(file.id);
                try {
                    await api.put(`/admin/files/${file.id}/vault`);
                    showToast('File successfully quarantined in secure vault.');
                    fetchFiles();
                } catch (err) {
                    showToast(err.response?.data || 'Failed to vault file', 'error');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleRestore = (file) => {
        setConfirmModal({
            isOpen: true,
            title: 'Restore Storage Record',
            message: `Are you sure you want to restore "${file.originalFilename}" to the active domain? The original user will regain access.`,
            type: 'info',
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setActionLoading(file.id);
                try {
                    await api.put(`/admin/files/${file.id}/restore`);
                    showToast('File payload restored to active grid.');
                    fetchFiles();
                } catch (err) {
                    showToast(err.response?.data || 'Failed to restore file', 'error');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleDelete = (file) => {
        setConfirmModal({
            isOpen: true,
            title: 'Wipe Storage Record',
            message: `Are you sure you want to permanently wipe "${file.originalFilename}"?\n\nPlease ensure you have taken a BACKUP if necessary. This action cannot be undone and will destroy the file from the remote grid.`,
            type: 'danger',
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setActionLoading(file.id);
                try {
                    await api.delete(`/admin/files/${file.id}`);
                    showToast('File completely removed from system.');
                    setFiles(files.filter(f => f.id !== file.id));
                } catch (err) {
                    showToast(err.response?.data || 'Failed to delete file', 'error');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const filteredFiles = files.filter(f => {
        const matchesSearch = f.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              f.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUser = userFilter === 'ALL' || f.uploadedBy === userFilter;
        return matchesSearch && matchesUser;
    });

    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    const paginatedFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 animate-fade-in relative h-full">
            {toast && (
                <div className={`fixed top-24 right-8 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in-up ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400'}`}>
                    {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <p className="font-medium text-sm">{toast.msg}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by file name or uploader..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                    />
                </div>
                
                <div className="relative w-full sm:w-64 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 px-2 flex items-center gap-2">
                    <Filter className="text-slate-400" size={16} />
                    <select 
                        value={userFilter} 
                        onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full py-2.5 pr-2 bg-transparent text-sm font-medium outline-none cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                        <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All File Owners</option>
                        {uploaders.map(uploader => (
                            <option key={uploader} value={uploader} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{uploader}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Asset Identity</th>
                                <th className="px-6 py-4 font-semibold">Ownership Link</th>
                                <th className="px-6 py-4 font-semibold">Footprint</th>
                                <th className="px-6 py-4 font-semibold">Timestamp</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
                                    </td>
                                </tr>
                            ) : paginatedFiles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                            <FileIcon size={32} className="text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-600 dark:text-slate-400 text-base">No Storage Blocks Found</p>
                                            <p className="text-sm mt-1 max-w-sm mx-auto">There are zero files matching your current global retention filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedFiles.map(f => (
                                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex flex-shrink-0 items-center justify-center">
                                                    <FileIcon className="text-blue-500" size={20} />
                                                </div>
                                                <div className={`max-w-[200px] sm:max-w-xs text-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap ${f.originalFilename.startsWith('[VAULTED]') ? 'text-orange-500 dark:text-orange-400 line-through opacity-80' : 'text-slate-900 dark:text-white'}`} title={f.originalFilename}>
                                                    {f.originalFilename}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm shadow-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer" onClick={() => { setUserFilter(f.uploadedBy); setCurrentPage(1); }}>
                                                {f.uploadedBy}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Database size={14} className="text-slate-400" />
                                                {formatBytes(f.size)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(f.uploadDate).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {f.originalFilename.startsWith('[VAULTED]') ? (
                                                    <button
                                                        onClick={() => handleRestore(f)}
                                                        disabled={actionLoading === f.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-green-50 text-green-600 hover:bg-green-100 focus:ring-2 focus:ring-green-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading === f.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleVault(f)}
                                                        disabled={actionLoading === f.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-orange-50 text-orange-600 hover:bg-orange-100 focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading === f.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                                                        Vault
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleDelete(f)}
                                                    disabled={actionLoading === f.id}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-red-50 text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading === f.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <><Trash2 size={14} /> Wipe</>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(currentPage * itemsPerPage, filteredFiles.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredFiles.length}</span> Records
                        </span>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex px-2 items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                                Page {currentPage} / {totalPages}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.action}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
};

export default AdminFiles;

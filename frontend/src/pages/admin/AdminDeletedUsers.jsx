import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { RefreshCw, Trash2, Eye, ShieldAlert, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

const AdminDeletedUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: 'danger', action: null });

    useEffect(() => {
        fetchDeletedUsers();
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchDeletedUsers = async () => {
        try {
            const response = await api.get('/admin/users/deleted');
            setUsers(response.data);
            setIsLoading(false);
        } catch (err) {
            showToast('Failed to load deleted archive', 'error');
            setIsLoading(false);
        }
    };

    const handleRestore = (user) => {
        setConfirmModal({
            isOpen: true,
            title: 'Restore Account',
            message: `Restore ${user.username} to ACTIVE status? They will regain login access immediately.`,
            type: 'info',
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setActionLoading(user.id);
                try {
                    await api.put(`/admin/users/${user.id}/restore`);
                    showToast('User restored successfully!');
                    setUsers(users.filter(u => u.id !== user.id));
                } catch (err) {
                    showToast(err.response?.data || 'Restore failed', 'error');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handlePermanentDelete = (user) => {
        setConfirmModal({
            isOpen: true,
            title: 'Permanent Eradication',
            message: `⚠️ CRITICAL WARNING ⚠️\n\nAre you sure you want to PERMANENTLY wipe ${user.username}?\nThis will irrevocably destroy all their files from the Cloud Storage disk arrays and cascade delete their database records. THIS CANNOT BE UNDONE.`,
            type: 'critical',
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setActionLoading(user.id);
                try {
                    await api.delete(`/admin/users/${user.id}/permanent`);
                    showToast('User and all associated data permanently annihilated.');
                    setUsers(users.filter(u => u.id !== user.id));
                } catch (err) {
                    showToast(err.response?.data || 'Hard delete failed', 'error');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-fade-in relative h-full">
            {toast && (
                <div className={`fixed top-24 right-8 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in-up ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400'}`}>
                    {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <p className="font-medium text-sm">{toast.msg}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                        <ShieldAlert className="text-red-500" />
                        Archived Accounts
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Soft-deleted users awaiting restoration or permanent wipe.</p>
                </div>

                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search archived records..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all dark:text-white"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User Identity</th>
                                <th className="px-6 py-4 font-semibold">System Role</th>
                                <th className="px-6 py-4 font-semibold">Deleted At</th>
                                <th className="px-6 py-4 font-semibold text-right">Emergency Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin text-red-500 mx-auto" size={32} />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                                        <ShieldAlert size={40} className="text-slate-300 dark:text-slate-700" />
                                        <p>No deleted users currently exist in the archival system.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white line-through opacity-70">{u.fullName || 'Unknown'}</div>
                                            <div className="text-xs text-red-500 dark:text-red-400 font-medium">{u.username}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                                            {u.deletedAt ? new Date(u.deletedAt).toLocaleString() : 'Legacy Wipe'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRestore(u)}
                                                    disabled={actionLoading === u.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-green-50 text-green-600 hover:bg-green-100 focus:ring-2 focus:ring-green-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading === u.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                    Restore
                                                </button>
                                                
                                                <button
                                                    onClick={() => handlePermanentDelete(u)}
                                                    disabled={actionLoading === u.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-red-50 text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    Perm Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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

export default AdminDeletedUsers;

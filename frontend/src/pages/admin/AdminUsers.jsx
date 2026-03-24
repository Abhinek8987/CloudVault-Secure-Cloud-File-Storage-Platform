import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Shield, ShieldOff, Loader2, AlertCircle, CheckCircle, Search, UserPlus, Trash2, X, ChevronLeft, ChevronRight, HardDrive, Calendar, Database, File as FileIcon } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    
    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    // Create User Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', username: '', password: '', role: 'USER' });
    const [isCreating, setIsCreating] = useState(false);

    // User Profile Modal
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // Confirmation Modal
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: 'danger', action: null });

    useEffect(() => {
        fetchUsers();
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
            setIsLoading(false);
        } catch (err) {
            showToast('Failed to load users', 'error');
            setIsLoading(false);
        }
    };

    const handleViewProfile = async (id) => {
        setSelectedUserId(id);
        setIsProfileLoading(true);
        setUserProfile(null);
        try {
            const response = await api.get(`/admin/users/${id}/profile`);
            setUserProfile(response.data);
        } catch (err) {
            showToast('Failed to load user profile details', 'error');
            setSelectedUserId(null);
        } finally {
            setIsProfileLoading(false);
        }
    };

    const toggleUserStatus = (e, user) => {
        e.stopPropagation(); // prevent opening profile
        const isBlocking = user.status === 'ACTIVE';
        
        setConfirmModal({
            isOpen: true,
            title: isBlocking ? 'Block User Access' : 'Restore User Access',
            message: `Are you sure you want to ${isBlocking ? 'BLOCK' : 'UNBLOCK'} ${user.username}?\n${isBlocking ? 'They will be immediately disconnected and prevented from authenticating.' : 'They will regain access to their storage locker.'}`,
            type: isBlocking ? 'block' : 'info',
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setActionLoading(user.id);
                try {
                    const endpoint = isBlocking ? `/admin/users/${user.id}/block` : `/admin/users/${user.id}/unblock`;
                    await api.put(endpoint);
                    showToast(`User successfully ${isBlocking ? 'blocked' : 'unblocked'}`);
                    setUsers(users.map(u => u.id === user.id ? { ...u, status: isBlocking ? 'BLOCKED' : 'ACTIVE' } : u));
                } catch (err) {
                    showToast(err.response?.data || 'Action failed', 'error');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };
    
    const handleSoftDelete = (e, user) => {
        e.stopPropagation(); // prevent opening profile
        
        setConfirmModal({
            isOpen: true,
            title: 'Move to Archive',
            message: `Are you sure you want to delete ${user.username}?\nUser will be moved to Deleted Users. You can restore them later.`,
            type: 'warning',
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setActionLoading(user.id);
                try {
                    await api.put(`/admin/users/${user.id}/soft-delete`);
                    showToast('User moved to Deleted Archive.');
                    setUsers(users.filter(u => u.id !== user.id));
                } catch (err) {
                    showToast(err.response?.data || 'Delete failed', 'error');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const response = await api.post('/admin/users', formData);
            setUsers([response.data, ...users]);
            showToast('User created successfully!');
            setIsModalOpen(false);
            setFormData({ fullName: '', username: '', password: '', role: 'USER' });
        } catch (err) {
            showToast(err.response?.data || 'Failed to create user', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 animate-fade-in relative h-full">
            {toast && (
                <div className={`fixed top-24 right-8 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in-up ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400'}`}>
                    {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <p className="font-medium text-sm">{toast.msg}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                        />
                    </div>
                    
                    <select 
                        value={roleFilter} 
                        onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                        className="py-2.5 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                    >
                        <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Roles</option>
                        <option value="USER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Standard User</option>
                        <option value="ADMIN" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Administrator</option>
                    </select>

                    <select 
                        value={statusFilter} 
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="py-2.5 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                    >
                        <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Status</option>
                        <option value="ACTIVE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Active</option>
                        <option value="BLOCKED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Blocked</option>
                    </select>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap w-full sm:w-auto justify-center"
                >
                    <UserPlus size={18} />
                    Create User
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Identity</th>
                                <th className="px-6 py-4 font-semibold">Clearance Level</th>
                                <th className="px-6 py-4 font-semibold">Account Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Administrative Logs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
                                    </td>
                                </tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No authorized users match the specified global filters.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map(u => (
                                    <tr 
                                        key={u.id} 
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                        onClick={() => handleViewProfile(u.id)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white">{u.fullName || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{u.username}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role !== 'ADMIN' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => toggleUserStatus(e, u)}
                                                        disabled={actionLoading === u.id}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                            u.status === 'ACTIVE' 
                                                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 focus:ring-orange-500 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20' 
                                                                : 'bg-green-50 text-green-600 hover:bg-green-100 focus:ring-green-500 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20'
                                                        }`}
                                                    >
                                                        {actionLoading === u.id ? <Loader2 size={14} className="animate-spin" /> : u.status === 'ACTIVE' ? <ShieldOff size={14} /> : <Shield size={14} />}
                                                        {u.status === 'ACTIVE' ? 'Block Access' : 'Unblock Access'}
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleSoftDelete(e, u)}
                                                        disabled={actionLoading === u.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                        Soft Delete
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-slate-500 italic">Protected System Entity</span>
                                            )}
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
                            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredUsers.length}</span> Records
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

            {/* Create User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-blue-500/10 overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                <UserPlus size={20} className="text-blue-500" />
                                Provision New Clearance
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                                <input 
                                    type="text" required
                                    value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    placeholder="Jane Doe"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Identity</label>
                                <input 
                                    type="email" required
                                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                                    placeholder="jane@company.com"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Clearance Package</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'USER'})}
                                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${formData.role === 'USER' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900'}`}
                                    >
                                        Standard User
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'ADMIN'})}
                                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${formData.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900'}`}
                                    >
                                        Administrator
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Initial Cipher</label>
                                <input 
                                    type="password" required minLength="6"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full flex justify-center items-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold font-sm shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? <Loader2 className="animate-spin" size={18} /> : 'Generate Secure Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Detail Overlay Modal */}
            {selectedUserId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedUserId(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        
                        {/* Profile Header */}
                        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                    Profile Intelligence Report
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deep forensic metadata scope</p>
                            </div>
                            <button 
                                onClick={() => setSelectedUserId(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Profile Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isProfileLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="animate-spin text-blue-500" size={32} />
                                    <p className="text-sm text-slate-500 font-medium">Aggregating relational telemetry...</p>
                                </div>
                            ) : userProfile && (
                                <div className="space-y-8">
                                    {/* User Core Identity */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Identity</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{userProfile.userDetails.username}</span>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage Footprint</span>
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatBytes(userProfile.totalStorageUsed)}</span>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Authentication</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                {userProfile.userDetails.lastLoginAt ? new Date(userProfile.userDetails.lastLoginAt).toLocaleString() : 'No active session recorded'}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credential Rotation</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                {userProfile.userDetails.passwordChangedAt ? new Date(userProfile.userDetails.passwordChangedAt).toLocaleString() : 'Factory default cipher'}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Inception</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                {userProfile.userDetails.createdAt ? new Date(userProfile.userDetails.createdAt).toLocaleString() : 'Legacy Account'}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Profile Mutation</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                {userProfile.userDetails.updatedAt ? new Date(userProfile.userDetails.updatedAt).toLocaleString() : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Associated Files Matrix */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                            <HardDrive size={16} className="text-purple-500" />
                                            Relational Storage Assets
                                        </h4>
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                            {userProfile.associatedFiles.length === 0 ? (
                                                <div className="p-8 text-center text-slate-500 text-sm">
                                                    No files have been uploaded by this identity cluster.
                                                </div>
                                            ) : (
                                                <table className="w-full text-left text-sm whitespace-nowrap">
                                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                                        <tr>
                                                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Origin Filename</th>
                                                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">MIME Hash</th>
                                                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">File Size</th>
                                                            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Upload Sequence</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {userProfile.associatedFiles.map(file => (
                                                            <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2 max-w-[200px] truncate font-semibold text-slate-800 dark:text-white" title={file.originalFilename}>
                                                                        <FileIcon size={14} className="text-blue-500" />
                                                                        {file.originalFilename}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-500 text-xs font-mono">{file.contentType}</td>
                                                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                                                    {formatBytes(file.size)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-500 text-xs font-mono">
                                                                    {new Date(file.uploadDate).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end">
                            <button 
                                onClick={() => setSelectedUserId(null)}
                                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
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

export default AdminUsers;

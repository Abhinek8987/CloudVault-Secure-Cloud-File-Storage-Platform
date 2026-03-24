import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
    LogOut, UploadCloud, File as FileIcon, Trash2, DownloadCloud,
    FileText, Image as ImageIcon, FileArchive, Folder, Menu, X, Loader2,
    CheckCircle, AlertCircle, Search, LayoutDashboard, HardDrive, Bell, ShieldCheck
} from 'lucide-react';
import { ThemeToggle } from './Login';
import ConfirmModal from '../components/ConfirmModal';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-fade-in-up z-50 transition-all ${type === 'success'
            ? 'bg-white dark:bg-slate-800 border-green-100 dark:border-green-500/20 text-slate-800 dark:text-slate-200'
            : 'bg-white dark:bg-slate-800 border-red-100 dark:border-red-500/20 text-slate-800 dark:text-slate-200'
            }`}>
            {type === 'success' ? (
                <div className="bg-green-100 dark:bg-green-500/20 p-1.5 rounded-full"><CheckCircle size={20} className="text-green-600 dark:text-green-400" /></div>
            ) : (
                <div className="bg-red-100 dark:bg-red-500/20 p-1.5 rounded-full"><AlertCircle size={20} className="text-red-600 dark:text-red-400" /></div>
            )}
            <span className="font-semibold text-sm">{message}</span>
        </div>
    );
};

const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 max-w-[200px]"></div></div></td>
        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
        <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20 inline-block"></div></td>
    </tr>
);

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('files');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState(null);
    const [notifications, setNotifications] = useState([{ id: 1, text: "Welcome back to CloudSpace!", time: "Just now", unread: true }]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: 'danger', action: null });

    const navigate = useNavigate();

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchFiles = async () => {
        setIsFetching(true);
        try {
            const response = await api.get('/files');
            // Simulate slight network delay for premium skeleton loading effect
            setTimeout(() => {
                setFiles(response.data);
                setIsFetching(false);
            }, 600);
        } catch (error) {
            console.error('Error fetching files', error);
            showToast('Failed to connect to storage', 'error');
            setIsFetching(false);
        }
    };

    useEffect(() => { fetchFiles(); }, []);

    const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0]);
    }, []);

    const handleFileSelect = async (e) => {
        if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
    };

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        setUploadProgress(0);
        try {
            await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            showToast('File securely uploaded!');
            setNotifications(prev => [{ id: Date.now(), text: `Uploaded ${file.name}`, time: "Just now", unread: true }, ...prev]);
            fetchFiles();
            setActiveTab('files');
        } catch (error) {
            console.error('Upload failed', error);
            showToast('Upload failed: ' + (error.response?.data?.message || 'Server error'), 'error');
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Data Block',
            message: 'Move this file to trash? This action cannot be undone.',
            type: 'danger',
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    await api.delete(`/files/${id}`);
                    showToast('File permanently deleted.');
                    setFiles(files.filter(f => f.id !== id));
                } catch (error) {
                    console.error('Delete failed', error);
                    showToast('Delete failed', 'error');
                }
            }
        });
    };

    const handleDownload = async (id, filename) => {
        try {
            const response = await api.get(`/files/download/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Download failed', error);
            showToast('Download failed', 'error');
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (contentType) => {
        if (!contentType) return <FileIcon className="text-slate-400" size={24} />;
        if (contentType.startsWith('image/')) return <ImageIcon className="text-indigo-500" size={24} />;
        if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('tar')) return <FileArchive className="text-amber-500" size={24} />;
        if (contentType.includes('pdf') || contentType.includes('text')) return <FileText className="text-rose-500" size={24} />;
        return <FileIcon className="text-slate-400" size={24} />;
    };

    const filteredFiles = files.filter(f => f.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()));

    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    const formattedTotalSize = formatSize(totalBytes);
    const uniqueTypes = new Set(files.map(f => f.contentType ? f.contentType.split('/')[0] : 'other')).size;
    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 xl:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-950 w-72 border-r border-slate-200 dark:border-slate-800 z-30 transform transition-transform duration-300 ease-in-out xl:translate-x-0 xl:static flex flex-col shadow-2xl xl:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-20 px-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/30">
                            <UploadCloud size={24} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">CloudSpace</span>
                    </div>
                    <button className="xl:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-8 px-5 space-y-1.5 flex flex-col">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-3">Main Menu</div>

                    <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                        <LayoutDashboard size={20} /> Overview
                    </button>

                    <button onClick={() => { setActiveTab('files'); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'files' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                        <HardDrive size={20} /> My Files
                    </button>

                    <button onClick={() => { setActiveTab('upload'); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'upload' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                        <UploadCloud size={20} /> Upload Data
                    </button>

                    <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <button onClick={() => navigate('/change-password')} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group">
                            <ShieldCheck size={20} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" /> Security Settings
                        </button>
                        <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all duration-200 group">
                            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950">

                {/* Top Navbar */}
                <header className="glass sticky top-0 h-20 flex items-center justify-between px-6 lg:px-10 z-10 border-b-0 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center flex-1 gap-6">
                        <button className="xl:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>

                        {/* Search Bar */}
                        <div className="relative w-full max-w-lg hidden sm:block">
                            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search folders, images, documents..."
                                className="w-full bg-slate-100 dark:bg-slate-950 border-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium rounded-2xl pl-12 pr-4 py-3 transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="hidden sm:block">
                            <ThemeToggle className="relative" />
                        </div>
                        <div className="relative">
                            <button onClick={() => { setShowNotifications(!showNotifications); setNotifications(notifications.map(n => ({ ...n, unread: false }))) }} className="relative p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition btn-glow">
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 glass-card p-4 z-50 animate-fade-in-up">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-3">Notifications</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {notifications.map(n => (
                                            <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.text}</p>
                                                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{user?.fullName || user?.username?.split('@')[0]}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">Standard Tier</p>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-indigo-500/30 transition-shadow">
                                {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Canvas Area */}
                <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto w-full max-w-[1600px] mx-auto relative">

                    {/* Floating Action Button for smaller screens or just always active tab triggers */}
                    {activeTab !== 'upload' && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 animate-fade-in">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {activeTab === 'dashboard' ? 'Welcome Back' : 'My Storage'}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage and organize your essential assets.</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transform transition-all duration-300 hover:-translate-y-0.5 btn-glow"
                            >
                                <UploadCloud size={20} />
                                Upload File
                            </button>
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <div className="animate-fade-in-up">
                            {/* Dashboard Tiles */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {[
                                    { title: "Total Space Used", value: formattedTotalSize, sub: "of 5 GB Free Tier", color: "bg-blue-500" },
                                    { title: "Total Files", value: files.length.toString(), sub: "Securely stored items", color: "bg-indigo-500" },
                                    { title: "Data Categories", value: `${uniqueTypes} Types`, sub: "Across your storage", color: "bg-purple-500" }
                                ].map((stat, idx) => (
                                    <div key={idx} className="glass-card p-6 border-l-4 border-l-transparent hover:border-l-indigo-500 transition-all duration-300 group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.title}</p>
                                                <h4 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{stat.value}</h4>
                                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">{stat.sub}</p>
                                            </div>
                                            <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
                                                <HardDrive size={24} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
                            <div className="glass-card overflow-hidden">
                                {isFetching ? (
                                    <div className="p-10 text-center text-slate-500">Loading activity...</div>
                                ) : (
                                    <div className="p-6">
                                        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400"><UploadCloud size={18} /></div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{notifications[0]?.text || 'No recent activity'}</p>
                                                    <p className="text-xs text-slate-500">{notifications[0]?.time || ''}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="animate-fade-in-up max-w-3xl mx-auto mt-6">
                            <div className="glass-card p-8 sm:p-12 text-center">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Upload Your Data</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Files are encrypted and stored safely.</p>
                                </div>

                                <div
                                    className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ease-out bg-slate-50/50 dark:bg-slate-900/50 ${isDragging ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02] shadow-xl shadow-indigo-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/80'
                                        } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                >
                                    {uploading ? (
                                        <div className="flex flex-col items-center justify-center animate-fade-in">
                                            <Loader2 size={56} className="text-indigo-600 dark:text-indigo-400 animate-spin mb-6" />
                                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Synchronizing...</p>

                                            {/* Progress Bar */}
                                            <div className="w-full max-w-xs mt-4">
                                                <div className="flex justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                                                    <span>Uploading</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                                    <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                                <UploadCloud size={40} />
                                            </div>
                                            <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Drag & Drop files here</p>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                                                Support for documents, images, and archives up to 50MB.
                                            </p>

                                            <label className="cursor-pointer relative overflow-hidden group">
                                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 to-blue-600 group-hover:scale-105 transition-transform duration-300"></div>
                                                <div className="relative flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/30">
                                                    <Folder size={18} /> Browse Local Files
                                                    <input type="file" className="hidden" onChange={handleFileSelect} disabled={uploading} />
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setActiveTab('files')} className="mt-8 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    Cancel and return to files
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className="animate-fade-in-up">
                            <div className="glass-card overflow-hidden">
                                {(isFetching ? [] : filteredFiles).length === 0 && !isFetching ? (
                                    <div className="p-20 flex flex-col items-center justify-center text-center">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-3xl mb-6 border border-slate-200 dark:border-slate-700 mx-auto w-max shadow-sm">
                                            <Folder size={56} className="text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">No files found</h4>
                                        <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md font-medium text-base">
                                            {searchQuery ? 'No files match your search criteria. Try a different term.' : 'Your workspace is empty. Securely upload files to have them accessible anywhere.'}
                                        </p>
                                        {!searchQuery && (
                                            <button
                                                onClick={() => setActiveTab('upload')}
                                                className="mt-8 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm btn-glow"
                                            >
                                                Upload your first file
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                            <thead className="bg-slate-50/80 dark:bg-slate-950 backdrop-blur-md">
                                                <tr>
                                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest content-center">File Metadata</th>
                                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">File Size</th>
                                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">Date Created</th>
                                                    <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Options</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white/50 dark:bg-transparent divide-y divide-slate-100 dark:divide-slate-800">
                                                {isFetching ? (
                                                    <>
                                                        <SkeletonRow />
                                                        <SkeletonRow />
                                                        <SkeletonRow />
                                                        <SkeletonRow />
                                                    </>
                                                ) : filteredFiles.map((file) => (
                                                    <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 dark:even:bg-[#0b1120] transition-all duration-200 group">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-md group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-all duration-300">
                                                                    {getFileIcon(file.contentType)}
                                                                </div>
                                                                <div className="max-w-[180px] sm:max-w-xs md:max-w-sm truncate">
                                                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate" title={file.originalFilename}>
                                                                        {file.originalFilename}
                                                                    </div>
                                                                    <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5 truncate uppercase">
                                                                        {file.contentType?.split('/')[1] || 'UNKNOWN'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                                {formatSize(file.size)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                                {new Date(file.uploadDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                                                <button onClick={() => handleDownload(file.id, file.originalFilename)} className="text-slate-400 hover:text-indigo-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-2.5 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 btn-glow" title="Download">
                                                                    <DownloadCloud size={18} />
                                                                </button>
                                                                <button onClick={() => handleDelete(file.id)} className="text-slate-400 hover:text-red-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/10 p-2.5 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 btn-glow" title="Delete Permanent">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
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

export default Dashboard;

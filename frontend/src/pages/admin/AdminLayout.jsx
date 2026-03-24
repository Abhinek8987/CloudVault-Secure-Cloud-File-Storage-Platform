import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Shield, LayoutDashboard, Users, FileText, LogOut, Moon, Sun, ShieldAlert } from 'lucide-react';
import { ThemeToggle } from '../Login';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', name: 'User Directory', icon: Users },
        { path: '/admin/deleted-users', name: 'Archived Users', icon: ShieldAlert },
        { path: '/admin/files', name: 'Global Storage', icon: FileText }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col shadow-2xl z-20 transition-colors">
                <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
                    <Shield className="text-blue-500 mr-3" size={24} />
                    <h1 className="text-lg font-bold tracking-wide">Admin Portal</h1>
                </div>
                
                <nav className="flex-1 py-6 px-4 space-y-2">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        const Icon = link.icon;
                        return (
                            <Link 
                                key={link.path} 
                                to={link.path}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                            >
                                <Icon size={20} className="mr-3" />
                                <span className="font-medium text-sm">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors duration-300"
                    >
                        <LogOut size={20} className="mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Decorative BG */}
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>

                <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10 sticky top-0 transition-colors">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
                        {navLinks.find(l => l.path === location.pathname)?.name || 'Admin'}
                    </h2>
                    <div className="flex items-center gap-6">
                        <ThemeToggle className="relative static scale-90" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{user?.fullName || user?.username?.split('@')[0]}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wide flex justify-end items-center gap-1">
                                    <Shield size={10} /> Administrator
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex justify-center items-center text-white font-bold shadow-lg shadow-blue-500/20">
                                {(user?.fullName || user?.username || 'A').charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 dark:bg-transparent p-6 sm:p-8 z-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

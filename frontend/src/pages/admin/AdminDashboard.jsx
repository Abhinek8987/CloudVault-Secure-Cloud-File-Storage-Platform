import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Users, UserX, UserCheck, HardDrive, Database, Loader2, AlertCircle, ShieldAlert, FileText, Clock, UserPlus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            setStats(response.data);
            setIsLoading(false);
        } catch (err) {
            setError(err.response?.data || 'Failed to load dashboard statistics');
            setIsLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={50} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3">
                <AlertCircle size={24} />
                <p className="font-medium">{error}</p>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Registered', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
        { title: 'Active Accounts', value: stats.activeUsers, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-100 dark:border-green-500/20' },
        { title: 'Blocked Restrictions', value: stats.blockedUsers, icon: UserX, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-500/20' },
        { title: 'Deleted Archives', value: stats.deletedUsers, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-100 dark:border-red-500/20' },
        { title: 'Stored Files', value: stats.totalFiles, icon: HardDrive, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20' },
        { title: 'Network Load', value: formatBytes(stats.totalStorageUsed), icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' }
    ];

    // Chart Data Parsing
    const pieData = [
        { name: 'Active', value: stats.activeUsers, color: '#10b981' },
        { name: 'Blocked', value: stats.blockedUsers, color: '#f97316' },
        { name: 'Deleted', value: stats.deletedUsers, color: '#ef4444' }
    ].filter(d => d.value > 0);

    const barData = stats.filesPerUser?.map(tuple => ({ name: tuple[0], files: tuple[1] })) || [];

    const lineDataMap = {};
    [...(stats.recentFiles || [])].reverse().forEach(f => {
        const date = new Date(f.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        lineDataMap[date] = (lineDataMap[date] || 0) + 1;
    });
    const areaData = Object.keys(lineDataMap).map(date => ({ date, uploads: lineDataMap[date] }));

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Top Stat Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group hover:-translate-y-1">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-transparent to-current opacity-[0.03] dark:opacity-[0.05] rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full gap-3">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{card.title}</p>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{card.value}</h3>
                                </div>
                                <div className={`p-2.5 rounded-xl w-fit ${card.bg} ${card.border} border`}>
                                    <Icon className={card.color} size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Distribution Pie Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <h3 className="w-full text-base font-bold text-slate-800 dark:text-white mb-2 text-left">Account Distributions</h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No user data available</div>
                    )}
                    <div className="flex gap-4 mt-2">
                        {pieData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                                {d.name} ({((d.value / stats.totalUsers) * 100).toFixed(0)}%)
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upload Acitvity Area Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2 min-h-[300px]">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6 text-left">Recent Upload Telemetry</h3>
                    {areaData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={230}>
                            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#60a5fa' }}
                                />
                                <Area type="monotone" dataKey="uploads" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[230px] flex items-center justify-center text-slate-400 text-sm">No recent upload activity to chart</div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Rankings & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* User Rankings Bar Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Top Resource Utilization by Account</h3>
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} width={80} />
                                <RechartsTooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                                <Bar dataKey="files" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">No files uploaded yet</div>
                    )}
                </div>

                {/* Audit Logs / Recent Activity */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-0 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Clock className="text-blue-500" size={18} />
                            Global Activity Stream
                        </h3>
                    </div>
                    <div className="p-0 overflow-y-auto max-h-[300px]">
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {/* Mix of new users and uploads sorted manually or just shown sequentially */}
                            {stats.recentUsers && stats.recentUsers.map(u => (
                                <li key={`user-${u.id}`} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${u.status === 'DELETED' ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-green-50 text-green-500 dark:bg-green-500/10'}`}>
                                        {u.status === 'DELETED' ? <Trash2 size={16} /> : <UserPlus size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                            Account {u.status === 'DELETED' ? 'Archived' : 'Provisioned'}: {u.username}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.role} clearance level granted.</p>
                                    </div>
                                </li>
                            ))}
                            {stats.recentFiles && stats.recentFiles.slice(0, 5).map(f => (
                                <li key={`file-${f.id}`} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
                                        <FileText size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                            File Upload: {f.originalFilename}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Uploaded by <span className="font-medium text-slate-700 dark:text-slate-300">{f.uploadedBy}</span> • {new Date(f.uploadDate).toLocaleDateString()}</p>
                                    </div>
                                </li>
                            ))}
                            {(!stats.recentUsers || stats.recentUsers.length === 0) && (!stats.recentFiles || stats.recentFiles.length === 0) && (
                                <li className="p-8 text-center text-sm text-slate-400">System event logs are empty.</li>
                            )}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from './Login';
import api from '../api/axiosConfig';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/auth/change-password', {
                username: user?.username,
                currentPassword,
                newPassword
            });

            setSuccess(response.data.message || 'Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

            // Log out user for security after 2 seconds
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2500);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen auth-bg flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-300/30 dark:bg-indigo-500/5 blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-400/20 dark:bg-blue-500/5 blur-[100px]"></div>

            <ThemeToggle />

            <div className="w-full max-w-md animate-fade-in-up z-10">
                <div className="glass rounded-[24px] p-8 sm:p-10 relative">
                    <Link to="/dashboard" className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>

                    <div className="text-center mb-10 mt-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30 mb-6 transform transition-transform hover:scale-105 duration-300">
                            <Shield size={32} />
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight mb-2">
                            Security Settings
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Update the password for your account safely.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-start gap-3 animate-fade-in text-red-600 dark:text-red-400">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 flex items-start gap-3 animate-fade-in text-green-600 dark:text-green-400">
                            <CheckCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{success} Logging out...</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Current Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block w-full pl-11 pr-11 p-3.5 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm outline-none"
                                    placeholder="Enter your current password"
                                    required
                                    disabled={isLoading || success}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5 pb-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block w-full pl-11 pr-11 p-3.5 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm outline-none"
                                    placeholder="Enter your new password"
                                    required
                                    disabled={isLoading || success}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5 pb-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showConfirmNewPassword ? 'text' : 'password'}
                                    value={confirmNewPassword}
                                    onChange={e => setConfirmNewPassword(e.target.value)}
                                    className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block w-full pl-11 pr-11 p-3.5 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm outline-none"
                                    placeholder="Confirm your new password"
                                    required
                                    disabled={isLoading || success}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
                                >
                                    {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || success}
                                className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-xl text-sm px-5 py-3.5 text-center flex justify-center items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed dark:focus:ring-indigo-800 btn-glow"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Update Password</span>
                                        <Shield size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;

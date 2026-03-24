import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from './Login';
import api from '../api/axiosConfig';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/forgot-password/send-otp', { username: email });
            setSuccess(response.data.message || 'OTP sent to your email.');
            setStep(2);
            setTimeout(() => setSuccess(''), 3000); // Clear the success message so it doesn't block UI permanently
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Check email.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/forgot-password/reset', { username: email, otp, newPassword });
            setSuccess(response.data.message || 'Password successfully reset.');
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP or failed to reset.');
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
                    <Link to="/login" className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>

                    <div className="text-center mb-10 mt-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30 mb-6 transform transition-transform hover:scale-105 duration-300">
                            {step === 1 ? <Mail size={32} /> : <Shield size={32} />}
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight mb-2">
                            {step === 1 ? 'Reset Password' : 'Secure Reset'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            {step === 1 ? 'Enter your email to receive an OTP code.' : 'Enter the OTP sent to your email and a new password.'}
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
                            <p className="text-sm font-medium whitespace-pre-wrap">{success}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6 animate-fade-in">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block w-full pl-11 p-3.5 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm outline-none"
                                        placeholder="your.email@example.com"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-xl text-sm px-5 py-3.5 text-center flex justify-center items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed dark:focus:ring-indigo-800 btn-glow"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Sending OTP...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Verification Email</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in">
                            <div className="space-y-1.5 pt-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Verification Code</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block w-full p-3.5 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm outline-none tracking-[0.2em] font-mono text-center"
                                        placeholder="••••••"
                                        maxLength={6}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block w-full pl-11 pr-11 p-3.5 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm outline-none"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full text-white bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:ring-4 focus:ring-slate-300 dark:focus:ring-indigo-800 font-medium rounded-xl text-sm px-5 py-3.5 text-center flex justify-center items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-slate-800/20 dark:shadow-indigo-600/30 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed btn-glow"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Update Password</span>
                                            <CheckCircle size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

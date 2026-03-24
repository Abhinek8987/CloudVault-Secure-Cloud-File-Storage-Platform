import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Cloud, Lock, User, ArrowRight, Loader2, Moon, Sun, AlertCircle, Eye, EyeOff, Shield, Mail } from 'lucide-react';

export const ThemeToggle = ({ className }) => {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    }, []);
    const toggle = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDark(true);
        }
    };
    return (
        <button onClick={toggle} title="Toggle Theme" className={`p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/40 hover:bg-slate-300 dark:hover:bg-slate-700 backdrop-blur-md transition-all duration-300 shadow-sm border border-slate-300/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 ${className ?? 'absolute top-6 right-6 z-50'}`}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

const Login = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, verifyLoginOtp } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLoginStart = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            const res = await login(email, password);
            if (res.requiresOtp) {
                setSuccess(res.message);
                setStep(2);
            } else {
                if (res.role === 'ADMIN') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await verifyLoginOtp(email, otp);
            if (res.role === 'ADMIN') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/dashboard';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Invalid OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen auth-bg flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-300/30 dark:bg-indigo-500/5 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-400/20 dark:bg-blue-500/5 blur-[100px] pointer-events-none"></div>

            <ThemeToggle />

            <div className="w-full max-w-md animate-fade-in-up z-10">
                <div className="glass rounded-[24px] p-8 sm:p-10 relative">
                    <div className="text-center mb-10 mt-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30 mb-6 transform transition-transform hover:scale-105 duration-300">
                            {step === 1 ? <Cloud size={32} /> : <Shield size={32} />}
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight mb-2">
                            {step === 1 ? 'Welcome Back' : 'Security Verification'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            {step === 1 ? 'Enter your credentials to access your workspace.' : 'Enter the OTP sent to your email.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-start gap-3 animate-fade-in text-red-600 dark:text-red-400">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success && step === 2 && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 flex items-start gap-3 animate-fade-in text-green-600 dark:text-green-400">
                            <Mail size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleLoginStart} className="space-y-5 animate-fade-in">
                            <div className="space-y-1.5 pt-2">
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
                                        placeholder="Enter your email address"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 pb-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
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

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-xl text-sm px-5 py-3.5 text-center flex justify-center items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed dark:focus:ring-indigo-800 btn-glow"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In to Dashboard</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                                <div className="text-right mt-3">
                                    <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>

                            <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-6">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    New to CloudStorage? <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">Create an account</Link>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
                            <div className="space-y-1.5 pt-2 mb-6">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Verification Code</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block w-full p-3.5 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm outline-none font-mono tracking-[0.2em] text-center"
                                        placeholder="••••••"
                                        maxLength={6}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

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
                                        <span>Verify & Access Dashboard</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;

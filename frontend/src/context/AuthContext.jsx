import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const fullName = localStorage.getItem('fullName');
        const role = localStorage.getItem('role');
        const status = localStorage.getItem('status');
        if (token && username) {
            setUser({ username, fullName, role, status });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('fullName', response.data.fullName || '');
            localStorage.setItem('role', response.data.role || 'USER');
            localStorage.setItem('status', response.data.status || 'ACTIVE');
            setUser({ 
                username: response.data.username, 
                fullName: response.data.fullName,
                role: response.data.role || 'USER',
                status: response.data.status || 'ACTIVE'
            });
        }
        return response.data; // { requiresOtp: true } or AuthResponse
    };

    const verifyLoginOtp = async (username, otp) => {
        const response = await api.post('/auth/verify-login', { username, otp });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('fullName', response.data.fullName || '');
        localStorage.setItem('role', response.data.role || 'USER');
        localStorage.setItem('status', response.data.status || 'ACTIVE');
        setUser({ 
            username: response.data.username, 
            fullName: response.data.fullName,
            role: response.data.role || 'USER',
            status: response.data.status || 'ACTIVE'
        });
        return response.data;
    };

    const register = async (fullName, username, password) => {
        await api.post('/auth/register', { fullName, username, password });
        // We do not auto-login to force 2FA verification.
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('role');
        localStorage.removeItem('status');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, verifyLoginOtp, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

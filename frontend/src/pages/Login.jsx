import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);

            if (res.data.role === 'doctor') {
                navigate('/doctor');
            } else if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/patient');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 healthcare-gradient px-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 ring-1 ring-slate-200">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6 shadow-xl shadow-blue-100">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Welcome</h1>
                    <p className="text-slate-500 mt-2 font-semibold">Smart Healthcare Scheduler</p>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-8 text-sm border border-rose-100 flex items-center font-bold">
                        <svg width="20" height="20" className="mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-500 text-[11px] font-black uppercase tracking-widest ml-1 mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 focus:bg-white transition-all outline-none text-slate-800 font-bold text-lg"
                            placeholder="you@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-500 text-[11px] font-black uppercase tracking-widest ml-1 mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 focus:bg-white transition-all outline-none text-slate-800 font-bold text-lg"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white px-6 py-5 rounded-2xl hover:bg-blue-700 transition-all font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-[0.98] mt-4"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-10 text-center font-bold">
                    <p className="text-sm text-slate-400">
                        Don't have an account?{' '}
                        <a href="/register" className="text-blue-600 hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4">
                            Register Now
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        phone: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const res = await api.post('/api/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);

            if (res.data.role === 'doctor') {
                navigate('/doctor');
            } else {
                navigate('/patient');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 healthcare-gradient px-4 py-12">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 ring-1 ring-slate-200">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl mb-6 shadow-xl shadow-indigo-100 text-white">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Join Us</h1>
                    <p className="text-slate-500 mt-2 font-semibold">Create your secure medical account</p>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-8 text-sm border border-rose-100 flex items-center font-bold">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="mr-3 shrink-0">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                            <input
                                type="text"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-slate-800"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block">Email</label>
                            <input
                                type="email"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-slate-800"
                                placeholder="name@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block">Phone Number *</label>
                        <input
                            type="tel"
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-slate-800"
                            placeholder="+1234567890"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block">Password</label>
                            <input
                                type="password"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-slate-800"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block">Confirm</label>
                            <input
                                type="password"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-slate-800"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block text-center">I am registering as a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'patient' })}
                                className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${formData.role === 'patient'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                Patient
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${formData.role === 'doctor'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                Doctor
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white px-6 py-5 rounded-2xl hover:bg-indigo-700 transition-all font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-[0.98] mt-4"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-8 text-center font-bold">
                    <p className="text-xs text-slate-400">
                        Already have an account?{' '}
                        <a href="/login" className="text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-2 underline-offset-4">
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

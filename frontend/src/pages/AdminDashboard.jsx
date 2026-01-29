import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const usersRes = await api.get('/api/admin/users');
            const apptsRes = await api.get('/api/admin/appointments');
            setUsers(usersRes.data);
            setAppointments(apptsRes.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved':
            case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
            case 'cancelled':
            case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10';
            default: return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 healthcare-gradient">
            <div className="max-w-7xl mx-auto">
                <header className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ring-1 ring-slate-100">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Controls</h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Administrative Oversight Panel</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-slate-50 text-slate-500 px-8 py-4 rounded-2xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        Sign Out
                    </button>
                </header>

                <div className="mb-10 flex flex-wrap gap-4">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border-2 ${activeTab === 'users' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                        Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border-2 ${activeTab === 'appointments' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                        Appointments ({appointments.length})
                    </button>
                </div>

                <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-100">
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">User Identification</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Credential</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Permit</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Registration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user) => (
                                        <tr key={user._id} className="group hover:bg-slate-50/30 transition-colors">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black border border-slate-200">
                                                        {user.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="font-black text-slate-800 text-base">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-slate-500 font-bold">{user.email}</td>
                                            <td className="px-10 py-8 text-center">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border ring-1 ring-inset ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                        user.role === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    }`}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right text-slate-400 font-black text-[11px]">
                                                {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Stakeholder</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Subject</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Schedule</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {appointments.map((appt) => (
                                        <tr key={appt._id} className="group hover:bg-slate-50/30 transition-colors">
                                            <td className="px-10 py-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Doctor</p>
                                                    <p className="font-black text-slate-800">Dr. {appt.doctorId?.name || 'Unassigned'}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Patient</p>
                                                    <p className="font-bold text-slate-600">{appt.patientId?.name || 'Guest User'}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="inline-block bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                                                    <p className="font-black text-slate-700 text-xs tracking-tight">
                                                        {new Date(appt.date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[10px] font-black text-blue-500 uppercase mt-0.5">{appt.timeSlot}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border ring-1 ring-inset ${getStatusStyles(appt.status)}`}>
                                                    {appt.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

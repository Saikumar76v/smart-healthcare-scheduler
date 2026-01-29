import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/api/appointments/doctor');
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/api/appointments/${id}/status`, { status });
            fetchAppointments();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
            case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10';
            case 'cancelled': return 'bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/10';
            case 'completed': return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10';
            default: return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
        }
    };

    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const upcomingAppointments = appointments.filter(a => ['approved', 'confirmed'].includes(a.status));

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 healthcare-gradient">
            <div className="max-w-7xl mx-auto">
                {/* Header Card */}
                <header className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ring-1 ring-slate-100">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Clinical Dashboard</h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Manage patient schedule and medical requests</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/doctor/calendar')}
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-3 bg-blue-50 text-blue-700 px-6 py-3.5 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all font-black text-xs uppercase tracking-widest"
                        >
                            📅 View Calendar
                        </button>
                        <button
                            onClick={handleLogout}
                            className="md:flex-none inline-flex items-center justify-center bg-slate-50 text-slate-500 px-6 py-3.5 rounded-2xl hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-widest border border-slate-200"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Pending Requests Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <span className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></span>
                                Requests
                            </h2>
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-3 py-1 rounded-full border border-rose-200 uppercase tracking-widest">
                                {pendingAppointments.length} New
                            </span>
                        </div>

                        {pendingAppointments.length === 0 ? (
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-200 text-center ring-1 ring-slate-100">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto mb-4 flex items-center justify-center text-slate-200 shadow-inner">
                                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">All clear!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {pendingAppointments.map(appt => (
                                    <div key={appt._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-blue-400 transition-all group relative overflow-hidden ring-1 ring-slate-100">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl group-hover:bg-blue-500/5 transition-all"></div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="font-black text-slate-800 text-lg leading-tight">{appt.patientId?.name || 'New Patient'}</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate max-w-[150px]">{appt.patientId?.email || 'Guest'}</p>
                                            </div>
                                            <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">{appt.timeSlot}</p>
                                            </div>
                                        </div>

                                        <div className="mb-8 flex items-center justify-center gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" className="text-slate-400">
                                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <span className="font-black text-slate-600 text-sm">
                                                {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate(appt._id, 'approved')}
                                                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition shadow-lg shadow-emerald-50 active:scale-95"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(appt._id, 'rejected')}
                                                className="flex-1 bg-slate-50 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition active:scale-95"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Schedule Column */}
                    <div className="lg:col-span-8 flex flex-col space-y-8">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-xl font-black text-slate-800">Live Schedule</h2>
                            <div className="flex gap-6">
                                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 tracking-widest uppercase">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-300 tracking-widest uppercase">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Past
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden flex-1 ring-1 ring-slate-100">
                            {upcomingAppointments.length === 0 ? (
                                <div className="py-32 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto mb-6 flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-slate-800 font-black text-2xl mb-2">No active sessions</h3>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Awaiting patient confirmations</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Patient</th>
                                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Timing</th>
                                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Status</th>
                                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Control</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {upcomingAppointments.map((appt) => (
                                                <tr key={appt._id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 font-black border-2 border-slate-100 shadow-sm transition-all group-hover:scale-110 group-hover:border-blue-200">
                                                                {appt.patientId?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-800 text-base">{appt.patientId?.name || 'Private Patient'}</div>
                                                                <div className="text-[10px] text-blue-500 font-black tracking-tighter mt-1 bg-blue-50 px-2 py-0.5 rounded-lg inline-block">ID: {appt._id.slice(-6).toUpperCase()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="text-center">
                                                            <div className="font-black text-slate-700 text-sm mb-1">{new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                                            <div className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{appt.timeSlot}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-center">
                                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border ring-1 ring-inset ${getStatusStyles(appt.status)}`}>
                                                            {appt.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="flex items-center justify-end gap-3 h-full">
                                                            {appt.status === 'approved' && (
                                                                <button
                                                                    onClick={() => handleStatusUpdate(appt._id, 'completed')}
                                                                    className="text-emerald-600 hover:text-white hover:bg-emerald-600 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl border border-emerald-100 transition-all active:scale-95"
                                                                >
                                                                    Complete
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                                                                className="text-slate-300 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl border border-slate-50 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95"
                                                            >
                                                                Cancel
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
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;

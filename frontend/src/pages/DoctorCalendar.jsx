import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const DoctorCalendar = () => {
    const [calendar, setCalendar] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [daysAhead, setDaysAhead] = useState(7);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCalendar();
    }, [daysAhead]);

    const fetchCalendar = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = JSON.parse(atob(token.split('.')[1])).id;

            const res = await api.get(`/api/appointments/calendar/${userId}?days=${daysAhead}`);
            setCalendar(res.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load calendar');
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
            case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10';
            default: return 'bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/10';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    const sortedDates = Object.keys(calendar).sort();

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 healthcare-gradient">
            <div className="max-w-5xl mx-auto">
                {/* Header Card */}
                <header className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 mb-10 ring-1 ring-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-800 tracking-tight">Clinical Calendar</h1>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Personalized Appointment Timeline</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative group flex-1 md:flex-none">
                                <select
                                    value={daysAhead}
                                    onChange={(e) => setDaysAhead(parseInt(e.target.value))}
                                    className="w-full md:w-48 px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-600 focus:bg-white transition-all outline-none font-black text-xs uppercase tracking-widest text-slate-700 appearance-none cursor-pointer pr-12"
                                >
                                    <option value={7}>Next 7 Days</option>
                                    <option value={14}>Next 14 Days</option>
                                    <option value={30}>Next 30 Days</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/doctor')}
                                className="bg-white text-slate-500 px-6 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                </header>

                {/* Calendar Content */}
                {loading ? (
                    <div className="bg-white rounded-[3rem] shadow-sm p-32 text-center border border-slate-100 ring-1 ring-slate-50">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-6">
                            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Synchronizing Records...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-8 text-rose-600 font-black text-center">
                        {error}
                    </div>
                ) : sortedDates.length === 0 ? (
                    <div className="bg-white rounded-[3rem] shadow-sm p-32 text-center border border-slate-100 ring-1 ring-slate-50">
                        <div className="w-24 h-24 bg-slate-50 rounded-3xl mx-auto mb-8 flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 className="text-slate-800 font-black text-3xl mb-3 tracking-tight">Empty Registry</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">No confirmed bookings in this window</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {sortedDates.map((dateStr) => (
                            <div key={dateStr} className="space-y-6">
                                <div className="flex items-center gap-6 px-4">
                                    <div className="w-1.5 h-12 bg-blue-600 rounded-full"></div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                        {formatDate(dateStr)}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {calendar[dateStr].map((apt) => (
                                        <div
                                            key={apt._id}
                                            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 hover:border-blue-400 transition-all group ring-1 ring-slate-100 overflow-hidden relative"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none transition-all group-hover:bg-blue-500/10"></div>

                                            <div className="flex justify-between items-start relative">
                                                <div className="space-y-6 flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                                                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session Time</p>
                                                            <p className="text-2xl font-black text-slate-800 tracking-tighter">{apt.timeSlot}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Patient Details</p>
                                                        <p className="font-black text-slate-700 text-lg leading-tight">{apt.patientName}</p>
                                                        <p className="text-xs text-slate-400 font-bold mt-1 truncate">{apt.patientEmail}</p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black border ring-1 ring-inset shadow-sm ${getStatusStyles(apt.status)}`}>
                                                        {apt.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorCalendar;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const PatientDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [rescheduleModal, setRescheduleModal] = useState({ open: false, appointmentId: null });
    const [rescheduleData, setRescheduleData] = useState({ newDate: '', newTimeSlot: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/api/appointments/my');
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) navigate('/login');
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm("Are you sure you want to cancel this appointment?")) {
            try {
                await api.put(`/api/appointments/${id}/cancel`);
                fetchAppointments();
            } catch (err) {
                alert(err.response?.data?.message || "Failed to cancel appointment");
            }
        }
    };

    const openRescheduleModal = (appointmentId) => {
        setRescheduleModal({ open: true, appointmentId });
        setRescheduleData({ newDate: '', newTimeSlot: '' });
    };

    const closeRescheduleModal = () => {
        setRescheduleModal({ open: false, appointmentId: null });
        setRescheduleData({ newDate: '', newTimeSlot: '' });
    };

    const handleReschedule = async () => {
        if (!rescheduleData.newDate || !rescheduleData.newTimeSlot) {
            alert('Please select both date and time slot');
            return;
        }

        try {
            await api.put(`/api/appointments/${rescheduleModal.appointmentId}/reschedule`, rescheduleData);
            closeRescheduleModal();
            fetchAppointments();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to reschedule appointment");
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
            case 'confirmed': return 'bg-sky-50 text-sky-700 border-sky-100 ring-sky-500/10';
            default: return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
        }
    };

    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 healthcare-gradient">
            <div className="max-w-6xl mx-auto">
                {/* Header Card */}
                <header className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ring-1 ring-slate-100">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Health Dashboard</h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Manage your appointments and consultations</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/ai-assistant')}
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
                        >
                            <span>🤖</span> AI Assistant
                        </button>
                        <button
                            onClick={() => navigate('/book')}
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-3.5 rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
                        >
                            <span className="text-lg leading-none">+</span> Book New
                        </button>
                        <button
                            onClick={handleLogout}
                            className="md:flex-none inline-flex items-center justify-center bg-slate-50 text-slate-500 px-5 py-3.5 rounded-2xl hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-widest border border-slate-200"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content Card */}
                <main className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-100">
                    <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800">Your Schedule</h2>
                        <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black border border-slate-200 text-slate-400 shadow-sm uppercase tracking-tighter">
                            {appointments.length} Total Appointments
                        </span>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-6 text-slate-200">
                                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-slate-800 font-black text-xl mb-2">No appointments yet</h3>
                            <p className="text-slate-400 font-medium mb-8 px-6 max-w-sm mx-auto uppercase text-[10px] tracking-widest">Book your first consultation with our medical team</p>
                            <button
                                onClick={() => navigate('/book')}
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                            >
                                Book Now
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">specialist</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Timing</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Status</th>
                                        <th className="px-10 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {appointments.map((appt) => (
                                        <tr key={appt._id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black border-2 border-white shadow-sm ring-1 ring-slate-100 transition-all group-hover:scale-110">
                                                        {appt.doctorId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-800 text-base">
                                                            Dr. {appt.doctorId?.name || 'Medical Specialist'}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                                                            {appt.doctorId?.email || 'General Consultation'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-700">
                                                        {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-xs text-blue-500 font-bold flex items-center gap-2 mt-1">
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        {appt.timeSlot}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border ring-1 ring-inset ${getStatusStyles(appt.status)}`}>
                                                    {appt.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {(appt.status === 'pending' || appt.status === 'approved') && (
                                                        <button
                                                            onClick={() => openRescheduleModal(appt._id)}
                                                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100"
                                                            title="Reschedule Appointment"
                                                        >
                                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {appt.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleCancel(appt._id)}
                                                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                                                            title="Cancel Appointment"
                                                        >
                                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Reschedule Modal */}
            {rescheduleModal.open && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reschedule</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Pick a new date and time slot</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2">New Date</label>
                                <input
                                    type="date"
                                    value={rescheduleData.newDate}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-600 focus:bg-white transition-all outline-none font-black text-slate-700 shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2">New Time Slot</label>
                                <div className="relative">
                                    <select
                                        value={rescheduleData.newTimeSlot}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, newTimeSlot: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-600 focus:bg-white transition-all outline-none font-black text-slate-700 appearance-none shadow-sm"
                                    >
                                        <option value="" disabled>Choose a slot...</option>
                                        {timeSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={handleReschedule}
                                className="flex-[2] bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100"
                            >
                                Confirm Change
                            </button>
                            <button
                                onClick={closeRescheduleModal}
                                className="flex-1 bg-slate-50 text-slate-500 px-6 py-4 rounded-2xl hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-widest border border-slate-200"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;

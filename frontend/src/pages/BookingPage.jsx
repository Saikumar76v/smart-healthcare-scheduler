import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

const BookingPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctorId: '',
        date: '',
        timeSlot: '09:00 AM',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchDoctors();
        if (location.state?.doctorId) {
            setFormData(prev => ({ ...prev, doctorId: location.state.doctorId }));
        }
    }, [location.state]);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/api/doctors');
            setDoctors(res.data);
            if (res.data.length > 0 && !location.state?.doctorId) {
                setFormData(prev => ({ ...prev, doctorId: res.data[0]._id }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSuggestSlot = async () => {
        if (!formData.doctorId) {
            setError('Please select a doctor first');
            return;
        }

        setSuggesting(true);
        setError('');
        try {
            const res = await api.get(`/api/appointments/suggest-slot/${formData.doctorId}`);
            if (res.data.suggestedDate) {
                setFormData({
                    ...formData,
                    date: res.data.suggestedDate,
                    timeSlot: res.data.suggestedTimeSlot
                });
                setSuccess(`AI Recommendation: ${res.data.suggestedDate} at ${res.data.suggestedTimeSlot}`);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('No available slots found for this specialist.');
            }
        } catch (err) {
            setError('Failed to fetch AI suggestions.');
        } finally {
            setSuggesting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/api/appointments/book', formData);
            setSuccess('Appointment booked successfully!');
            setTimeout(() => navigate('/patient'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center p-4 md:p-8 healthcare-gradient">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl border border-slate-100 ring-1 ring-slate-200 overflow-hidden relative">
                <div className="h-4 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                <div className="p-10 md:p-14">
                    <header className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-3xl mb-6 text-blue-600 shadow-inner">
                            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Booking</h2>
                        <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">Reserve your appointment slot</p>
                    </header>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 p-6 rounded-[1.5rem] mb-10 text-sm border border-rose-100 flex items-center font-black animate-in shake-1 duration-300">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="mr-3 shrink-0">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 text-emerald-600 p-6 rounded-[1.5rem] mb-10 text-sm border border-emerald-100 flex items-center font-black animate-in slide-in-from-top-4">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="mr-3 shrink-0">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Provider</label>
                                <button
                                    type="button"
                                    onClick={handleSuggestSlot}
                                    disabled={suggesting}
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {suggesting ? 'Analyzing...' : '⚡ AI Smart Slot'}
                                </button>
                            </div>
                            <div className="relative group">
                                <select
                                    className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 focus:bg-white transition-all appearance-none text-slate-800 font-bold text-lg cursor-pointer"
                                    value={formData.doctorId}
                                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Specialist...</option>
                                    {doctors.map((doc) => (
                                        <option key={doc._id} value={doc._id}>Dr. {doc.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 mb-2 block">Date</label>
                                <input
                                    type="date"
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-600 focus:bg-white transition-all outline-none text-slate-800 font-bold"
                                    value={formData.date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 mb-2 block">Time</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-600 focus:bg-white transition-all appearance-none text-slate-800 font-bold cursor-pointer"
                                        value={formData.timeSlot}
                                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                                        required
                                    >
                                        {timeSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse md:flex-row gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/patient')}
                                className="flex-1 bg-slate-50 text-slate-500 py-5 rounded-2xl hover:bg-slate-100 transition-all font-black uppercase tracking-widest text-xs border border-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl hover:bg-blue-700 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Secure Booking'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.5em]">
                            🛡️ HIPAA COMPLIANT SYSTEM
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

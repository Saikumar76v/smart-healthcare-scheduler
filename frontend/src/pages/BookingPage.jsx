import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const BookingPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctorId: '',
        date: '',
        timeSlot: '09:00',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/api/doctors');
            setDoctors(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, doctorId: res.data[0]._id }));
            }
        } catch (err) {
            console.error("Failed to fetch doctors", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/api/appointments/book', formData);
            setSuccess('Appointment booked successfully!');
            setTimeout(() => navigate('/patient'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
                <header className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Book Appointment</h2>
                    <p className="text-gray-500 mt-2">Schedule a consultation with a specialist</p>
                </header>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-center shadow-sm">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                </div>}

                {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm border border-green-100 flex items-center shadow-sm">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {success}
                </div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">Select Doctor</label>
                        <div className="relative">
                            <select
                                className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition appearance-none text-gray-700"
                                value={formData.doctorId}
                                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                required
                            >
                                <option value="" disabled>Choose a specialist...</option>
                                {doctors.map((doc) => (
                                    <option key={doc._id} value={doc._id}>
                                        {doc.name} • {doc.email}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">Date</label>
                            <input
                                type="date"
                                className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition text-gray-700"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">Time Slot</label>
                            <div className="relative">
                                <select
                                    className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition appearance-none text-gray-700"
                                    value={formData.timeSlot}
                                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                                >
                                    <option value="09:00">09:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                    <option value="14:00">02:00 PM</option>
                                    <option value="15:00">03:00 PM</option>
                                    <option value="16:00">04:00 PM</option>
                                    <option value="17:00">05:00 PM</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4 gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/patient')}
                            className="flex-1 bg-white text-gray-700 px-6 py-3.5 rounded-xl border border-gray-300 hover:bg-gray-50 font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-blue-600 text-white px-6 py-3.5 rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingPage;

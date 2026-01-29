import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 5000); // Poll every 5 seconds
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const upcomingAppointments = appointments.filter(a => ['approved', 'confirmed'].includes(a.status));

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Doctor Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage your patient schedule</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-100 transition border border-red-100 font-medium"
                    >
                        Logout
                    </button>
                </header>

                {/* Pending Requests Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide mr-2">Action Required</span>
                        Pending Requests ({pendingAppointments.length})
                    </h2>

                    {pendingAppointments.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
                            No pending appointment requests.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingAppointments.map(appt => (
                                <div key={appt._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{appt.patientId?.name || 'Unknown'}</h3>
                                            <p className="text-sm text-gray-500">{appt.patientId?.email}</p>
                                        </div>
                                        <div className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg text-xs">
                                            {appt.timeSlot}
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <p className="text-gray-600 text-sm flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleStatusUpdate(appt._id, 'approved')}
                                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(appt._id, 'rejected')}
                                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 border border-red-100 transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Upcoming Appointments Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Schedule</h2>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {upcomingAppointments.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">No upcoming appointments scheduled.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {upcomingAppointments.map((appt) => (
                                        <tr key={appt._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="p-5 font-medium text-gray-800">{appt.patientId?.name || 'Unknown'}</td>
                                            <td className="p-5 text-gray-600">
                                                {new Date(appt.date).toLocaleDateString()} <span className="text-gray-400 mx-1">•</span> {appt.timeSlot}
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${appt.status === 'completed' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                        'bg-green-100 text-green-700 border-green-200'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right space-x-3">
                                                <button
                                                    onClick={() => handleStatusUpdate(appt._id, 'completed')}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                                >
                                                    Mark Complete
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DoctorDashboard;

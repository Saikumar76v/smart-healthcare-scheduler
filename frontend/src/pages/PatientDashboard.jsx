import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const PatientDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 5000); // Poll every 5 seconds for status updates
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
        if (window.confirm("Are you sure you want to cancel?")) {
            try {
                await api.delete(`/api/appointments/cancel/${id}`);
                fetchAppointments();
            } catch (err) {
                alert("Failed to cancel");
            }
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Patient Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage your health appointments</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/book')}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            + Book Appointment
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-50 text-red-600 px-5 py-2.5 rounded-lg hover:bg-red-100 transition font-medium border border-red-100"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">My Appointments</h2>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            You have no appointments. <br />
                            <button onClick={() => navigate('/book')} className="text-blue-600 font-medium hover:underline mt-2">Book your first one now.</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map((appt) => (
                                        <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-800">
                                                {/* We might need to populate doctor info completely. 
                              Assuming doctorId populated via /my route update or we rely on basic info 
                          */}
                                                {appt.doctorId?.name ?
                                                    `${appt.doctorId.name} (${appt.doctorId.email})`
                                                    : 'Unknown Doctor'}
                                            </td>
                                            <td className="p-4 text-gray-700">{new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                            <td className="p-4 text-gray-700">{appt.timeSlot}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appt.status)}`}>
                                                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {appt.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancel(appt._id)}
                                                        className="text-red-500 hover:text-red-700 font-medium text-sm transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PatientDashboard;

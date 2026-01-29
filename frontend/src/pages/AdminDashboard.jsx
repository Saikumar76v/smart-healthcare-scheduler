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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">System Overview</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 transition shadow-md hover:shadow-lg font-medium"
                    >
                        Logout
                    </button>
                </header>

                <div className="mb-6 flex space-x-4">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Appointments ({appointments.length})
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-800">{user.name}</td>
                                            <td className="p-4 text-gray-600">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                        user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
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
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map((appt) => (
                                        <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-800">
                                                {appt.doctorId?.name || 'Unknown'}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {appt.patientId?.name || 'Unknown'}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {new Date(appt.date).toLocaleDateString()} {appt.timeSlot}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${appt.status === 'confirmed' || appt.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        appt.status === 'cancelled' || appt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {appt.status}
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

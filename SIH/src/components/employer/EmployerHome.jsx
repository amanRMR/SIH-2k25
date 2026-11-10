import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Users, LogIn, UserPlus, Briefcase, LogOut, Plus, Edit, Trash2, X, Activity } from 'lucide-react';
import { getEmployerApiUrl, buildApiUrl } from '../../utils/api';

const EmployerHome = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({ aadhaar: '', name: '' });
    const navigate = useNavigate();
    const token = localStorage.getItem('employerToken');
    const employerDetails = JSON.parse(localStorage.getItem('employerDetails') || '{}');

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY,
        'Authorization': token ? `Bearer ${token}` : ''
    });

    const checkHealthStatus = async (worker) => {
        try {
            const response = await fetch(buildApiUrl(`/api/users/${worker.aadhaar}`), {
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && (data.success || data.data)) {
                const patient = data.data?.user || data.data;
                if (!patient) return { ...worker, illnessStatus: false };

                const illnesses = patient.illnesses || [];

                // Normalize current date to midnight for accurate comparison
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Check for active illness:
                // - No recovery date means still ill (not fit)
                // - Recovery date >= today means still recovering (not fit)
                // - Recovery date < today means recovered (fit to work)
                const activeIllness = illnesses.find(i => {
                    if (!i.recoveryDate) {
                        return true; // No recovery date = still ill
                    }
                    const recoveryDate = new Date(i.recoveryDate);
                    recoveryDate.setHours(0, 0, 0, 0);
                    return recoveryDate >= today; // Recovery date is today or in future = still recovering
                });

                if (activeIllness) {
                    return {
                        ...worker,
                        illnessStatus: true,
                        illnessDetails: activeIllness.illnessName,
                        recoveryDate: activeIllness.recoveryDate,
                        diagnosisDate: activeIllness.diagnosisDate
                    };
                }
            }
        } catch (e) {
            console.error('Health check failed for', worker.name);
        }
        return { ...worker, illnessStatus: false };
    };

    const fetchWorkers = async () => {
        if (!employerDetails.companyId) {
            console.warn('Company ID missing from storage. Please re-login.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                companyId: employerDetails.companyId
            }).toString();
            const response = await fetch(`${getEmployerApiUrl('workers')}?${queryParams}`, {
                headers: getHeaders()
            });
            const data = await response.json();
            if (data.success) {
                const initialWorkers = data.data || [];
                const enrichedWorkers = await Promise.all(initialWorkers.map(checkHealthStatus));
                setWorkers(enrichedWorkers);
            } else {
                if (response.status === 401) {
                    // handleLogout();
                }
            }
        } catch (error) {
            console.error('Failed to fetch workers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchWorkers();
        } else {
            setWorkers([]);
            setLoading(false);
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('employerToken');
        localStorage.removeItem('employerDetails');
        navigate('/employerlogin');
    };

    const handleAddClick = () => {
        setModalType('add');
        setFormData({ aadhaar: '', name: '' });
        setShowModal(true);
    };

    const handleEditClick = (worker) => {
        setModalType('edit');
        setFormData({ aadhaar: worker.aadhaar, name: worker.name });
        setShowModal(true);
    };

    const handleDelete = async (aadhaar) => {
        if (!window.confirm('Are you sure you want to remove this worker?')) return;
        try {
            const response = await fetch(getEmployerApiUrl('workers'), {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ aadhaar })
            });
            const data = await response.json();
            if (response.ok) {
                fetchWorkers();
            } else {
                alert(data.message || 'Delete failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting worker');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate if worker exists on portal before adding
        if (modalType === 'add') {
            try {
                const checkResponse = await fetch(buildApiUrl(`/api/users/${formData.aadhaar}`), {
                    headers: getHeaders()
                });

                // If 404 or not success, assume user not registered
                if (!checkResponse.ok) {
                    toast.error('Worker is not registered on the portal.');
                    return;
                }

                const checkData = await checkResponse.json();
                if (!checkData.success && !checkData.data) {
                    toast.error('Worker is not registered on the portal.');
                    return;
                }
            } catch (err) {
                console.error('User verification failed:', err);
                toast.error('Unable to verify worker registration. Please check connection.');
                return;
            }
        }

        const url = modalType === 'add'
            ? getEmployerApiUrl('addWorker')
            : getEmployerApiUrl('workers');

        const method = modalType === 'add' ? 'POST' : 'PUT';

        // Prepare payload with companyId if adding
        const payload = { ...formData };
        if (modalType === 'add' && employerDetails.companyId) {
            payload.companyId = employerDetails.companyId;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok && (data.success || modalType === 'edit')) {
                setShowModal(false);
                fetchWorkers();
                toast.success(modalType === 'add' ? 'Worker added successfully!' : 'Worker updated successfully!');
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ToastContainer position="top-right" autoClose={3000} />
            {/* Header */}
            <header className="bg-[#006B61] text-white p-4 shadow-md sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Employer Portal</h1>
                    </div>
                    <div className="flex gap-4">
                        {token ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/employerlogin')}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/employersignup')}
                                    className="flex items-center gap-2 bg-white text-[#006B61] hover:bg-gray-100 px-4 py-2 rounded-lg transition font-bold"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-6 flex-1">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column: Worker Roster & Management */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Users className="w-6 h-6 text-[#006B61]" />
                                Worker Roster
                            </h2>
                            {token && (
                                <button
                                    onClick={handleAddClick}
                                    className="bg-[#006B61] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#005a51] transition shadow-sm"
                                >
                                    <Plus size={18} />
                                    Add Worker
                                </button>
                            )}
                        </div>

                        {!token ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-700">Please Login to Manage Workers</h3>
                                <p className="text-gray-500 max-w-md mx-auto mt-2">Access your worker roster, monitor health status, and manage records securely.</p>
                                <button
                                    onClick={() => navigate('/employerlogin')}
                                    className="mt-6 px-6 py-2 bg-[#006B61] text-white rounded-lg hover:bg-[#005a51] transition"
                                >
                                    Log In Now
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="text-center py-10">Loading workers...</div>
                        ) : workers.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">
                                No workers found. Add your first worker to get started.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {workers.map((worker) => (
                                    <div key={worker.aadhaar || worker._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800">{worker.name}</h3>
                                                <p className="text-gray-500 text-xs font-mono bg-gray-50 inline-block px-2 py-0.5 rounded mt-1">
                                                    ID: {worker.aadhaar}
                                                </p>
                                                {worker.addedAt && (
                                                    <p className="text-gray-400 text-[10px] mt-1 pl-1">
                                                        Added: {new Date(worker.addedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(worker)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(worker.aadhaar)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Illness Status Section */}
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Health Status</span>
                                                {worker.illnessStatus ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                        <Activity size={12} /> Unwell
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                        <Activity size={12} /> Healthy
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 min-h-[1.25rem]">
                                                {worker.illnessStatus ? 'Unfit to Work' : 'Fit for work'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Alerts Box */}
                    {token && workers.some(w => w.illnessStatus) && (
                        <div className="w-full lg:w-80 shrink-0 sticky top-24">
                            <div className="bg-white rounded-xl shadow-md border border-red-100 overflow-hidden">
                                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-2">
                                    <Activity className="text-red-600 w-5 h-5" />
                                    <h3 className="font-bold text-red-800">Health Alerts</h3>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                                    {workers.filter(w => w.illnessStatus).map((worker) => (
                                        <div key={worker.aadhaar} className="p-4 hover:bg-gray-50 transition flex items-start gap-4">
                                            <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-sm animate-pulse" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-800 text-sm">{worker.name}</h4>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200">
                                                        UNFIT
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-xs mt-1 font-medium">
                                                    Unfit to Work
                                                </p>
                                                <div className="flex flex-col gap-1 mt-2 text-[10px] text-gray-400">
                                                    {worker.diagnosisDate && (
                                                        <span>Diag: {new Date(worker.diagnosisDate).toLocaleDateString()}</span>
                                                    )}
                                                    {worker.recoveryDate && (
                                                        <span>Rec: {new Date(worker.recoveryDate).toLocaleDateString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Configurable Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl transform scale-100 transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">
                                {modalType === 'add' ? 'Add New Worker' : 'Edit Worker'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number (ID)</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={12}
                                    disabled={modalType === 'edit'} // Usually ID is immutable in edit, or acts as key
                                    value={formData.aadhaar}
                                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] outline-none ${modalType === 'edit' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                    placeholder="12-digit Aadhaar"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Worker Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] outline-none"
                                    placeholder="Full Name"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#006B61] text-white py-3 rounded-xl font-bold hover:bg-[#005a51] transition mt-2"
                            >
                                {modalType === 'add' ? 'Add Worker' : 'Update Worker'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerHome;

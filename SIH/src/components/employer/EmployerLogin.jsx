import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { getEmployerApiUrl } from '../../utils/api';

const EmployerLogin = () => {
    const [formData, setFormData] = useState({ companyId: '', employerId: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(getEmployerApiUrl('login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_API_KEY
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('employerToken', data.token || data.data?.token);

                // Store employer details (prefer backend response, fallback to input)
                const details = data.data || {};
                if (!details.companyId) details.companyId = formData.companyId;
                if (!details.employerId) details.employerId = formData.employerId;

                localStorage.setItem('employerDetails', JSON.stringify(details));

                navigate('/employer');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="bg-[#006B61] p-6 text-white text-center">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                        <LogIn className="w-6 h-6" />
                        Employer Login
                    </h2>
                    <p className="text-white/80 mt-2">Access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
                        <input
                            type="text"
                            name="companyId"
                            required
                            value={formData.companyId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] focus:border-transparent outline-none transition"
                            placeholder="Enter Company ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employer ID</label>
                        <input
                            type="text"
                            name="employerId"
                            required
                            value={formData.employerId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] focus:border-transparent outline-none transition"
                            placeholder="Enter your Employer ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] focus:border-transparent outline-none transition"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#006B61] text-white py-3 rounded-xl font-bold hover:bg-[#005a51] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                        Don't have an account?{' '}
                        <Link to="/employersignup" className="text-[#006B61] font-bold hover:underline">
                            Register here
                        </Link>
                    </div>

                    <Link to="/employer" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4 flex items-center justify-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default EmployerLogin;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { getEmployerApiUrl } from '../../utils/api';

const EmployerSignup = () => {
    const [formData, setFormData] = useState({
        employerId: '',
        companyId: '',
        name: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });
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

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(getEmployerApiUrl('register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_API_KEY
                },
                body: JSON.stringify({
                    employerId: formData.employerId,
                    companyId: formData.companyId,
                    name: formData.name,
                    mobile: formData.mobile,
                    password: formData.password
                }),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                navigate('/employerlogin'); // Redirect to login
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
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
                        <UserPlus className="w-6 h-6" />
                        Employer Register
                    </h2>
                    <p className="text-white/80 mt-2">Create a new account</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employer ID</label>
                        <input
                            type="text"
                            name="employerId"
                            required
                            value={formData.employerId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] outline-none"
                            placeholder="E.g. EMP1001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
                        <input
                            type="text"
                            name="companyId"
                            required
                            value={formData.companyId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] outline-none"
                            placeholder="Company ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            required
                            value={formData.mobile}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] outline-none"
                            placeholder="Mobile Number"
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
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] outline-none"
                            placeholder="Create a password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006B61] outline-none"
                            placeholder="Confirm password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#006B61] text-white py-3 rounded-xl font-bold hover:bg-[#005a51] transition disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                        Already have an account?{' '}
                        <Link to="/employerlogin" className="text-[#006B61] font-bold hover:underline">
                            Login here
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

export default EmployerSignup;

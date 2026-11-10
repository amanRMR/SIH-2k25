import React from 'react';
import { BookOpen, UserPlus, FileText, Activity, Shield } from 'lucide-react';

const UserGuide = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">User Guide</h1>
                    <p className="text-xl text-gray-600">How to use the Swaasth Setu Portal</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Section 1: Registration */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-100 p-3 rounded-full mr-4">
                                <UserPlus className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">1. Registration</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Hospitals and Admins can register using the "Sign Up" links on the login pages. Patients are registered by Hospital staff.
                        </p>
                        <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            <li>Provide valid credentials and official identification.</li>
                            <li>Verify your email/phone number via OTP (if applicable).</li>
                        </ul>
                    </div>

                    {/* Section 2: Managing Records */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-100 p-3 rounded-full mr-4">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">2. Health Records</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Access and update patient health records securely.
                        </p>
                        <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            <li>Search for patients using their 12-digit Aadhaar ID.</li>
                            <li>View medical history, prescriptions, and lab reports.</li>
                            <li>Upload new documents (PDF/Images) to the patient's profile.</li>
                        </ul>
                    </div>

                    {/* Section 3: Dashboard & Analytics */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="bg-purple-100 p-3 rounded-full mr-4">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">3. Dashboard & Analytics</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Utilize the dashboard for real-time insights.
                        </p>
                        <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            <li>View disease outbreak alerts and heatmaps.</li>
                            <li>Analyze migration patterns and occupation distribution.</li>
                            <li>Monitor hospital resource utilization.</li>
                        </ul>
                    </div>

                    {/* Section 4: Privacy & Security */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="bg-orange-100 p-3 rounded-full mr-4">
                                <Shield className="w-6 h-6 text-orange-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">4. Privacy & Security</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Your data security is our top priority.
                        </p>
                        <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            <li>Always log out after your session.</li>
                            <li>Do not share your login credentials.</li>
                            <li>Report any suspicious activity to support immediately.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserGuide;

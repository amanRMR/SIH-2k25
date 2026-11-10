import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <div className="prose prose-blue max-w-none text-gray-700">
                    <p className="mb-4">
                        Last updated: December 4, 2024
                    </p>
                    <p className="mb-4">
                        Swaasth Setu is committed to protecting the privacy and security of your personal health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our portal.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Information We Collect</h2>
                    <p className="mb-4">
                        We collect personal information that you voluntarily provide to us when you register on the portal, including but not limited to:
                        <ul className="list-disc pl-5 mt-2">
                            <li>Personal Identification Information (Name, Aadhaar Number, Date of Birth)</li>
                            <li>Contact Information (Phone Number, Email Address, Address)</li>
                            <li>Health Records (Medical History, Prescriptions, Lab Reports, Immunizations)</li>
                            <li>Occupation and Migration Details</li>
                        </ul>
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. How We Use Your Information</h2>
                    <p className="mb-4">
                        We use the information we collect to:
                        <ul className="list-disc pl-5 mt-2">
                            <li>Create and manage your health account.</li>
                            <li>Facilitate access to healthcare services across different states.</li>
                            <li>Monitor and analyze public health trends and disease outbreaks.</li>
                            <li>Communicate with you regarding your health records and appointments.</li>
                        </ul>
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Data Security</h2>
                    <p className="mb-4">
                        We implement appropriate technical and organizational security measures to protect your personal information. Your data is encrypted and stored in secure government servers. Access is restricted to authorized healthcare personnel and administrators.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Sharing of Information</h2>
                    <p className="mb-4">
                        We do not sell or rent your personal information. We may share your information with:
                        <ul className="list-disc pl-5 mt-2">
                            <li>Authorized healthcare providers for your treatment.</li>
                            <li>Government health departments for public health monitoring.</li>
                            <li>Law enforcement agencies if required by law.</li>
                        </ul>
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Contact Us</h2>
                    <p className="mb-4">
                        If you have any questions about this Privacy Policy, please contact us at support@swaasthsetu.gov.in.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

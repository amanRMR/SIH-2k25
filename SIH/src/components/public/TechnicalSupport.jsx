import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send } from 'lucide-react';

const TechnicalSupport = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setTimeout(() => {
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Technical Support</h1>
                    <p className="text-xl text-gray-600">We are here to help you with any issues.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="bg-white p-8 rounded-xl shadow-md h-full">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <Phone className="w-6 h-6 text-blue-600 mt-1 mr-4" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Helpline</h3>
                                    <p className="text-gray-600">1800-123-4567 (Toll Free)</p>
                                    <p className="text-sm text-gray-500">Available 24/7</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Mail className="w-6 h-6 text-blue-600 mt-1 mr-4" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                                    <p className="text-gray-600">support@swaasthsetu.gov.in</p>
                                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <MessageSquare className="w-6 h-6 text-blue-600 mt-1 mr-4" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Live Chat</h3>
                                    <p className="text-gray-600">Available on the dashboard</p>
                                    <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Form */}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit a Ticket</h2>

                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="bg-green-100 text-green-800 p-4 rounded-full inline-block mb-4">
                                    <Send className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Ticket Submitted!</h3>
                                <p className="text-gray-600 mt-2">We will get back to you shortly.</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Submit another ticket
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select Issue Type</option>
                                        <option value="login">Login Issue</option>
                                        <option value="data">Data Discrepancy</option>
                                        <option value="technical">Technical Bug</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Submit Ticket
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicalSupport;

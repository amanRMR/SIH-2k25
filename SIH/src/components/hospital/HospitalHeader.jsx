import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { LogOut, Home, UserPlus, FileText, Calendar } from "lucide-react";

export default function HospitalHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { label: "Dashboard", icon: Home, path: "/hospitalhome" },
        { label: "Add Patient", icon: UserPlus, path: "/hospitaladdpatient" },
        { label: "Records", icon: FileText, path: "/hospitalmedicalrecord" },
        { label: "Appointments", icon: Calendar, path: "/hospitalappointments" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/hospitalhome')}
                    >
                        <div className="w-10 h-10 bg-[#006B61] rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Swaasth Setu</h1>
                            <p className="text-xs text-red-500 font-medium">Hospital Portal</p>
                        </div>
                    </div>

                    {/* Navigation - hide on dashboard */}
                    {location.pathname !== '/hospitalhome' && (
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                        ? "text-[#006B61] bg-[#006B61]/5"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    )}

                    {/* Right Side - Logout only */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

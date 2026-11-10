import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  Users,
  Calendar,
  FileText,
  Stethoscope,
  AlertTriangle,
  LogOut,
  Bell,
  Plus,
  Activity,
  MessageCircle,
  Phone,
  BarChart3,
  Map,
  Shield,
  Settings,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const quickStats = [
    { label: "Total Hospitals", value: "247", icon: Stethoscope, color: "text-blue-600" },
    { label: "Active Users", value: "12,847", icon: Users, color: "text-green-600" },
    { label: "Reports Today", value: "1,237", icon: FileText, color: "text-purple-600" },
    { label: "System Alerts", value: "23", icon: AlertTriangle, color: "text-orange-600" },
  ];

  const adminActions = [
    { title: "View Statistics", icon: BarChart3, path: "/secure/statistics", color: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { title: "Health Records", icon: FileText, path: "/secure/healthrecords", color: "bg-green-50 hover:bg-green-100 border-green-200" },
    { title: "Map View", icon: Map, path: "/secure/map", color: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
    { title: "Alerts Management", icon: Bell, path: "/secure/alerts", color: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
    { title: "About System", icon: Shield, path: "/secure/about", color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
    { title: "Contact Info", icon: MessageCircle, path: "/secure/contact", color: "bg-teal-50 hover:bg-teal-100 border-teal-200" },
  ];

  const recentAlerts = [
    { type: "System", message: "Database backup completed successfully", priority: "low", time: "30 min ago" },
    { type: "Security", message: "New hospital registration pending approval", priority: "medium", time: "2 hrs ago" },
    { type: "Performance", message: "Server load is within normal limits", priority: "low", time: "4 hrs ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          🛡️ Admin Dashboard
        </h1>
        <div className="flex items-center space-x-6">
          <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-800"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-10">
        {/* Welcome Message */}
        <section className="bg-gradient-to-r from-[#3291B6] to-[#BB8ED0] text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name || 'Admin'}!</h2>
          <p className="text-[#F1E2E2]">You have full access to all system features except hospital-specific functions.</p>
        </section>

        {/* Quick Stats */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">System Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, i) => (
              <div key={i} className="bg-white shadow-sm rounded-lg p-6 text-center border border-gray-200">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Admin Actions */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Functions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminActions.map((action, i) => (
              <div
                key={i}
                onClick={() => navigate(action.path)}
                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${action.color} flex items-center space-x-4`}
              >
                <action.icon className="h-8 w-8 text-gray-700" />
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">Click to access</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Alerts */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">System Alerts</h2>
          <div className="space-y-4">
            {recentAlerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 bg-white border border-gray-200 p-4 rounded-lg shadow-sm"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${alert.priority === "high"
                    ? "bg-red-500"
                    : alert.priority === "medium"
                      ? "bg-orange-500"
                      : "bg-blue-500"
                    }`}
                ></div>
                <div>
                  <div className="font-medium text-gray-900">{alert.type}</div>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">System Support</h2>
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 bg-[#3291B6] hover:bg-[#3291B6]/90 text-white px-4 py-2 rounded-lg">
              <MessageCircle className="h-5 w-5" />
              <span>System Chat</span>
            </button>
            <button className="flex items-center space-x-2 bg-[#BB8ED0] hover:bg-[#BB8ED0]/90 text-white px-4 py-2 rounded-lg">
              <Phone className="h-5 w-5" />
              <span>Technical Support</span>
            </button>
            <button className="flex items-center space-x-2 bg-[#E0A8A8] hover:bg-[#E0A8A8]/90 text-white px-4 py-2 rounded-lg">
              <Settings className="h-5 w-5" />
              <span>System Settings</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

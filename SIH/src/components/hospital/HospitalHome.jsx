import React from "react";
import { buildApiUrl } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import HospitalHeader from "./HospitalHeader.jsx";
import {
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Bell,
  Plus,
  Clock,
} from "lucide-react";

export default function HospitalHome() {
  const navigate = useNavigate();
  const { user, fetchWithAuth } = useAuth();
  const [hospitalName, setHospitalName] = React.useState("Hospital");

  React.useEffect(() => {
    const fetchHospitalName = async () => {
      // 1. Debugging: Check what the user object actually contains
      console.log("HospitalHome: Current User Context:", user);

      if (!user) return;

      // 2. Handle potential nesting of user data (e.g. user.user or user.data)
      // This ensures we get the actual ID/fields regardless of how AuthContext saved it
      const userData = user.user || user.data || user;

      try {
        const response = await fetchWithAuth(buildApiUrl("/api/hospitals"));
        const result = await response.json();
        console.log("HospitalHome: API Response:", result); // Debugging

        if (response.ok && result.data?.users) {
          const users = result.data.users;

          // 3. Robust matching logic
          // Convert to strings to avoid type mismatches (number vs string)
          const matchedUser = users.find(u => {
            const apiHospitalId = String(u.hospitalId || "");
            const apiUserId = String(u.userId || "");
            const apiObjId = String(u._id || "");

            const contextHospitalId = String(userData.hospitalId || "");
            const contextUserId = String(userData.userId || userData.id || userData._id || "");

            return (
              (contextHospitalId && apiHospitalId === contextHospitalId) ||
              (contextUserId && (apiObjId === contextUserId || apiUserId === contextUserId))
            );
          });

          if (matchedUser?.name) {
            console.log("HospitalHome: Found matched hospital:", matchedUser.name);
            setHospitalName(matchedUser.name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch hospital details:", error);
      }
    };

    fetchHospitalName();
  }, [user]);

  const quickStats = [
    { label: "Total Patients", value: "99+", icon: Users },
    { label: "Appointments Today", value: "25", icon: Calendar },
    { label: "Doctors Active", value: "25", icon: Stethoscope },
    { label: "Reports Uploaded", value: "152", icon: FileText },
  ];

  const quickActions = [
    {
      title: "Add New Patient",
      description: "Register new patient",
      icon: Plus,
      path: "/hospitaladdpatient",
      bgColor: "bg-[#006B61]/10",
      iconColor: "text-[#006B61]",
      hoverBg: "hover:bg-[#006B61]/20"
    },
    {
      title: "Patient Records",
      description: "View & update records",
      icon: FileText,
      path: "/hospitalmedicalrecord",
      bgColor: "bg-[#006B61]/10",
      iconColor: "text-[#006B61]",
      hoverBg: "hover:bg-[#006B61]/20"
    },
    {
      title: "View Appointments",
      description: "Manage schedule",
      icon: Calendar,
      path: "/hospitalappointments",
      bgColor: "bg-[#006B61]/10",
      iconColor: "text-[#006B61]",
      hoverBg: "hover:bg-[#006B61]/20"
    },
  ];

  const recentAlerts = [
    { type: "Outbreak", message: "Rise in malaria cases in nearby district", time: "1 hr ago", priority: "high" },
    { type: "Policy", message: "New patient data compliance update", time: "5 hrs ago", priority: "medium" },
    { type: "Reminder", message: "Vaccination camp scheduled tomorrow", time: "1 day ago", priority: "low" },
  ];

  const getPriorityColor = (priority) => {
    if (priority === "high") return "bg-red-500";
    if (priority === "medium") return "bg-orange-500";
    return "bg-blue-500";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <HospitalHeader />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#006B61] via-[#005a52] to-[#1a2e35] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, <span className="text-[#00C49A]">{hospitalName}</span>
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              Streamline patient care, manage records, and stay updated with real-time alerts.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/10 hover:bg-white/15 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <stat.icon className="h-6 w-6 mx-auto mb-3 text-white/80" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm cursor-pointer group 
                    transition-all duration-300 ease-out
                    hover:shadow-lg hover:border-[#006B61]/30 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mb-4 
                    transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <action.icon className={`h-5 w-5 ${action.iconColor} transition-colors`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-[#006B61] transition-colors">{action.title}</h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Alerts */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900">Recent Alerts</h3>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {recentAlerts.map((alert, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getPriorityColor(alert.priority)}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{alert.type}</div>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{alert.message}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {alert.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

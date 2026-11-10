import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  AlertTriangle,
  FileText,
  UserPlus,
  TrendingUp,
  Shield,
  Globe,
  Phone,
  Download,
  BarChart3,
  Activity,
  MapPin,
  Bell,
  Settings,
  ChevronRight,
  Plus,
  MessageCircle,
  HelpCircle,
  Calendar,
  Clock,
  Sparkles,
  Map,
  Heart
} from 'lucide-react';

import { useAuth } from "../../contexts/AuthContext.jsx";

const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

export default function Home() {
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const [language, setLanguage] = useState('English');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetchWithAuth(`${backendUrl}/api/camps/upcoming`);
        const result = await response.json();
        if (response.ok && (result.success !== false)) {
          const data = result.data || [];
          setAlerts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      }
    };
    fetchAlerts();
  }, [fetchWithAuth]);

  const quickStats = [
    { label: 'Registered Migrants', value: '1999+', icon: Users, color: 'text-blue-600' },
    { label: 'Active Records', value: '149+', icon: Activity, color: 'text-green-600' },
    { label: 'Hospitals', value: '9+', icon: Shield, color: 'text-purple-600' },
    { label: 'Vaccination %', value: '78.4%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const quickAccessTiles = [
    { title: 'Add New Record', icon: Plus, description: 'Register new migrant worker', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100', path: '/secure/healthrecords' },
    { title: 'Search by Aadhaar ID', icon: Search, description: 'Find migrant health records', color: 'bg-green-50 border-green-200 hover:bg-green-100', path: '/secure/healthrecords' },
    { title: 'View Alerts', icon: AlertTriangle, description: 'Check health alerts & outbreaks', color: 'bg-red-50 border-red-200 hover:bg-red-100', path: '/secure/map' },
    { title: 'Generate Reports', icon: FileText, description: 'Create health analytics reports', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100', path: '/secure/healthrecords' },
    // { title: 'Partner Registration', icon: UserPlus, description: 'Register NGOs & hospitals', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100', path: '/hospitallogin' },
    { title: 'Analytics Dashboard', icon: BarChart3, description: 'View comprehensive analytics', color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100', path: '/secure/statistics' }
  ];

  const getPriorityColor = (alert) => {
    const text = (alert.name + " " + (alert.description || "")).toLowerCase();
    if (text.includes("outbreak") || text.includes("emergency") || text.includes("alert")) return "bg-red-500";
    if (text.includes("vaccin")) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Digital Health Records for Migrant Workers
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Ensuring healthcare continuity across state boundaries through Aadhaar integration
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-white" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Access Tiles */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickAccessTiles.map((tile, index) => (
                  <Link key={index} to={tile.path}>
                    <div
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${tile.color}`}
                    >
                      <div className="flex items-start space-x-4">
                        <tile.icon className="h-8 w-8 text-gray-700 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{tile.title}</h4>
                          <p className="text-sm text-gray-600">{tile.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Platform Features (formerly Analytics Snapshot) */}
            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Platform Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Feature 1 */}
                <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-900">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Driven Predictive Analytics</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Analyzes large-scale health data to detect disease trends early. Assists hospitals & government in resource planning and epidemic management.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-900">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Health Assistant</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Smart chatbot for citizens: answers medical questions in simple language with multilingual support.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-900">
                    <Map className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Health Map</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    See healthcare like never before — from national trends to your nearest hospital with state-wise dashboards and health heatmaps.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-900">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Unified Health Record</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    All patient data (prescriptions, lab reports, immunizations, allergies) in one secure digital profile, linked with Aadhaar/ABHA ID.
                  </p>
                </div>

              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications & Alerts */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Camps & Notifications</h3>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>

              {/* Vertical Floating/Scrolling List */}
              <div className="relative h-96 overflow-hidden">
                <div className="absolute w-full space-y-4 animate-vertical-scroll hover:pause-animation">
                  {/* Duplicate list for seamless scrolling effect if needed, or just list them */}
                  {alerts.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No active alerts</div>
                  ) : (
                    [...alerts, ...alerts].map((alert, index) => (
                      <div key={`${alert._id}-${index}`} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getPriorityColor(alert)}`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{alert.name}</div>
                          <div className="text-sm text-gray-600 line-clamp-2">{alert.description}</div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(alert.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.time}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {alert.location}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <style>{`
                @keyframes vertical-scroll {
                  0% { transform: translateY(0); }
                  100% { transform: translateY(-50%); }
                }
                .animate-vertical-scroll {
                  animation: vertical-scroll 30s linear infinite;
                }
                .animate-vertical-scroll:hover {
                  animation-play-state: paused;
                }
                /* Ensure container has enough height or mask */
                .hover\\:pause-animation:hover {
                  animation-play-state: paused;
                }
              `}</style>

              <button className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => navigate("/secure/alerts")}>
                View All →
              </button>
            </section>

            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About This Platform</h3>
              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                <p className="font-medium text-gray-900">
                  Swaaasth Setu is a digital healthcare bridge connecting patients, hospitals,
                  and NGOs. It enables secure access to medical records, lab reports, and
                  prescriptions using Aadhaar-based search.
                </p>
                <p className="font-medium text-gray-900">
                  The platform also helps hospitals manage patient data, upload reports, and
                  collaborate with NGOs to improve healthcare accessibility across India.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

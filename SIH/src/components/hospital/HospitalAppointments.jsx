import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { buildApiUrl } from "../../utils/api.js";
import HospitalHeader from "./HospitalHeader.jsx";
import { FileText, RefreshCw, User, Stethoscope, Calendar as CalendarIcon, Clock, MessageSquare } from "lucide-react";

export default function HospitalAppointments() {
  const { user, fetchWithAuth } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getHospitalId = useCallback(() => {
    const id = user?.hospitalId || user?.id || user?._id || user?.data?.hospitalId || user?.data?.id || user?.data?._id || user?.user?.id || user?.user?._id;
    return id;
  }, [user]);

  const fetchAppointments = useCallback(async () => {
    const hospitalId = getHospitalId();

    if (!hospitalId) {
      if (user) {
        setError("Hospital ID not found. Please log in again.");
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const url = buildApiUrl(`/api/hospitals/appointments?hospitalId=${hospitalId}`);

      const response = await fetchWithAuth(url);
      const data = await response.json();

      if (data.success) {
        setAppointments(data.data.appointments || []);
      } else {
        setError(data.message || "Failed to fetch appointments");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("An error occurred while fetching appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getHospitalId, user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#006B61] rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-sm text-gray-500">Manage patient appointments</p>
            </div>
          </div>

          <button
            onClick={fetchAppointments}
            disabled={loading}
            className="flex items-center gap-2 bg-[#006B61] hover:bg-[#005a52] disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#006B61] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Patient
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Doctor
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Reason
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No appointments scheduled yet.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {appt.username || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {appt.doctorname || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(appt.date)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {appt.time || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {appt.reason || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

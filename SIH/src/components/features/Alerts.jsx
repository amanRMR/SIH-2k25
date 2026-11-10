import React, { useState, useEffect } from "react";
import { AlertTriangle, Syringe, FileText, CheckCircle, Plus, X, Calendar, MapPin, Clock, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

export default function AlertsPage() {
  const { fetchWithAuth } = useAuth();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    time: "",
    organizer: "",
    description: "",
    contact: ""
  });

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${backendUrl}/api/camps/all`);
      const result = await response.json();

      if (!response.ok || (result.success === false)) {
        throw new Error(result.message || "Failed to fetch camps");
      }

      const data = result.data || [];
      setCamps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetchWithAuth(`${backendUrl}/api/camps/create`, {
        method: "POST",
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok || (result.success === false)) {
        throw new Error(result.message || "Failed to create camp");
      }

      await fetchCamps();
      setShowModal(false);
      setFormData({
        name: "",
        location: "",
        date: "",
        time: "",
        organizer: "",
        description: "",
        contact: ""
      });
      alert(result.message || "Camp created successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (item) => {
    const text = (item.name + " " + (item.description || "")).toLowerCase();
    if (text.includes("vaccin")) return Syringe;
    if (text.includes("outbreak") || text.includes("emergency") || text.includes("alert") || text.includes("dengue") || text.includes("malaria")) return AlertTriangle;
    if (text.includes("checkup") || text.includes("camp") || text.includes("health")) return CheckCircle;
    return FileText;
  };

  const getSeverityColor = (item) => {
    const text = (item.name + " " + (item.description || "")).toLowerCase();
    if (text.includes("outbreak") || text.includes("emergency") || text.includes("alert")) return "bg-red-100 text-red-700 border-red-200";
    if (text.includes("vaccin")) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  // Sort and split camps
  const now = new Date();
  const sortedCamps = [...camps].sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

  const upcomingCamps = sortedCamps.filter(camp => new Date(camp.date) >= now);
  const pastCamps = sortedCamps.filter(camp => new Date(camp.date) < now);

  const renderCampList = (list) => {
    if (list.length === 0) {
      return <div className="text-center py-4 text-gray-500 bg-white rounded-lg shadow">No camps found in this section.</div>;
    }
    return list.map((camp, idx) => {
      const Icon = getIcon(camp);
      return (
        <div
          key={camp._id || idx}
          className="flex items-start p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow mb-4"
        >
          <div
            className={`p-3 rounded-full mr-4 border ${getSeverityColor(camp)}`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {camp.name}
                </h3>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  {camp.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(camp.date).toLocaleDateString()}
                    </span>
                  )}
                  {camp.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {camp.time}
                    </span>
                  )}
                  {camp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {camp.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {camp.description && (
              <p className="text-gray-700 mt-2">{camp.description}</p>
            )}

            {(camp.organizer || camp.contact) && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
                {camp.organizer && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <strong>Organizer:</strong> {camp.organizer}
                  </span>
                )}
                {camp.contact && <span><strong>Contact:</strong> {camp.contact}</span>}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Health Camps & Alerts
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Camp
          </button>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading camps...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Alerts List */}
        {!loading && !error && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Upcoming Camps & Alerts</h2>
              {renderCampList(upcomingCamps)}
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Past Camps & History</h2>
              {renderCampList(pastCamps)}
            </section>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Create New Health Camp</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Camp/Event Name *</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Free Eye Checkup Camp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    required
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    required
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Community Hall, Sector 4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer *</label>
                  <input
                    required
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., City Hospital"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                  <input
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., +91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Details about the camp..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Camp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

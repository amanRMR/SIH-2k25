import React, { useState } from 'react';
import { Search, Plus, FileText, Download, User, Calendar, MapPin, Activity, Shield, X, Save, AlertCircle, CheckCircle, Eye, Edit } from 'lucide-react';
import { buildApiUrl } from '../../utils/api.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import HospitalHeader from './HospitalHeader.jsx';
import LiveTranslationPanel from './LiveTranslationPanel';

const HospitalMedicalRecord = () => {
  const { fetchWithAuth } = useAuth();
  const [aadhaarId, setAadhaarId] = useState('');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, prescription, lab, immunization
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // prescription, lab-report, immunization
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  // File Viewer State
  const [viewFile, setViewFile] = useState(null);
  const [viewFileType, setViewFileType] = useState('');

  // Illness Edit State
  const [showIllnessEditModal, setShowIllnessEditModal] = useState(false);
  const [selectedIllness, setSelectedIllness] = useState(null);
  const [recoveryDate, setRecoveryDate] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Hospital Data State
  const [hospitals, setHospitals] = useState([]);
  const [currentHospitalName, setCurrentHospitalName] = useState('');
  const [doctors, setDoctors] = useState([]);

  // Fetch hospitals on component mount
  React.useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('http://13.201.85.159:3000/api/hospitals?api_key=NishDarDevMrigVanshAman2025');
        const data = await response.json();

        if (data.success && data.data?.users) {
          setHospitals(data.data.users);

          // Get current hospital from localStorage or first in the list
          const storedHospitalId = localStorage.getItem('hospitalId');
          const currentHospital = data.data.users.find(h => h.hospitalId === storedHospitalId) || data.data.users[0];

          if (currentHospital) {
            setCurrentHospitalName(currentHospital.name);
            // Set default doctors list (for demo purposes - you can customize this)
            setDoctors([
              'Dr. Rajesh Kumar',
              'Dr. Priya Sharma',
              'Dr. Amit Patel',
              'Dr. Sunita Singh',
              'Dr. Vikram Mehta',
              'Dr. Neha Gupta'
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch hospitals:', err);
        // Set default values if API fails
        setDoctors([
          'Dr. Rajesh Kumar',
          'Dr. Priya Sharma',
          'Dr. Amit Patel',
          'Dr. Sunita Singh',
          'Dr. Vikram Mehta',
          'Dr. Neha Gupta'
        ]);
      }
    };

    fetchHospitals();
  }, []);

  const handleSearch = async () => {
    if (!aadhaarId || aadhaarId.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar ID');
      return;
    }
    setLoading(true);
    setError('');
    setPatient(null);

    try {
      const response = await fetchWithAuth(buildApiUrl(`/api/users/${aadhaarId}`));
      const data = await response.json();

      if (response.ok && (data.success || data.data)) {
        setPatient(data.data?.user || data.data || data);
      } else {
        setError(data.message || 'Patient not found');
      }
    } catch (err) {
      setError('Failed to fetch patient details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshPatientData = async () => {
    if (patient?.aadhaar) {
      try {
        const response = await fetchWithAuth(buildApiUrl(`/api/users/${patient.aadhaar}`));
        const data = await response.json();
        if (response.ok) {
          setPatient(data.data?.user || data.data || data);
        }
      } catch (err) {
        console.error("Failed to refresh data", err);
      }
    }
  };

  const openModal = (type) => {
    setModalType(type);
    // Auto-fill hospital name
    setFormData({ hospitalName: currentHospitalName });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setSubmitLoading(true);
    const data = new FormData();
    data.append('file', selectedFile);

    // Append all form fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      const endpoint = buildApiUrl(`/api/users/${patient.aadhaar}/${modalType}`);
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      if (response.ok) {
        alert(`${modalType.replace('-', ' ')} added successfully!`);
        setShowModal(false);
        refreshPatientData();
      } else {
        alert(result.message || "Failed to add record");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while uploading");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const openIllnessEditModal = (illness, index) => {
    setSelectedIllness({ ...illness, index });
    setRecoveryDate(illness.recoveryDate ? new Date(illness.recoveryDate).toISOString().split('T')[0] : '');
    setShowIllnessEditModal(true);
  };

  const handleUpdateRecoveryDate = async () => {
    if (!recoveryDate) {
      alert('Please select a recovery date');
      return;
    }

    setEditLoading(true);
    try {
      // Update the illness array with the new recovery date
      const updatedIllnesses = [...patient.illnesses];
      updatedIllnesses[selectedIllness.index] = {
        ...updatedIllnesses[selectedIllness.index],
        recoveryDate: recoveryDate
      };

      const response = await fetchWithAuth(buildApiUrl(`/api/users/${patient.aadhaar}`), {
        method: 'PUT',
        body: JSON.stringify({
          illnesses: updatedIllnesses
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert('Recovery date updated successfully!');
        setShowIllnessEditModal(false);
        refreshPatientData();
      } else {
        alert(result.message || 'Failed to update recovery date');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating the recovery date');
    } finally {
      setEditLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-[#006B61]">
          <User className="w-5 h-5 mr-2" /> Personal Information
        </h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2"><span className="text-gray-500">Full Name:</span> <span className="font-medium">{patient.name}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Occupation:</span> <span className="font-medium">{patient.occupation || 'N/A'}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Age / Gender:</span> <span className="font-medium">{patient.age} / {patient.gender}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Blood Group:</span> <span className="font-medium">{patient.bloodGroup}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Height / Weight:</span> <span className="font-medium">{patient.heightCm} cm / {patient.weightKg} kg</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">DOB:</span> <span className="font-medium">{formatDate(patient.dob)}</span></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-green-800">
          <MapPin className="w-5 h-5 mr-2" /> Contact & Address
        </h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2"><span className="text-gray-500">Phone:</span> <span className="font-medium">{patient.contact?.phone}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Email:</span> <span className="font-medium">{patient.contact?.email}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Emergency Contact:</span> <span className="font-medium">{patient.emergencyContact?.[0]?.phone || 'N/A'}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Current State:</span> <span className="font-medium">{patient.currentState}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Origin State:</span> <span className="font-medium">{patient.originState}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">District:</span> <span className="font-medium">{patient.address?.district}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{patient.address?.local}, {patient.address?.pincode}</span></div>
          <div className="grid grid-cols-2"><span className="text-gray-500">Language:</span> <span className="font-medium">{patient.languagePreference}</span></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border md:col-span-2">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-red-800">
          <Activity className="w-5 h-5 mr-2" /> Medical History
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Allergies</h4>
            {patient.healthRecords?.allergies?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.healthRecords.allergies.map((a, i) => (
                  <span key={i} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-100">{a}</span>
                ))}
              </div>
            ) : <span className="text-gray-400 text-sm">None recorded</span>}
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Chronic Conditions</h4>
            {patient.healthRecords?.chronicConditions?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.healthRecords.chronicConditions.map((c, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs border border-orange-100">{c}</span>
                ))}
              </div>
            ) : <span className="text-gray-400 text-sm">None recorded</span>}
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Past Illnesses</h4>
            {patient.illnesses?.length > 0 ? (
              <div className="space-y-2">
                {patient.illnesses.map((ill, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{ill.illnessName}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Diagnosis:</span> {formatDate(ill.diagnosisDate)}
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Recovery:</span> {ill.recoveryDate ? formatDate(ill.recoveryDate) : 'Not set'}
                        </div>
                      </div>
                      <button
                        onClick={() => openIllnessEditModal(ill, i)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#006B61] text-white rounded hover:bg-[#005a52] transition"
                        title="Edit Recovery Date"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <span className="text-gray-400 text-sm">None recorded</span>}
          </div>
        </div>
      </div>
    </div>
  );

  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;

    // Normalize path: replace backslashes with forward slashes
    const normalizedPath = path.replace(/\\/g, '/');

    // Ensure it starts with /
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

    // Use direct backend URL for files to avoid proxy issues with non-API paths
    return `http://13.201.85.159:3000${cleanPath}`;
  };

  const handleViewFile = (fileUrl) => {
    const url = getFileUrl(fileUrl);
    let type = 'image';

    // Check for PDF extension or MIME type in Data URI
    if (url.toLowerCase().endsWith('.pdf') ||
      (url.startsWith('data:') && url.includes('application/pdf'))) {
      type = 'pdf';
    }

    setViewFile(url);
    setViewFileType(type);
  };

  const renderRecordsList = (type, title, icon, records) => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="text-lg font-semibold flex items-center">
          {icon} <span className="ml-2">{title}</span>
        </h3>
        <button
          onClick={() => openModal(type)}
          className="flex items-center px-3 py-1.5 bg-[#006B61] text-white text-sm rounded hover:bg-[#005a52] transition"
        >
          <Plus className="w-4 h-4 mr-1" /> Add New
        </button>
      </div>

      {records && records.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((rec, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(rec.date || rec.uploadedAt)}</td>
                  <td className="px-4 py-3">
                    {type === 'prescription' && (
                      <>
                        <div className="font-medium">{rec.doctorName || 'Unknown Doctor'}</div>
                        <div className="text-xs text-gray-500">{rec.hospitalName}</div>
                      </>
                    )}
                    {type === 'lab-report' && (
                      <>
                        <div className="font-medium">{rec.testType || 'Lab Test'}</div>
                        <div className="text-xs text-gray-500">{rec.labName}</div>
                      </>
                    )}
                    {type === 'immunization' && (
                      <>
                        <div className="font-medium">{rec.vaccineName || rec.vaccine || 'Vaccine'}</div>
                        <div className="text-xs text-gray-500">Dose: {rec.doseNumber || rec.dose}</div>
                        <div className="text-xs text-gray-500">By: {rec.administeredBy || rec.doctorName}</div>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{rec.notes || '-'}</td>
                  <td className="px-4 py-3">
                    {rec.url || rec.fileUrl ? (
                      <button
                        onClick={() => handleViewFile(rec.url || rec.fileUrl)}
                        className="text-[#006B61] hover:underline flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View File
                      </button>
                    ) : <span className="text-gray-400">No File</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          No records found. Click "Add New" to upload.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#006B61] rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Records Portal</h1>
            <p className="text-sm text-gray-500">Search and manage patient health records</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Patient by Aadhaar</label>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={aadhaarId}
              onChange={(e) => setAadhaarId(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="Enter 12-digit Aadhaar ID"
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006B61] outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#006B61] text-white px-6 py-3 rounded-lg hover:bg-[#005a52] disabled:opacity-50 flex items-center font-medium"
            >
              {loading ? 'Searching...' : <><Search className="w-4 h-4 mr-2" /> Search</>}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {error}</p>}
        </div>

        {patient && (
          <div className="space-y-6">


            {/* Tabs */}
            <div className="flex border-b bg-white rounded-t-lg overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'prescription', label: 'Prescriptions', icon: FileText },
                { id: 'lab-report', label: 'Lab Reports', icon: Activity },
                { id: 'immunization', label: 'Immunizations', icon: Shield },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-[#006B61] text-[#006B61] bg-[#006B61]/10'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'prescription' && renderRecordsList('prescription', 'Prescriptions', <FileText className="w-5 h-5 text-[#006B61]" />, patient.healthRecords?.prescriptions)}
              {activeTab === 'lab-report' && renderRecordsList('lab-report', 'Lab Reports', <Activity className="w-5 h-5 text-purple-600" />, patient.healthRecords?.labReports)}
              {activeTab === 'immunization' && renderRecordsList('immunization', 'Immunizations', <Shield className="w-5 h-5 text-green-600" />, patient.healthRecords?.immunizations)}
            </div>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold capitalize">Add {modalType.replace('-', ' ')}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {modalType === 'prescription' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
                    <select
                      required
                      name="doctorName"
                      value={formData.doctorName || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#006B61] outline-none"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor, idx) => (
                        <option key={idx} value={doctor}>{doctor}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                    <input
                      required
                      name="hospitalName"
                      value={formData.hospitalName || currentHospitalName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-[#006B61] outline-none"
                      readOnly
                    />
                  </div>
                </>
              )}

              {modalType === 'lab-report' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
                    <input
                      required
                      name="labName"
                      value={formData.labName || currentHospitalName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-[#006B61] outline-none"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
                    <input
                      required
                      name="testType"
                      placeholder="e.g. Blood Test, X-Ray, MRI"
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#006B61] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                    <select
                      name="doctorName"
                      value={formData.doctorName || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#006B61] outline-none"
                    >
                      <option value="">Select Doctor (Optional)</option>
                      {doctors.map((doctor, idx) => (
                        <option key={idx} value={doctor}>{doctor}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {modalType === 'immunization' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name *</label>
                    <input
                      required
                      name="vaccineName"
                      placeholder="e.g. COVID-19, Hepatitis B"
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#006B61] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dose Number *</label>
                    <input
                      required
                      type="number"
                      name="doseNumber"
                      placeholder="e.g. 1, 2, 3"
                      min="1"
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#006B61] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input
                      name="batchNumber"
                      placeholder="Batch Number (Optional)"
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#006B61] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Administered By *</label>
                    <select
                      required
                      name="administeredBy"
                      value={formData.administeredBy || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#006B61] outline-none"
                    >
                      <option value="">Select Doctor/Nurse</option>
                      {doctors.map((doctor, idx) => (
                        <option key={idx} value={doctor}>{doctor}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                    <input
                      name="hospitalName"
                      value={formData.hospitalName || currentHospitalName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-[#006B61] outline-none"
                      readOnly
                    />
                  </div>
                </>
              )}

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Record</label>
                <input
                  type="date"
                  name="date"
                  required
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <textarea name="notes" placeholder="Additional Notes (Optional)" onChange={handleInputChange} className="w-full p-2 border rounded" rows="3" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document (PDF/Image)</label>
                <input required type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#006B61]/10 file:text-[#006B61] hover:file:bg-[#006B61]/20" />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-[#006B61] text-white py-2 rounded hover:bg-[#005a52] disabled:opacity-50 flex justify-center items-center"
              >
                {submitLoading ? 'Uploading...' : 'Save Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {viewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Document Viewer</h3>
              <button
                onClick={() => { setViewFile(null); setViewFileType(''); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-4 bg-gray-100 overflow-auto flex justify-center items-center">
              {viewFileType === 'pdf' ? (
                <iframe
                  src={viewFile}
                  className="w-full h-full rounded border"
                  title="Document Viewer"
                />
              ) : (
                <img
                  src={viewFile}
                  alt="Medical Record"
                  className="max-w-full max-h-full object-contain rounded shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      )
      }

      {/* Edit Recovery Date Modal */}
      {
        showIllnessEditModal && selectedIllness && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold">Edit Recovery Date</h3>
                <button
                  onClick={() => setShowIllnessEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Illness Name
                  </label>
                  <input
                    type="text"
                    value={selectedIllness.illnessName}
                    disabled
                    className="w-full p-2 border rounded bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis Date
                  </label>
                  <input
                    type="text"
                    value={formatDate(selectedIllness.diagnosisDate)}
                    disabled
                    className="w-full p-2 border rounded bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recovery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={recoveryDate}
                    onChange={(e) => setRecoveryDate(e.target.value)}
                    min={selectedIllness.diagnosisDate ? new Date(selectedIllness.diagnosisDate).toISOString().split('T')[0] : ''}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#006B61] outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recovery date must be on or after the diagnosis date
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowIllnessEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateRecoveryDate}
                    disabled={editLoading || !recoveryDate}
                    className="flex-1 px-4 py-2 bg-[#006B61] text-white rounded hover:bg-[#005a52] disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                  >
                    {editLoading ? (
                      <>
                        <span className="mr-2">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      <div className="w-full max-w-md">
        <LiveTranslationPanel patientAadhaar={aadhaarId} />
      </div>
    </div >
  );
};

export default HospitalMedicalRecord;

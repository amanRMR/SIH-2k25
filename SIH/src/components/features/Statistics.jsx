import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { buildApiUrl } from '../../utils/api.js';
import OverallDistrictChart from '../graphs/OverallDistrictChart';
import OverallIllnessChart from '../graphs/OverallIllnessChart';
import DistrictIllnessRechart from '../graphs/DistrictIllnessRechart';
import PredictionDashboard from '../graphs/PredictionDashboard';
import HomeStateDistributionChart from '../graphs/HomeStateDistributionChart';
import OccupationDistributionChart from '../graphs/OccupationDistributionChart';

const HealthDashboardPage = () => {
  const { fetchWithAuth } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [currentStateFilter, setCurrentStateFilter] = useState('');
  const [availableCurrentStates, setAvailableCurrentStates] = useState([]);

  // State for specific illness chart interaction
  const [selectedIllness, setSelectedIllness] = useState('');
  const [illnessOptions, setIllnessOptions] = useState([]);

  // Fetch all users once
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(buildApiUrl('/api/users'));
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        let users = [];
        if (result.success && result.data && result.data.users) {
          users = result.data.users;
        } else if (Array.isArray(result.data)) {
          users = result.data;
        } else if (Array.isArray(result)) {
          users = result;
        }

        setAllUsers(users);

        // Extract unique current states for filter
        const uniqueStates = [...new Set(users.map(u => u.currentState).filter(Boolean))].sort();
        setAvailableCurrentStates(uniqueStates);

      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchWithAuth]);

  // Filter logic
  const filteredUsers = useMemo(() => {
    if (!currentStateFilter) return allUsers;
    return allUsers.filter(u => u.currentState === currentStateFilter);
  }, [allUsers, currentStateFilter]);

  // Extract unique illnesses for the dropdown
  useEffect(() => {
    const illnesses = new Set();
    allUsers.forEach(user => {
      if (user.illnesses && Array.isArray(user.illnesses)) {
        user.illnesses.forEach(ill => {
          if (ill.illnessName) illnesses.add(ill.illnessName);
        });
      }
    });
    const uniqueIllnesses = [...illnesses].sort();
    setIllnessOptions(uniqueIllnesses);
    if (!selectedIllness) {
      setSelectedIllness("All");
    }
  }, [allUsers]);

  // --- Data Processing for Charts ---

  // 1. Overall District Data (Total Cases per District)
  // 1. Overall District Data (Total Cases per District)
  const overallDistrictData = useMemo(() => {
    if (!filteredUsers) return [];
    const counts = {};
    filteredUsers.forEach(user => {
      const district = user.currentDistrict || user.district || (user.address?.district) || "Unknown";
      const illnessCount = user.illnesses?.length || 0;
      if (illnessCount > 0) {
        counts[district] = (counts[district] || 0) + illnessCount;
      }
    });
    return Object.keys(counts).map(key => ({
      district: key,
      totalCases: counts[key]
    })).sort((a, b) => b.totalCases - a.totalCases);
  }, [filteredUsers]);

  // 2. Overall Illness Data (Pie Chart)
  const overallIllnessData = useMemo(() => {
    if (!filteredUsers) return [];
    const counts = {};
    filteredUsers.forEach(user => {
      user.illnesses?.forEach(ill => {
        const name = ill.illnessName || "Unknown";
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).sort((a, b) => b.value - a.value);
  }, [filteredUsers]);

  // 3. District Specific Illness Data (Selected Illness)
  const districtIllnessRechartData = useMemo(() => {
    if (!filteredUsers) return [];
    const counts = {};
    filteredUsers.forEach(user => {
      const district = user.currentDistrict || user.district || (user.address?.district) || "Unknown";

      let countToAdd = 0;
      if (selectedIllness === "All" || !selectedIllness) {
        // If All selected, count total illnesses
        countToAdd = user.illnesses?.length || 0;
      } else {
        // If specific illness selected, check if user has it
        const hasIllness = user.illnesses?.some(ill => ill.illnessName === selectedIllness);
        if (hasIllness) countToAdd = 1;
      }

      if (countToAdd > 0) {
        counts[district] = (counts[district] || 0) + countToAdd;
      }
    });
    return Object.keys(counts).map(key => ({
      district: key,
      count: counts[key]
    })).sort((a, b) => b.count - a.count);
  }, [filteredUsers, selectedIllness]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 w-[90%]">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Comprehensive overview of patient demographics and disease spread</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-stretch space-x-4 h-[60px]">
            <div className="bg-blue-50 px-6 rounded-lg border border-blue-100 flex flex-col justify-center items-center min-w-[120px]">
              <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">Total Patients</span>
              <div className="text-2xl font-bold text-blue-700 leading-none mt-1">{allUsers.length}</div>
            </div>

            <select
              className="px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white h-full"
              value={currentStateFilter}
              onChange={(e) => setCurrentStateFilter(e.target.value)}
            >
              <option value="">All States</option>
              {availableCurrentStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-8">


          {/* AI Prediction Dashboard */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
              AI Disease Prediction Model
            </h2>
            <PredictionDashboard users={filteredUsers} />
          </div>

          {/* Disease Spread by District */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
              Disease Spread by District
            </h2>
            <div className="h-[400px]">
              <OverallDistrictChart data={overallDistrictData} />
            </div>
          </div>

          {/* Overall Illness Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>
              Overall Illness Distribution
            </h2>
            <div className="h-[400px]">
              <OverallIllnessChart data={overallIllnessData} />
            </div>
          </div>

          {/* District-wise Specific Illness Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
                District-wise Illness Analysis
              </h2>
              <select
                className="mt-2 md:mt-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                value={selectedIllness}
                onChange={(e) => setSelectedIllness(e.target.value)}
              >
                <option value="All">All Illnesses</option>
                {illnessOptions.map(ill => (
                  <option key={ill} value={ill}>{ill}</option>
                ))}
              </select>
            </div>
            <div className="h-[500px]">
              <DistrictIllnessRechart data={districtIllnessRechartData} illnessName={selectedIllness} />
            </div>
          </div>

          {/* Patient Demographics: Home State */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-indigo-500 rounded-full mr-3"></span>
              Patient Distribution by Home State
            </h2>
            <div className="h-[400px]">
              <HomeStateDistributionChart users={filteredUsers} />
            </div>
          </div>

          {/* Patient Demographics: Occupation */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-pink-500 rounded-full mr-3"></span>
              Occupation Demographics
            </h2>
            <div className="h-[400px]">
              <OccupationDistributionChart users={filteredUsers} />
            </div>
          </div>



        </div>
      </div>
    </div>
  );
};

export default HealthDashboardPage;
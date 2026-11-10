import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#F97316']; // Blue for Current, Orange for Predicted

const PredictionDashboard = ({ currentData, users }) => {
  // Use users if currentData is not provided
  const dataToUse = currentData || users;
  const [prediction, setPrediction] = useState(null);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [selectedIllness, setSelectedIllness] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // Derived options from props
  const illnessOptions = useMemo(() => {
    if (!dataToUse) return [];
    const options = [...new Set(dataToUse.map(item => {
      // Handle both flattened structure (item.illnessName) and nested (item.illnesses array)
      if (item.illnessName) return item.illnessName;
      if (item.illnesses && Array.isArray(item.illnesses)) {
        return item.illnesses.map(i => i.illnessName);
      }
      return [];
    }).flat().filter(Boolean))];
    return options.sort();
  }, [dataToUse]);

  const districtOptions = useMemo(() => {
    if (!dataToUse) return ['All'];
    const districts = [...new Set(dataToUse.map(item => item.currentDistrict || item.district || (item.address?.district)).filter(Boolean))];
    return ['All', ...districts.sort()];
  }, [dataToUse]);

  // Set default selection when options change
  useEffect(() => {
    if (illnessOptions.length > 0 && !illnessOptions.includes(selectedIllness)) {
      setSelectedIllness(illnessOptions[0]);
    }
  }, [illnessOptions]);

  // Fetch prediction data
  useEffect(() => {
    if (!selectedIllness) return;

    const fetchPredictionData = async () => {
      setIsPredictionLoading(true);
      setPrediction(null);
      let apiUrl = `${import.meta.env.VITE_BACKEND_URL || ''}/api/predictions/illness-wise?illnessName=${selectedIllness}`;
      if (selectedDistrict !== 'All') {
        apiUrl += `&district=${selectedDistrict}`;
      }
      try {
        const response = await fetch(apiUrl, {
          headers: {
            "x-api-key": import.meta.env.VITE_API_KEY,
          },
        });
        if (!response.ok) throw new Error(`Prediction not available for this selection.`);
        const predictionData = await response.json();
        setPrediction(predictionData.data);
      } catch (err) {
        console.warn(err.message);
      } finally {
        setIsPredictionLoading(false);
      }
    };
    fetchPredictionData();
  }, [selectedIllness, selectedDistrict]);

  const chartData = useMemo(() => {
    if (!dataToUse || dataToUse.length === 0) return [];

    let currentTotal = 0;

    // Calculate current total based on selected filters
    dataToUse.forEach(user => {
      // user location check
      const userDistrict = user.currentDistrict || user.district || (user.address?.district);
      if (selectedDistrict !== 'All' && userDistrict !== selectedDistrict) return;

      // illness check
      // Check if user has the selected illness
      const hasIllness = user.illnesses?.some(i => i.illnessName === selectedIllness) || user.illnessName === selectedIllness;

      if (hasIllness) {
        currentTotal += 1;
      }
    });

    return [{ name: 'Current Cases', cases: currentTotal }, { name: 'Predicted Month-End', cases: prediction?.predictedCases || 0 }];
  }, [dataToUse, prediction, selectedIllness, selectedDistrict]);

  // Generate a hard-coded confidence value between 75 and 85
  const displayConfidence = useMemo(() => {
    if (!prediction) return null;
    return Math.floor(Math.random() * (85 - 75 + 1)) + 75;
  }, [prediction]);

  // --- RESPONSIVE STATE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // --- END RESPONSIVE STATE ---

  if (!dataToUse || dataToUse.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 bg-gray-100 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Current vs. Predicted Health Cases</h1>
        <p className="text-center text-gray-500">No data available for analysis.</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-lg shadow-inner">
        <div className="flex-1">
          <label htmlFor="illness-select" className="block text-md font-medium text-gray-700 mb-2">Select Illness</label>
          <select id="illness-select" value={selectedIllness} onChange={(e) => setSelectedIllness(e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm">
            {illnessOptions.map(illness => <option key={illness} value={illness}>{illness}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="district-select" className="block text-md font-medium text-gray-700 mb-2">Select District</label>
          <select id="district-select" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm">
            {districtOptions.map(district => <option key={district} value={district}>{district}</option>)}
          </select>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-bold text-gray-700 mb-4">{selectedIllness} Cases in {selectedDistrict}</h2>
          <div className="w-full h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: isMobile ? 0 : 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={isMobile ? 100 : 180}
                  tick={{ fontSize: isMobile ? 10 : 12, width: isMobile ? 90 : 170 }}
                />
                <Tooltip cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                <Bar dataKey="cases" barSize={isMobile ? 30 : 40}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionDashboard;
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DistrictIllnessRechart = ({ data, illnessName }) => {
  // If no data or no illness selected, show a message or empty state
  if (!data || data.length === 0) {
    return (
      <div className="w-full text-center text-gray-500 py-10">
        {illnessName ? `No cases of ${illnessName} found.` : "Please select an illness to view details."}
      </div>
    );
  }

  return (
    <div className="w-full h-full text-center">
      <div className="w-full h-full overflow-x-auto">
        <div style={{ minWidth: `${Math.max(data.length * 200, 600)}px`, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="district" height={80} interval={0} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
              <Legend verticalAlign="top" />
              <Bar dataKey="count" name={`Cases`} fill="#82ca9d" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DistrictIllnessRechart;
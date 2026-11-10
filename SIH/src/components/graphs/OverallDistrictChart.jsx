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

const OverallDistrictChart = ({ data }) => {
  return (
    <div className="w-full h-full">
      {data && data.length > 0 ? (
        <div className="w-full h-full overflow-x-auto">
          <div style={{ minWidth: `${Math.max(data.length * 200, 600)}px`, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="district" height={80} interval={0} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="totalCases" name="Total Cases" fill="#ff7300" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">No data available.</p>
        </div>
      )}
    </div>
  );
};

export default OverallDistrictChart;
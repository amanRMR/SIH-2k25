import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Colors for the pie chart slices
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

// Custom label is no longer needed as we use default external labels
const OverallIllnessChart = ({ data }) => {
  return (
    <div className="w-full h-full">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true} // Enable lines to labels
              // Render percentage outside
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={105} // Reduce radius to make room for external labels
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} cases`} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">No data available.</p>
        </div>
      )}
    </div>
  );
};

export default OverallIllnessChart;
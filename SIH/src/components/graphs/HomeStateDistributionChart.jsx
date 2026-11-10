import React, { useState, useEffect } from 'react';
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

const HomeStateDistributionChart = ({ users }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (!users) return;

        // Aggregate data by originState
        const stateCounts = users.reduce((acc, user) => {
            const state = user.originState || "Unknown";
            acc[state] = (acc[state] || 0) + 1;
            return acc;
        }, {});

        const processedData = Object.keys(stateCounts)
            .map(state => ({
                state,
                count: stateCounts[state]
            }))
            .sort((a, b) => b.count - a.count);

        setChartData(processedData);
    }, [users]);

    return (
        <div className="w-full h-full overflow-x-auto">
            {chartData.length > 0 ? (
                <div style={{ minWidth: `${Math.max(chartData.length * 200, 600)}px`, height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="state"
                                height={80}
                                interval={0}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="count" name="Number of Workers" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">No data available for the selected criteria.</p>
                </div>
            )}
        </div>
    );
};

export default HomeStateDistributionChart;

import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const OccupationDistributionChart = ({ users }) => {
    const data = useMemo(() => {
        if (!users || users.length === 0) return [];

        const counts = users.reduce((acc, user) => {
            const occupation = user.occupation || "Unknown";
            acc[occupation] = (acc[occupation] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(counts)
            .map(key => ({
                name: key,
                value: counts[key]
            }))
            .sort((a, b) => b.value - a.value);
    }, [users]);

    return (
        <div className="w-full h-full overflow-x-auto">
            {data && data.length > 0 ? (
                <div style={{ minWidth: `${Math.max(data.length * 200, 600)}px`, height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                height={100}
                                interval={0}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="value" name="Workers" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={40}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">No data available.</p>
                </div>
            )}
        </div>
    );
};

export default OccupationDistributionChart;

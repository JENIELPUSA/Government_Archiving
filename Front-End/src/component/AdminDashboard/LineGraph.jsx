import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6B6B", "#6BFFB8", "#FFD166", "#83C9F4", "#FF9F1C", "#D4A5A5", "#7B68EE"];

function MonthlyLineGraph({ MonthlyUploads }) {
    const [chartData, setChartData] = useState([]);
    
    // Process data using useMemo for better performance
    const processedData = useMemo(() => {
        if (!MonthlyUploads) return [];
        
        // Handle different possible formats
        let dataArray;
        
        if (Array.isArray(MonthlyUploads)) {
            // Direct array
            dataArray = MonthlyUploads;
        } else if (MonthlyUploads && typeof MonthlyUploads === 'object') {
            // Handle object with array-like structure
            if (Array.isArray(MonthlyUploads)) {
                dataArray = MonthlyUploads;
            } else if (MonthlyUploads[0]) {
                // Handle array with index 0
                dataArray = [MonthlyUploads[0]];
            } else {
                // Try to extract array from object
                const values = Object.values(MonthlyUploads);
                dataArray = Array.isArray(values[0]) ? values[0] : values;
            }
        } else {
            return [];
        }
        
        // Process valid array
        if (dataArray.length > 0) {
            return dataArray
                .filter(item => item && item.month && typeof item.totalFileSize === 'number')
                .map(({ month, totalFileSize, monthNumber, totalFiles }) => ({
                    month,
                    monthNumber: monthNumber || 0,
                    uploads: parseFloat((totalFileSize / 1024).toFixed(2)), // Convert bytes → KB
                    totalFiles: totalFiles || 0,
                    rawSize: totalFileSize
                }))
                .sort((a, b) => a.monthNumber - b.monthNumber); // Sort by month number
        }
        
        return [];
    }, [MonthlyUploads]);

    useEffect(() => {
        setChartData(processedData);
    }, [processedData]);

    // Format tooltip
    const customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-300 shadow-lg rounded-lg">
                    <p className="font-bold text-gray-800">{label}</p>
                    <p className="text-blue-600">
                        Size: <span className="font-bold">{payload[0].value} KB</span>
                    </p>
                    <p className="text-green-600">
                        Raw Size: <span className="font-bold">
                            {payload[0].payload.rawSize.toLocaleString()} bytes
                        </span>
                    </p>
                    {payload[0].payload.totalFiles > 0 && (
                        <p className="text-purple-600">
                            Files: <span className="font-bold">{payload[0].payload.totalFiles}</span>
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex items-center justify-center font-sans">
            <div className="w-full max-w-6xl rounded-lg bg-white p-4 shadow-xl transition-colors duration-300 dark:bg-gray-800">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100 md:text-3xl">
                    Monthly Uploads Analysis
                </h1>

                {chartData.length > 0 ? (
                    <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={chartData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fill: '#6b7280' }}
                                    axisLine={{ stroke: '#d1d5db' }}
                                />
                                <YAxis
                                    label={{
                                        value: "Upload Size (KB)",
                                        angle: -90,
                                        position: "insideLeft",
                                        style: { 
                                            textAnchor: "middle",
                                            fill: '#6b7280'
                                        },
                                    }}
                                    tick={{ fill: '#6b7280' }}
                                    axisLine={{ stroke: '#d1d5db' }}
                                />
                                <Tooltip content={customTooltip} />
                                <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    wrapperStyle={{ paddingBottom: '20px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="uploads"
                                    name="Total Upload Size (KB)"
                                    stroke={COLORS[0]}
                                    strokeWidth={3}
                                    activeDot={{ r: 8, fill: COLORS[0] }}
                                    dot={{ r: 4 }}
                                    connectNulls={true}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        
                        {/* Summary Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Months</p>
                                <p className="text-2xl font-bold text-blue-600">{chartData.length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Average Monthly Upload</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {parseFloat(chartData.reduce((sum, item) => sum + item.uploads, 0) / chartData.length).toFixed(2)} KB
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Peak Month</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {chartData.reduce((max, item) => item.uploads > max.uploads ? item : max, chartData[0]).month}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-96 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="mb-4 text-5xl">📊</div>
                        <p className="text-lg">No upload data available.</p>
                        <p className="text-sm mt-2">Upload some files to see your monthly analytics.</p>
                    </div>
                )}

                <div className="mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-semibold mb-2">📈 Monthly Uploads Analysis</p>
                        <p>This line graph visualizes the total size of files uploaded each month (converted from bytes to KB).</p>
                        <p>Hover over data points to see detailed metrics including raw file size and number of files.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MonthlyLineGraph;
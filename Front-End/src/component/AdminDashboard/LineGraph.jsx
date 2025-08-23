import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function LineGraph({ isFileData }) {
  const [chartData, setChartData] = useState([]);

  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (isFileData) {
      const processedData = processApplicationData(isFileData);
      setChartData(processedData);
    }
  }, [isFileData]);

  const processApplicationData = (applications) => {
    const monthlyCounts = {};
    allMonths.forEach(month => {
      monthlyCounts[month] = { Approved: 0, Rejected: 0, Pending: 0 };
    });

    applications.forEach(app => {
      const date = new Date(app.createdAt);
      const month = date.toLocaleString('en-US', { month: 'long' });

      if (monthlyCounts[month]) {
        if (app.status === 'Approved') {
          monthlyCounts[month].Approved++;
        } else if (app.status === 'Rejected') {
          monthlyCounts[month].Rejected++;
        } else if (app.status === 'Pending') {
          monthlyCounts[month].Pending++;
        }
      }
    });

    return allMonths.map(month => ({
      name: month,
      ...monthlyCounts[month]
    }));
  };

  return (
    <div className="flex items-center justify-center font-sans">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-full max-w-4xl transition-colors duration-300">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
          Application Status Overview
        </h1>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#4B5563', fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
              tickLine={{ stroke: '#ccc' }}
            />
            <YAxis
              tick={{ fill: '#4B5563', fontSize: 12 }}
              axisLine={{ stroke: '#ccc' }}
              tickLine={{ stroke: '#ccc' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#333' }}
              itemStyle={{ color: '#555' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="Approved"
              stroke="#82ca9d"
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Rejected"
              stroke="#ff7300"
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Pending"
              stroke="#8884d8"
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>This graph shows the monthly trend of approved, rejected, and pending applications based on the provided data.</p>
          <p>
            <span className="text-green-500 font-semibold">Green line</span> = Approved &nbsp; | &nbsp;
            <span className="text-orange-500 font-semibold">Orange line</span> = Rejected &nbsp; | &nbsp;
            <span className="text-indigo-400 font-semibold">Purple line</span> = Pending
          </p>
        </div>
      </div>
    </div>
  );
}

export default LineGraph;

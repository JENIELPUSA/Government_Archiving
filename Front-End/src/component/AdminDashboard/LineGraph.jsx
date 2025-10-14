import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import moment from "moment";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF",
  "#FF6B6B", "#6BFFB8", "#FFD166", "#83C9F4", "#FF9F1C",
  "#D4A5A5", "#7B68EE"
];

function MonthlyLineGraph({ isFileData }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (isFileData && Array.isArray(isFileData) && isFileData.length > 0) {
      const processedData = processMonthlyData(isFileData);
      setChartData(processedData);
    } else {
      setChartData([]);
    }
  }, [isFileData]);

  const processMonthlyData = (applications) => {
    const monthlyData = {};

    applications.forEach((app) => {
      // ✅ Use 'createdAt' instead of 'dateUploaded'
      if (!app?.createdAt) return;

      const uploadDate = moment(app.createdAt); // ISO string like "2025-09-29T06:22:24.929Z"
      if (!uploadDate.isValid()) return;

      const monthYear = uploadDate.format("MMM YYYY");
      const fileSizeKB = app.fileSize ? app.fileSize / 1024 : 0;

      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + fileSizeKB;
    });

    // Sort by actual date
    const sortedData = Object.entries(monthlyData)
      .map(([month, total]) => ({
        month,
        uploads: parseFloat(total.toFixed(2)),
        sortKey: moment(month, "MMM YYYY").valueOf()
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, uploads }) => ({ month, uploads }));

    return sortedData;
  };

  return (
    <div className="flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl rounded-lg bg-white p-2 shadow-xl transition-colors duration-300 dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100 md:text-3xl">
          Monthly Uploads
        </h1>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                label={{
                  value: "Uploads (KB)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" }
                }}
              />
              <Tooltip formatter={(value) => [`${value} KB`, "Total Uploads"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="uploads"
                name="Total Upload Size"
                stroke={COLORS[0]}
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-96 items-center justify-center text-gray-500 dark:text-gray-400">
            No upload data available.
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          <p>This line graph shows the total size of the files uploaded each month (in KB).</p>
          <p>Each point represents the total size of uploads for that month.</p>
        </div>
      </div>
    </div>
  );
}

export default MonthlyLineGraph;
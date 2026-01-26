import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#6BFFB8', '#FFD166', '#83C9F4', '#FF9F1C', '#D4A5A5', '#7B68EE'];

function PieGraph({ categorySummary }) { // Bagong prop name
  const [chartData, setChartData] = useState([]);

  console.log("categorySummary",categorySummary)

  useEffect(() => {
    if (categorySummary && categorySummary.length > 0) {
      const processedData = processCategoryData(categorySummary);
      setChartData(processedData);
    } else {
      // Fallback para sa empty data
      setChartData([]);
    }
  }, [categorySummary]);

  const processCategoryData = (summaryData) => {
    // Gamitin ang bagong data structure
    return summaryData.map(item => ({
      name: item.category || 'Uncategorized',
      value: item.totalFiles, // Gamitin ang totalFiles bilang pangunahing value
      totalFileSize: item.totalFileSize,
      totalFiles: item.totalFiles
    }));
  };

  const formatTooltipValue = (value, name, props) => {
    // Custom tooltip na magpapakita ng parehong files at file size
    const dataPoint = props.payload;
    const fileSizeMB = (dataPoint.totalFileSize / (1024 * 1024)).toFixed(2);
    return [
      `Files: ${dataPoint.totalFiles}`,
      `Size: ${fileSizeMB} MB`
    ];
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const fileSizeFormatted = formatFileSize(data.totalFileSize);
      const percentage = ((data.totalFiles / chartData.reduce((sum, item) => sum + item.totalFiles, 0)) * 100).toFixed(1);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-800 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Files: <span className="font-semibold">{data.totalFiles}</span></p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Size: <span className="font-semibold">{fileSizeFormatted}</span></p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Percentage: <span className="font-semibold">{percentage}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex items-center justify-center font-sans">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl transition-colors duration-300">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6 dark:text-gray-100">
          Documents by Category
        </h1>

        <div className="transform transition-transform duration-500 hover:scale-105">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                innerRadius={60}
                fill="#8884d8"
                dataKey="totalFiles" // Gamitin ang totalFiles bilang pangunahing data key
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />

              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '14px'
                }}
                formatter={(value, entry) => {
                  const data = chartData.find(item => item.name === value);
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {value} ({data?.totalFiles || 0} files)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        {chartData.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{chartData.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {chartData.reduce((sum, item) => sum + item.totalFiles, 0)}
                </p>
              </div>
              <div className="text-center md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Storage Used</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatFileSize(chartData.reduce((sum, item) => sum + item.totalFileSize, 0))}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>This pie chart shows the distribution of documents across different categories.</p>
          <p>Each slice represents a category with its corresponding number of files.</p>
        </div>
      </div>
    </div>
  );
}

export default PieGraph;
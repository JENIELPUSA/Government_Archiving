import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#6BFFB8', '#FFD166', '#83C9F4', '#FF9F1C', '#D4A5A5', '#7B68EE'];

function PieGraph({isFileData}) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (isFileData && isFileData) {
      const processedData = processStorageData(isFileData);
      setChartData(processedData);
    }
  }, [isFileData]);

  const processStorageData = (applications) => {
    const categoryStorage = {};

    applications.forEach(app => {
      const categoryName = app.category || 'Uncategorized'; // Default to 'Uncategorized' if category is missing
      const fileSizeKB = app.fileSize / 1024; // Convert bytes to kilobytes for a more readable value

      if (categoryStorage[categoryName]) {
        categoryStorage[categoryName] += fileSizeKB;
      } else {
        categoryStorage[categoryName] = fileSizeKB;
      }
    });

    return Object.keys(categoryStorage).map(category => ({
      name: category,
      value: parseFloat(categoryStorage[category].toFixed(2)) // Format to 2 decimal places
    }));
  };

  const formatTooltipValue = (value) => {
    return `${value.toFixed(2)} KB`; // Display in KB with 2 decimal places
  };

  return (
    <div className="flex items-center justify-center font-sans">
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl w-full max-w-4xl transition-colors duration-300">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6 dark:text-gray-100">
          Storage Usage by Category
        </h1>

        <div style={{ perspective: '1000px', transform: 'rotateX(30deg) rotateZ(-10deg)' }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {
                  chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))
                }
              </Pie>

              <Tooltip
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#333' }}
                itemStyle={{ color: '#555' }}
              />

              <Legend wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>This pie graph shows the proportion of storage usage per document category.</p>
          <p>Each slice represents a category, and its size is based on the total file size (in KB).</p>
        </div>
      </div>
    </div>
  );
}

export default PieGraph;
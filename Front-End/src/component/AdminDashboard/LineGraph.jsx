import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import moment from "moment"; // Import moment.js for easy date handling

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6B6B", "#6BFFB8", "#FFD166", "#83C9F4", "#FF9F1C", "#D4A5A5", "#7B68EE"];

function MonthlyLineGraph({ isFileData }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (isFileData && isFileData.length > 0) {
            const processedData = processMonthlyData(isFileData);
            setChartData(processedData);
        }
    }, [isFileData]);

    const processMonthlyData = (applications) => {
        const monthlyData = {};

        applications.forEach((app) => {
            // Assuming 'dateUploaded' or similar property exists and is a valid date string
            const uploadDate = moment(app.dateUploaded);
            if (uploadDate.isValid()) {
                const monthYear = uploadDate.format("MMM YYYY");
                const fileSizeKB = app.fileSize / 1024; // Convert bytes to kilobytes

                if (monthlyData[monthYear]) {
                    monthlyData[monthYear] += fileSizeKB;
                } else {
                    monthlyData[monthYear] = fileSizeKB;
                }
            }
        });

        // Sort the data by date to ensure the line graph is in the correct order
        const sortedData = Object.keys(monthlyData)
            .sort((a, b) => {
                return moment(a, "MMM YYYY").valueOf() - moment(b, "MMM YYYY").valueOf();
            })
            .map((month) => ({
                month: month,
                uploads: parseFloat(monthlyData[month].toFixed(2)),
            }));

        return sortedData;
    };

    return (
        <div className="flex items-center justify-center font-sans">
            <div className="w-full max-w-4xl rounded-lg bg-white p-2 shadow-xl transition-colors duration-300 dark:bg-gray-800">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100 md:text-3xl">Monthly Uploads</h1>

                <ResponsiveContainer
                    width="100%"
                    height={400}
                >
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis label={{ value: "Uploads (KB)", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="uploads"
                            stroke={COLORS[0]}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>This line graph shows the total size of the files uploaded each month (in KB).</p>
                    <p>Each point represents the total size of uploads for that month.</p>
                </div>
            </div>
        </div>
    );
}

export default MonthlyLineGraph;

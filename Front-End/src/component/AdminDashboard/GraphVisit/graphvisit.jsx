import React, { useContext, useState, useEffect, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function VisitorGraph({ visitorGraph, fetchVisitorGraph, graphLoading }) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [localFrom, setLocalFrom] = useState("");
    const [localTo, setLocalTo] = useState("");

    // Local filtering para instant response
    const chartData = useMemo(() => {
        if (!visitorGraph || !Array.isArray(visitorGraph)) {
            console.log("No visitor data or not an array");
            return [];
        }

        let filteredData = [...visitorGraph];

        // Apply local date filters
        if (localFrom) {
            filteredData = filteredData.filter(item => item.date >= localFrom);
        }
        if (localTo) {
            filteredData = filteredData.filter(item => item.date <= localTo);
        }

        const formattedData = filteredData.map(item => ({
            date: item.date,
            visits: item.visitors || 0
        }));

        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log("Filtered chart data:", formattedData);
        return formattedData;

    }, [visitorGraph, localFrom, localTo]);

    const handleFilter = () => {
        console.log("=== FILTER BUTTON CLICKED ===");
        console.log("From date:", from);
        console.log("To date:", to);

        if (!fetchVisitorGraph) {
            console.error("fetchVisitorGraph is not defined!");
            return;
        }

        // Check kung walang laman ang dates
        if (!from && !to) {
            console.log("No dates selected, fetching all data");
            setLocalFrom("");
            setLocalTo("");
            fetchVisitorGraph(); // Fetch all data
            return;
        }

        // Validate dates
        if (from && to && new Date(from) > new Date(to)) {
            alert("'From' date cannot be later than 'To' date");
            return;
        }

        // Set local filters para mag-update agad ang graph
        setLocalFrom(from);
        setLocalTo(to);

        // Tawagin ang API na may parameters (hindi empty string)
        // ✅ IMPORTANTE: Huwag magpadala ng empty string, magpadala lang kung may value
        const filterParams = {};
        if (from) filterParams.from = from;
        if (to) filterParams.to = to;

        console.log("Calling API with params:", filterParams);
        fetchVisitorGraph(filterParams.from, filterParams.to);
    };

    const handleClearFilter = () => {
        console.log("Clearing filters");
        setFrom("");
        setTo("");
        setLocalFrom("");
        setLocalTo("");
        if (fetchVisitorGraph) {
            fetchVisitorGraph(); // Fetch all data (walang parameters)
        }
    };

    // Auto-fetch pag walang data
    useEffect(() => {
        if (fetchVisitorGraph && (!visitorGraph || visitorGraph.length === 0)) {
            console.log("Auto-fetching visitor data...");
            fetchVisitorGraph();
        }
    }, [fetchVisitorGraph, visitorGraph]);

    return (
        <div className="w-full rounded-xl bg-white p-4 shadow-md">
            {/* HEADER */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-gray-700">
                    Visitor Analytics
                </h2>

                {/* FILTER */}
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="rounded border px-2 py-1 text-sm"
                    />
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="rounded border px-2 py-1 text-sm"
                    />
                    <button
                        onClick={handleFilter}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                        Filter
                    </button>
                    <button
                        onClick={handleClearFilter}
                        className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Display active filters */}
            {(localFrom || localTo) && (
                <div className="mb-3 text-sm text-gray-600">
                    📅 Showing data from {localFrom || "start"} to {localTo || "present"}
                </div>
            )}

            {/* NO DATA MESSAGE */}
            {!graphLoading && chartData.length === 0 && (
                <div className="py-10 text-center text-gray-500">
                    No visitor data available for the selected period.
                </div>
            )}

            {/* LOADING */}
            {graphLoading ? (
                <div className="py-10 text-center text-gray-500">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-2">Loading graph...</p>
                </div>
            ) : chartData.length > 0 ? (
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                allowDecimals={false}
                                domain={[0, 'auto']}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value) => [`${value} visitors`, 'Visits']}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="visits"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#2563eb" }}
                                activeDot={{ r: 6 }}
                                name="Visitors"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : null}
        </div>
    );
}

export default VisitorGraph;
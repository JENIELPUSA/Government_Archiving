import React, { useState, useEffect, useMemo, useContext } from "react";
import { LogsAndAuditContext } from "../../contexts/LogsAndAuditContext/LogsAndAuditContext";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
};

const AuditLogItemSkeleton = () => (
    <div className="border-b border-gray-200 py-4 dark:border-gray-700">
        <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="flex flex-wrap gap-4">
            {[...Array(3)].map((_, i) => (
                <div key={i}>
                    <div className="mb-1 h-3 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                </div>
            ))}
        </div>
    </div>
);

const AuditLogItem = ({ log, isLoading }) => {
    const [showDetails, setShowDetails] = useState(false);

    if (isLoading) return <AuditLogItemSkeleton />;

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case "DELETE":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "UPDATE":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "CREATE":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "RESTORE":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            case "REVIEW":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
        }
    };

    const getLevelTextColor = (level) => {
        switch (level) {
            case "warning":
                return "text-yellow-600 dark:text-yellow-400";
            case "info":
                return "text-blue-600 dark:text-blue-400";
            case "error":
                return "text-red-600 dark:text-red-400";
            default:
                return "text-gray-600 dark:text-gray-400";
        }
    };

    return (
        <div
            className="cursor-pointer border-b border-gray-200 py-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            onClick={() => setShowDetails(!showDetails)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className={`mr-2 h-3 w-3 rounded-full ${log.level === "warning" ? "bg-yellow-500" : "bg-blue-500"}`}></div>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{log.action}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(log.createdAt)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">File</span>
                    <p className="font-medium text-gray-700 dark:text-gray-200">{log.file_title}</p>
                </div>
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Performed By</span>
                    <p className="font-medium text-gray-700 dark:text-gray-200">{log.performed_by_name}</p>
                </div>
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${getTypeBadgeClass(log.type)}`}>{log.type}</span>
                </div>
            </div>

            <div className={`mt-3 ${showDetails ? "" : "hidden"}`}>
                <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-600">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">Details</h4>
                            <div className="text-sm text-gray-700 dark:text-gray-200">
                                <p>
                                    <span className="text-gray-500 dark:text-gray-400">IP Address:</span> {log.ipAddress}
                                </p>
                                <p>
                                    <span className="text-gray-500 dark:text-gray-400">User Agent:</span> {log.userAgent}
                                </p>
                                <p>
                                    <span className="text-gray-500 dark:text-gray-400">Level:</span>{" "}
                                    <span className={getLevelTextColor(log.level)}>{log.level}</span>
                                </p>
                            </div>
                        </div>
                        {log.beforeChange && (
                            <div>
                                <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">Changes</h4>
                                <div className="text-sm text-gray-700 dark:text-gray-200">
                                    <p>
                                        <span className="text-gray-500 dark:text-gray-400">Before:</span> {log.beforeChange.ArchivedStatus || "N/A"}
                                    </p>
                                    <p>
                                        <span className="text-gray-500 dark:text-gray-400">After:</span> {log.afterChange.ArchivedStatus || "N/A"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    {log.beforeChange && (
                        <div className="mt-4">
                            <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">Full Changes</h4>
                            <div className="grid max-h-40 grid-cols-1 gap-4 overflow-y-auto text-sm md:grid-cols-2">
                                <div className="rounded bg-gray-50 p-3 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                                    <h5 className="mb-2 font-medium">Before Change</h5>
                                    <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">
                                        {JSON.stringify(log.beforeChange, null, 2)}
                                    </pre>
                                </div>
                                <div className="rounded bg-gray-50 p-3 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                                    <h5 className="mb-2 font-medium">After Change</h5>
                                    <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">
                                        {JSON.stringify(log.afterChange, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LogsAndAudit = () => {
    const { isLogs } = useContext(LogsAndAuditContext);
    const allAuditLogs = isLogs;
    const [filterType, setFilterType] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage] = useState(5);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const uniqueTypes = useMemo(() => {
        const types = new Set(allAuditLogs.map((log) => log.type));
        return ["ALL", ...Array.from(types).sort()];
    }, [allAuditLogs]);

    const filteredLogs = useMemo(() => {
        setCurrentPage(1);
        return allAuditLogs.filter((log) => {
            const logDate = new Date(log.createdAt);

            const matchesType = filterType === "ALL" || log.type === filterType;

            const matchesStartDate = startDate ? logDate >= new Date(startDate) : true;

            const matchesEndDate = endDate ? logDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999)) : true;

            return matchesType && matchesStartDate && matchesEndDate;
        });
    }, [allAuditLogs, filterType, startDate, endDate]);

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (startPage > 1) {
            pageNumbers.push(
                <button
                    key={1}
                    onClick={() => paginate(1)}
                    className="mx-1 rounded-md px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pageNumbers.push(
                    <span key="dots-start" className="mx-1 px-3 py-1 text-gray-500">...</span>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => paginate(i)}
                    className={`mx-1 rounded-md px-3 py-1 ${
                        currentPage === i
                            ? "bg-blue-500 text-white dark:bg-blue-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <span key="dots-end" className="mx-1 px-3 py-1 text-gray-500">...</span>
                );
            }
            pageNumbers.push(
                <button
                    key={totalPages}
                    onClick={() => paginate(totalPages)}
                    className="mx-1 rounded-md px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                    {totalPages}
                </button>
            );
        }

        return pageNumbers;
    };

    return (
        <div className="font-sans transition-colors duration-300">
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-3">
                    <div className="rounded-lg bg-white p-6 shadow transition-colors duration-300 dark:bg-gray-800">
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label
                                    htmlFor="typeFilter"
                                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Type:
                                </label>
                                <select
                                    id="typeFilter"
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-900 shadow-sm transition-colors duration-300 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    {uniqueTypes.map((type) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="startDate"
                                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Start Date:
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-3 text-base text-gray-900 shadow-sm transition-colors duration-300 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="endDate"
                                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    End Date:
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-3 text-base text-gray-900 shadow-sm transition-colors duration-300 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            {isLoading ? (
                                <>
                                    <AuditLogItemSkeleton />
                                    <AuditLogItemSkeleton />
                                    <AuditLogItemSkeleton />
                                </>
                            ) : filteredLogs.length > 0 ? (
                                currentLogs.map((log) => (
                                    <AuditLogItem
                                        key={log._id}
                                        log={log}
                                        isLoading={false}
                                    />
                                ))
                            ) : (
                                <p className="py-8 text-center text-gray-500 dark:text-gray-400">No audit logs found for the selected filters.</p>
                            )}
                        </div>

                        {filteredLogs.length > logsPerPage && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="mx-1 rounded-md bg-gray-200 px-3 py-1 text-gray-700 transition-colors duration-300 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Previous
                                </button>
                                {renderPageNumbers()}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="mx-1 rounded-md bg-gray-200 px-3 py-1 text-gray-700 transition-colors duration-300 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogsAndAudit;
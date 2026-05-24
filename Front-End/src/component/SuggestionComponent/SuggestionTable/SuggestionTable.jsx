import React, { useState, useEffect } from 'react';
import {
    Table as TableIcon,
    Moon,
    Sun,
    Calendar,
    X,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Database,
    Clock,
    Shield,
    AlertTriangle
} from 'lucide-react';
import SuccessFailed from "../../../ReusableFolder/SuccessandField";

export default function Suggestionsetting({
    suggestions = [],
    pagination = {},
    loading = false,
    currentFilters = {},
    onFetchData,
    deleteSuggestion
}) {
    // FIXED: Properly extract pagination values
    const {
        currentPage = 1,
        totalPages = 1,
        total = 0
    } = pagination;

    // FIXED: Get limit from currentFilters
    const limit = currentFilters.limit || 10;

    // Local theme state
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    // Local state para sa date values para makita agad ang napili
    const [localDateFrom, setLocalDateFrom] = useState(currentFilters.dateFrom || "");
    const [localDateTo, setLocalDateTo] = useState(currentFilters.dateTo || "");

    // Local state para sa limit para agad makita ang napili sa dropdown
    const [localLimit, setLocalLimit] = useState(limit);

    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");

    // Modal states
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", isError: false });

    // Sync local state kapag nagbago ang currentFilters galing sa parent
    useEffect(() => {
        setLocalDateFrom(currentFilters.dateFrom || "");
        setLocalDateTo(currentFilters.dateTo || "");
        setLocalLimit(currentFilters.limit || 10);
    }, [currentFilters.dateFrom, currentFilters.dateTo, currentFilters.limit]);

    const triggerToast = (msg, isError = false) => {
        setToast({ show: true, message: msg, isError });
        setTimeout(() => setToast({ show: false, message: "", isError: false }), 3000);
    };

    // Handle date change
    const handleDateChange = (type, value) => {
        if (type === 'dateFrom') {
            setLocalDateFrom(value);
        } else {
            setLocalDateTo(value);
        }

        if (typeof onFetchData === 'function') {
            onFetchData({
                ...currentFilters,
                [type]: value,
                page: 1
            });
        }
    };

    // Handle limit change
    const handleLimitChange = (newLimit) => {
        setLocalLimit(newLimit);

        if (typeof onFetchData === 'function') {
            onFetchData({
                ...currentFilters,
                page: 1,
                limit: newLimit
            });
        }
    };

    // Helper kapag naglipat ng page
    const handlePageChange = (newPage) => {
        if (typeof onFetchData === 'function') {
            onFetchData({
                ...currentFilters,
                page: newPage,
                limit: localLimit
            });
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        setLocalDateFrom("");
        setLocalDateTo("");
        if (typeof onFetchData === 'function') {
            onFetchData({ ...currentFilters, dateFrom: "", dateTo: "", page: 1 });
        }
    };

    // Handle delete confirmation
    const handleDelete = async () => {
        if (!deleteTargetId) return;

        setIsDeleting(true);
        try {
            if (typeof deleteSuggestion === 'function') {
                const result = await deleteSuggestion(deleteTargetId);

                console.log("result", result);
                if (result && result.success === true) {
                    setModalStatus("success");
                    setShowModal(true);
                    // Close delete modal
                    setDeleteTargetId(null);
                    // Refresh data after delete
                    if (typeof onFetchData === 'function') {
                        onFetchData({
                            ...currentFilters,
                            page: currentPage,
                            limit: localLimit
                        });
                    }
                } else {
                    setModalStatus("error");
                    setCustomError(result?.message || "Failed to delete suggestion");
                    setShowModal(true);
                }
            } else {
                triggerToast("❌ Delete function is not available", true);
            }
        } catch (error) {
            console.error("Delete error:", error);
            triggerToast("❌ Failed to delete suggestion. Please try again.", true);
        } finally {
            setIsDeleting(false);
        }
    };

    // Range calculator para sa footer text ng pagination
    const startIndex = total > 0 ? (currentPage - 1) * localLimit + 1 : 0;
    const endIndex = Math.min(currentPage * localLimit, total);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">

            {toast.show && (
                <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center text-sm font-medium animate-fade-in ${toast.isError
                    ? 'bg-red-600 text-white dark:bg-red-500'
                    : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    }`}>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* HEADER */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md">
                            <TableIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Suggestions Manager</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Total Records: {total}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* FILTERS SECTION */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full lg:w-auto">

                        <div className="flex flex-col w-full sm:w-auto">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                <span>Date From</span>
                            </label>
                            <input
                                type="date"
                                value={localDateFrom}
                                onChange={(e) => handleDateChange("dateFrom", e.target.value)}
                                className="w-full sm:w-48 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                            {localDateFrom && (
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                    Selected: {new Date(localDateFrom).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col w-full sm:w-auto">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-violet-500" />
                                <span>Date To</span>
                            </label>
                            <input
                                type="date"
                                value={localDateTo}
                                onChange={(e) => handleDateChange("dateTo", e.target.value)}
                                className="w-full sm:w-48 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                            {localDateTo && (
                                <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                                    Selected: {new Date(localDateTo).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        {(localDateFrom || localDateTo) && (
                            <button
                                onClick={handleClearFilters}
                                className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 transition"
                            >
                                <X className="h-3.5 w-3.5" />
                                <span>Clear Filters</span>
                            </button>
                        )}
                    </div>

                    {/* SELECTOR KUNG ILANG HILERA KADA PAHINA */}
                    <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-medium">Show Rows:</span>
                        <select
                            value={localLimit}
                            onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            {[5, 10, 20, 50, 100].map((v) => (
                                <option key={v} value={v}>{v} rows</option>
                            ))}
                        </select>
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg">
                            Current: {localLimit} per page
                        </span>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(localDateFrom || localDateTo) && (
                    <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Active Date Filter:</span>
                            {localDateFrom && <span>From: {new Date(localDateFrom).toLocaleDateString()}</span>}
                            {localDateTo && <span>To: {new Date(localDateTo).toLocaleDateString()}</span>}
                        </p>
                    </div>
                )}

                {/* MAIN LOADING & TABLE AREA */}
                {loading ? (
                    <div className="my-24 flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading data from context API...</p>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center my-12 min-h-[400px] flex flex-col items-center justify-center">
                        <Database className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No Data Found</h3>
                        <p className="text-base text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                            {localDateFrom || localDateTo
                                ? "No results match the selected date range. Please try adjusting your filters."
                                : "The database may be empty. Start by adding some suggestions."}
                        </p>
                        {(localDateFrom || localDateTo) && (
                            <button
                                onClick={handleClearFilters}
                                className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-2 transition shadow-sm"
                            >
                                <X className="h-4 w-4" />
                                <span>Clear All Filters</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <th className="py-4 px-6">User Email</th>
                                        <th className="py-4 px-6">Suggestion</th>
                                        <th className="py-4 px-6">Authorized Admins</th>
                                        <th className="py-4 px-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                                    {suggestions.map((item) => {
                                        const initials = item.email ? item.email.substring(0, 2).toUpperCase() : "SU";
                                        return (
                                            <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{item.email}</h4>
                                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 min-w-[250px]">
                                                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{item.suggestion}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.adminId && item.adminId.length > 0 ? (
                                                            item.adminId.map((id, idx) => (
                                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                    <Shield className="h-2.5 w-2.5 mr-1 text-indigo-500" />{id}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs italic text-slate-400">Public / Global</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => setDeleteTargetId(item._id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PAGINATION NAVIGATION DOCK */}
                {!loading && suggestions.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startIndex} - {endIndex}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span> items
                            <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                (Limit: {localLimit} per page)
                            </span>
                        </div>

                        <nav className="flex items-center space-x-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:hover:bg-transparent"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 7) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 4) {
                                        pageNum = i + 1;
                                        if (i === 5) pageNum = totalPages - 1;
                                        if (i === 6) pageNum = totalPages;
                                    } else if (currentPage >= totalPages - 3) {
                                        pageNum = totalPages - 6 + i;
                                    } else {
                                        pageNum = currentPage - 3 + i;
                                        if (i === 0) pageNum = 1;
                                        if (i === 1) pageNum = 2;
                                        if (i === 4) pageNum = totalPages - 1;
                                        if (i === 5) pageNum = totalPages;
                                    }

                                    if (pageNum && pageNum > 0 && pageNum <= totalPages) {
                                        const isSelected = pageNum === currentPage;
                                        const isEllipsis = (i === 1 && currentPage > 4 && totalPages > 7) ||
                                            (i === 4 && currentPage < totalPages - 3 && totalPages > 7);

                                        if (isEllipsis && pageNum !== 2 && pageNum !== totalPages - 1) {
                                            return <span key={`ellipsis-${i}`} className="px-2 text-slate-400">...</span>;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-semibold transition ${isSelected
                                                    ? "bg-indigo-600 text-white shadow-md"
                                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:hover:bg-transparent"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </nav>
                    </div>
                )}
            </main>

            {/* DELETE CONFIRMATION MODAL */}
            {deleteTargetId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-6 text-center border dark:border-slate-700 shadow-xl">
                        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Are you sure?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This action cannot be undone or reversed.</p>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                onClick={() => setDeleteTargetId(null)}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete Completely</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FEEDBACK MODAL (Success or Fail) */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
        </div>
    );
}
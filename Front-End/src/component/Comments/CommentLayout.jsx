import React, { useEffect, useState, useRef, useContext } from "react";
import { CheckCircle, XCircle, Search, Filter, User, RefreshCw, MoreVertical, Calendar } from "lucide-react"; // Added Calendar icon
import { CommentsDisplayContext } from "../../contexts/CommentsContext/CommentsContext";

const CommentReview = () => {
    const { allcomments, setIsComments, getAllComments, UpdateStatus } = useContext(CommentsDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [currentOpenDropdownId, setCurrentOpenDropdownId] = useState(null);
    const dropdownRefs = useRef({});

    // NEW: State for date filters
    const [startDate, setStartDate] = useState(""); // Stores date in YYYY-MM-DD format
    const [endDate, setEndDate] = useState(""); // Stores date in YYYY-MM-DD format

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            await getAllComments();
            setLoading(false);
        };
        fetchComments();
    }, [getAllComments]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.keys(dropdownRefs.current).forEach((id) => {
                if (dropdownRefs.current[id] && !dropdownRefs.current[id].contains(event.target) && currentOpenDropdownId === id) {
                    setCurrentOpenDropdownId(null);
                }
            });
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [currentOpenDropdownId]);

    const handleApprove = async (comment) => {
        await UpdateStatus(comment._id, "Approved");
        setCurrentOpenDropdownId(null);
    };

    const handleReject = async (comment) => {
        await UpdateStatus(comment._id, "Rejected");
        setCurrentOpenDropdownId(null);
    };

    const handleRefresh = async () => {
        setLoading(true);
        await getAllComments();
        setLoading(false);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case "Approved":
                return { color: "text-green-700 bg-green-50 border-green-200", label: "Approved", icon: <CheckCircle size={16} /> };
            case "Rejected":
                return { color: "text-red-700 bg-red-50 border-red-200", label: "Rejected", icon: <XCircle size={16} /> };
            case "Pending":
            default:
                return { color: "text-amber-700 bg-amber-50 border-amber-200", label: "Pending Review", icon: <RefreshCw size={16} /> };
        }
    };

    const filteredComments = allcomments.filter((comment) => {
        const commentText = comment.commentText || "";
        const userId = comment.userId || "";

        const matchesSearch = commentText.toLowerCase().includes(searchTerm.toLowerCase()) || userId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || comment.status === filterStatus;

        // NEW: Date filter logic
        const commentDate = new Date(comment.timestamp);
        let matchesDateRange = true;

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); // Start of the day
            if (commentDate < start) {
                matchesDateRange = false;
            }
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // End of the day
            if (commentDate > end) {
                matchesDateRange = false;
            }
        }

        return matchesSearch && matchesStatus && matchesDateRange;
    });

    const statusCounts = {
        all: allcomments.length,
        pending: allcomments.filter((c) => c.status === "Pending").length,
        approved: allcomments.filter((c) => c.status === "Approved").length,
        rejected: allcomments.filter((c) => c.status === "Rejected").length,
    };

    const toggleDropdown = (id) => {
        setCurrentOpenDropdownId(currentOpenDropdownId === id ? null : id);
    };

    return (
        <div className="flex min-h-screen items-center justify-center ">
            <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800 md:p-8">
                <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-3xl">Comment Review Dashboard</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Manage and moderate user comments</p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="mt-4 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 md:mt-0"
                    >
                        <RefreshCw
                            size={18}
                            className={`mr-2 ${loading ? "animate-spin" : ""}`}
                        />
                        Refresh Comments
                    </button>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                        <div className="text-xl font-bold text-blue-800">{statusCounts.all}</div>
                        <div className="text-sm text-blue-600">Total Comments</div>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                        <div className="text-xl font-bold text-amber-800">{statusCounts.pending}</div>
                        <div className="text-sm text-amber-600">Pending Review</div>
                    </div>
                    <div className="rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                        <div className="text-xl font-bold text-green-800">{statusCounts.approved}</div>
                        <div className="text-sm text-green-600">Approved</div>
                    </div>
                    <div className="rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50 p-4">
                        <div className="text-xl font-bold text-red-800">{statusCounts.rejected}</div>
                        <div className="text-sm text-red-600">Rejected</div>
                    </div>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search comments or users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        />
                    </div>

                    <div className="flex w-full space-x-2 md:w-auto">
                        {/* NEW: Date From Filter */}
                        <div className="relative flex-grow">
                            <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-300" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" // appearance-none to handle default date picker styling
                            />
                        </div>

                        {/* NEW: Date To Filter */}
                        <div className="relative flex-grow">
                            <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-300" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            />
                        </div>

                        <div className="relative w-full md:w-48">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Filter className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-gray-200">{filteredComments.length} Comments to Review</h2>

                {loading ? (
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-xl border border-gray-200 p-6 dark:border-gray-600 dark:bg-gray-700"
                            >
                                <div className="mb-4 flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                                    <div className="ml-3">
                                        <div className="mb-2 h-4 w-32 rounded bg-gray-200 dark:bg-gray-600"></div>
                                        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-600"></div>
                                    </div>
                                    <div className="ml-auto h-4 w-16 rounded bg-gray-200 dark:bg-gray-600"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-600"></div>
                                    <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-600"></div>
                                </div>
                                <div className="mt-4 flex space-x-3">
                                    <div className="h-9 w-24 rounded bg-gray-200 dark:bg-gray-600"></div>
                                    <div className="h-9 w-24 rounded bg-gray-200 dark:bg-gray-600"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredComments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 dark:border-gray-600 dark:bg-gray-700">
                        <Search className="mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200">No comments found</h3>
                        <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                            {searchTerm
                                ? "No comments match your search criteria. Try a different search term."
                                : "There are no comments to review with the current filter."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredComments.map((comment) => {
                            const { color, label, icon } = getStatusInfo(comment.status);
                            const date = new Date(comment.timestamp);
                            const formattedDate = date.toLocaleDateString();
                            const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                            return (
                                <div
                                    key={comment.id}
                                    className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-600 dark:bg-gray-700"
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-white">
                                                {(comment.userId || "").charAt(0).toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="ml-4 flex-grow">
                                            <div className="flex flex-wrap items-center justify-between">
                                                <div>
                                                    <h3 className="flex items-center font-semibold text-gray-900 dark:text-gray-100">
                                                        {comment.userId}
                                                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs font-normal text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                                                            User ID: **{(comment.id || "").slice(0, 8)}**
                                                        </span>
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        {formattedDate} at {formattedTime}
                                                    </p>
                                                </div>

                                                <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                                                    <div className={`flex items-center rounded-full border px-3 py-1 text-sm font-medium ${color}`}>
                                                        {icon}
                                                        <span className="ml-1.5">{label}</span>
                                                    </div>

                                                    <div
                                                        className="relative"
                                                        ref={(el) => (dropdownRefs.current[comment.id] = el)}
                                                    >
                                                        <button
                                                            onClick={() => toggleDropdown(comment.id)}
                                                            className="flex items-center justify-center rounded-lg px-3 py-2 text-gray-500 transition duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {currentOpenDropdownId === comment.id && (
                                                            <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                                                                <button
                                                                    onClick={() => handleApprove(comment)}
                                                                    className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                                                >
                                                                    <CheckCircle
                                                                        size={16}
                                                                        className="mr-2 text-green-600"
                                                                    />
                                                                    <span>Approve</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(comment)}
                                                                    className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                                                >
                                                                    <XCircle
                                                                        size={16}
                                                                        className="mr-2 text-red-600"
                                                                    />
                                                                    <span>Reject</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <p className="rounded-lg border border-gray-100 bg-gray-50 p-4 leading-relaxed text-gray-800 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-200">
                                                    "{comment.commentText || "No comment text available."}"
                                                </p>
                                            </div>

                                            <div className="mt-5 flex space-x-3">
                                                {comment.status === "Pending" ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(comment.id)}
                                                            className="flex items-center justify-center rounded-lg bg-green-100 px-4 py-2 text-green-700 transition duration-200 ease-in-out hover:bg-green-200"
                                                        >
                                                            <CheckCircle
                                                                size={18}
                                                                className="mr-2"
                                                            />{" "}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(comment.id)}
                                                            className="flex items-center justify-center rounded-lg bg-red-100 px-4 py-2 text-red-700 transition duration-200 ease-in-out hover:bg-red-200"
                                                        >
                                                            <XCircle
                                                                size={18}
                                                                className="mr-2"
                                                            />{" "}
                                                            Rejected
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div
                                                        className={`flex items-center rounded-lg px-4 py-2 ${comment.status === "Approved" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                                                    >
                                                        {comment.status === "Approved" ? (
                                                            <CheckCircle
                                                                size={18}
                                                                className="mr-2"
                                                            />
                                                        ) : (
                                                            <XCircle
                                                                size={18}
                                                                className="mr-2"
                                                            />
                                                        )}
                                                        <span>This comment is {comment.status}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentReview;

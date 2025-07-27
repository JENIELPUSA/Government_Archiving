import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, XCircle, Folder, FileText, ArrowLeft, Loader2, ListTodo, Bell } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import FolderCard from "./FolderCard";
import DocumentTableList from "./DocumentTableList";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext";

const SkeletonPieChart = () => (
    <div className="flex h-[280px] w-full flex-col items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
        <div className="h-40 w-40 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="mt-4 flex space-x-4">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="flex items-center"
                >
                    <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <div className="ml-2 h-3 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                </div>
            ))}
        </div>
    </div>
);

const SkeletonFolderCard = () => (
    <div className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="ml-3">
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-6 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
        <div className="mt-2 h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
);

const SkeletonStorageBar = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
);

const SkeletonTableRow = () => (
    <tr>
        {[1, 2, 3, 4, 5].map((cell) => (
            <td
                key={cell}
                className="whitespace-nowrap px-6 py-4"
            >
                <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </td>
        ))}
    </tr>
);

const OfficerDashboard = () => {
    const { isOfficerData, setOfficerData } = useContext(OfficerDisplayContext);
    const [activeSection, setActiveSection] = useState("summary");
    const [selectedFolderStatus, setSelectedFolderStatus] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [previousSection, setPreviousSection] = useState("summary");
    const [showSidebar, setShowSidebar] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                await new Promise((resolve) => setTimeout(resolve, 500));

                if (!isMounted) return;
                setOfficerData(mockOfficerData?.data || []);
                setNotifications(mockNotifications || []);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // Cleanup function to prevent state updates on unmounted component
        return () => {
            isMounted = false;
        };
    }, [setOfficerData]);

    const handlePdfView = () => {
        if (!selectedDocument) return;
        const fileId = selectedDocument._id;
        const fileData = selectedDocument;

        console.log("JKKKJJKKJJKKJ",fileData)
        navigate(`/dashboard/pdf-viewer/${fileId}`, { state: { fileData } });
    };

    const approvedDocuments = useMemo(() => {
        return isOfficerData ? isOfficerData.filter((doc) => doc.status === "Approved" && doc.ArchivedStatus === "Active") : [];
    }, [isOfficerData]);

    const pendingDocuments = useMemo(() => {
        return isOfficerData ? isOfficerData.filter((doc) => doc.status === "Pending" && doc.ArchivedStatus === "Active") : [];
    }, [isOfficerData]);

    const rejectedDocuments = useMemo(() => {
        return isOfficerData ? isOfficerData.filter((doc) => doc.status === "Rejected" && doc.ArchivedStatus === "Active") : [];
    }, [isOfficerData]);

    const recentDocuments = useMemo(() => {
        if (!isOfficerData) return [];
        return [...isOfficerData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    }, [isOfficerData]);

    const statusCounts = useMemo(() => {
        const counts = { Approved: 0, Pending: 0, Rejected: 0, Draft: 0 };

        isOfficerData
            ?.filter((doc) => doc.ArchivedStatus === "Active")
            .forEach((doc) => {
                if (counts[doc.status] !== undefined) {
                    counts[doc.status]++;
                }
            });

        return Object.keys(counts)
            .map((status) => ({
                name: status,
                value: counts[status],
            }))
            .filter((item) => item.value > 0);
    }, [isOfficerData]);

    const COLORS = ["#82ca9d", "#ffc658", "#ff7380", "#8884d8"];

    // Add this constant at the top of the file (outside the component)
    const TOTAL_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

    // Inside the OfficerDashboard component:

    // Remove the existing consumedStorage useMemo and replace it with:
    const totalStorageUsedBytes = useMemo(() => {
        if (!isOfficerData || isOfficerData.length === 0) return 0;
        return isOfficerData.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
    }, [isOfficerData]);

    const storagePercentage = useMemo(() => {
        return (totalStorageUsedBytes / TOTAL_STORAGE_BYTES) * 100;
    }, [totalStorageUsedBytes]);

    // Helper function to format storage
    const formatStorage = (bytes) => {
        if (bytes < 1024) return { value: bytes, unit: "bytes", formatted: `${bytes} bytes` };
        if (bytes < 1024 * 1024) return { value: bytes / 1024, unit: "KB", formatted: `${(bytes / 1024).toFixed(0)} KB` };
        if (bytes < 1024 * 1024 * 1024) return { value: bytes / (1024 * 1024), unit: "MB", formatted: `${(bytes / (1024 * 1024)).toFixed(2)} MB` };
        return { value: bytes / (1024 * 1024 * 1024), unit: "GB", formatted: `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB` };
    };

    // Usage in the JSX:
    const consumedStorage = formatStorage(totalStorageUsedBytes);
    const totalStorage = formatStorage(TOTAL_STORAGE_BYTES);

    const isNewDocument = useCallback((createdAt) => {
        const twentyFourHours = 24 * 60 * 60 * 1000;
        return new Date() - new Date(createdAt) < twentyFourHours;
    }, []);

    const handleViewDocument = (doc) => {
        setSelectedDocument(doc);
        setPreviousSection(activeSection);
        setActiveSection("detail");
        if (showSidebar) setShowSidebar(false);
    };

    const handleBack = () => {
        setSelectedDocument(null);

        if (activeSection === "detail") {
            setActiveSection(previousSection);
        } else if (activeSection === "folderContent" || activeSection === "allDocuments") {
            setSelectedFolderStatus(null);
            setActiveSection("summary");
        }
    };

    const handleOpenFolder = (status) => {
        setSelectedFolderStatus(status);
        setPreviousSection("summary");
        setActiveSection("folderContent");
        if (showSidebar) setShowSidebar(false);
    };

    const handleNotificationClick = (notif) => {
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));

        if (notif.type === "document_status" || notif.type === "new_document") {
            const doc = isOfficerData.find((d) => d._id === notif.documentId);
            if (doc) {
                handleViewDocument(doc);
            } else {
                alert("Document not found.");
            }
        }
    };

    const handleDismissNotification = (id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    };

    return (
        <div className="flex">
            <div
                className={`font-inter min-h-screen w-full flex-1 bg-gray-100 p-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100 md:p-6 lg:p-8 ${showSidebar ? "pr-80" : ""}`}
            >
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="skeleton-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {/* Pie Chart Skeleton */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
                                    <div className="mb-4 h-7 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    <SkeletonPieChart />
                                </div>

                                <div className="flex flex-col gap-6 lg:col-span-2">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {[1, 2, 3].map((item) => (
                                            <SkeletonFolderCard key={item} />
                                        ))}
                                    </div>

                                    <SkeletonStorageBar />
                                </div>
                            </div>

                            {/* Recent Documents Table Skeleton */}
                            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <div className="mb-4 flex items-center">
                                    <div className="mr-2 h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                    <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                {["Filename", "Submitted By", "Date", "Status", "Action"].map((header) => (
                                                    <th
                                                        key={header}
                                                        scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                    >
                                                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                            {[1, 2, 3, 4, 5].map((row) => (
                                                <SkeletonTableRow key={row} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        // Actual content when not loading
                        <>
                            {activeSection === "summary" && (
                                <motion.div
                                    key="summary-view"
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
                                            <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">Document Status Overview</h2>
                                            <ResponsiveContainer
                                                width="100%"
                                                height={280}
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={statusCounts}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={90}
                                                        innerRadius={50}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        paddingAngle={5}
                                                    >
                                                        {statusCounts.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={COLORS[index % COLORS.length]}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: "rgba(0,0,0,0.7)",
                                                            border: "none",
                                                            borderRadius: "8px",
                                                            color: "white",
                                                        }}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{ paddingTop: "20px" }}
                                                        formatter={(value, entry) => (
                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                {value} ({entry.payload.value})
                                                            </span>
                                                        )}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="flex flex-col gap-6 lg:col-span-2">
                                            <motion.div
                                                key="folder-cards-grid"
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                                className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                                            >
                                                <FolderCard
                                                    count={approvedDocuments.length}
                                                    folderName="Approved"
                                                    icon={CheckCircle}
                                                    iconColorClass="text-green-500"
                                                    onClick={() => handleOpenFolder("Approved")}
                                                    isActive={selectedFolderStatus === "Approved"}
                                                    newCount={approvedDocuments.filter(isNewDocument).length}
                                                />
                                                <FolderCard
                                                    count={pendingDocuments.length}
                                                    folderName="Pending"
                                                    icon={Clock}
                                                    iconColorClass="text-yellow-500"
                                                    onClick={() => handleOpenFolder("Pending")}
                                                    isActive={selectedFolderStatus === "Pending"}
                                                    newCount={pendingDocuments.filter(isNewDocument).length}
                                                />
                                                <FolderCard
                                                    count={rejectedDocuments.length}
                                                    folderName="Rejected"
                                                    icon={XCircle}
                                                    iconColorClass="text-red-500"
                                                    onClick={() => handleOpenFolder("Rejected")}
                                                    isActive={selectedFolderStatus === "Rejected"}
                                                    newCount={rejectedDocuments.filter(isNewDocument).length}
                                                />
                                            </motion.div>

                                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition-all hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Storage Consumption</h2>
                                                    </div>
                                                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                        {storagePercentage.toFixed(2)}%
                                                    </span>
                                                </div>

                                                <div className="mt-6">
                                                    <div className="mb-2 flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        <span>{consumedStorage.formatted} used</span>
                                                        <span>{totalStorage.formatted} total</span>
                                                    </div>
                                                    <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                        <div
                                                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-300 shadow-inner transition-all duration-700 ease-out"
                                                            style={{ width: `${storagePercentage}%` }}
                                                        >
                                                            <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-white opacity-80 shadow-sm"></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                    <span>0%</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                        <h2 className="mb-4 flex items-center text-xl font-bold text-gray-800 dark:text-white">
                                            <ListTodo className="mr-2 h-6 w-6 text-indigo-600" /> Recent Documents
                                        </h2>
                                        <div className="overflow-x-auto">
                                            {recentDocuments.length > 0 ? (
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                            >
                                                                Filename
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                            >
                                                                Title
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                            >
                                                                Date
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                            >
                                                                Status
                                                            </th>
    
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                                        {recentDocuments.map((doc, index) => (
                                                            <motion.tr
                                                                key={doc._id || index}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                            >
                                                                <td className="whitespace-nowrap px-6 py-4">
                                                                    <div className="flex items-center">
                                                                        <FileText className="mr-2 h-5 w-5 text-gray-500" />
                                                                        <div className="max-w-xs truncate text-sm font-medium text-gray-900 dark:text-white">
                                                                            {doc.fileName}
                                                                            {isNewDocument(doc.createdAt) && (
                                                                                <span className="ml-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                                                                                    New
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="whitespace-nowrap px-6 py-4">
                                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                                        {doc.title}
                                                                    </div>
                                                                </td>
                                                                <td className="whitespace-nowrap px-6 py-4">
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {new Date(doc.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                </td>
                                                                <td className="whitespace-nowrap px-6 py-4">
                                                                    <span
                                                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${doc.status === "Approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""} ${doc.status === "Pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : ""} ${doc.status === "Rejected" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : ""} ${doc.status === "Draft" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : ""} `}
                                                                    >
                                                                        {doc.status}
                                                                    </span>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                                                    <p>No recent documents to display.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === "folderContent" && selectedFolderStatus && (
                                <DocumentTableList
                                    documents={
                                        selectedFolderStatus === "Approved"
                                            ? approvedDocuments
                                            : selectedFolderStatus === "Pending"
                                              ? pendingDocuments
                                              : rejectedDocuments
                                    }
                                    title={`${selectedFolderStatus} Documents`}
                                    icon={selectedFolderStatus === "Approved" ? CheckCircle : selectedFolderStatus === "Pending" ? Clock : XCircle}
                                    iconColorClass={
                                        selectedFolderStatus === "Approved"
                                            ? "text-green-500"
                                            : selectedFolderStatus === "Pending"
                                              ? "text-yellow-500"
                                              : "text-red-500"
                                    }
                                    onBack={handleBack}
                                    onViewDocument={handleViewDocument}
                                    isNewDocument={isNewDocument}
                                />
                            )}

                            {activeSection === "detail" && selectedDocument && (
                                <motion.div
                                    key="document-detail-view"
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <button
                                        onClick={handleBack}
                                        className="mb-6 flex items-center font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                        Back to {previousSection === "summary" ? "Dashboard Summary" : "Document List"}
                                    </button>

                                    <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <FileText className="mr-3 h-7 w-7 text-indigo-600" />
                                            <h2 className="max-w-md truncate text-2xl font-bold text-gray-800 dark:text-white">
                                                {selectedDocument.title}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                        <p>
                                            <strong>Filename:</strong> {selectedDocument.fileName}
                                        </p>
                                        <p>
                                            <strong>Summary:</strong> {selectedDocument.summary}
                                        </p>
                                        <p>
                                            <strong>Author:</strong> {selectedDocument.author}
                                        </p>
                                        <p>
                                            <strong>Category:</strong> {selectedDocument.category}
                                        </p>
                                        <p>
                                            <strong>Officer In Charge:</strong> {selectedDocument.officer_first_name}{" "}
                                            {selectedDocument.officer_last_name}
                                        </p>
                                        <p>
                                            <strong>Status:</strong>
                                            <span
                                                className={`ml-2 inline-flex rounded-full px-2 text-sm font-semibold leading-5 ${selectedDocument.status === "Approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""} ${selectedDocument.status === "Pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : ""} ${selectedDocument.status === "Rejected" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : ""} ${selectedDocument.status === "Draft" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : ""} `}
                                            >
                                                {selectedDocument.status}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Created At:</strong> {new Date(selectedDocument.createdAt).toLocaleString()}
                                        </p>
                                        <p>
                                            <strong>Last Updated:</strong> {new Date(selectedDocument.updatedAt).toLocaleString()}
                                        </p>
                                        {selectedDocument.archivedMetadata && (
                                            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                                <p>
                                                    <strong>Archived Status:</strong> {selectedDocument.ArchivedStatus}
                                                </p>
                                                <p>
                                                    <strong>Date Archived:</strong>{" "}
                                                    {new Date(selectedDocument.archivedMetadata.dateArchived).toLocaleString()}
                                                </p>
                                                <p>
                                                    <strong>Archived By:</strong> {selectedDocument.archivedMetadata.archivedBy}
                                                </p>
                                                <p>
                                                    <strong>Archiving Notes:</strong> {selectedDocument.archivedMetadata.notes}
                                                </p>
                                            </div>
                                        )}
                                        <div className="mt-6">
                                            <a
                                                onClick={handlePdfView}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                            >
                                                <FileText className="mr-2 h-5 w-5" /> View Full Document ({selectedDocument.fullText})
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {showSidebar && (
                    <Sidebar
                        notifications={notifications}
                        onNotificationClick={handleNotificationClick}
                        onDismissNotification={handleDismissNotification}
                        onClose={() => setShowSidebar(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default OfficerDashboard;

import React, { useState, useEffect, useRef, useContext } from "react";
import { FileText, UploadCloud, UserCheck, HardDrive } from "lucide-react";
import StatisticsCard from "../AdminDashboard/dashboardcard";
import LineGraph from "./LineGraph";
import PieGraph from "./PieGraph";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import { AdminDisplayContext } from "../../contexts/AdminContext/AdminContext";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext";
import useAutoLogout from "../../../../Back-End/Utils/useAutoLogout";
import { useNavigate } from "react-router-dom";

// AnimatedValue - ILABAS SA LABAS NG DashboardLayout
const AnimatedValue = ({ targetValue, duration = 1500, suffix = "", precision = 2 }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const finalTargetValue = typeof targetValue === "number" ? targetValue : 0;
        let startTimestamp = null;

        const animate = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = (timestamp - startTimestamp) / duration;

            if (progress < 1) {
                const easedProgress = 1 - Math.pow(1 - progress, 3); // easing
                const animated = easedProgress * finalTargetValue;
                setCurrentValue(parseFloat(animated.toFixed(precision)));
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setCurrentValue(parseFloat(finalTargetValue.toFixed(precision)));
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [targetValue, duration, precision]);

    return (
        <span>
            {currentValue.toLocaleString(undefined, {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
            })}
            {suffix}
        </span>
    );
};

// Custom AnimatedStorage Component para sa storage na auto-convert sa GB/MB
const AnimatedStorage = ({ totalBytes, duration = 1500 }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const [suffix, setSuffix] = useState("MB");
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (!totalBytes || totalBytes === 0) {
            setCurrentValue(0);
            setSuffix("MB");
            return;
        }

        const totalMB = totalBytes / (1024 * 1024);
        const shouldUseGB = totalMB >= 1024;
        const finalValue = shouldUseGB ? totalMB / 1024 : totalMB;
        const finalSuffix = shouldUseGB ? " GB" : " MB";

        let startTimestamp = null;

        const animate = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = (timestamp - startTimestamp) / duration;

            if (progress < 1) {
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const animated = easedProgress * finalValue;
                setCurrentValue(parseFloat(animated.toFixed(2)));
                setSuffix(finalSuffix);
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setCurrentValue(parseFloat(finalValue.toFixed(2)));
                setSuffix(finalSuffix);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [totalBytes, duration]);

    return (
        <span>
            {currentValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
            {suffix}
        </span>
    );
};

// Main Dashboard Component
function DashboardLayout() {
    const navigate = useNavigate();
    const { isFile, isTotaDocuments, isTodayDocuments, isMonthlyFile, categorySummary, MonthlyUploads, fetchCategorySummary } =
        useContext(FilesDisplayContext);
    const { isTotalAdmin } = useContext(AdminDisplayContext);
    const { isTotalOfficer } = useContext(OfficerDisplayContext);
    const documents = isFile;
    const totalDocuments = isTotaDocuments;
    const activeUsers = isTotalAdmin + (isTotalOfficer || 0); // Kasama ang officers sa active users

    // Gamitin ang useRef para i-track kung initial render na ba
    const hasFetchedRef = useRef(false);
    const isMountedRef = useRef(true);

    useAutoLogout(() => {
        localStorage.removeItem("token");
        navigate("/login");
    });

    // Function para kalkulahin ang total bytes
    const getTotalBytes = () => {
        if (!Array.isArray(isMonthlyFile)) return 0;

        return isMonthlyFile.reduce((sum, month) => sum + (typeof month.totalFileSize === "number" ? month.totalFileSize : 0), 0);
    };

    // Eto ang useEffect para sa fetchCategorySummary na may useRef
    useEffect(() => {
        // Set isMountedRef to true sa component mount
        isMountedRef.current = true;

        // Tawagin ang fetchCategorySummary sa initial render lang
        if (isMountedRef.current && !hasFetchedRef.current && fetchCategorySummary) {
            fetchCategorySummary();
            hasFetchedRef.current = true; // Mark as fetched
        }

        // Cleanup function
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchCategorySummary]); // May dependencies pero safe na

    // Optional: Maaari ring gumamit ng interval para mag-refresh ng data periodically
    const refreshIntervalRef = useRef(null);
    
    useEffect(() => {
        // Setup para sa periodic refresh (every 30 seconds)
        const setupRefresh = () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }

            refreshIntervalRef.current = setInterval(() => {
                if (isMountedRef.current && fetchCategorySummary) {
                    console.log("Refreshing category summary data...");
                    fetchCategorySummary();
                }
            }, 30000); // 30 seconds
        };

        setupRefresh();

        // Cleanup function
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [fetchCategorySummary]);

    // Alternative approach: Gamit ang useRef para i-track ang previous values
    const prevCategorySummaryRef = useRef(categorySummary);
    
    useEffect(() => {
        // Compare current at previous categorySummary
        if (JSON.stringify(categorySummary) !== JSON.stringify(prevCategorySummaryRef.current)) {
            prevCategorySummaryRef.current = categorySummary;
        }
    }, [categorySummary]);

    const statisticsData = [
        {
            icon: <FileText size={26} />,
            value: <AnimatedValue targetValue={totalDocuments} />,
            label: "Total Documents",
            trend: "Calculated",
        },
        {
            icon: <UploadCloud size={26} />,
            value: <AnimatedValue targetValue={isTodayDocuments} />,
            label: "New Documents (Today)",
            trend: "Calculated",
        },
        {
            icon: <UserCheck size={26} />,
            value: <AnimatedValue targetValue={activeUsers} />,
            label: "Active Users",
            trend: "15%",
        },
        {
            icon: <HardDrive size={26} />,
            value: <AnimatedStorage totalBytes={getTotalBytes()} />,
            label: "Total Storage Used",
            trend: "Calculated",
        },
    ];

    const [activeModal, setActiveModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDocuments, setFilteredDocuments] = useState(documents);
    const initialCategories = [...new Set(documents.map((doc) => doc.category))];
    const [categories, setCategories] = useState(initialCategories);
    const [reportMessage, setReportMessage] = useState("");
    const uniqueDocumentTypes = ["All Types", ...new Set(documents.map((doc) => doc.fullText))];
    const [selectedType, setSelectedType] = useState("All Types");
    const [currentPageDocuments, setCurrentPageDocuments] = useState(1);
    const [documentsPerPage] = useState(5);

    // Gamit ang useRef para sa debouncing ng search
    const searchTimeoutRef = useRef(null);
    
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Debouncing: hintayin muna mag-stop ang user bago i-filter
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                let currentDocs = isFile || [];

                if (value) {
                    currentDocs = currentDocs.filter(
                        (doc) =>
                            doc.title?.toLowerCase().includes(value.toLowerCase()) ||
                            doc.summary?.toLowerCase().includes(value.toLowerCase()) ||
                            doc.author?.toLowerCase().includes(value.toLowerCase()) ||
                            doc.fileName?.toLowerCase().includes(value.toLowerCase()) ||
                            doc.tags?.some((tag) => tag.toLowerCase().includes(value.toLowerCase())) ||
                            doc.category?.toLowerCase().includes(value.toLowerCase()) ||
                            doc.department?.toLowerCase().includes(value.toLowerCase()),
                    );
                }

                if (selectedType !== "All Types") {
                    currentDocs = currentDocs.filter((doc) => doc.fullText === selectedType);
                }

                setFilteredDocuments(currentDocs);
                setCurrentPageDocuments(1);
            }
        }, 300); // 300ms delay
    };

    // Original useEffect para sa search (pwede mo pa ring gamitin ito)
    useEffect(() => {
        let currentDocs = isFile || [];

        if (searchQuery) {
            currentDocs = currentDocs.filter(
                (doc) =>
                    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    doc.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.department?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        if (selectedType !== "All Types") {
            currentDocs = currentDocs.filter((doc) => doc.fullText === selectedType);
        }

        setFilteredDocuments(currentDocs);
        setCurrentPageDocuments(1);
    }, [searchQuery, selectedType, isFile]);

    // Gamit ang useRef para i-track kung naka-mount pa ang component bago mag-setState
    const generateReport = () => {
        if (!isMountedRef.current) return;
        
        setReportMessage("Generating comprehensive archive report... (Simulated)");
        
        const timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
                setReportMessage("Report generated successfully! (Simulated)");
            }
        }, 2000);
        
        // Store timeout ID sa ref para ma-clear sa cleanup
        const reportTimeoutRef = useRef(timeoutId);
        
        return () => {
            if (reportTimeoutRef.current) {
                clearTimeout(reportTimeoutRef.current);
            }
        };
    };

    return (
        <div className="font-inter flex min-h-screen flex-col items-center justify-center overflow-hidden transition-colors duration-300">
            <main className="mx-auto flex w-full flex-1 flex-col space-y-10 rounded-3xl bg-white/60 p-6 text-gray-900 shadow-inner backdrop-blur-md transition-colors duration-300 dark:bg-slate-800/50 dark:text-gray-100 dark:backdrop-blur-md">
                <section>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {statisticsData.map((stat, index) => (
                            <StatisticsCard
                                key={index}
                                {...stat}
                            />
                        ))}
                    </div>
                </section>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="min-h-[300px] w-full overflow-hidden lg:w-1/2">
                        <LineGraph MonthlyUploads={MonthlyUploads} />
                    </div>
                    <div className="min-h-[300px] w-full overflow-hidden lg:w-1/2">
                        <PieGraph categorySummary={categorySummary} />
                    </div>
                </div>
            </main>

            {/* Modals */}
            {activeModal === "reports" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-75 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl transition-colors duration-300 dark:bg-gray-800">
                        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">View Reports</h3>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">
                            Here you can generate various reports about the archiving system, such as document statistics, user activity, storage
                            usage, and more.
                        </p>
                        <button
                            className="w-full rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
                            onClick={generateReport}
                        >
                            Generate Comprehensive Report
                        </button>
                        {reportMessage && <p className="mt-4 text-center text-green-600 dark:text-green-400">{reportMessage}</p>}
                        <button
                            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                            onClick={() => setActiveModal(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {activeModal === "profile" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-75 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl transition-colors duration-300 dark:bg-gray-800">
                        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">User Profile & Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Username:</label>
                                <input
                                    type="text"
                                    value="AdminUser"
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Email:</label>
                                <input
                                    type="email"
                                    value="admin@example.com"
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Role:</label>
                                <input
                                    type="text"
                                    value="Administrator"
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                />
                            </div>
                        </div>
                        <button
                            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                            onClick={() => setActiveModal(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {activeModal === "notifications" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-75 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl transition-colors duration-300 dark:bg-gray-800">
                        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">You have no new notifications at the moment.</p>
                        <button
                            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                            onClick={() => setActiveModal(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardLayout;
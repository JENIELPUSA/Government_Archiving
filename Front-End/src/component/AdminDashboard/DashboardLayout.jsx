import React, { useState, useEffect, useRef, useContext } from "react";
import { FileText, UploadCloud, UserCheck, HardDrive, Globe } from "lucide-react";
import StatisticsCard from "../AdminDashboard/dashboardcard";
import LineGraph from "./LineGraph";
import PieGraph from "./PieGraph";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import { AdminDisplayContext } from "../../contexts/AdminContext/AdminContext";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext";

const AnimatedValue = ({ targetValue, duration = 1500, suffix = "", precision = 2 }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        let startTimestamp = null;

        const animate = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = (timestamp - startTimestamp) / duration;

            if (progress < 1) {
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const animated = easedProgress * targetValue;
                setCurrentValue(parseFloat(animated.toFixed(precision)));
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setCurrentValue(parseFloat(targetValue.toFixed(precision)));
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [targetValue, duration, precision]);

    return <span>{currentValue.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}{suffix}</span>;
};

function DashboardLayout() {
    const {isFile}=useContext(FilesDisplayContext)
    const {isTotalAdmin}=useContext(AdminDisplayContext);
    const {isTotalOfficer}=useContext(OfficerDisplayContext)
    const documents = isFile;

    const totalDocuments = documents.length;
    const newDocumentsToday = documents.filter(doc => {
        const docDate = new Date(doc.createdAt);
        const today = new Date();
        return docDate.getDate() === today.getDate() &&
               docDate.getMonth() === today.getMonth() &&
               docDate.getFullYear() === today.getFullYear();
    }).length;

    const activeUsers = isTotalAdmin  + isTotalOfficer;
    const totalStorageUsedBytes = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

    const formatStorage = (bytes) => {
        if (bytes < 1024) return { value: bytes, unit: 'bytes' };
        if (bytes < 1024 * 1024) return { value: bytes / 1024, unit: 'KB' };
        if (bytes < 1024 * 1024 * 1024) return { value: bytes / (1024 * 1024), unit: 'MB' };
        return { value: bytes / (1024 * 1024 * 1024), unit: 'GB' };
    };

    const storage = formatStorage(totalStorageUsedBytes);
    const storagePrecision = storage.unit === 'bytes' || storage.unit === 'KB' ? 0 : 2;

    const statisticsData = [
        {
            icon: <FileText size={26} />,
            value: <AnimatedValue targetValue={totalDocuments} />,
            label: "Total Documents",
            trend: "Calculated",
        },
        {
            icon: <UploadCloud size={26} />,
            value: <AnimatedValue targetValue={newDocumentsToday} />,
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
            value: <AnimatedValue
                           targetValue={storage.value}
                           suffix={` ${storage.unit}`}
                           precision={storagePrecision}
                         />,
            label: "Storage Used",
            trend: "Calculated",
        },
    ];

    const [activeModal, setActiveModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDocuments, setFilteredDocuments] = useState(documents);
    const [newCategory, setNewCategory] = useState("");
    const initialCategories = [...new Set(documents.map(doc => doc.category))];
    const [categories, setCategories] = useState(initialCategories);
    const [reportMessage, setReportMessage] = useState("");
    const uniqueDocumentTypes = ["All Types", ...new Set(documents.map((doc) => doc.fullText))];
    const [selectedType, setSelectedType] = useState("All Types");
    const [showTypeFilterDropdown, setShowTypeFilterDropdown] = useState(false);
    const [currentPageDocuments, setCurrentPageDocuments] = useState(1);
    const [documentsPerPage] = useState(5);

    useEffect(() => {
        let currentDocs = isFile;

        if (searchQuery) {
            currentDocs = currentDocs.filter((doc) =>
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedType !== "All Types") {
            currentDocs = currentDocs.filter((doc) => doc.fullText === selectedType);
        }
        setFilteredDocuments(currentDocs);
        setCurrentPageDocuments(1);
    }, [searchQuery, selectedType]);


    const generateReport = () => {
        setReportMessage("Generating comprehensive archive report... (Simulated)");
        setTimeout(() => {
            setReportMessage("Report generated successfully! (Simulated)");
        }, 2000);
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
                        <LineGraph isFileData={isFile} />
                    </div>
                    <div className="min-h-[300px] w-full overflow-hidden lg:w-1/2">
                        <PieGraph isFileData={isFile}/>
                    </div>
                </div>
            </main>
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
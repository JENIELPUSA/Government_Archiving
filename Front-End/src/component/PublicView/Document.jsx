import React, { useState, useMemo, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import { CategoryContext } from "../../contexts/CategoryContext/CategoryContext";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";
import { debounce } from "lodash";

const Documents = ({ searchKeyword,onViewFile}) => {
    const navigate = useNavigate();
    const { isCategory } = useContext(CategoryContext);
    const { isPublic, fetchPublicDisplay, loading } = useContext(FilesDisplayContext);
    const [selectedYear, setSelectedYear] = useState("All Years");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [openYear, setOpenYear] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});
    const [isPaginatedAction, setIsPaginatedAction] = useState(false);

    console.log("isCategory",isCategory)

    const debouncedFetch = useMemo(
        () =>
            debounce((params) => {
                fetchPublicDisplay(params);
            }, 500),
        [fetchPublicDisplay],
    );

    useEffect(() => {
        setIsPaginatedAction(false);

        debouncedFetch({
            title: searchKeyword || null,
            category: selectedCategory,
            page: 1,
        });

        return () => debouncedFetch.cancel();
    }, [searchKeyword, selectedCategory, debouncedFetch]);

    const billsByYear = useMemo(() => {
        const grouped = {};
        if (!isPublic) return grouped;

        const dataArray = Array.isArray(isPublic) ? isPublic : [isPublic];

        dataArray.forEach((group) => {
            const year = group.year || "Unknown";
            const existing = grouped[year]?.data || [];
            const totalCount = group.totalCount || 0;
            const totalPages = group.totalPages || Math.ceil(totalCount / 10) || 1;

            grouped[year] = {
                data: [...existing, ...(group.data || [])],
                currentPage: group.currentPage || 1,
                totalPages: totalPages,
                totalCount: totalCount,
            };
        });

        return grouped;
    }, [isPublic]);

    const sortedYears = useMemo(() => {
        return Object.keys(billsByYear).sort((a, b) => {
            if (a === "Unknown") return 1;
            if (b === "Unknown") return -1;
            return parseInt(b, 10) - parseInt(a, 10);
        });
    }, [billsByYear]);

    const years = useMemo(() => ["All Years", ...sortedYears], [sortedYears]);

    const filteredData = useMemo(() => {
        if (selectedYear === "All Years") return billsByYear;
        return { [selectedYear]: billsByYear[selectedYear] || { data: [], currentPage: 1, totalPages: 1, totalCount: 0 } };
    }, [billsByYear, selectedYear]);

    const categories = useMemo(() => {
        const defaultCategory = { name: "All Categories", id: "" };
        const categoryArray = isCategory || [];
        if (!Array.isArray(categoryArray)) return [defaultCategory];

        const categoryOptions = categoryArray.map((category) => ({
            name: category.category,
            id: category._id,
        }));

        return [defaultCategory, ...categoryOptions];
    }, [isCategory]);

    const handleView = (file) => {
        navigate("/expand-PDF", {
            state: {
                fileId: file._id,
                fileData: file,
                from: "/documents",
            },
        });
    };

    const toggleYear = (year) => {
        const isCurrentlyOpen = openYear === year;
        setOpenYear(isCurrentlyOpen ? null : year);
        if (isCurrentlyOpen && isPaginatedAction) {
            fetchPublicDisplay();
            setIsPaginatedAction(false);
        }
    };

    const handlePageChange = async (year, page) => {
        setIsPaginatedAction(true);
        setLoadingStates((prev) => ({ ...prev, [year]: true }));

        try {
            await fetchPublicDisplay({
                title: searchKeyword || null,
                year: year === "Unknown" ? null : parseInt(year, 10),
                category: selectedCategory,
                page,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStates((prev) => ({ ...prev, [year]: false }));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const options = { year: "numeric", month: "short", day: "numeric" };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch {
            return "Invalid Date";
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    };

    const yearSectionVariants = {
        closed: {
            height: 0,
            opacity: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        },
        open: {
            height: "auto",
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div 
            className="container mx-auto mt-8 max-w-7xl flex-grow rounded-lg bg-white p-6 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h1 
                className="mb-6 text-3xl font-bold text-blue-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                DOCUMENTS
            </motion.h1>

            <motion.div 
                className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div 
                    className="rounded-lg bg-blue-50 p-4 shadow-sm"
                    variants={itemVariants}
                >
                    <label
                        htmlFor="year-select"
                        className="mb-2 block text-sm font-medium text-blue-800"
                    >
                        Filter by Year:
                    </label>
                    <select
                        id="year-select"
                        className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        value={selectedYear}
                        onChange={(e) => {
                            const year = e.target.value;
                            setSelectedYear(year);
                            setOpenYear(year !== "All Years" ? year : null);
                        }}
                    >
                        {years.map((year) => (
                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>
                        ))}
                    </select>
                </motion.div>

                {/* Category Filter */}
                <motion.div 
                    className="rounded-lg bg-blue-50 p-4 shadow-sm"
                    variants={itemVariants}
                >
                    <label
                        htmlFor="category-select"
                        className="mb-2 block text-sm font-medium text-blue-800"
                    >
                        Filter by Category:
                    </label>
                    <select
                        id="category-select"
                        className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        value={selectedCategory || ""}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </motion.div>
            </motion.div>

            {/* Document List */}
            {loading && !isPaginatedAction && Object.values(filteredData).flatMap((yearData) => yearData.data).length === 0 ? (
                <motion.div 
                    className="py-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-800 border-t-transparent"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading documents...</p>
                </motion.div>
            ) : Object.values(filteredData).flatMap((yearData) => yearData.data).length === 0 ? (
                <motion.div 
                    className="rounded-lg border border-blue-100 bg-blue-50 py-12 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <h3 className="mt-4 text-xl font-semibold text-blue-800">No documents found</h3>
                    <p className="mx-auto mt-2 max-w-md text-gray-600">Try adjusting your search or filter criteria.</p>
                </motion.div>
            ) : (
                <motion.div
                    id="document-list"
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {Object.entries(filteredData)
                        .sort(([a], [b]) => {
                            if (a === "Unknown") return 1;
                            if (b === "Unknown") return -1;
                            return parseInt(b, 10) - parseInt(a, 10);
                        })
                        .map(([year, yearData]) => {
                            const yearFiles = yearData.data;
                            const currentPage = yearData.currentPage;
                            const totalPages = yearData.totalPages;
                            const totalCount = yearData.totalCount || 0;
                            const isLoading = loadingStates[year];
                            const isOpen = openYear === year;

                            const startIndex = (currentPage - 1) * 10 + 1;
                            const endIndex = Math.min(currentPage * 10, totalCount);

                            return (
                                <motion.div
                                    key={year}
                                    className="overflow-hidden rounded-xl shadow-md"
                                    variants={itemVariants}
                                    layout
                                >
                                    <motion.div
                                        className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 p-5 text-white transition-all hover:from-blue-800 hover:to-blue-900"
                                        onClick={() => toggleYear(year)}
                                        whileHover={{ scale: 1.005 }}
                                        whileTap={{ scale: 0.995 }}
                                    >
                                        <h2 className="flex items-center gap-3 text-xl font-bold">
                                            <motion.span 
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900"
                                                whileHover={{ rotate: 5 }}
                                            >
                                                {year === "Unknown" ? "?" : year.substring(2)}
                                            </motion.span>
                                            <span>
                                                {year} • {totalCount} document
                                                {totalCount !== 1 ? "s" : ""}
                                                {isLoading && (
                                                    <span className="ml-2 inline-flex">
                                                        <Loader
                                                            className="animate-spin"
                                                            size={18}
                                                        />
                                                    </span>
                                                )}
                                            </span>
                                        </h2>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {isOpen ? (
                                                <ChevronUp
                                                    className="text-blue-200"
                                                    size={24}
                                                />
                                            ) : (
                                                <ChevronDown
                                                    className="text-blue-200"
                                                    size={24}
                                                />
                                            )}
                                        </motion.div>
                                    </motion.div>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div 
                                                className="bg-white"
                                                variants={yearSectionVariants}
                                                initial="closed"
                                                animate="open"
                                                exit="closed"
                                                layout
                                            >
                                                <div className="space-y-4 p-6">
                                                    {isLoading && yearFiles.length === 0 ? (
                                                        <div className="flex justify-center py-8">
                                                            <Loader
                                                                className="animate-spin text-blue-700"
                                                                size={32}
                                                            />
                                                        </div>
                                                    ) : yearFiles.length === 0 ? (
                                                        <div className="py-8 text-center">
                                                            <p className="text-gray-500">No documents found for {year}</p>
                                                        </div>
                                                    ) : (
                                                        yearFiles.map((item) => (
                                                            <motion.div
                                                                key={item?._id}
                                                                className="rounded-lg border border-gray-200 p-5 transition-all hover:bg-blue-50"
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                                                            >
                                                                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                                                                    <div className="flex-grow">
                                                                        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                                                                            <h3 className="text-lg font-bold text-gray-800">{item?.title}</h3>
                                                                            {item?.resolutionNumber && (
                                                                                <span className="whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                                                                    Resolution #: {item.resolutionNumber}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="mb-4 line-clamp-2 text-gray-600">{item?.summary}</p>
                                                                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                                                                            <div className="flex items-center rounded-lg bg-blue-50 p-3">
                                                                                <div className="mr-2 text-xs font-medium text-blue-700">Author:</div>
                                                                                <div className="truncate font-medium text-gray-700">
                                                                                    {item?.author || "N/A"}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center rounded-lg bg-blue-50 p-3">
                                                                                <div className="mr-2 text-xs font-medium text-blue-700">Category:</div>
                                                                                <div className="truncate font-medium text-gray-700">
                                                                                    {item?.category || "Uncategorized"}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center rounded-lg bg-blue-50 p-3">
                                                                                <div className="mr-2 text-xs font-medium text-blue-700">Created:</div>
                                                                                <div className="font-medium text-gray-700">
                                                                                    {formatDate(item?.createdAt)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <motion.button
                                                                        onClick={() => onViewFile (item._id,item)}
                                                                        className="whitespace-nowrap rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-800 md:self-center"
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                    >
                                                                        View Document
                                                                    </motion.button>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Pagination */}
                                                {isOpen && totalPages > 1 && (
                                                    <motion.div 
                                                        className="mb-6 mt-2 flex flex-col items-center justify-between gap-4 px-6 sm:flex-row"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        <div className="text-sm text-gray-600">
                                                            Showing {startIndex} to {endIndex} of {totalCount} documents
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <motion.button
                                                                onClick={() => handlePageChange(year, Math.max(1, currentPage - 1))}
                                                                disabled={currentPage === 1 || isLoading}
                                                                className={`rounded-lg border px-4 py-2 ${
                                                                    currentPage === 1 || isLoading
                                                                        ? "cursor-not-allowed border-gray-300 text-gray-400"
                                                                        : "border-blue-300 text-blue-700 hover:bg-blue-50"
                                                                }`}
                                                                whileHover={{ scale: currentPage === 1 || isLoading ? 1 : 1.05 }}
                                                                whileTap={{ scale: currentPage === 1 || isLoading ? 1 : 0.95 }}
                                                            >
                                                                Previous
                                                            </motion.button>
                                                            <div className="flex flex-wrap items-center justify-center gap-1">
                                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                                    <motion.button
                                                                        key={page}
                                                                        onClick={() => handlePageChange(year, page)}
                                                                        disabled={isLoading}
                                                                        className={`h-10 min-w-[2.5rem] rounded-lg px-2 ${
                                                                            page === currentPage
                                                                                ? "bg-blue-700 text-white"
                                                                                : "text-blue-700 hover:bg-blue-50"
                                                                        } ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
                                                                        whileHover={{ scale: isLoading ? 1 : 1.1 }}
                                                                        whileTap={{ scale: isLoading ? 1 : 0.9 }}
                                                                    >
                                                                        {page}
                                                                    </motion.button>
                                                                ))}
                                                            </div>
                                                            <motion.button
                                                                onClick={() => handlePageChange(year, Math.min(totalPages, currentPage + 1))}
                                                                disabled={currentPage === totalPages || isLoading}
                                                                className={`rounded-lg border px-4 py-2 ${
                                                                    currentPage === totalPages || isLoading
                                                                        ? "cursor-not-allowed border-gray-300 text-gray-400"
                                                                        : "border-blue-300 text-blue-700 hover:bg-blue-50"
                                                                }`}
                                                                whileHover={{ scale: currentPage === totalPages || isLoading ? 1 : 1.05 }}
                                                                whileTap={{ scale: currentPage === totalPages || isLoading ? 1 : 0.95 }}
                                                            >
                                                                Next
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                </motion.div>
            )}
        </motion.div>
    );
};

export default Documents;
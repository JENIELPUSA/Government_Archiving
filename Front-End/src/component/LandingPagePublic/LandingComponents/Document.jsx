import React, { useState, useMemo, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilesDisplayContext } from ".././../../contexts/FileContext/FileContext";
import { CategoryContext } from ".././../../contexts/CategoryContext/CategoryContext";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { debounce } from "lodash";
import BannerImage from "./BannerImage";
import Breadcrumb from "./Breadcrumb";

// Skeleton para sa collapsed year sections (para sa "All Years" view)
const SkeletonCollapsedYear = () => (
    <motion.div className="mb-6 overflow-hidden rounded-xl border border-gray-200">
        <div className="flex animate-pulse items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 p-5 xs:p-2 text-white">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-900"></div>
                <div className="h-6 w-48 rounded bg-blue-900"></div>
            </div>
            <div className="h-6 w-6 rounded-full bg-white"></div>
        </div>
    </motion.div>
);

// Skeleton para sa expanded year (ginamit pa rin para sa specific year view)
const SkeletonItem = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 p-5">
        <div className="mb-3 h-5 w-3/4 rounded bg-gray-200"></div>
        <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
        <div className="mb-4 h-4 w-5/6 rounded bg-gray-200"></div>
        <div className="mt-2 flex gap-4">
            <div className="h-3 w-1/4 rounded bg-gray-200"></div>
            <div className="h-3 w-1/4 rounded bg-gray-200"></div>
            <div className="h-3 w-1/4 rounded bg-gray-200"></div>
        </div>
        <div className="mt-2 h-8 w-32 rounded bg-gray-200"></div>
    </div>
);

const SkeletonYearSection = () => (
    <motion.div className="mb-6 overflow-hidden rounded-xl border border-gray-200">
        <div className="flex animate-pulse items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 p-5 text-white">
            <div className="h-6 w-32 rounded bg-blue-900"></div>
            <div className="h-6 w-6 rounded-full bg-white"></div>
        </div>
        <div className="space-y-4 bg-white p-6">
            {[...Array(3)].map((_, i) => (
                <SkeletonItem key={i} />
            ))}
        </div>
    </motion.div>
);

// Professional Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
    const handlePrevious = () => {
        if (currentPage > 1 && !isLoading) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages && !isLoading) onPageChange(currentPage + 1);
    };

    return (
        <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <motion.button
                onClick={handlePrevious}
                disabled={currentPage === 1 || isLoading}
                className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                    ${currentPage === 1 || isLoading
                        ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                    }`}
                whileTap={{ scale: 0.97 }}
            >
                <ChevronLeft size={18} />
                <span className="xs:hidden sm:inline">Previous</span>
            </motion.button>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 shadow-inner">
                Page {currentPage} of {totalPages}
            </span>

            <motion.button
                onClick={handleNext}
                disabled={currentPage === totalPages || isLoading}
                className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                    ${currentPage === totalPages || isLoading
                        ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                    }`}
                whileTap={{ scale: 0.97 }}
            >
                <span className="xs:hidden sm:inline">Next</span>
                <ChevronRight size={18} />
            </motion.button>
        </motion.div>
    );
};

const Documents = ({ searchKeyword, onViewFile, documentType, onBack }) => {
    const { isCategory } = useContext(CategoryContext);
    const { isPublic, fetchPublicDisplay, isLoading: globalIsLoading, clearPublicDisplay } = useContext(FilesDisplayContext);
    const [selectedYear, setSelectedYear] = useState("All Years");
    const [openYear, setOpenYear] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(false);

    // State para sa "All Years" pagination
    const [allYearsCurrentPage, setAllYearsCurrentPage] = useState(1);
    const ALL_YEARS_PER_PAGE = 10; // Ilang taon ang ipapakita kada page

    const forcedCategoryId = useMemo(() => {
        if (!documentType || !Array.isArray(isCategory)) return null;
        const match = isCategory.find((cat) => cat.category?.toLowerCase().trim() === documentType.toLowerCase().trim());
        return match?._id || null;
    }, [documentType, isCategory]);

    const effectiveCategory = forcedCategoryId;

    // Debounced fetch for All Years
    const fetchAllYears = useMemo(
        () =>
            debounce(async () => {
                if (clearPublicDisplay) {
                    clearPublicDisplay();
                }
                setShowSkeleton(true);
                setIsFetching(true);
                try {
                    await fetchPublicDisplay({
                        title: searchKeyword || null,
                        category: effectiveCategory,
                        page: 1,
                    });
                    // Reset sa page 1 kapag may bagong data
                    setAllYearsCurrentPage(1);
                } finally {
                    setIsFetching(false);
                    setTimeout(() => setShowSkeleton(false), 300);
                }
            }, 500),
        [fetchPublicDisplay, clearPublicDisplay, searchKeyword, effectiveCategory],
    );

    // Initial fetch
    useEffect(() => {
        setShowSkeleton(true);
        const clearTimer = setTimeout(() => {
            fetchAllYears();
        }, 100);
        return () => {
            clearTimeout(clearTimer);
            fetchAllYears.cancel();
        };
    }, [searchKeyword, effectiveCategory, fetchAllYears]);

    useEffect(() => {
        return () => {
            if (clearPublicDisplay) {
                clearPublicDisplay();
            }
        };
    }, [clearPublicDisplay]);

    // Group data by year
    const billsByYear = useMemo(() => {
        if (showSkeleton) return {};
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
    }, [isPublic, showSkeleton]);

    // Sorted years
    const sortedYears = useMemo(() => {
        if (showSkeleton) return [];
        return Object.keys(billsByYear).sort((a, b) => {
            if (a === "Unknown") return 1;
            if (b === "Unknown") return -1;
            return parseInt(b, 10) - parseInt(a, 10);
        });
    }, [billsByYear, showSkeleton]);

    const years = useMemo(() => ["All Years", ...sortedYears], [sortedYears]);

    // Sliced years para sa "All Years" view
    const paginatedYears = useMemo(() => {
        const start = (allYearsCurrentPage - 1) * ALL_YEARS_PER_PAGE;
        const end = start + ALL_YEARS_PER_PAGE;
        return sortedYears.slice(start, end);
    }, [sortedYears, allYearsCurrentPage]);

    // Total pages para sa "All Years" pagination
    const totalAllYearsPages = useMemo(() => {
        return Math.ceil(sortedYears.length / ALL_YEARS_PER_PAGE);
    }, [sortedYears]);

    const filteredData = useMemo(() => {
        if (showSkeleton) return {};
        if (selectedYear === "All Years") {
            // Sa "All Years", ipapakita lang ang mga taon na nasa current page
            const paginatedData = {};
            paginatedYears.forEach(year => {
                if (billsByYear[year]) {
                    paginatedData[year] = billsByYear[year];
                }
            });
            return paginatedData;
        }
        return {
            [selectedYear]: billsByYear[selectedYear] || {
                data: [],
                currentPage: 1,
                totalPages: 1,
                totalCount: 0,
            },
        };
    }, [billsByYear, selectedYear, paginatedYears, showSkeleton]);

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

    const toggleYear = (year) => {
        if (showSkeleton || isFetching || globalIsLoading) return;

        if (openYear === year) {
            fetchAllYears();
            setSelectedYear("All Years");
            setOpenYear(null);
        } else {
            setSelectedYear(year);
            setOpenYear(year);
        }
    };

    const handlePageChange = async (year, page) => {
        if (showSkeleton || isFetching || globalIsLoading) return;
        try {
            setShowSkeleton(true);
            setIsFetching(true);
            await fetchPublicDisplay({
                title: searchKeyword || null,
                year: year === "Unknown" ? null : parseInt(year, 10),
                category: effectiveCategory,
                page,
            });
            setSelectedYear(year);
            setOpenYear(year);
        } catch (error) {
            console.error("Pagination error:", error);
        } finally {
            setIsFetching(false);
            setTimeout(() => setShowSkeleton(false), 300);
        }
    };

    // Handler para sa "All Years" pagination
    const handleAllYearsPageChange = (newPage) => {
        setAllYearsCurrentPage(newPage);
    };

    const returnToAllYears = () => {
        fetchAllYears();
        setSelectedYear("All Years");
        setOpenYear(null);
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

    const showCategoryFilter = !documentType;

    const yearSectionVariants = {
        closed: { height: 0, opacity: 0, transition: { duration: 0.3 } },
        open: { height: "auto", opacity: 1, transition: { duration: 0.4 } },
    };

    const shouldShowSkeletonState = showSkeleton || isFetching || globalIsLoading;
    const hasData = !shouldShowSkeletonState && Object.values(filteredData).length > 0;

    return (
        <div className="relative min-h-screen overflow-hidden bg-blue-950">
            {/* Enhanced Animated Background with Grid */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_60%)]"></div>
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <BannerImage selection={documentType} />
                <Breadcrumb position={documentType} onBack={onBack} />

                <motion.div className="mb-6 xs:mb-2 xs-max:mb-2 container mx-auto mt-8 xs:mt-2 min-h-[400px] max-w-7xl flex-grow rounded-lg bg-white p-6 shadow-xl">
                    <motion.h1 className="mb-6 text-3xl font-bold text-blue-800 xs:text-lg">DOCUMENTS</motion.h1>

                    {/* Filters */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-lg bg-blue-50 p-4 shadow-sm">
                            <label className="mb-2 block text-sm font-medium text-blue-800 xs:text-[12px]">Filter by Year:</label>
                            <select
                                className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 shadow-inner xs:text-[12px]"
                                value={selectedYear}
                                onChange={(e) => {
                                    const year = e.target.value;
                                    if (year === "All Years") {
                                        returnToAllYears();
                                    } else {
                                        setSelectedYear(year);
                                        setOpenYear(year);
                                    }
                                }}
                                disabled={shouldShowSkeletonState}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {showCategoryFilter && (
                            <div className="rounded-lg bg-blue-50 p-4 shadow-sm">
                                <label className="mb-2 block text-sm font-medium text-blue-800 xs:text-[12px]">Filter by Category:</label>
                                <select className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 shadow-inner" value="" disabled>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    {shouldShowSkeletonState ? (
                        // Kapag naglo-load at "All Years" ang napili, magpakita ng collapsed skeleton
                        selectedYear === "All Years" ? (
                            <div className="space-y-6">
                                {[...Array(ALL_YEARS_PER_PAGE)].map((_, i) => (
                                    <SkeletonCollapsedYear key={i} />
                                ))}
                            </div>
                        ) : (
                            // Kapag specific year, magpakita ng expanded skeleton (may mga document items)
                            <div className="space-y-6">
                                <SkeletonYearSection />
                            </div>
                        )
                    ) : hasData ? (
                        <>
                            <div className="space-y-6">
                                {Object.entries(filteredData)
                                    .sort(([a], [b]) => (a === "Unknown" ? 1 : b === "Unknown" ? -1 : parseInt(b) - parseInt(a)))
                                    .map(([year, yearData]) => {
                                        const yearFiles = yearData.data;
                                        const currentPage = yearData.currentPage;
                                        const totalPages = yearData.totalPages;
                                        const totalCount = yearData.totalCount || 0;
                                        const isOpen = openYear === year;

                                        return (
                                            <motion.div key={year} className="rounded-xl border border-gray-200 shadow-sm">
                                                {/* Year Header */}
                                                <motion.div
                                                    className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 p-5 xs:p-2 text-white transition-all duration-200 hover:from-blue-800 hover:to-blue-900"
                                                    onClick={() => toggleYear(year)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <h2 className="flex items-center gap-3 text-xl font-bold">
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 xs:text-[12px] xs-max:text-[15px]">
                                                                {year === "Unknown" ? "?" : year.substring(2)}
                                                            </span>
                                                            <div className="xs:text-[15px] xs-max:text-[15px]">
                                                                {year} • {totalCount} document{totalCount !== 1 ? "s" : ""}
                                                            </div>
                                                        </h2>
                                                    </div>
                                                    {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                                </motion.div>

                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            className="overflow-hidden bg-white"
                                                            initial="closed"
                                                            animate="open"
                                                            exit="closed"
                                                            variants={yearSectionVariants}
                                                        >
                                                            <div className="space-y-4 p-6 xs:p-2">
                                                                {yearFiles.map((item) => (
                                                                    <div key={item._id} className="rounded-lg border border-gray-200 p-5 transition-all duration-200 hover:bg-blue-50">
                                                                        <h3 className="mb-2 text-lg font-bold text-gray-800 xs:text-[12px] xs-max:text-[12px] xs:leading-4 2xs:leading-4 xs-max:leading-4">
                                                                            {item?.title}
                                                                        </h3>
                                                                        <p className="mb-3 line-clamp-2 text-gray-600 xs:text-[12px] xs-max:text-[15px]">
                                                                            {item?.summary}
                                                                        </p>
                                                                        <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-700 xs:text-[12px] xs-max:text-[12px]">
                                                                            <span>Author: {item?.author || "N/A"}</span>
                                                                            <span>Category: {item?.category || "Uncategorized"}</span>
                                                                            <span>Created: {formatDate(item?.createdAt)}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => onViewFile(item._id, item)}
                                                                            className="rounded-lg bg-blue-700 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-800 xs:text-[12px] xs-max:text-[12px]"
                                                                        >
                                                                            View Document
                                                                        </button>
                                                                    </div>
                                                                ))}

                                                                {totalPages > 1 && (
                                                                    <div className="mt-6">
                                                                        <Pagination
                                                                            currentPage={currentPage}
                                                                            totalPages={totalPages}
                                                                            onPageChange={(newPage) => handlePageChange(year, newPage)}
                                                                            isLoading={shouldShowSkeletonState}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                            </div>

                            {/* All Years Pagination (ilagay sa baba) */}
                            {selectedYear === "All Years" && totalAllYearsPages > 1 && (
                                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
                                    <span className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{paginatedYears.length}</span> of{' '}
                                        <span className="font-semibold">{sortedYears.length}</span> years
                                    </span>
                                    <Pagination
                                        currentPage={allYearsCurrentPage}
                                        totalPages={totalAllYearsPages}
                                        onPageChange={handleAllYearsPageChange}
                                        isLoading={shouldShowSkeletonState}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-lg border border-blue-100 bg-blue-50 py-12 text-center">
                            <FileText size={48} className="mx-auto text-blue-500" />
                            <h3 className="mt-4 text-xl font-semibold text-blue-800">No documents found</h3>
                            <p className="mt-2 text-blue-700">Try adjusting your search criteria</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Documents;
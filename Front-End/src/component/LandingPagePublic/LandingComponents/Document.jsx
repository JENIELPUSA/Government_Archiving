import React, { useState, useMemo, useContext, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilesDisplayContext } from ".././../../contexts/FileContext/FileContext";
import { CategoryContext } from ".././../../contexts/CategoryContext/CategoryContext";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileText, Search, X } from "lucide-react";
import { debounce } from "lodash";
import BannerImage from "./BannerImage";
import Breadcrumb from "./Breadcrumb";

// Skeleton para sa collapsed year sections
const SkeletonCollapsedYear = () => (
    <motion.div className="mb-4 overflow-hidden rounded-xl border border-gray-200 sm:mb-6">
        <div className="flex animate-pulse items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 p-3 text-white xs:p-2 sm:p-4 md:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-900 sm:h-8 sm:w-8"></div>
                <div className="h-5 w-32 rounded bg-blue-900 sm:h-6 sm:w-48"></div>
            </div>
            <div className="h-5 w-5 rounded-full bg-white sm:h-6 sm:w-6"></div>
        </div>
    </motion.div>
);

// Skeleton para sa expanded year
const SkeletonItem = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 p-3 sm:p-4 md:p-5">
        <div className="mb-2 h-5 w-3/4 rounded bg-gray-200 sm:mb-3 sm:h-6"></div>
        <div className="mb-2 h-4 w-full rounded bg-gray-200 sm:mb-3"></div>
        <div className="mb-3 h-4 w-5/6 rounded bg-gray-200 sm:mb-4"></div>
        <div className="mt-2 flex flex-wrap gap-2 sm:gap-4">
            <div className="h-3 w-1/3 rounded bg-gray-200 sm:w-1/4"></div>
            <div className="h-3 w-1/3 rounded bg-gray-200 sm:w-1/4"></div>
            <div className="h-3 w-1/3 rounded bg-gray-200 sm:w-1/4"></div>
        </div>
        <div className="mt-3 h-8 w-28 rounded bg-gray-200 sm:mt-4 sm:w-32"></div>
    </div>
);

const SkeletonYearSection = () => (
    <motion.div className="mb-4 overflow-hidden rounded-xl border border-gray-200 sm:mb-6">
        <div className="flex animate-pulse items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 p-3 text-white xs:p-2 sm:p-4 md:p-5">
            <div className="h-5 w-28 rounded bg-blue-900 sm:h-6 sm:w-32"></div>
            <div className="h-5 w-5 rounded-full bg-white sm:h-6 sm:w-6"></div>
        </div>
        <div className="space-y-3 bg-white p-3 sm:space-y-4 sm:p-4 md:p-6">
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
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <motion.button
                onClick={handlePrevious}
                disabled={currentPage === 1 || isLoading}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm
                    ${currentPage === 1 || isLoading
                        ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                    }`}
                whileTap={{ scale: 0.97 }}
            >
                <ChevronLeft size={16} className="sm:size-[18px]" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
            </motion.button>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-inner sm:px-4 sm:py-2 sm:text-sm">
                Page {currentPage} of {totalPages}
            </span>

            <motion.button
                onClick={handleNext}
                disabled={currentPage === totalPages || isLoading}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm
                    ${currentPage === totalPages || isLoading
                        ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                    }`}
                whileTap={{ scale: 0.97 }}
            >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight size={16} className="sm:size-[18px]" />
            </motion.button>
        </motion.div>
    );
};

// Enhanced Search Bar Component with Debounce
const SearchBar = ({ searchKeyword, onSearch, isLoading, totalResults }) => {
    const [localValue, setLocalValue] = useState(searchKeyword || "");
    const [isFocused, setIsFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchRef = useRef(null);
    
    useEffect(() => {
        debouncedSearchRef.current = debounce((value) => {
            onSearch(value);
            setIsSearching(false);
        }, 1500);
        
        return () => {
            if (debouncedSearchRef.current) {
                debouncedSearchRef.current.cancel();
            }
        };
    }, [onSearch]);

    const handleChange = (e) => {
        const value = e.target.value;
        setLocalValue(value);
        
        if (value.trim()) {
            setIsSearching(true);
        }
        
        if (debouncedSearchRef.current) {
            debouncedSearchRef.current.cancel();
            debouncedSearchRef.current(value);
        }
    };

    const handleClear = () => {
        setLocalValue("");
        setIsSearching(false);
        if (debouncedSearchRef.current) {
            debouncedSearchRef.current.cancel();
        }
        onSearch("");
    };

    useEffect(() => {
        if (searchKeyword !== localValue) {
            setLocalValue(searchKeyword || "");
        }
    }, [searchKeyword]);

    return (
        <motion.div 
            className="relative w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`
                relative transition-all duration-300
                ${isFocused ? 'scale-[1.01] sm:scale-[1.02]' : 'scale-100'}
            `}>
                <Search className={`
                    absolute left-3 top-1/2 -translate-y-1/2 
                    transition-all duration-300 z-10
                    ${isFocused ? 'text-blue-600' : 'text-gray-400'}
                    xs:left-2 xs:h-3.5 xs:w-3.5
                    sm:left-3 sm:h-4 sm:w-4
                    md:left-4 md:h-5 md:w-5
                `} />
                
                <input
                    type="text"
                    placeholder="Search documents by title or keywords..."
                    value={localValue}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isLoading}
                    className={`
                        w-full rounded-xl border-2 bg-white 
                        transition-all duration-300
                        focus:outline-none focus:ring-4
                        disabled:cursor-not-allowed disabled:bg-gray-50
                        text-gray-800 placeholder:text-gray-400
                        
                        xs:pl-7 xs:pr-8 xs:py-2 xs:text-xs xs:h-10
                        sm:pl-8 sm:pr-10 sm:py-2.5 sm:text-sm sm:h-11
                        md:pl-10 md:pr-12 md:py-3 md:text-base md:h-12
                        
                        ${isFocused 
                            ? 'border-blue-500 ring-blue-500/20 shadow-lg' 
                            : 'border-gray-200 hover:border-blue-300'
                        }
                        
                        ${isLoading || isSearching ? 'opacity-75' : 'opacity-100'}
                    `}
                />
                
                {localValue && !isLoading && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleClear}
                        className={`
                            absolute right-3 top-1/2 -translate-y-1/2
                            flex items-center justify-center
                            rounded-full transition-all duration-200
                            hover:bg-gray-100 active:scale-95
                            text-gray-400 hover:text-gray-600
                            xs:right-2 xs:h-5 xs:w-5
                            sm:right-3 sm:h-6 sm:w-6
                            md:right-4 md:h-7 md:w-7
                        `}
                        aria-label="Clear search"
                    >
                    </motion.button>
                )}
                
                {(isLoading || isSearching) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center xs:right-2 sm:right-3 md:right-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent xs:h-3 xs:w-3 sm:h-4 sm:w-4 md:h-5 md:w-5"></div>
                    </div>
                )}
            </div>
            
            {localValue && !isLoading && totalResults !== undefined && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex flex-col gap-1 px-2 xs:flex-row xs:justify-between xs:gap-0"
                >
                    <p className="text-xs text-blue-600 xs:text-[11px] sm:text-sm">
                        {isSearching ? (
                            <span className="flex items-center gap-1">
                                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
                                Searching...
                            </span>
                        ) : (
                            <>Results for: <span className="font-semibold">"{localValue}"</span></>
                        )}
                    </p>
                    {!isSearching && (
                        <p className="text-xs text-gray-500 xs:text-[11px] sm:text-sm">
                            {totalResults} result{totalResults !== 1 ? 's' : ''}
                        </p>
                    )}
                </motion.div>
            )}
            
            {localValue && isSearching && (
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                />
            )}
        </motion.div>
    );
};

// Year Filter Component - Without internal arrow, wider dropdown
const YearFilter = ({ years, selectedYear, onYearChange, isLoading }) => {
    return (
        <div className="w-full sm:w-auto sm:min-w-[280px] md:min-w-[320px] lg:min-w-[360px]">
            <select
                className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50
                    xs:px-3 xs:py-2 xs:text-xs xs:h-10
                    sm:px-4 sm:py-2.5 sm:text-sm sm:h-11
                    md:px-5 md:py-3 md:text-base md:h-12"
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                disabled={isLoading}
            >
                {years.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>
            {/* Arrow removed from here */}
        </div>
    );
};

const Documents = ({ searchKeyword, onViewFile, documentType, onBack }) => {
    const { isCategory } = useContext(CategoryContext);
    const { isPublic, fetchPublicDisplay, isLoading: globalIsLoading, clearPublicDisplay } = useContext(FilesDisplayContext);
    const [selectedYear, setSelectedYear] = useState("All Years");
    const [openYear, setOpenYear] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword || "");
    
    const isInitialMount = useRef(true);

    const [allYearsCurrentPage, setAllYearsCurrentPage] = useState(1);
    const ALL_YEARS_PER_PAGE = 10;

    const forcedCategoryId = useMemo(() => {
        if (!documentType || !Array.isArray(isCategory)) return null;
        const match = isCategory.find((cat) => cat.category?.toLowerCase().trim() === documentType.toLowerCase().trim());
        return match?._id || null;
    }, [documentType, isCategory]);

    const effectiveCategory = forcedCategoryId;

    const performFetch = useCallback(async (searchTerm, year, page = 1) => {
        if (clearPublicDisplay) {
            clearPublicDisplay();
        }
        setShowSkeleton(true);
        setIsFetching(true);
        try {
            await fetchPublicDisplay({
                title: searchTerm || null,
                year: year === "Unknown" ? null : (year && year !== "All Years" ? parseInt(year, 10) : null),
                category: effectiveCategory,
                page: page,
            });
            if (page === 1) {
                setAllYearsCurrentPage(1);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
            setTimeout(() => setShowSkeleton(false), 300);
        }
    }, [fetchPublicDisplay, clearPublicDisplay, effectiveCategory]);

    const debouncedSearch = useMemo(
        () => debounce((searchTerm) => {
            performFetch(searchTerm, "All Years", 1);
            setSelectedYear("All Years");
            setOpenYear(null);
        }, 600),
        [performFetch]
    );

    const handleSearch = useCallback((keyword) => {
        setLocalSearchKeyword(keyword);
        
        debouncedSearch.cancel();
        
        if (keyword.trim() === "") {
            performFetch("", "All Years", 1);
            setSelectedYear("All Years");
            setOpenYear(null);
        } else {
            debouncedSearch(keyword);
        }
    }, [debouncedSearch, performFetch]);

    useEffect(() => {
        if (isInitialMount.current && searchKeyword) {
            isInitialMount.current = false;
            setLocalSearchKeyword(searchKeyword);
            performFetch(searchKeyword, "All Years", 1);
            return;
        }
        
        performFetch(localSearchKeyword, "All Years", 1);
        isInitialMount.current = false;
        
        return () => {
            debouncedSearch.cancel();
        };
    }, [localSearchKeyword, effectiveCategory]);

    useEffect(() => {
        return () => {
            if (clearPublicDisplay) {
                clearPublicDisplay();
            }
            debouncedSearch.cancel();
        };
    }, [clearPublicDisplay, debouncedSearch]);

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

    const sortedYears = useMemo(() => {
        if (showSkeleton) return [];
        return Object.keys(billsByYear).sort((a, b) => {
            if (a === "Unknown") return 1;
            if (b === "Unknown") return -1;
            return parseInt(b, 10) - parseInt(a, 10);
        });
    }, [billsByYear, showSkeleton]);

    const years = useMemo(() => ["All Years", ...sortedYears], [sortedYears]);

    const paginatedYears = useMemo(() => {
        const start = (allYearsCurrentPage - 1) * ALL_YEARS_PER_PAGE;
        const end = start + ALL_YEARS_PER_PAGE;
        return sortedYears.slice(start, end);
    }, [sortedYears, allYearsCurrentPage]);

    const totalAllYearsPages = useMemo(() => {
        return Math.ceil(sortedYears.length / ALL_YEARS_PER_PAGE);
    }, [sortedYears]);

    const filteredData = useMemo(() => {
        if (showSkeleton) return {};
        if (selectedYear === "All Years") {
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
            performFetch(localSearchKeyword, "All Years", 1);
            setSelectedYear("All Years");
            setOpenYear(null);
        } else {
            setSelectedYear(year);
            setOpenYear(year);
        }
    };

    const handlePageChange = async (year, page) => {
        if (showSkeleton || isFetching || globalIsLoading) return;
        await performFetch(localSearchKeyword, year, page);
        setSelectedYear(year);
        setOpenYear(year);
    };

    const handleAllYearsPageChange = (newPage) => {
        setAllYearsCurrentPage(newPage);
    };

    const returnToAllYears = () => {
        performFetch(localSearchKeyword, "All Years", 1);
        setSelectedYear("All Years");
        setOpenYear(null);
    };

    const handleYearChange = (year) => {
        if (year === "All Years") {
            returnToAllYears();
        } else {
            setSelectedYear(year);
            setOpenYear(year);
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

    const totalResults = useMemo(() => {
        if (!isPublic || showSkeleton) return 0;
        const dataArray = Array.isArray(isPublic) ? isPublic : [isPublic];
        return dataArray.reduce((total, group) => total + (group.totalCount || 0), 0);
    }, [isPublic, showSkeleton]);

    const yearSectionVariants = {
        closed: { height: 0, opacity: 0, transition: { duration: 0.3 } },
        open: { height: "auto", opacity: 1, transition: { duration: 0.4 } },
    };

    const shouldShowSkeletonState = showSkeleton || isFetching || globalIsLoading;
    const hasData = !shouldShowSkeletonState && Object.values(filteredData).length > 0;

    return (
        <div className="relative min-h-screen overflow-hidden bg-blue-950">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_60%)]"></div>
                <div className="absolute top-0 left-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl animate-pulse sm:h-[400px] sm:w-[400px] md:h-[600px] md:w-[600px]"></div>
                <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-3xl animate-pulse sm:h-[400px] sm:w-[400px] md:h-[600px] md:w-[600px]" style={{ animationDelay: '1s' }}></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] sm:bg-[size:48px_48px] md:bg-[size:64px_64px]"></div>
            </div>

            <div className="relative z-10 mb-8">
                <BannerImage selection={documentType} />
                <Breadcrumb position={documentType} onBack={onBack} />

                <motion.div className="container mx-auto mt-3 max-w-7xl flex-grow rounded-lg bg-white p-3 shadow-xl xs:mt-2 xs:p-2 sm:mt-4 sm:p-4 md:mt-6 md:p-6 lg:mt-8">
                    <motion.h1 className="mb-3 text-xl font-bold text-blue-800 xs:text-lg sm:mb-4 sm:text-2xl md:mb-6 md:text-3xl">
                        DOCUMENTS
                    </motion.h1>

                    {/* Search and Filter Row - Side by Side with priority on search */}
                    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:gap-4">
                        {/* Search Bar - Takes remaining space */}
                        <div className="flex-1 min-w-0">
                            <SearchBar 
                                searchKeyword={localSearchKeyword}
                                onSearch={handleSearch}
                                isLoading={shouldShowSkeletonState}
                                totalResults={totalResults}
                            />
                        </div>
                        
                        {/* Year Filter - Wider width with same height as search bar */}
                        <div className="sm:w-auto">
                            <label className="mb-1 block text-xs font-medium text-blue-800 xs:text-[11px] sm:hidden">
                                Filter by Year:
                            </label>
                            <YearFilter
                                years={years}
                                selectedYear={selectedYear}
                                onYearChange={handleYearChange}
                                isLoading={shouldShowSkeletonState}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    {shouldShowSkeletonState ? (
                        selectedYear === "All Years" ? (
                            <div className="space-y-3 sm:space-y-4 md:space-y-6">
                                {[...Array(Math.min(ALL_YEARS_PER_PAGE, 5))].map((_, i) => (
                                    <SkeletonCollapsedYear key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4 md:space-y-6">
                                <SkeletonYearSection />
                            </div>
                        )
                    ) : hasData ? (
                        <>
                            <div className="space-y-3 sm:space-y-4 md:space-y-6">
                                {Object.entries(filteredData)
                                    .sort(([a], [b]) => (a === "Unknown" ? 1 : b === "Unknown" ? -1 : parseInt(b) - parseInt(a)))
                                    .map(([year, yearData]) => {
                                        const yearFiles = yearData.data;
                                        const currentPage = yearData.currentPage;
                                        const totalPages = yearData.totalPages;
                                        const totalCount = yearData.totalCount || 0;
                                        const isOpen = openYear === year;

                                        return (
                                            <motion.div key={year} className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                                <motion.div
                                                    className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 p-3 text-white transition-all duration-200 hover:from-blue-800 hover:to-blue-900 xs:p-2 sm:p-4 md:p-5"
                                                    onClick={() => toggleYear(year)}
                                                >
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <h2 className="flex items-center gap-2 text-base font-bold sm:gap-3 sm:text-lg md:text-xl">
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-xs sm:h-7 sm:w-7 sm:text-sm md:h-8 md:w-8 md:text-base">
                                                                {year === "Unknown" ? "?" : year.substring(2)}
                                                            </span>
                                                            <div className="text-sm xs:text-xs sm:text-base md:text-lg">
                                                                {year} • {totalCount} document{totalCount !== 1 ? "s" : ""}
                                                            </div>
                                                        </h2>
                                                    </div>
                                                    {isOpen ? 
                                                        <ChevronUp size={24} className="sm:size-6 md:size-7" /> : 
                                                        <ChevronDown size={24} className="sm:size-6 md:size-7" />
                                                    }
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
                                                            <div className="space-y-3 p-3 xs:p-2 sm:space-y-4 sm:p-4 md:p-6">
                                                                {yearFiles.map((item) => (
                                                                    <div key={item._id} className="rounded-lg border border-gray-200 p-3 transition-all duration-200 hover:bg-blue-50 sm:p-4 md:p-5">
                                                                        <h3 className="mb-1 text-base font-bold text-gray-800 xs:mb-1.5 xs:text-sm sm:mb-2 sm:text-lg md:text-xl">
                                                                            {item?.title}
                                                                        </h3>
                                                                        <p className="mb-2 line-clamp-2 text-sm text-gray-600 xs:text-xs sm:mb-3 sm:text-sm md:text-base">
                                                                            {item?.summary}
                                                                        </p>
                                                                        <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-700 xs:gap-1.5 xs:text-[11px] sm:mb-3 sm:gap-3 sm:text-sm">
                                                                            <span>Author: {item?.author || "N/A"}</span>
                                                                            <span>Category: {item?.category || "Uncategorized"}</span>
                                                                            <span>Created: {formatDate(item?.createdAt)}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => onViewFile(item._id, item)}
                                                                            className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs text-white transition-colors duration-200 hover:bg-blue-800 sm:px-4 sm:py-2 sm:text-sm"
                                                                        >
                                                                            View Document
                                                                        </button>
                                                                    </div>
                                                                ))}

                                                                {totalPages > 1 && (
                                                                    <div className="mt-4 sm:mt-6">
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

                            {selectedYear === "All Years" && totalAllYearsPages > 1 && (
                                <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 sm:mt-8 sm:flex-row sm:gap-4 sm:pt-6">
                                    <span className="text-xs text-gray-600 sm:text-sm">
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
                        <div className="rounded-lg border border-blue-100 bg-blue-50 py-8 text-center sm:py-10 md:py-12">
                            <FileText size={36} className="mx-auto text-blue-500 sm:size-10 md:size-12" />
                            <h3 className="mt-3 text-lg font-semibold text-blue-800 sm:mt-4 sm:text-xl">No documents found</h3>
                            <p className="mt-1 text-sm text-blue-700 sm:mt-2">Try adjusting your search criteria</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Documents;
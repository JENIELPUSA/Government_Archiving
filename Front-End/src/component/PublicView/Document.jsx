import React, { useState, useMemo, useContext, useEffect } from "react";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import { CategoryContext } from "../../contexts/CategoryContext/CategoryContext";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";
import { debounce } from "lodash";

const Documents = ({ searchKeyword }) => {
    const navigate = useNavigate();
    const { isCategory } = useContext(CategoryContext);
    const { isPublic, fetchPublicDisplay, loading } = useContext(FilesDisplayContext);

    const [selectedYear, setSelectedYear] = useState("All Years");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [openYear, setOpenYear] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});
    const debouncedFetch = useMemo(
        () =>
            debounce((params) => {
                fetchPublicDisplay(params);
            }, 500),
        [fetchPublicDisplay],
    );

    useEffect(() => {
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
            grouped[year] = {
                data: [...existing, ...(group.data || [])],
                currentPage: group.currentPage || 1,
                totalPages: group.totalPages || 1,
                totalCount: group.totalCount || existing.length + (group.data?.length || 0),
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
        return { [selectedYear]: billsByYear[selectedYear] || { data: [], currentPage: 1, totalPages: 1 } };
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

    // Removed effect that auto-opens first year
    // useEffect(() => {
    //     if (sortedYears.length > 0 && !openYear) {
    //         setOpenYear(sortedYears[0]);
    //     }
    // }, [sortedYears]);

    const handleView = (file) => {
        navigate("/expand-pdf", {
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

        // Call fetchPublicDisplay only when hiding the year
        if (isCurrentlyOpen) {
            fetchPublicDisplay({
                title: searchKeyword || null,
                category: selectedCategory,
                page: 1,
            });
        }
    };

    const handlePageChange = async (year, page) => {
        setLoadingStates((prev) => ({ ...prev, [year]: true }));

        try {
            const newData = await fetchPublicDisplay({
                title: searchKeyword || null,
                year: year === "Unknown" ? null : parseInt(year, 10),
                category: selectedCategory,
                page,
            });

            setAllYearsData((prev) => {
                const existing = prev[year]?.data || [];
                return {
                    ...prev,
                    [year]: {
                        ...newData,
                        data: [...existing, ...(newData.data || [])],
                    },
                };
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

    return (
        <div className="container mx-auto mt-8 max-w-7xl flex-grow rounded-lg bg-white p-6 shadow-xl">
            <h1 className="mb-6 text-3xl font-bold text-blue-800">DOCUMENTS</h1>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Year Filter */}
                <div className="rounded-lg bg-blue-50 p-4 shadow-sm">
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
                </div>

                {/* Category Filter */}
                <div className="rounded-lg bg-blue-50 p-4 shadow-sm">
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
                </div>
            </div>

            {/* Document List */}
            {loading && Object.values(filteredData).flatMap((yearData) => yearData.data).length === 0 ? (
                <div className="py-12 text-center">
                    <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-800 border-t-transparent"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading documents...</p>
                </div>
            ) : Object.values(filteredData).flatMap((yearData) => yearData.data).length === 0 ? (
                <div className="rounded-lg border border-blue-100 bg-blue-50 py-12 text-center">
                    <h3 className="mt-4 text-xl font-semibold text-blue-800">No documents found</h3>
                    <p className="mx-auto mt-2 max-w-md text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div
                    id="document-list"
                    className="space-y-6"
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
                            const isLoading = loadingStates[year];
                            const isOpen = openYear === year;

                            return (
                                <div
                                    key={year}
                                    className="overflow-hidden rounded-xl shadow-md"
                                >
                                    <div
                                        className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 p-5 text-white transition-all hover:from-blue-800 hover:to-blue-900"
                                        onClick={() => toggleYear(year)}
                                    >
                                        <h2 className="flex items-center gap-3 text-xl font-bold">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900">
                                                {year === "Unknown" ? "?" : year.substring(2)}
                                            </span>
                                            <span>
                                                {year} • {yearFiles.length} document
                                                {yearFiles.length !== 1 ? "s" : ""}
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
                                    </div>

                                    {isOpen && (
                                        <div className="bg-white">
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
                                                        <div
                                                            key={item?._id}
                                                            className="rounded-lg border border-gray-200 p-5 transition-all hover:bg-blue-50"
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
                                                                <button
                                                                    onClick={() => handleView(item)}
                                                                    className="whitespace-nowrap rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-800 md:self-center"
                                                                >
                                                                    View Document
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Pagination */}
                                            {isOpen && totalPages > 1 && (
                                                <div className="mb-6 mt-2 flex flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                                                    <div className="text-sm text-gray-600">
                                                        Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, yearFiles.length)} of{" "}
                                                        {yearFiles.length} documents
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handlePageChange(year, Math.max(1, currentPage - 1))}
                                                            disabled={currentPage === 1 || isLoading}
                                                            className={`rounded-lg border px-4 py-2 ${
                                                                currentPage === 1 || isLoading
                                                                    ? "cursor-not-allowed border-gray-300 text-gray-400"
                                                                    : "border-blue-300 text-blue-700 hover:bg-blue-50"
                                                            }`}
                                                        >
                                                            Previous
                                                        </button>
                                                        <div className="flex flex-wrap items-center justify-center gap-1">
                                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => handlePageChange(year, page)}
                                                                    disabled={isLoading}
                                                                    className={`h-10 min-w-[2.5rem] rounded-lg px-2 ${
                                                                        page === currentPage
                                                                            ? "bg-blue-700 text-white"
                                                                            : "text-blue-700 hover:bg-blue-50"
                                                                    } ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => handlePageChange(year, Math.min(totalPages, currentPage + 1))}
                                                            disabled={currentPage === totalPages || isLoading}
                                                            className={`rounded-lg border px-4 py-2 ${
                                                                currentPage === totalPages || isLoading
                                                                    ? "cursor-not-allowed border-gray-300 text-gray-400"
                                                                    : "border-blue-300 text-blue-700 hover:bg-blue-50"
                                                            }`}
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default Documents;

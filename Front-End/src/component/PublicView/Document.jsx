import React, { useState, useEffect, useContext } from "react";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";

const Documents = ({ searchKeyword }) => {
    const [externalData, setExternalData] = useState({
        status: "success",
        currentPage: 1,
        totalPages: 2,
        totalCount: 9,
        totalDocumentsToday: 3,
        results: 5,
        data: [],
        activeTags: [],
    });
    const { isPublicData } = useContext(FilesDisplayContext);
    const [selectedYear, setSelectedYear] = useState("All Years");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openYear, setOpenYear] = useState(null);


    console.log("Public",isPublicData)

    useEffect(() => {
        if (isPublicData && Array.isArray(isPublicData)) {
            setExternalData(prevState => ({
                ...prevState,
                data: isPublicData,
                totalCount: isPublicData.length,
                results: isPublicData.length,
            }));
            const years = [...new Set(isPublicData.map((item) => new Date(item.createdAt).getFullYear().toString()).sort((a, b) => b - a))];
            if (years.length > 0) {
                setOpenYear(years[0]);
            }
        }
    }, [isPublicData]);

    const categories = ["All Categories", ...new Set(externalData.data.map((item) => item.category))];
    const years = ["All Years", ...new Set(externalData.data.map((item) => new Date(item.dateOfResolution).getFullYear().toString()))].sort((a, b) => b - a);

    const filteredData = externalData.data.filter((item) => {
        const matchesKeyword =
            searchKeyword === "" ||
            item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchKeyword.toLowerCase());
        const matchesYear = selectedYear === "All Years" || new Date(item.dateOfResolution).getFullYear().toString() === selectedYear;
        const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
        return matchesKeyword && matchesYear && matchesCategory;
    });

    const billsByYear = filteredData.reduce((acc, bill) => {
        const year = new Date(bill.dateOfResolution).getFullYear();
        acc[year] = acc[year] || [];
        acc[year].push(bill);
        return acc;
    }, {});

    const sortedYears = Object.keys(billsByYear).sort((a, b) => b - a);

    const handleToggle = (year) => {
        setOpenYear(openYear === year ? null : year);
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="container mx-auto mt-8 max-w-7xl flex-grow rounded-lg bg-white p-6 shadow-xl">
            <h1 className="mb-6 text-3xl font-bold text-blue-800">DOCUMENTS</h1>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label
                        htmlFor="year-select"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Filter by Year:
                    </label>
                    <select
                        id="year-select"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
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

                <div>
                    <label
                        htmlFor="category-select"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Filter by Category:
                    </label>
                    <select
                        id="category-select"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map((category) => (
                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="items-per-page"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Items per page:
                    </label>
                    <select
                        id="items-per-page"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            <div className="mb-6 text-sm text-gray-600">
                Showing {filteredData.length} of {externalData.data.length} documents
            </div>

            {externalData.data.length === 0 ? (
                <div className="py-8 text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
                    <p className="mt-4 text-gray-600">Loading documents...</p>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="py-8 text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto h-16 w-16 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                </div>
            ) : (
                <div id="document-list">
                    {sortedYears.map((year) => (
                        <div
                            key={year}
                            className="mb-6"
                        >
                            <div
                                className="flex cursor-pointer items-center justify-between rounded-t-lg bg-blue-800 p-4 text-white hover:bg-blue-700"
                                onClick={() => handleToggle(year)}
                            >
                                <h2 className="text-xl font-bold">
                                    {year} ({billsByYear[year].length})
                                </h2>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-6 w-6 transform transition-transform duration-300 ${openYear === year ? "rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${openYear === year ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
                            >
                                <div className="rounded-b-lg border border-gray-200">
                                    {billsByYear[year].map((item) => (
                                        <div
                                            key={item._id}
                                            className="border-b border-gray-200 p-5 last:border-b-0 hover:bg-gray-50"
                                        >
                                            <div className="mb-4">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <span className="mr-2 rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                                            {item.resolutionNumber}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{formatDate(item.createdAt)}</span>
                                                </div>
                                                <h3 className="mb-3 text-lg font-bold text-gray-800">{item.title}</h3>
                                                <div className="mb-4 rounded-md bg-gray-50 p-3">
                                                    <p className="text-gray-700">
                                                        <strong className="font-semibold">Summary:</strong> {item.summary}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
                                                    <div>
                                                        <span className="font-semibold">Date Filed:</span> {formatDate(item.createdAt)}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">Principal Author/s:</span> {item.author}
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <span className="font-semibold">Bill Status:</span> {item.status}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm font-medium text-blue-800">
                                                <a
                                                    href={item.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center hover:text-blue-600 hover:underline"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="mr-1 h-5 w-5"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 2h8v12H6V4zm2 2h4a1 1 0 100-2H8a1 1 0 100 2zm0 4h4a1 1 0 100-2H8a1 1 0 100 2zm0 4h4a1 1 0 100-2H8a1 1 0 100 2z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    View Document
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Documents;
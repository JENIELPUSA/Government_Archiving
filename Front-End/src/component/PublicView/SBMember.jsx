import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { SbMemberDisplayContext } from "../../contexts/SbContext/SbContext";

import { FaSearch, FaFilter, FaUserAlt, FaCalendarAlt, FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import _ from "lodash";

// Skeleton Loading Components
const SkeletonCard = () => (
    <div className="flex items-start bg-white p-4 shadow-sm">
        <div className="mr-4 h-44 w-28 animate-pulse rounded bg-gray-200"></div>
        <div className="flex-grow">
            <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-gray-200"></div>
            <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
            <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
        </div>
    </div>
);

const SkeletonFilter = () => (
    <div className="animate-pulse">
        <div className="mb-2 h-4 w-1/3 rounded bg-gray-200"></div>
        <div className="h-12 w-full rounded-md bg-gray-200"></div>
    </div>
);

const MemberCard = ({ member, openModal }) => (
    <div className="flex items-start bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <img
            src={member.memberInfo?.avatar?.url || "https://randomuser.me/api/portraits/men/64.jpg"}
            alt="Profile Picture"
            className="mr-4 h-44 w-28 object-cover"
        />
        <div className="flex-grow">
            <h2 className="mb-1 flex items-center text-lg font-bold text-gray-900">
                <FaUserAlt className="mr-2 text-blue-600" />
                {member.memberInfo?.first_name} {member.memberInfo?.last_name}
            </h2>
            <p className="flex items-center text-sm font-medium text-gray-600">
                <FaUserAlt className="mr-2 text-sm text-blue-600" />
                {member.district || member.memberInfo?.district}
            </p>
            <p className="flex items-center text-sm font-medium capitalize text-gray-600">
                <FaUserAlt className="mr-2 text-sm text-blue-600" />
                {member.memberInfo.Position || member.memberInfo.position}
            </p>
            <button
                onClick={() => openModal(member)}
                className="mt-2 flex items-center text-sm font-bold text-blue-700 hover:underline focus:outline-none"
            >
                <FaUserAlt className="mr-1" />
                View Profile
            </button>
        </div>
    </div>
);

const MemberModal = ({ member, closeModal }) => {
    if (!member) return null;
    const district = member.district || member.memberInfo?.district;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-screen w-11/12 max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl md:p-8">
                <div className="flex justify-end">
                    <button
                        onClick={closeModal}
                        className="text-2xl font-bold text-gray-500 hover:text-gray-900"
                    >
                        &times;
                    </button>
                </div>
                <div className="mt-4 flex flex-col items-start space-y-6 md:flex-row md:space-x-6 md:space-y-0">
                    <div className="w-full flex-shrink-0 md:w-1/3">
                        <img
                            src={(
                                member.memberInfo?.avatar?.url ||
                                member.memberInfo?.avatar?.url ||
                                "https://randomuser.me/api/portraits/men/64.jpg"
                            ).replace("112x176", "300x450")}
                            alt="Member Profile Picture"
                            className="h-auto w-full object-cover shadow-md"
                        />
                    </div>
                    <div className="w-full md:w-2/3">
                        <h2 className="mb-2 flex items-center text-2xl font-bold text-gray-900">
                            <FaUserAlt className="mr-2 text-blue-600" />
                            {member.memberInfo?.first_name} {member.memberInfo?.last_name}
                        </h2>
                        <div className="mb-4 text-base font-medium text-gray-600">
                            <strong className="flex items-center capitalize">
                                <FaUserAlt className="mr-2 text-blue-600" />
                                {member.memberInfo.Position || member.memberInfo.Position}
                            </strong>{" "}
                            <br />
                            {district && <span>District {district}</span>} <br />
                            <br />
                            <span>{member.memberInfo.detailInfo}</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 text-center md:grid-cols-3">
                            <div className="rounded-lg bg-gray-100 p-4">
                                <p className="text-3xl font-bold text-blue-600">{member.count || 0}</p>
                                <p className="text-sm font-medium text-gray-500">Total Laws</p>
                            </div>
                            <div className="rounded-lg bg-gray-100 p-4">
                                <p className="text-3xl font-bold text-blue-600">{member.resolutionCount || 0}</p>
                                <p className="text-sm font-medium text-gray-500">Total Resolutions</p>
                            </div>
                            <div className="rounded-lg bg-gray-100 p-4">
                                <p className="text-3xl font-bold text-blue-600">{member.ordinanceCount || 0}</p>
                                <p className="text-sm font-medium text-gray-500">Total Ordinances</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const { isGroupPublicAuthor, DisplayPublicAuthor, currentPage, totalPages, setCurrentPage, loading, setLoading } =
        useContext(SbMemberDisplayContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [positionFilter, setPositionFilter] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [availablePositions, setAvailablePositions] = useState([]);

    const initialLoad = useRef(true);
    const positionsInitialized = useRef(false);

    useEffect(() => {
        if (isGroupPublicAuthor?.length > 0 && !positionsInitialized.current) {
            const positionsArray = isGroupPublicAuthor.map((member) => member.memberInfo?.Position || member.memberInfo?.position || "");
            const nonEmptyPositions = positionsArray.filter(Boolean);
            const uniquePositions = Array.from(new Set(nonEmptyPositions));
            setAvailablePositions(uniquePositions);
            positionsInitialized.current = true;
        }
    }, [isGroupPublicAuthor]);

    const openModal = (member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMember(null);
    };

    console.log("isGroupPublicAuthor", isGroupPublicAuthor);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const fetchWithFilters = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                Position: positionFilter === "all" ? "" : positionFilter,
                term_from: fromDate,
                term_to: toDate,
                page: currentPage,
                limit: 10,
            };
            await DisplayPublicAuthor(params);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("Error fetching filtered data:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, positionFilter, fromDate, toDate, DisplayPublicAuthor, currentPage, setLoading]);

    const debouncedFetch = useCallback(
        _.debounce(() => {
            fetchWithFilters();
        }, 1500),
        [fetchWithFilters],
    );

    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false;
            fetchWithFilters();
            return;
        }

        debouncedFetch();

        return () => {
            debouncedFetch.cancel();
        };
    }, [searchTerm, positionFilter, fromDate, toDate, currentPage, debouncedFetch, fetchWithFilters]);

    const renderPagination = () => {
        if (totalPages === 0 || loading) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage, endPage;

        if (totalPages <= maxVisiblePages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
            const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;

            if (currentPage <= maxPagesBeforeCurrent) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - maxPagesBeforeCurrent;
                endPage = currentPage + maxPagesAfterCurrent;
            }
        }

        pages.push(
            <button
                key="prev"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`mx-1 flex items-center justify-center rounded px-3 py-1 ${
                    currentPage === 1 ? "cursor-not-allowed bg-gray-200 text-gray-400" : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
                <FaChevronLeft className="inline" />
            </button>,
        );

        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className={`mx-1 rounded px-3 py-1 ${
                        currentPage === 1 ? "bg-blue-700 font-bold text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    1
                </button>,
            );

            if (startPage > 2) {
                pages.push(
                    <span
                        key="start-ellipsis"
                        className="mx-1 px-2 py-1"
                    >
                        ...
                    </span>,
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`mx-1 rounded px-3 py-1 ${
                        currentPage === i ? "bg-blue-700 font-bold text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    {i}
                </button>,
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span
                        key="end-ellipsis"
                        className="mx-1 px-2 py-1"
                    >
                        ...
                    </span>,
                );
            }

            pages.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className={`mx-1 rounded px-3 py-1 ${
                        currentPage === totalPages ? "bg-blue-700 font-bold text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    {totalPages}
                </button>,
            );
        }

        pages.push(
            <button
                key="next"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`mx-1 flex items-center justify-center rounded px-3 py-1 ${
                    currentPage === totalPages ? "cursor-not-allowed bg-gray-200 text-gray-400" : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
                <FaChevronRight className="inline" />
            </button>,
        );

        return <div className="mt-8 flex flex-wrap justify-center">{pages}</div>;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="mx-auto max-w-7xl bg-white p-6 shadow-lg md:p-8">
                <header className="mb-8">
                    <h1 className="flex items-center text-2xl font-bold text-gray-800 md:text-3xl">
                        <FaUserAlt className="mr-2 text-blue-600" />
                        List Of SB Member
                    </h1>
                    <p className="mt-1 flex items-center text-base font-bold text-red-500 md:text-lg">
                        <FaUserAlt className="mr-2 text-blue-600" />
                        Total Member: ({isGroupPublicAuthor?.length || 0})
                    </p>
                </header>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {loading ? (
                        <>
                            <SkeletonFilter />
                            <SkeletonFilter />
                            <SkeletonFilter />
                            <SkeletonFilter />
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    <FaSearch className="mr-1 inline" />
                                    Search by Name
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type a name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 p-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    <FaFilter className="mr-1 inline" />
                                    Position
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FaFilter className="text-gray-400" />
                                    </div>
                                    <select
                                        value={positionFilter}
                                        onChange={(e) => setPositionFilter(e.target.value)}
                                        className="w-full appearance-none rounded-md border border-gray-300 bg-white p-3 pl-10 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">ALL POSITIONS</option>
                                        {availablePositions.map((position, index) => (
                                            <option
                                                key={index}
                                                value={position}
                                            >
                                                {position}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg
                                            className="h-4 w-4 fill-current"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    <FaCalendarAlt className="mr-1 inline" />
                                    From
                                </label>
                                <input
                                    type="number"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    placeholder="YYYY"
                                    min={1900} // pwede palitan depende sa kailangan
                                    max={2100}
                                    className="w-full rounded-md border border-gray-300 p-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    <FaCalendarAlt className="mr-1 inline" />
                                    To
                                </label>
                                <input
                                    type="number"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    placeholder="YYYY"
                                    min={1900}
                                    max={2100}
                                    className="w-full rounded-md border border-gray-300 p-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                ) : isGroupPublicAuthor?.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">No Data Found</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {isGroupPublicAuthor?.map((member) => (
                                <MemberCard
                                    key={member._id || member.id}
                                    member={member}
                                    openModal={openModal}
                                />
                            ))}
                        </div>
                        {totalPages > 0 && renderPagination()}
                    </>
                )}
            </div>

            {isModalOpen && (
                <MemberModal
                    member={selectedMember}
                    closeModal={closeModal}
                />
            )}

            <button
                id="backToTopBtn"
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 rounded-full bg-blue-500 p-3 text-white shadow-lg transition-opacity duration-300 ${
                    showBackToTop ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-label="Back to top"
            >
                <FaArrowUp className="h-6 w-6" />
            </button>
        </div>
    );
};

export default App;

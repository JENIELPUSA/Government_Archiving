import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import BannerImage from "./BannerImage";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { FaSearch, FaListUl, FaFilter, FaUserAlt, FaCalendarAlt, FaArrowUp, FaChevronLeft, FaChevronRight, FaTimes, FaList } from "react-icons/fa";
import _ from "lodash";
import MemberProfile from "./MemberProfile";
import Breadcrumb from "./Breadcrumb";

// FIXED: Check if MemberProfile exists and has these components
const MemberCard = MemberProfile?.MemberCard;
const MemberModal = MemberProfile?.MemberModal;
const SkeletonCard = MemberProfile?.SkeletonCard;
const SkeletonFilter = MemberProfile?.SkeletonFilter;

const normalizePosition = (str) => {
    if (!str || typeof str !== "string") return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
};

const SBmember = ({ Position, onBack }) => {
    const { isGroupPublicAuthor, DisplayPublicAuthor, currentPage, totalPages, setCurrentPage, loading, setLoading } =
        useContext(SbMemberDisplayContext);

    const { FilesByPosition, fetchFilesByPosition, PositioncurentPage, PositiontotalPage, Totaldata,isLoading } = useContext(FilesDisplayContext);

    const isSbMembers = (pos) => {
        if (!pos) return false;
        const clean = normalizePosition(pos);
        return clean === "sbmember" || clean === "sbmembers";
    };

    const isAll = Position && Position.toLowerCase() === "all";
    const isSbMembersFlag = Position && isSbMembers(Position);

    if (!Position || isAll) {
        return null;
    }

    const initialFilter = isSbMembersFlag ? null : Position;

    const [termFilter, setTermFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [positionFilter, setPositionFilter] = useState(initialFilter);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [availablePositions, setAvailablePositions] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const initialLoad = useRef(true);
    const positionsInitialized = useRef(false);
    const scrollTimeout = useRef(null);
    const memberGridRef = useRef(null);
    const headerRef = useRef(null);

    useEffect(() => {
        if (isGroupPublicAuthor?.length > 0 && !positionsInitialized.current) {
            const positionSet = new Set();
            const originalPositions = [];

            isGroupPublicAuthor.forEach((member) => {
                const pos = member.memberInfo?.Position || member.memberInfo?.position || "";
                if (pos) {
                    const normalized = normalizePosition(pos);
                    if (!positionSet.has(normalized)) {
                        positionSet.add(normalized);
                        originalPositions.push(pos); // keep original for display
                    }
                }
            });

            setAvailablePositions(originalPositions);
            positionsInitialized.current = true;
        }
    }, [isGroupPublicAuthor]);

    // Reset filters when Position prop changes
    useEffect(() => {
        const newIsAll = Position && Position.toLowerCase() === "all";
        const newIsSbMembersFlag = Position && isSbMembers(Position);

        if (!Position || newIsAll) return;

        const newFilter = newIsSbMembersFlag ? null : Position;
        setPositionFilter(newFilter);
        setCurrentPage(1);
        setSearchTerm("");
        setTermFilter("");
        setFromDate("");
        setToDate("");
    }, [Position, setCurrentPage]);

    const openModal = (member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMember(null);
    };

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearFilters = () => {
        setSearchTerm("");
        const resetFilter = isSbMembersFlag ? null : Position;
        setPositionFilter(resetFilter);
        setFromDate("");
        setToDate("");
        setTermFilter("");
    };

    const fetchWithFilters = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                Position: positionFilter || "", // empty string = no position filter
                term_from: fromDate,
                term_to: toDate,
                term: termFilter,
                page: currentPage,
            };
            await DisplayPublicAuthor(params);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("Error fetching filtered data:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, positionFilter, fromDate, toDate, termFilter, currentPage, DisplayPublicAuthor, setLoading]);

    const debouncedFetch = useCallback(
        _.debounce(() => fetchWithFilters(), 500),
        [fetchWithFilters],
    );

    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false;
            fetchWithFilters();
            return;
        }
        debouncedFetch();
        return () => debouncedFetch.cancel();
    }, [searchTerm, positionFilter, fromDate, toDate, currentPage, debouncedFetch, fetchWithFilters]);

    // Scroll animation for cards
    useEffect(() => {
        if (!memberGridRef.current || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-fade-in-up");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 },
        );

        const cards = memberGridRef.current.querySelectorAll(".member-card");
        cards.forEach((card) => observer.observe(card));
        return () => observer.disconnect();
    }, [isGroupPublicAuthor, loading]);

    const renderPagination = () => {
        if (totalPages === 0 || loading) return null;

        const pages = [];
        const maxVisible = 5;
        let start, end;

        if (totalPages <= maxVisible) {
            start = 1;
            end = totalPages;
        } else {
            const before = Math.floor(maxVisible / 2);
            const after = Math.ceil(maxVisible / 2) - 1;
            if (currentPage <= before) {
                start = 1;
                end = maxVisible;
            } else if (currentPage + after >= totalPages) {
                start = totalPages - maxVisible + 1;
                end = totalPages;
            } else {
                start = currentPage - before;
                end = currentPage + after;
            }
        }

        pages.push(
            <button
                key="prev"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`mx-1 flex items-center justify-center rounded-lg px-3 py-2 transition-all ${
                    currentPage === 1
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 hover:shadow-md"
                }`}
            >
                <FaChevronLeft />
            </button>,
        );

        if (start > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className={`mx-1 rounded-lg px-3 py-2 ${
                        currentPage === 1
                            ? "bg-blue-600 font-bold text-white shadow-md"
                            : "border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 hover:shadow-md"
                    }`}
                >
                    1
                </button>,
            );
            if (start > 2)
                pages.push(
                    <span
                        key="s-ell"
                        className="mx-1"
                    >
                        ...
                    </span>,
                );
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`mx-1 rounded-lg px-3 py-2 ${
                        i === currentPage
                            ? "bg-blue-600 font-bold text-white shadow-md"
                            : "border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 hover:shadow-md"
                    }`}
                >
                    {i}
                </button>,
            );
        }

        if (end < totalPages) {
            if (end < totalPages - 1)
                pages.push(
                    <span
                        key="e-ell"
                        className="mx-1"
                    >
                        ...
                    </span>,
                );
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className={`mx-1 rounded-lg px-3 py-2 ${
                        currentPage === totalPages
                            ? "bg-blue-600 font-bold text-white shadow-md"
                            : "border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 hover:shadow-md"
                    }`}
                >
                    {totalPages}
                </button>,
            );
        }

        pages.push(
            <button
                key="next"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`mx-1 flex items-center justify-center rounded-lg px-3 py-2 transition-all ${
                    currentPage === totalPages
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 hover:shadow-md"
                }`}
            >
                <FaChevronRight />
            </button>,
        );

        return (
            <div className="mt-8 flex flex-wrap items-center justify-center">
                <span className="mr-4 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex flex-wrap justify-center">{pages}</div>
            </div>
        );
    };

    const hasActiveFilters = searchTerm || (positionFilter !== null && positionFilter !== Position) || fromDate || toDate;

    // Create fallback components if the imported ones are undefined
    const FallbackComponent = ({ name }) => (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-center">
            <div className="font-medium text-red-600">Component Error: {name} is not available</div>
            <div className="text-sm text-red-500">Check the export in MemberProfile.js</div>
        </div>
    );

    const SafeMemberCard = MemberCard || (({ member, openModal }) => (
        <FallbackComponent name="MemberCard" />
    ));
    
    const SafeMemberModal = MemberModal || (({ member, closeModal }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-lg bg-white p-6">
                <FallbackComponent name="MemberModal" />
                <button onClick={closeModal} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
                    Close
                </button>
            </div>
        </div>
    ));
    
    const SafeSkeletonCard = SkeletonCard || (() => (
        <div className="animate-pulse rounded-lg bg-gray-200 p-4">
            <div className="h-48 bg-gray-300 rounded-md"></div>
            <div className="mt-3 h-4 bg-gray-300 rounded"></div>
            <div className="mt-2 h-3 bg-gray-300 rounded"></div>
        </div>
    ));
    
    const SafeSkeletonFilter = SkeletonFilter || (() => (
        <div className="animate-pulse rounded-lg bg-gray-200 p-4">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
        </div>
    ));

    return (
        <div className="relative min-h-screen overflow-hidden bg-blue-950 py-4">
            {/* Enhanced Animated Background with Grid */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_60%)]"></div>
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <div className="w-full">
                    <BannerImage selection={"SP Members"} />
                </div>
                <Breadcrumb
                    position={"SP Members"}
                    onBack={onBack}
                />
                <div className="mx-auto mt-10 max-w-7xl rounded-xl bg-white p-6 shadow-sm md:mt-8 md:p-8">
                    <header
                        ref={headerRef}
                        className="mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="flex items-center text-2xl font-bold text-gray-800 md:text-3xl xs:text-lg">
                                    <span className="mr-3 rounded-lg bg-blue-100 p-2 text-blue-600 xs:text-sm">
                                        <FaUserAlt />
                                    </span>
                                    SP Members Directory
                                </h1>
                                <p className="mt-2 text-gray-600 xs:text-sm">
                                    Browse and search through the complete list of Sangguniang Panlalawigan members
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center">
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 xs:text-sm">
                                {isGroupPublicAuthor?.length || 0} Members
                            </span>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="ml-4 flex items-center text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes className="mr-1" />
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="mb-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-4 w-full md:mb-0 md:w-1/2">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 xs:text-sm">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 xs:text-sm"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        >
                                            <FaTimes className="text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="ml-auto flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200 hover:shadow-sm md:justify-start xs:text-[10px]"
                            >
                                <FaFilter className="mr-2 text-gray-600 xs:text-[8px]" />
                                <span>{showFilters ? "Hide" : "Show"} Filters</span>
                            </button>
                        </div>

                        {showFilters && (
                            <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4 lg:grid-cols-6 xs:gap-2">
                                {loading ? (
                                    <>
                                        <SafeSkeletonFilter />
                                        <SafeSkeletonFilter />
                                    </>
                                ) : (
                                    <>
                                        {/* Position Filter - shows ORIGINAL spelling */}
                                        <div className="md:col-span-2 lg:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700 xs:text-[10px]">Position</label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 xs:text-[10px]">
                                                    <FaFilter className="text-gray-400" />
                                                </div>
                                                <select
                                                    value={positionFilter || ""}
                                                    onChange={(e) => setPositionFilter(e.target.value || null)}
                                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white p-3 pl-10 font-medium shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 xs:text-[10px]"
                                                >
                                                    <option value="">All Positions</option>
                                                    {availablePositions.map((position, index) => (
                                                        <option
                                                            key={index}
                                                            value={position}
                                                        >
                                                            {position} {/* ← Original spelling shown */}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Term Filter */}
                                        <div className="md:col-span-2 lg:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700 xs:text-[10px]">Number of Term</label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 xs:text-[10px]">
                                                    <FaListUl className="text-gray-400" />
                                                </div>
                                                <select
                                                    value={termFilter}
                                                    onChange={(e) => setTermFilter(e.target.value)}
                                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white p-3 pl-10 font-medium shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 xs:text-[10px]"
                                                >
                                                    <option value="">All Terms</option>
                                                    <option value="1st_term">1st Term</option>
                                                    <option value="2nd_term">2nd Term</option>
                                                    <option value="3rd_term">3rd Term</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* From Year */}
                                        <div className="md:col-span-1 lg:col-span-1">
                                            <label className="mb-1 block text-sm font-medium text-gray-700 xs:text-[10px]">Term Start (Year)</label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <FaCalendarAlt className="text-gray-400 xs:text-[10px]" />
                                                </div>
                                                <input
                                                    type="number"
                                                    value={fromDate}
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                    placeholder="YYYY"
                                                    min={1900}
                                                    max={2100}
                                                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 xs:text-[10px]"
                                                />
                                            </div>
                                        </div>

                                        {/* To Year */}
                                        <div className="md:col-span-1 lg:col-span-1">
                                            <label className="mb-1 block text-sm font-medium text-gray-700 xs:text-[10px]">Term End (Year)</label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 xs:text-[10px]">
                                                    <FaCalendarAlt className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="number"
                                                    value={toDate}
                                                    onChange={(e) => setToDate(e.target.value)}
                                                    placeholder="YYYY"
                                                    min={1900}
                                                    max={2100}
                                                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 xs:text-[10px]"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <SafeSkeletonCard key={i} />
                            ))}
                        </div>
                    ) : isGroupPublicAuthor?.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="mb-4 text-5xl text-gray-400">
                                <FaUserAlt className="inline" />
                            </div>
                            <h3 className="mb-2 text-xl font-medium text-gray-600">No members found</h3>
                            <p className="text-gray-500">
                                {hasActiveFilters ? "Try adjusting your filters to see more results" : "There are currently no members to display"}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 font-medium text-blue-600 hover:text-blue-800"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div
                                ref={memberGridRef}
                                className="grid grid-cols-2 gap-4 lg:grid-cols-4"
                            >
                                {isGroupPublicAuthor?.map((member, index) => (
                                    <div
                                        key={member._id || member.id}
                                        className="member-card translate-y-4 opacity-0"
                                        style={{ transitionDelay: `${index * 50}ms` }}
                                    >
                                        <SafeMemberCard
                                            member={member}
                                            openModal={openModal}
                                        />
                                    </div>
                                ))}
                            </div>
                            {totalPages > 0 && renderPagination()}
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <SafeMemberModal
                    member={selectedMember}
                    closeModal={closeModal}
                    FilesByPosition={FilesByPosition || []}
                    PositioncurentPage={PositioncurentPage}
                    PositiontotalPage={PositiontotalPage}
                    Totaldata={Totaldata}
                    fetchFilesByPosition={fetchFilesByPosition} 
                    isLoading={isLoading}
                />
            )}

            <button
                id="backToTopBtn"
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-20 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl ${
                    showBackToTop ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
                }`}
                aria-label="Back to top"
            >
                <FaArrowUp className="h-6 w-6" />
            </button>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(1rem);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default SBmember;
import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import BannerImage from "./BannerImage";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { FaSearch, FaFilter, FaUserAlt, FaArrowUp, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import _ from "lodash";
import MemberProfile from "./MemberProfile";
import Breadcrumb from "./Breadcrumb";

// Safe extraction ng components mula sa MemberProfile
const MemberCard = MemberProfile?.MemberCard;
const MemberModal = MemberProfile?.MemberModal;
const SkeletonCard = MemberProfile?.SkeletonCard;

const SBmember = ({ Position, onBack }) => {
    // ==========================================
    // 1. ALL HOOKS FIRST (TOP LEVEL)
    // ==========================================
    const { isGroupPublicAuthor, DisplayPublicAuthor, currentPage, totalPages, setCurrentPage, loading, setLoading } =
        useContext(SbMemberDisplayContext);

    const { FilesByPosition, fetchFilesByPosition, PositioncurentPage, PositiontotalPage, Totaldata, isLoading } = 
        useContext(FilesDisplayContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [positionFilter, setPositionFilter] = useState(null);
    const [termFilter, setTermFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [availablePositions, setAvailablePositions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const initialLoad = useRef(true);
    const positionsInitialized = useRef(false);
    const memberGridRef = useRef(null);

    // ==========================================
    // 2. LOGIC & HELPERS
    // ==========================================
    const isSbMembers = useCallback((pos) => {
        if (!pos) return false;
        const clean = pos.toLowerCase().replace(/[^a-z0-9]/g, "");
        return clean === "sbmember" || clean === "sbmembers";
    }, []);

    const isSbMembersFlag = Position && isSbMembers(Position);

    // Filter Fetch Logic
    const fetchWithFilters = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                Position: positionFilter || "",
                term_from: fromDate,
                term_to: toDate,
                term: termFilter,
                page: currentPage,
            };
            await DisplayPublicAuthor(params);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, positionFilter, fromDate, toDate, termFilter, currentPage, DisplayPublicAuthor, setLoading]);

    const debouncedFetch = useCallback(_.debounce(() => fetchWithFilters(), 500), [fetchWithFilters]);

    // ==========================================
    // 3. USE EFFECTS (ORDER IS STABLE)
    // ==========================================

    // Initialize positions list
    useEffect(() => {
        if (isGroupPublicAuthor?.length > 0 && !positionsInitialized.current) {
            const positionSet = new Set();
            const originalPositions = [];
            isGroupPublicAuthor.forEach((member) => {
                const pos = member.memberInfo?.Position || member.memberInfo?.position || "";
                if (pos) {
                    const normalized = pos.toLowerCase().replace(/[^a-z0-9]/g, "");
                    if (!positionSet.has(normalized)) {
                        positionSet.add(normalized);
                        originalPositions.push(pos);
                    }
                }
            });
            setAvailablePositions(originalPositions);
            positionsInitialized.current = true;
        }
    }, [isGroupPublicAuthor]);

    // Update filter when prop "Position" changes
    useEffect(() => {
        if (Position && Position.toLowerCase() !== "all") {
            setPositionFilter(isSbMembersFlag ? null : Position);
            setCurrentPage(1);
        }
    }, [Position, isSbMembersFlag, setCurrentPage]);

    // Debounced search trigger
    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false;
            fetchWithFilters();
            return;
        }
        debouncedFetch();
        return () => debouncedFetch.cancel();
    }, [searchTerm, positionFilter, fromDate, toDate, termFilter, currentPage, debouncedFetch, fetchWithFilters]);

    // Back to top listener
    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Handlers
    const clearFilters = () => {
        setSearchTerm("");
        setPositionFilter(isSbMembersFlag ? null : Position);
        setFromDate("");
        setToDate("");
        setTermFilter("");
    };

    const hasActiveFilters = searchTerm || positionFilter || termFilter || fromDate || toDate;

    // ==========================================
    // 4. RENDER HELPERS
    // ==========================================
    const renderPagination = () => {
        if (totalPages <= 1 || loading) return null;
        return (
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 disabled:opacity-30"
                    >
                        <FaChevronLeft className="text-blue-600" />
                    </button>
                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                            .map((p, idx, arr) => (
                                <React.Fragment key={p}>
                                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-300">...</span>}
                                    <button
                                        onClick={() => setCurrentPage(p)}
                                        className={`h-10 w-10 rounded-full text-xs font-bold transition-all ${currentPage === p ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600"}`}
                                    >
                                        {p}
                                    </button>
                                </React.Fragment>
                            ))
                        }
                    </div>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 disabled:opacity-30"
                    >
                        <FaChevronRight className="text-blue-600" />
                    </button>
                </div>
            </div>
        );
    };

    // ==========================================
    // 5. RENDER UI
    // ==========================================
    return (
        <div className="relative min-h-screen bg-[#0a192f] pb-12 font-sans">
            {/* Background Grid Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                {/* Removed the radial gradient circle (was blue, not yellow) */}
                <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            <div className="relative z-10">
                <BannerImage selection={"SP Members"} />
                <Breadcrumb position={"SP Members"} onBack={onBack} />

                <div className="mx-auto mt-4 max-w-7xl px-3 sm:px-6 md:mt-10 lg:px-8">
                    <div className="rounded-2xl bg-white p-4 shadow-2xl md:p-8">
                        
                        {/* Header: Responsive flex */}
                        <header className="mb-6 border-b border-gray-100 pb-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="text-left">
                                    <h1 className="flex items-center gap-3 text-xl font-black text-gray-800 md:text-3xl">
                                        <div className="rounded-lg bg-blue-600 p-2 text-white">
                                            <FaUserAlt className="text-sm md:text-xl" />
                                        </div>
                                        SP Directory
                                    </h1>
                                    <p className="mt-1 text-xs font-medium text-gray-500 md:text-sm">
                                        Official list of Sangguniang Panlalawigan members.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase text-blue-700 ring-1 ring-blue-100">
                                        {isGroupPublicAuthor?.length || 0} Results
                                    </span>
                                    {hasActiveFilters && (
                                        <button onClick={clearFilters} className="text-[10px] font-bold uppercase text-red-500 hover:underline">
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        </header>

                        {/* Search and Toggle Filters */}
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-grow">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border-0 bg-gray-100 p-3.5 pl-11 text-sm font-semibold ring-1 ring-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all active:scale-95 ${
                                    showFilters ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                <FaFilter className={showFilters ? "animate-pulse" : ""} />
                                {showFilters ? "Hide Filters" : "Filter"}
                            </button>
                        </div>

                        {/* Filter Panel (Mobile Stacked) */}
                        {showFilters && (
                            <div className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-blue-50 bg-blue-50/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Position</label>
                                    <select
                                        value={positionFilter || ""}
                                        onChange={(e) => setPositionFilter(e.target.value || null)}
                                        className="w-full rounded-lg border-gray-200 bg-white p-2.5 text-sm font-bold"
                                    >
                                        <option value="">All Positions</option>
                                        {availablePositions.map((pos, i) => (
                                            <option key={i} value={pos}>{pos}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Term</label>
                                    <select
                                        value={termFilter}
                                        onChange={(e) => setTermFilter(e.target.value)}
                                        className="w-full rounded-lg border-gray-200 bg-white p-2.5 text-sm font-bold"
                                    >
                                        <option value="">Any Term</option>
                                        <option value="1st_term">1st Term</option>
                                        <option value="2nd_term">2nd Term</option>
                                        <option value="3rd_term">3rd Term</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">From Year</label>
                                    <input
                                        type="number"
                                        placeholder="YYYY"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full rounded-lg border-gray-200 bg-white p-2.5 text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">To Year</label>
                                    <input
                                        type="number"
                                        placeholder="YYYY"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full rounded-lg border-gray-200 bg-white p-2.5 text-sm font-bold"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Results Area */}
                        {loading ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    SkeletonCard ? <SkeletonCard key={i} /> : <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />
                                ))}
                            </div>
                        ) : isGroupPublicAuthor?.length > 0 ? (
                            <>
                                <div ref={memberGridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {isGroupPublicAuthor.map((member) => (
                                        <div key={member._id} className="transform transition-transform duration-300 hover:-translate-y-1">
                                            {MemberCard && (
                                                <MemberCard 
                                                    member={member} 
                                                    openModal={(m) => { setSelectedMember(m); setIsModalOpen(true); }} 
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {renderPagination()}
                            </>
                        ) : (
                            <div className="py-20 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                                    <FaUserAlt size={30} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">No results found</h2>
                                <p className="text-sm text-gray-500">Try changing your search terms or filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && MemberModal && (
                <MemberModal
                    member={selectedMember}
                    closeModal={() => { setIsModalOpen(false); setSelectedMember(null); }}
                    FilesByPosition={FilesByPosition || []}
                    PositioncurentPage={PositioncurentPage}
                    PositiontotalPage={PositiontotalPage}
                    Totaldata={Totaldata}
                    fetchFilesByPosition={fetchFilesByPosition}
                    isLoading={isLoading}
                />
            )}

            {/* Floating Back to Top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition-all duration-300 ${
                    showBackToTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                }`}
            >
                <FaArrowUp />
            </button>
        </div>
    );
};

export default SBmember;
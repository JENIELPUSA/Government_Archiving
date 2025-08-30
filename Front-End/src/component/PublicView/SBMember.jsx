import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { SbMemberDisplayContext } from "../../contexts/SbContext/SbContext";
import { FaSearch, FaFilter, FaUserAlt, FaCalendarAlt, FaArrowUp, FaChevronLeft, FaChevronRight, FaTimes, FaList } from "react-icons/fa";
import _ from "lodash";

// Import the member profile components
import MemberProfile from "./MemberProfile";
const { MemberCard, MemberModal, SkeletonCard, SkeletonFilter } = MemberProfile;

const SBmember = () => {
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
  const [showFilters, setShowFilters] = useState(false);

  const initialLoad = useRef(true);
  const positionsInitialized = useRef(false);
  const scrollTimeout = useRef(null);
  const memberGridRef = useRef(null);
  const headerRef = useRef(null);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPositionFilter("all");
    setFromDate("");
    setToDate("");
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

  // Add scroll animation for member cards
  useEffect(() => {
    if (!memberGridRef.current || loading) return;
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const memberCards = memberGridRef.current.querySelectorAll('.member-card');
    memberCards.forEach(card => {
      observer.observe(card);
    });
    
    return () => {
      observer.disconnect();
    };
  }, [isGroupPublicAuthor, loading]);

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
        className={`mx-1 flex items-center justify-center rounded-lg px-3 py-2 transition-all duration-300 ${
          currentPage === 1 ? "cursor-not-allowed bg-gray-100 text-gray-400" : "bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:shadow-md"
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
          className={`mx-1 rounded-lg px-3 py-2 transition-all duration-300 ${
            currentPage === 1 ? "bg-blue-600 font-bold text-white shadow-md" : "bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:shadow-md"
          }`}
        >
          1
        </button>,
      );

      if (startPage > 2) {
        pages.push(
          <span
            key="start-ellipsis"
            className="mx-1 px-2 py-2"
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
          className={`mx-1 rounded-lg px-3 py-2 transition-all duration-300 ${
            currentPage === i ? "bg-blue-600 font-bold text-white shadow-md" : "bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:shadow-md"
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
            className="mx-1 px-2 py-2"
          >
            ...
          </span>,
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`mx-1 rounded-lg px-3 py-2 transition-all duration-300 ${
            currentPage === totalPages ? "bg-blue-600 font-bold text-white shadow-md" : "bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:shadow-md"
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
        className={`mx-1 flex items-center justify-center rounded-lg px-3 py-2 transition-all duration-300 ${
          currentPage === totalPages ? "cursor-not-allowed bg-gray-100 text-gray-400" : "bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:shadow-md"
        }`}
      >
        <FaChevronRight className="inline" />
      </button>,
    );

    return (
      <div className="mt-8 flex flex-wrap justify-center items-center">
        <span className="text-sm text-gray-600 mr-4">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex flex-wrap justify-center">{pages}</div>
      </div>
    );
  };

  const hasActiveFilters = searchTerm || positionFilter !== "all" || fromDate || toDate;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl bg-white p-6 rounded-xl shadow-sm md:p-8">
        <header ref={headerRef} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center text-2xl font-bold text-gray-800 md:text-3xl">
                <span className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-600">
                  <FaUserAlt />
                </span>
                SB Members Directory
              </h1>
              <p className="mt-2 text-gray-600">
                Browse and search through the complete list of Sangguniang Bayan members
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {isGroupPublicAuthor?.length || 0} Members
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-4 flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes className="mr-1" />
                Clear filters
              </button>
            )}
          </div>
        </header>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <FaTimes className="text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center md:justify-start px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 ml-auto hover:shadow-sm"
            >
              <FaFilter className="mr-2 text-gray-600" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 bg-gray-50 p-4 rounded-lg transition-all duration-500 ease-in-out">
              {loading ? (
                <>
                  <SkeletonFilter />
                  <SkeletonFilter />
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaFilter className="text-gray-400" />
                      </div>
                      <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white p-3 pl-10 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="all">All Positions</option>
                        {availablePositions.map((position, index) => (
                          <option
                            key={index}
                            value={position}
                          >
                            {position}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Term Start (Year)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        placeholder="YYYY"
                        min={1900}
                        max={2100}
                        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Term End (Year)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        placeholder="YYYY"
                        min={1900}
                        max={2100}
                        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : isGroupPublicAuthor?.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-gray-400 mb-4 text-5xl">
              <FaUserAlt className="inline" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No members found</h3>
            <p className="text-gray-500">
              {hasActiveFilters 
                ? "Try adjusting your filters to see more results" 
                : "There are currently no members to display"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div ref={memberGridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {isGroupPublicAuthor?.map((member, index) => (
                <div 
                  key={member._id || member.id} 
                  className="member-card opacity-0 transition-all duration-500 ease-out translate-y-4"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <MemberCard
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

      {isModalOpen && (
        <MemberModal
          member={selectedMember}
          closeModal={closeModal}
        />
      )}

      <button
        id="backToTopBtn"
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all duration-500 hover:bg-blue-700 hover:shadow-xl ${
          showBackToTop ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-90"
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
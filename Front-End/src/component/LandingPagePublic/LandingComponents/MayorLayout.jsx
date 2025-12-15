import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import {Clock, Mail, User } from "lucide-react";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import Breadcrumb from "./Breadcrumb";
import BannerImage from "./BannerImage";

const extractYear = (dateStr) => {
  if (!dateStr) return null;
  const year = new Date(dateStr).getFullYear();
  return isNaN(year) ? null : year;
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const OfficialProfileLayout = ({ fullName, Position, onBack }) => {
  const {
    DisplaySpecificPublicAuthor,
    loading: contextLoading,
    isGroupSpecificAuthor,
    DisplaySummaryTerm,
    isSummaryTerm,
    isGroupPublicAuthor,
  } = useContext(SbMemberDisplayContext);

  const [official, setOfficial] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔹 Enhanced Avatar shuffle states
  const [currentImage, setCurrentImage] = useState("/placeholder-avatar.png");
  const [shuffling, setShuffling] = useState(true);
  const [showShuffleBadge, setShowShuffleBadge] = useState(false);
  const [imageKey, setImageKey] = useState(0); // For forcing re-render with animations

  const isLoading = contextLoading || localLoading;
  const lastProfileKey = useRef(null);
  const hasFetched = useRef(false);

  // 🔹 Fetch official
  useEffect(() => {
    const profileKey = `${fullName || ""}-${Position || ""}`;

    if (profileKey !== lastProfileKey.current) {
      setOfficial(null);
      setLocalLoading(true);
      hasFetched.current = false;
      lastProfileKey.current = profileKey;
      // Reset avatar state when switching profiles
      setCurrentImage("/placeholder-avatar.png");
      setShuffling(true);
      setShowShuffleBadge(false);
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchOfficial = async () => {
      try {
        const query = { search: fullName || "" };
        if (!fullName && Position) query.Position = Position;
        await DisplaySpecificPublicAuthor(query);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchOfficial();
  }, [fullName, Position, DisplaySpecificPublicAuthor]);

  const lastFetchedProfile = useRef({ first: "", middle: "", last: "" });

  // 🔹 Update official when loaded
  useEffect(() => {
    if (isGroupSpecificAuthor?.length > 0) {
      const officialData = isGroupSpecificAuthor[0];
      setOfficial(officialData);

      const profile = officialData.memberInfo || officialData;
      const first_name = profile.first_name || "";
      const middle_name = profile.middle_name || "";
      const last_name = profile.last_name || "";

      const prev = lastFetchedProfile.current;
      if (
        prev.first === first_name &&
        prev.middle === middle_name &&
        prev.last === last_name
      ) {
        return;
      }

      lastFetchedProfile.current = {
        first: first_name,
        middle: middle_name,
        last: last_name,
      };

      if (first_name || last_name) {
        DisplaySummaryTerm({
          first_name,
          middle_name,
          last_name,
        }).catch((err) => {
          console.error("Failed to fetch summary term:", err);
        });
      }
    } else {
      setOfficial(null);
      lastFetchedProfile.current = { first: "", middle: "", last: "" };
    }
  }, [isGroupSpecificAuthor, DisplaySummaryTerm]);

  // 🔹 Enhanced Slot machine effect with multiple cool features
  useEffect(() => {
    // If no specific author yet, keep placeholder
    if (!isGroupSpecificAuthor?.length) {
      setCurrentImage("/placeholder-avatar.png");
      setShuffling(false);
      setShowShuffleBadge(false);
      return;
    }

    // If no public authors to shuffle from, show final image immediately
    if (!isGroupPublicAuthor?.length || isGroupPublicAuthor.length < 2) {
      const finalImg =
        isGroupSpecificAuthor[0]?.memberInfo?.avatar?.url ||
        isGroupSpecificAuthor[0]?.avatar?.url ||
        "/placeholder-avatar.png";
      setCurrentImage(finalImg);
      setShuffling(false);
      setShowShuffleBadge(false);
      setImageKey(prev => prev + 1); // Trigger pop-in animation
      return;
    }

    // Start enhanced shuffling
    setShuffling(true);
    setShowShuffleBadge(true);
    
    let shuffleCount = 0;
    const maxShuffles = 15; // Total number of shuffles
    
    const shuffleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * isGroupPublicAuthor.length);
      const randomImg =
        isGroupPublicAuthor[randomIndex]?.memberInfo?.avatar?.url ||
        isGroupPublicAuthor[randomIndex]?.avatar?.url ||
        "/placeholder-avatar.png";
      setCurrentImage(randomImg);
      shuffleCount++;
      
      // Speed up shuffle towards the end for dramatic effect
      if (shuffleCount > maxShuffles * 0.7) {
        clearInterval(shuffleInterval);
        const fastInterval = setInterval(() => {
          const fastRandomIndex = Math.floor(Math.random() * isGroupPublicAuthor.length);
          const fastRandomImg =
            isGroupPublicAuthor[fastRandomIndex]?.memberInfo?.avatar?.url ||
            isGroupPublicAuthor[fastRandomIndex]?.avatar?.url ||
            "/placeholder-avatar.png";
          setCurrentImage(fastRandomImg);
          shuffleCount++;
        }, 100);
        
        setTimeout(() => {
          clearInterval(fastInterval);
          revealFinalImage();
        }, 800);
      }
    }, 200);

    const revealFinalImage = () => {
      const finalImg =
        isGroupSpecificAuthor[0]?.memberInfo?.avatar?.url ||
        isGroupSpecificAuthor[0]?.avatar?.url ||
        "/placeholder-avatar.png";
      setCurrentImage(finalImg);
      setShuffling(false);
      setImageKey(prev => prev + 1); // Trigger final animation
      
      // Hide badge after a delay
      setTimeout(() => {
        setShowShuffleBadge(false);
      }, 1000);
    };

    const timeout = setTimeout(() => {
      clearInterval(shuffleInterval);
      revealFinalImage();
    }, 3000);

    return () => {
      clearInterval(shuffleInterval);
      clearTimeout(timeout);
    };
  }, [isGroupPublicAuthor, isGroupSpecificAuthor]);

  const { ordinancesByYear, resolutionsByYear } = useMemo(() => {
    if (!official || !isSummaryTerm || isSummaryTerm.length === 0) {
      return { ordinancesByYear: {}, resolutionsByYear: {} };
    }

    const ordMap = {};
    const resMap = {};

    isSummaryTerm[0].terms.forEach((termItem) => {
      if (termItem.titles && Array.isArray(termItem.titles)) {
        termItem.titles.forEach((titleObj) => {
          const title =
            typeof titleObj === "string" ? titleObj : titleObj.title;
          const date = typeof titleObj === "string" ? null : titleObj.date;
          const year = extractYear(date) || "Unknown";
          if (!ordMap[year]) ordMap[year] = [];
          ordMap[year].push(title);
        });
      }

      if (termItem.summaries && Array.isArray(termItem.summaries)) {
        termItem.summaries.forEach((summaryObj) => {
          const title =
            typeof summaryObj === "string" ? summaryObj : summaryObj.title;
          const date =
            typeof summaryObj === "string" ? null : summaryObj.date;
          const year = extractYear(date) || "Unknown";
          if (!resMap[year]) resMap[year] = [];
          resMap[year].push(title);
        });
      }
    });

    return { ordinancesByYear: ordMap, resolutionsByYear: resMap };
  }, [official, isSummaryTerm]);

  const profileData = useMemo(() => {
    return official?.memberInfo || official || {};
  }, [official]);

  // CSS for animations (you can also put this in your CSS file)
  const animationStyles = `
    @keyframes pop-in {
      0% { transform: scale(0.8); opacity: 0; }
      80% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes shuffle-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    @keyframes badge-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes glitch {
      0% { transform: translate(0); filter: hue-rotate(0deg); }
      10% { transform: translate(-2px, 2px); }
      20% { transform: translate(2px, -2px); }
      30% { transform: translate(-2px, -2px); filter: hue-rotate(90deg); }
      40% { transform: translate(2px, 2px); }
      50% { transform: translate(-2px, 2px); filter: hue-rotate(180deg); }
      60% { transform: translate(2px, -2px); }
      70% { transform: translate(-2px, -2px); filter: hue-rotate(270deg); }
      80% { transform: translate(2px, 2px); }
      90% { transform: translate(-2px, 2px); }
      100% { transform: translate(0); filter: hue-rotate(360deg); }
    }
    .animate-pop-in {
      animation: pop-in 0.6s ease-out;
    }
    .animate-shuffle-pulse {
      animation: shuffle-pulse 0.2s ease-in-out infinite;
    }
    .animate-badge-pulse {
      animation: badge-pulse 1s ease-in-out infinite;
    }
    .animate-glitch {
      animation: glitch 0.3s ease-in-out;
    }
  `;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BannerImage selection={Position} />
        <div className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <div className="mb-5 space-y-3">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200"></div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            <div className="flex-1 space-y-6">
              <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="mx-auto h-48 w-48 animate-pulse rounded-lg bg-gray-200 sm:h-64 sm:w-64 md:mx-0"></div>
                  <div className="mt-4 flex-1 space-y-4 md:mt-0">
                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                      <div className="mb-2 h-4 w-1/3 animate-pulse rounded bg-blue-200"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-blue-200"></div>
                        <div className="h-3 w-1/2 animate-pulse rounded bg-blue-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 h-6 w-1/4 animate-pulse rounded bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-3 h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {[1, 2, 3, 4].map((i) => (
                          <th key={i} className="px-3 py-2 sm:px-6 sm:py-3">
                            <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2].map((row) => (
                        <tr key={row} className="border-b border-gray-200">
                          {[1, 2, 3, 4].map((col) => (
                            <td key={col} className="px-3 py-3 sm:px-6 sm:py-4">
                              <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200"></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:w-64">
              <div className="sticky top-24 rounded-xl bg-white p-4 shadow-sm">
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div>
                    <div className="mb-2 h-3 w-20 animate-pulse rounded bg-gray-300"></div>
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i}>
                          <div className="mb-1 h-2.5 w-10 animate-pulse rounded bg-blue-200"></div>
                          <div className="space-y-1">
                            <div className="h-2 w-4/5 animate-pulse rounded bg-gray-200"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!official) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="px-4 text-center">
          <h2 className="text-xl font-bold text-gray-800">No Official Found</h2>
          <p className="mt-2 text-gray-600">
            No {Position} is currently listed in the system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Inject animation styles */}
      <style>{animationStyles}</style>
      
      <BannerImage selection={Position} />
      <Breadcrumb position={Position} onBack={onBack} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-5">
          <h1 className="mb-2 text-left text-2xl font-bold text-blue-600 sm:text-3xl md:text-4xl">
            HON. {official.fullName || "Name not available"}
          </h1>
          <p className="text-left text-lg font-medium text-gray-700 sm:text-xl md:text-2xl">
            {profileData.Position || Position}
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Profile Content */}
          <div className="flex-1">
            <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-shrink-0 relative">
                  {/* Enhanced Avatar Container */}
                  <div className="relative">
                    <img
                      key={imageKey}
                      src={currentImage}
                      alt={official.fullName || "Official"}
                      className={`mx-auto h-48 w-48 rounded-lg border-2 border-gray-200 object-cover sm:h-64 sm:w-64 md:mx-0 md:h-[340px] md:w-64 ${
                        shuffling 
                          ? 'animate-shuffle-pulse border-blue-300' 
                          : 'animate-pop-in border-gray-300'
                      } ${
                        !shuffling && imageKey > 0 ? 'shadow-lg' : ''
                      }`}
                      onError={(e) => {
                        e.target.src = "/placeholder-avatar.png";
                      }}
                    />
                    
                    {showShuffleBadge && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="animate-badge-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-lg xs:text-[8px]">
                          🔄 Searching...
                        </div>
                      </div>
                    )}
                    
                    {!shuffling && imageKey > 0 && (
                      <div className="absolute inset-0 animate-glitch opacity-0">
                        <img
                          src={currentImage}
                          alt="glitch effect"
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                </div>

                <div className="mt-4 flex-1 md:mt-0">
                  <div className="mb-4">
                    <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                      {official.bio
                        ? official.bio
                        : official.detailInfo
                        ? official.detailInfo.split("\n")[0] ||
                          official.detailInfo.substring(0, 200) +
                            (official.detailInfo.length > 200 ? "..." : "")
                        : "Biography not available."}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:text-base">
                      Office of the {profileData.Position || Position}
                    </h3>
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      {profileData.district && (
                        <div className="flex items-start gap-2">
                          <User className="mt-0.5 h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">{profileData.district}</span>
                        </div>
                      )}
                      {profileData.term_from && profileData.term_to && (
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5">📅</span>
                          <span className="text-gray-700">
                            Term: {formatDate(profileData.term_from)} – {formatDate(profileData.term_to)}
                          </span>
                        </div>
                      )}
                      {profileData.term && (
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                          <span className="text-gray-700">
                            {profileData.term.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                          </span>
                        </div>
                      )}
                      {profileData.email && (
                        <div className="flex items-start gap-2">
                          <Mail className="mt-0.5 h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                          <span className="text-gray-700">{profileData.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-900 sm:text-2xl">Biography</h2>
              <div className="space-y-3 text-sm leading-relaxed text-gray-700 sm:text-base">
                {(official.detailInfo || "Biography not available.")
                  .split("\n")
                  .slice(1)
                  .map((para, i) => (
                    <p key={i}>{para.trim() || "\u00A0"}</p>
                  ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-3 border-b pb-2 text-xl font-bold text-gray-900 sm:text-2xl">Term Summary</h2>
              <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700 sm:px-6 sm:py-3">
                        Position
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700 sm:px-6 sm:py-3">
                        Term
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700 sm:px-6 sm:py-3">
                        Ordinances
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700 sm:px-6 sm:py-3">
                        Resolutions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {isSummaryTerm && isSummaryTerm.length > 0 ? (
                      isSummaryTerm[0].terms.map((termItem, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-900 sm:px-6 sm:py-4">
                            {termItem.Position || "—"}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-700 sm:px-6 sm:py-4">
                            <div>
                              {termItem.term && (
                                <span>
                                  {termItem.term.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                                </span>
                              )}
                              {termItem.from && termItem.to && (
                                <span className="ml-1 text-xs text-gray-500 sm:text-sm">
                                  ({termItem.from}–{termItem.to})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm sm:px-6 sm:py-4">
                            {termItem.ordinanceCount > 0 ? (
                              <button
                                onClick={() => {
                                  setModalData({
                                    type: "ordinance",
                                    items: termItem.titles || [],
                                    position: termItem.Position,
                                    term: termItem.term,
                                  });
                                  setIsModalOpen(true);
                                }}
                                className="cursor-pointer text-xs font-medium text-blue-600 hover:underline sm:text-sm"
                              >
                                {termItem.ordinanceCount}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500 sm:text-sm">0</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-sm sm:px-6 sm:py-4">
                            {termItem.resolutionCount > 0 ? (
                              <button
                                onClick={() => {
                                  setModalData({
                                    type: "resolution",
                                    items: termItem.summaries || [],
                                    position: termItem.Position,
                                    term: termItem.term,
                                  });
                                  setIsModalOpen(true);
                                }}
                                className="cursor-pointer text-xs font-medium text-green-600 hover:underline sm:text-sm"
                              >
                                {termItem.resolutionCount}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500 sm:text-sm">0</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-3 py-3 text-center text-sm text-gray-500 sm:px-6 sm:py-4">
                          No term data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SIDEBAR - Only visible on large screens */}
          <div className="hidden lg:block lg:w-64">
            <div className="sticky top-24 rounded-xl bg-white p-4 shadow-sm">
              <div className="border-t border-gray-200 pt-4">
                <div className="mb-4">
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-700">Ordinances</h3>
                  {Object.keys(ordinancesByYear).length > 0 ? (
                    Object.entries(ordinancesByYear)
                      .sort(([a], [b]) => {
                        if (b === "Unknown") return -1;
                        if (a === "Unknown") return 1;
                        return b - a;
                      })
                      .map(([year, titles]) => (
                        <div key={year} className="mb-2">
                          <p className="text-[9px] font-medium text-blue-700">{year}</p>
                          <ul className="mt-1 space-y-1 text-[9px] text-gray-600">
                            {titles.map((title, i) => (
                              <li key={i} className="truncate">
                                {title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                  ) : (
                    <p className="text-[9px] italic text-gray-500">None</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-700">Resolutions</h3>
                  {Object.keys(resolutionsByYear).length > 0 ? (
                    Object.entries(resolutionsByYear)
                      .sort(([a], [b]) => {
                        if (b === "Unknown") return -1;
                        if (a === "Unknown") return 1;
                        return b - a;
                      })
                      .map(([year, titles]) => (
                        <div key={year} className="mb-2">
                          <p className="text-[9px] font-medium text-green-700">{year}</p>
                          <ul className="mt-1 space-y-1 text-[9px] text-gray-600">
                            {titles.map((title, i) => (
                              <li key={i} className="truncate">
                                {title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                  ) : (
                    <p className="text-[9px] italic text-gray-500">None</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && modalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
              <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                {modalData.type === "ordinance" ? "Ordinance Titles" : "Resolution Summaries"}
              </h3>
              <p className="text-xs text-gray-600 sm:text-sm">
                {modalData.position} •{" "}
                {modalData.term ? modalData.term.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Unknown Term"}
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
              {modalData.items.length > 0 ? (
                <ul className="list-disc space-y-1.5 pl-4 text-xs text-gray-700 sm:pl-5 sm:text-sm">
                  {modalData.items.map((item, i) => (
                    <li key={i}>{typeof item === "string" ? item : item.title || item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs italic text-gray-500 sm:text-sm">No data available.</p>
              )}
            </div>

            <div className="border-t bg-gray-50 px-4 py-2 text-right sm:px-6 sm:py-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialProfileLayout;
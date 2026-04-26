import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Clock, Mail, User, UserCircle } from "lucide-react";
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

const OfficialProfileLayout = ({ member: directMember, fullName, Position, onBack }) => {
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
    const [currentImage, setCurrentImage] = useState("/placeholder-avatar.png");
    const [imageKey, setImageKey] = useState(0);
    const [isBiographyExpanded, setIsBiographyExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const biographyRef = useRef(null);

    const isLoading = contextLoading || localLoading;
    const lastProfileKey = useRef(null);
    const hasFetched = useRef(false);
    
    const formatPositionForDisplay = (pos) => {
        const positionMap = {
            Board_Member: "Board Member",
            Vice_Governor: "Vice Governor",
            Vice_Mayor: "Vice Mayor",
            Mayor: "Mayor",
            Governor: "Governor",
        };
        return positionMap[pos] || pos;
    };

    const formatPositionForBanner = (pos) => {
        const bannerMap = {
            Board_Member: "Board Member",
            Vice_Governor: "Vice Governor",
            Vice_Mayor: "Vice Mayor",
            Mayor: "Mayor",
            Governor: "Governor",
            "SP Members": "SP Members",
        };
        return bannerMap[pos] || pos;
    };

    const getOfficeTitle = (pos) => {
        const officeMap = {
            Board_Member: "Sangguniang Panlalawigan Member",
            Vice_Governor: "Office of the Vice Governor",
            Vice_Mayor: "Office of the Vice Mayor",
            Mayor: "Office of the Mayor",
            Governor: "Office of the Governor",
        };
        return officeMap[pos] || `Office of the ${pos}`;
    };

    const getMemberName = (member) => {
        return member?.fullName ||
            `${member?.first_name || ""} ${member?.last_name || ""}`.trim() ||
            member?.name ||
            null;
    };

    const getMemberPosition = (member) => {
        return member?.memberInfo?.Position ||
            member?.memberInfo?.position ||
            member?.Position ||
            member?.position ||
            null;
    };

    // Helper function to get role badge color
    const getRoleBadgeColor = (role) => {
        switch(role) {
            case "Chairperson":
                return "bg-blue-100 text-blue-800";
            case "ViceChairperson":
                return "bg-purple-100 text-purple-800";
            case "Member":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Compute profileData and currentOfficial before using them in effects
    const profileData = useMemo(() => {
        const currentOfficial = official || directMember;
        return currentOfficial?.memberInfo || currentOfficial || {};
    }, [official, directMember]);

    const currentOfficial = official || directMember;
    const currentPosition = profileData.Position || Position || getMemberPosition(directMember);
    const currentFullName = currentOfficial?.fullName ||
        `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() ||
        getMemberName(directMember) ||
        "Name not available";

    // Check if biography needs truncation - moved after currentOfficial is defined
    useEffect(() => {
        if (biographyRef.current && currentOfficial) {
            const element = biographyRef.current;
            const lineHeight = parseInt(getComputedStyle(element).lineHeight);
            const maxHeight = lineHeight * 6; // 6 lines max before truncation
            const needsCollapse = element.scrollHeight > maxHeight;
            setNeedsTruncation(needsCollapse);
        }
    }, [currentOfficial, isBiographyExpanded]);

    // If member is passed directly, use it immediately
    useEffect(() => {
        if (directMember) {
            setOfficial(directMember);
            setLocalLoading(false);

            // Fetch summary term for this member
            const firstName = directMember.first_name || directMember.memberInfo?.first_name;
            const lastName = directMember.last_name || directMember.memberInfo?.last_name;

            if (firstName || lastName) {
                DisplaySummaryTerm({
                    first_name: firstName || "",
                    middle_name: directMember.middle_name || directMember.memberInfo?.middle_name || "",
                    last_name: lastName || "",
                }).catch(err => console.error("Failed to fetch summary term:", err));
            }
            return;
        }
    }, [directMember, DisplaySummaryTerm]);

    // Fetch official from API if no direct member provided
    useEffect(() => {
        if (directMember) return; // Skip API fetch if we have direct member

        const profileKey = `${fullName || ""}-${Position || ""}`;

        if (profileKey !== lastProfileKey.current) {
            setOfficial(null);
            setLocalLoading(true);
            hasFetched.current = false;
            lastProfileKey.current = profileKey;
            setCurrentImage("/placeholder-avatar.png");
        }

        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchOfficial = async () => {
            try {
                let query = {};
                if (fullName && fullName !== "Name not available") {
                    query.search = fullName;
                } else if (Position) {
                    query.Position = Position;
                }
                await DisplaySpecificPublicAuthor(query);
            } catch (error) {
                console.error("Failed to fetch official:", error);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchOfficial();
    }, [fullName, Position, DisplaySpecificPublicAuthor, directMember]);

    const lastFetchedProfile = useRef({ first: "", middle: "", last: "" });

    // Update official when loaded from API
    useEffect(() => {
        if (directMember) return; // Skip if we already have direct member

        if (isGroupSpecificAuthor?.length > 0) {
            const officialData = isGroupSpecificAuthor[0];
            setOfficial(officialData);

            const profile = officialData.memberInfo || officialData;
            const first_name = profile.first_name || "";
            const middle_name = profile.middle_name || "";
            const last_name = profile.last_name || "";

            const prev = lastFetchedProfile.current;
            if (prev.first === first_name && prev.middle === middle_name && prev.last === last_name) {
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
        } else if (!directMember) {
            setOfficial(null);
            lastFetchedProfile.current = { first: "", middle: "", last: "" };
        }
    }, [isGroupSpecificAuthor, DisplaySummaryTerm, directMember]);

    // Direct image display without shuffle effect
    useEffect(() => {
        if (!official && !directMember) {
            setCurrentImage("/placeholder-avatar.png");
            return;
        }

        const currentOfficial = official || directMember;
        
        // Directly set the final image
        const finalImg = currentOfficial?.memberInfo?.avatar?.url ||
            currentOfficial?.avatar?.url ||
            "/placeholder-avatar.png";
        
        setCurrentImage(finalImg);
        setImageKey((prev) => prev + 1);
        
    }, [official, directMember, isGroupPublicAuthor]);

    // Process term data from isSummaryTerm
    const termData = useMemo(() => {
        if (!isSummaryTerm || isSummaryTerm.length === 0) {
            return { terms: [], ordinancesByYear: {}, resolutionsByYear: {} };
        }

        const summaryData = isSummaryTerm[0];
        
        // Check if the data has the old structure (with terms array) or new structure (direct files)
        if (summaryData.terms && Array.isArray(summaryData.terms)) {
            // Old structure with nested terms
            const ordMap = {};
            const resMap = {};
            
            summaryData.terms.forEach((termItem) => {
                if (termItem.titles && Array.isArray(termItem.titles)) {
                    termItem.titles.forEach((titleObj) => {
                        const title = typeof titleObj === "string" ? titleObj : titleObj.title;
                        const date = typeof titleObj === "string" ? null : titleObj.date;
                        const year = extractYear(date) || "Unknown";
                        if (!ordMap[year]) ordMap[year] = [];
                        ordMap[year].push({ title, role: titleObj.role || null });
                    });
                }
    
                if (termItem.summaries && Array.isArray(termItem.summaries)) {
                    termItem.summaries.forEach((summaryObj) => {
                        const title = typeof summaryObj === "string" ? summaryObj : summaryObj.title;
                        const date = typeof summaryObj === "string" ? null : summaryObj.date;
                        const year = extractYear(date) || "Unknown";
                        if (!resMap[year]) resMap[year] = [];
                        resMap[year].push({ title, role: summaryObj.role || null });
                    });
                }
            });
            
            return { 
                terms: summaryData.terms, 
                ordinancesByYear: ordMap, 
                resolutionsByYear: resMap 
            };
        } 
        
        // New structure based on your data
        // Use the counts directly from summaryData instead of counting from files
        const termObj = {
            Position: summaryData.Position || summaryData.position,
            term: summaryData.term,
            from: summaryData.from,
            to: summaryData.to,
            ordinanceCount: summaryData.ordinanceCount || 0,  // Use the provided count
            resolutionCount: summaryData.resolutionCount || 0, // Use the provided count
            titles: [], // ordinances with roles
            summaries: [] // resolutions with roles
        };
        
        // Process files array for ordinances and resolutions (for display in modal)
        const ordMap = {};
        const resMap = {};
        
        if (summaryData.files && Array.isArray(summaryData.files)) {
            summaryData.files.forEach((file) => {
                const title = file.title || "";
                const category = file.category || "";
                const roles = file.roles || [];
                
                // Get the primary role (first role in the array, or "Member" if empty)
                const primaryRole = roles.length > 0 ? roles[0] : "Member";
                
                if (category === "Ordinance") {
                    termObj.titles.push({ title, role: primaryRole, allRoles: roles });
                    // Don't increment count here - use the provided count
                    
                    // Group by year for sidebar
                    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
                    const year = yearMatch ? yearMatch[0] : "Unknown";
                    if (!ordMap[year]) ordMap[year] = [];
                    ordMap[year].push({ title, role: primaryRole, allRoles: roles });
                } else if (category === "Resolution") {
                    termObj.summaries.push({ title, role: primaryRole, allRoles: roles });
                    // Don't increment count here - use the provided count
                    
                    // Group by year for sidebar
                    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
                    const year = yearMatch ? yearMatch[0] : "Unknown";
                    if (!resMap[year]) resMap[year] = [];
                    resMap[year].push({ title, role: primaryRole, allRoles: roles });
                }
            });
        }
        
        return { 
            terms: [termObj], 
            ordinancesByYear: ordMap, 
            resolutionsByYear: resMap 
        };
    }, [isSummaryTerm]);

    const animationStyles = `
    @keyframes pop-in {
      0% { transform: scale(0.8); opacity: 0; }
      80% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop-in {
      animation: pop-in 0.6s ease-out;
    }
    `;

    if (isLoading && !directMember) {
        return (
            <div className="min-h-screen bg-gray-50">
                <BannerImage selection={formatPositionForBanner(currentPosition)} />
                <div className="border-b bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-3">
                        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
                    </div>
                </div>
                <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
                    {/* Skeleton loading UI */}
                    <div className="mb-5 space-y-3">
                        <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200"></div>
                    </div>
                    <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
                                <div className="flex flex-col gap-6 md:flex-row">
                                    <div className="mx-auto h-48 w-48 animate-pulse rounded bg-gray-200 sm:h-64 sm:w-64 md:mx-0"></div>
                                    <div className="mt-4 flex-1 space-y-4 md:mt-0">
                                        <div className="space-y-2">
                                            <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                                            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
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

    if (!currentOfficial) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="px-4 text-center">
                    <h2 className="text-xl font-bold text-gray-800">No Official Found</h2>
                    <p className="mt-2 text-gray-600">
                        No {formatPositionForDisplay(currentPosition)} is currently listed in the system.
                    </p>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Get biography paragraphs
    const biographyParagraphs = (currentOfficial.detailInfo || "Biography not available.")
        .split("\n")
        .slice(1)
        .filter(para => para.trim());

    const displayedParagraphs = isBiographyExpanded 
        ? biographyParagraphs 
        : biographyParagraphs.slice(0, 3); // Show only first 3 paragraphs when collapsed

    return (
        <div className="min-h-screen bg-blue-950">
            <style>{animationStyles}</style>

            <BannerImage selection={formatPositionForBanner(currentPosition)} />
            <Breadcrumb
                position={formatPositionForDisplay(currentPosition)}
                onBack={onBack}
            />

            <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
                <div className="mb-5">
                    <h1 className="mb-2 text-left text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                        HON. {currentFullName}
                    </h1>
                    <p className="text-left text-lg font-medium text-gray-100 sm:text-xl md:text-2xl">
                        {formatPositionForDisplay(currentPosition)}
                    </p>
                </div>

                <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                    {/* Profile Content */}
                    <div className="flex-1">
                        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex flex-col gap-6 md:flex-row">
                                <div className="relative flex-shrink-0">
                                    <div className="relative">
                                        <img
                                            key={imageKey}
                                            src={currentImage}
                                            alt={currentFullName}
                                            className={`mx-auto h-48 w-48 rounded-lg border-2 border-gray-200 object-cover sm:h-64 sm:w-64 md:mx-0 md:h-[340px] md:w-64 animate-pop-in border-gray-300 shadow-lg`}
                                            onError={(e) => {
                                                e.target.src = "/placeholder-avatar.png";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex-1 md:mt-0">
                                    <div className="mb-4">
                                        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                                            {currentOfficial.bio
                                                ? currentOfficial.bio
                                                : currentOfficial.detailInfo
                                                    ? currentOfficial.detailInfo.split("\n")[0] ||
                                                    currentOfficial.detailInfo.substring(0, 200) + (currentOfficial.detailInfo.length > 200 ? "..." : "")
                                                    : "Biography not available."}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                                        <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:text-base">
                                            {getOfficeTitle(currentPosition)}
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
                            <div 
                                ref={biographyRef}
                                className={`space-y-3 text-sm leading-relaxed text-gray-700 sm:text-base ${
                                    !isBiographyExpanded && needsTruncation ? 'max-h-48 overflow-hidden' : ''
                                }`}
                                style={{
                                    maxHeight: !isBiographyExpanded && needsTruncation ? '12rem' : 'none'
                                }}
                            >
                                {displayedParagraphs.map((para, i) => (
                                    <p key={i}>{para.trim() || "\u00A0"}</p>
                                ))}
                            </div>
                            
                            {/* View More / View Less Button */}
                            {biographyParagraphs.length > 3 && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => setIsBiographyExpanded(!isBiographyExpanded)}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                    >
                                        {isBiographyExpanded ? (
                                            <>
                                                <span>View Less</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            </>
                                        ) : (
                                            <>
                                                <span>View More</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
                            <h2 className="mb-3 border-b pb-2 text-xl font-bold text-gray-900 sm:text-2xl">Term Summary</h2>
                            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700 sm:px-6 sm:py-3">Position</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700 sm:px-6 sm:py-3">Term</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700 sm:px-6 sm:py-3">Ordinances</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {termData.terms.length > 0 ? (
                                            termData.terms.map((termItem, index) => (
                                                <tr key={index}>
                                                    <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-900 sm:px-6 sm:py-4">
                                                        {formatPositionForDisplay(termItem.Position) || formatPositionForDisplay(currentPosition) || "—"}
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
                                                                        position: formatPositionForDisplay(termItem.Position) || formatPositionForDisplay(currentPosition),
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

                    {/* SIDEBAR */}
                    <div className="hidden lg:block lg:w-64">
                        <div className="sticky top-24 rounded-xl bg-white p-4 shadow-sm">
                            <div className="border-t border-gray-200 pt-4">
                                <div className="mb-4">
                                    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-700">Ordinances</h3>
                                    {Object.keys(termData.ordinancesByYear).length > 0 ? (
                                        Object.entries(termData.ordinancesByYear)
                                            .sort(([a], [b]) => {
                                                if (b === "Unknown") return -1;
                                                if (a === "Unknown") return 1;
                                                return b - a;
                                            })
                                            .map(([year, items]) => (
                                                <div key={year} className="mb-2">
                                                    <p className="text-[9px] font-medium text-blue-700">{year}</p>
                                                    <ul className="mt-1 space-y-1 text-[9px] text-gray-600">
                                                        {items.slice(0, 3).map((item, i) => (
                                                            <li key={i} className="truncate" title={item.title}>
                                                                {item.title}
                                                            </li>
                                                        ))}
                                                        {items.length > 3 && (
                                                            <li className="text-[8px] text-gray-400">+{items.length - 3} more</li>
                                                        )}
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

            {/* Modal with Role Display */}
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
                                <div className="space-y-3">
                                    {modalData.items.map((item, i) => (
                                        <div key={i} className="border-b border-gray-100 pb-2 last:border-0">
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-700 sm:text-sm">
                                                        {typeof item === "string" ? item : item.title}
                                                    </p>
                                                </div>
                                                {item.role && (
                                                    <div className="flex-shrink-0">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:py-0.5 sm:text-xs ${getRoleBadgeColor(item.role)}`}>
                                                            <UserCircle className="mr-1 h-3 w-3" />
                                                            {item.role}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {item.allRoles && item.allRoles.length > 1 && (
                                                <div className="mt-1 pl-4">
                                                    <span className="text-[9px] text-gray-400 sm:text-[10px]">
                                                        Also: {item.allRoles.slice(1).join(", ")}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
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
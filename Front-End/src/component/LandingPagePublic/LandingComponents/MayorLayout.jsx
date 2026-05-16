import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Clock, Mail, User, Shield, Calendar, Landmark, ChevronDown, ChevronUp, CheckCircle, FileText, GraduationCap, Briefcase, MoreHorizontal } from "lucide-react";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import Breadcrumb from "./Breadcrumb";
import BannerImage from "./BannerImage";
import Transparency from "../../../assets/Transparency.svg"
import bagongpilipinas from "../../../assets/bagongpilipinas.png"

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
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const [needsSummaryTruncation, setNeedsSummaryTruncation] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [expandedCategories, setExpandedCategories] = useState({});
    const biographyRef = useRef(null);
    const summaryRef = useRef(null);

    const isLoading = contextLoading || localLoading;
    const lastProfileKey = useRef(null);
    const hasFetched = useRef(false);

    const sections = [
        { id: "profile", title: "Profile Information", icon: User },
        { id: "summary", title: "Summary of Credentials", icon: Shield },
        { id: "legislative", title: "Legislative Track Record", icon: Calendar },
    ];

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

    const summaryData = useMemo(() => {
        return currentOfficial?.summary || currentOfficial?.memberInfo?.summary || [];
    }, [currentOfficial]);

    // Group summaries by specificname
    const groupedSummaries = useMemo(() => {
        const groups = {
            Education_Experience: [],
            Work_Experience: [],
            Others: []
        };

        if (Array.isArray(summaryData) && summaryData.length > 0) {
            summaryData.forEach(item => {
                const specificname = item.specificname || "";
                if (specificname === "Education_Experience") {
                    groups.Education_Experience.push(item);
                } else if (specificname === "Work_Experience") {
                    groups.Work_Experience.push(item);
                } else {
                    groups.Others.push(item);
                }
            });
        }
        
        return groups;
    }, [summaryData]);

    const hasSummaries = useMemo(() => {
        return summaryData.length > 0;
    }, [summaryData]);

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const scrollToSection = (sectionId, index) => {
        setActiveStep(index);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    useEffect(() => {
        if (biographyRef.current && currentOfficial) {
            const element = biographyRef.current;
            const lineHeight = parseInt(getComputedStyle(element).lineHeight);
            const maxHeight = lineHeight * 6;
            const needsCollapse = element.scrollHeight > maxHeight;
            setNeedsTruncation(needsCollapse);
        }
    }, [currentOfficial, isBiographyExpanded]);

    useEffect(() => {
        if (summaryRef.current && hasSummaries) {
            const summaryHeight = summaryRef.current.scrollHeight;
            const maxHeight = 400;
            setNeedsSummaryTruncation(summaryHeight > maxHeight);
        }
    }, [hasSummaries, isSummaryExpanded]);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: "-80px 0px -50% 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = sections.findIndex(s => s.id === entry.target.id);
                    if (index !== -1) {
                        setActiveStep(index);
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [currentOfficial]);

    useEffect(() => {
        if (directMember) {
            setOfficial(directMember);
            setLocalLoading(false);

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

    useEffect(() => {
        if (directMember) return;

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

    useEffect(() => {
        if (directMember) return;

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

    useEffect(() => {
        if (!official && !directMember) {
            setCurrentImage("/placeholder-avatar.png");
            return;
        }

        const currentOfficial = official || directMember;
        const finalImg = currentOfficial?.memberInfo?.avatar?.url ||
            currentOfficial?.avatar?.url ||
            "/placeholder-avatar.png";

        setCurrentImage(finalImg);
        setImageKey((prev) => prev + 1);
    }, [official, directMember, isGroupPublicAuthor]);

    const termData = useMemo(() => {
        if (!isSummaryTerm || isSummaryTerm.length === 0) {
            return { terms: [], ordinancesByYear: {} };
        }

        const summaryData = isSummaryTerm[0];

        if (summaryData.terms && Array.isArray(summaryData.terms)) {
            const ordMap = {};

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
            });

            return {
                terms: summaryData.terms,
                ordinancesByYear: ordMap
            };
        }

        const termObj = {
            Position: summaryData.Position || summaryData.position,
            term: summaryData.term,
            from: summaryData.from,
            to: summaryData.to,
            ordinanceCount: summaryData.ordinanceCount || 0,
            resolutionCount: summaryData.resolutionCount || 0,
            titles: [],
            summaries: []
        };

        const ordMap = {};

        if (summaryData.files && Array.isArray(summaryData.files)) {
            summaryData.files.forEach((file) => {
                const title = file.title || "";
                const category = file.category || "";
                const roles = file.roles || [];
                const primaryRole = roles.length > 0 ? roles[0] : "Member";

                if (category === "Ordinance") {
                    termObj.titles.push({ title, role: primaryRole, allRoles: roles });
                    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
                    const year = yearMatch ? yearMatch[0] : "Unknown";
                    if (!ordMap[year]) ordMap[year] = [];
                    ordMap[year].push({ title, role: primaryRole, allRoles: roles });
                }
            });
        }

        return {
            terms: [termObj],
            ordinancesByYear: ordMap
        };
    }, [isSummaryTerm]);

    const animationStyles = `
    @keyframes pop-in {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop-in {
      animation: pop-in 0.4s ease-out forwards;
    }
    `;

    const biographyParagraphs = (currentOfficial?.detailInfo || "Biography data not available.")
        .split("\n")
        .slice(1)
        .filter(para => para.trim());

    const displayedParagraphs = isBiographyExpanded
        ? biographyParagraphs
        : biographyParagraphs.slice(0, 3);

    if (isLoading && !directMember) {
        return (
            <div className="min-h-screen bg-blue-950">
                <style>{animationStyles}</style>
                <div className="w-full h-1.5 flex">
                    <div className="bg-blue-600 flex-1"></div>
                    <div className="bg-amber-400 w-12"></div>
                    <div className="bg-red-600 flex-1"></div>
                </div>
                <BannerImage selection={formatPositionForBanner(currentPosition)} />
                <div className="border-b bg-blue-900/50 border-blue-800 shadow-sm">
                    <div className="mx-auto max-w-6xl px-4 py-3">
                        <div className="h-4 w-1/3 animate-pulse rounded bg-blue-700"></div>
                    </div>
                </div>
                <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
                    <div className="mb-5 space-y-3">
                        <div className="h-8 w-3/4 animate-pulse rounded bg-blue-800"></div>
                        <div className="h-6 w-1/2 animate-pulse rounded bg-blue-800"></div>
                    </div>
                    <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 border border-slate-200">
                                <div className="flex flex-col gap-6 md:flex-row">
                                    <div className="mx-auto h-48 w-48 animate-pulse rounded bg-slate-200 sm:h-64 sm:w-64 md:mx-0"></div>
                                    <div className="mt-4 flex-1 space-y-4 md:mt-0">
                                        <div className="space-y-2">
                                            <div className="h-4 w-full animate-pulse rounded bg-slate-200"></div>
                                            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200"></div>
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
            <div className="flex min-h-screen items-center justify-center bg-blue-950">
                <style>{animationStyles}</style>
                <div className="px-4 text-center max-w-md bg-white p-8 rounded-lg shadow-md border border-slate-200">
                    <Landmark className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <h2 className="text-xl font-bold text-slate-800">No Official Record Found</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        No {formatPositionForDisplay(currentPosition)} is currently listed or active in the database.
                    </p>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mt-5 inline-flex items-center justify-center rounded bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors"
                        >
                            Return to Directory
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-950 font-sans antialiased">
            <style>{animationStyles}</style>

            <div className="w-full h-1.5 flex">
                <div className="bg-blue-600 flex-1"></div>
                <div className="bg-amber-400 w-12"></div>
                <div className="bg-red-600 flex-1"></div>
            </div>

            <BannerImage selection={formatPositionForBanner(currentPosition)} />

            <div className="bg-blue-950 backdrop-blur-sm border-b border-blue-800 shadow-sm sticky top-0 z-20">
                <div className="mx-auto max-w-6xl">
                    <Breadcrumb
                        position={formatPositionForDisplay(currentPosition)}
                        onBack={onBack}
                    />
                </div>
            </div>

            <div className="sticky top-12 z-20 bg-blue-950/95 backdrop-blur-sm border-b border-blue-800 shadow-md">
                <div className="mx-auto max-w-6xl px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            const isActive = activeStep === index;
                            const isCompleted = activeStep > index;
                            
                            return (
                                <React.Fragment key={section.id}>
                                    <button
                                        onClick={() => scrollToSection(section.id, index)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                                            isActive
                                                ? "bg-blue-800 text-white shadow-lg scale-105"
                                                : "text-blue-300 hover:text-white hover:bg-blue-800/50"
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-blue-400"}`} />
                                        )}
                                        <span className="text-sm font-medium hidden sm:inline">
                                            {section.title}
                                        </span>
                                        <span className="text-xs font-medium sm:hidden">
                                            {index + 1}
                                        </span>
                                    </button>
                                    
                                    {index < sections.length - 1 && (
                                        <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                                            activeStep > index ? "bg-blue-600" : "bg-blue-800"
                                        }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
                <div className="mb-6 border-b-2 border-blue-700 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                    <div>
                        <span className="text-xs font-bold tracking-widest text-blue-300 uppercase block mb-1">Republic of the Philippines</span>
                        <h1 className="text-2xl font-black text-white sm:text-3xl md:text-4xl tracking-tight">
                            HON. {currentFullName.toUpperCase()}
                        </h1>
                        <p className="mt-1 text-base font-semibold text-amber-400 sm:text-lg md:text-xl flex items-center gap-1.5">
                            <Shield className="h-5 w-5 text-amber-400 inline" /> {formatPositionForDisplay(currentPosition)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-8">
                        {/* Section 1: Profile Information */}
                        <div id="profile" className="scroll-mt-32">
                            <div className="rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-700" />
                                        Profile Information
                                    </h2>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col gap-6 md:flex-row">
                                        <div className="flex-shrink-0 mx-auto md:mx-0">
                                            <div className="relative p-1 bg-white border border-slate-300 rounded shadow-md">
                                                <img
                                                    key={imageKey}
                                                    src={currentImage}
                                                    alt={currentFullName}
                                                    className="h-48 w-48 object-cover sm:h-56 sm:w-56 md:h-64 md:w-56 animate-pop-in"
                                                    onError={(e) => {
                                                        e.target.src = "/placeholder-avatar.png";
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="mb-4">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Official Statement / Overview</h3>
                                                <p className="text-sm leading-relaxed text-slate-700 italic border-l-4 border-slate-300 pl-3">
                                                    "{currentOfficial.bio
                                                        ? currentOfficial.bio
                                                        : currentOfficial.detailInfo
                                                            ? currentOfficial.detailInfo.split("\n")[0] || currentOfficial.detailInfo.substring(0, 200) + "..."
                                                            : "Official summary currently unpopulated."}"
                                                </p>
                                            </div>

                                            <div className="rounded border border-slate-200 bg-slate-50 p-4">
                                                <h4 className="mb-2.5 text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                                                    <Landmark className="h-3.5 w-3.5" /> Mandate & Office Information
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-700">
                                                    <div className="font-semibold text-slate-900 col-span-1 sm:col-span-2 text-sm mb-1">
                                                        {getOfficeTitle(currentPosition)}
                                                    </div>
                                                    {profileData.district && (
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-3.5 w-3.5 text-slate-500" />
                                                            <span>Jurisdiction: <strong className="text-slate-900">{profileData.district}</strong></span>
                                                        </div>
                                                    )}
                                                    {profileData.term_from && profileData.term_to && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                                            <span>Incumbency: <span className="text-slate-900 font-medium">{formatDate(profileData.term_from)} – {formatDate(profileData.term_to)}</span></span>
                                                        </div>
                                                    )}
                                                    {profileData.term && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                                                            <span>Legislative Session: <span className="text-slate-900 font-medium">{profileData.term.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}</span></span>
                                                        </div>
                                                    )}
                                                    {profileData.email && (
                                                        <div className="flex items-center gap-2 sm:col-span-2 border-t border-slate-200/60 pt-1.5 mt-1">
                                                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                                                            <span>Official Email: <a href={`mailto:${profileData.email}`} className="text-blue-800 hover:underline font-medium">{profileData.email}</a></span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Summary of Credentials - Simple Design */}
                        <div id="summary" className="scroll-mt-32">
                            <div className="rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-blue-700" />
                                            Summary of Credentials
                                        </h2>
                                        {needsSummaryTruncation && (
                                            <button
                                                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                                className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors"
                                            >
                                                {isSummaryExpanded ? (
                                                    <>Collapse <ChevronUp className="h-4 w-4" /></>
                                                ) : (
                                                    <>Expand <ChevronDown className="h-4 w-4" /></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {hasSummaries ? (
                                        <div 
                                            ref={summaryRef}
                                            className={`transition-all duration-300 ${!isSummaryExpanded && needsSummaryTruncation ? 'max-h-[400px] overflow-y-auto relative' : ''}`}
                                        >
                                            <div className="space-y-6">
                                                {/* Education Experience Group */}
                                                {groupedSummaries.Education_Experience.length > 0 && (
                                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => toggleCategory("Education_Experience")}
                                                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <GraduationCap className="h-5 w-5 text-slate-600" />
                                                                <h3 className="font-semibold text-slate-800">Educational Background</h3>
                                                                <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                                                                    {groupedSummaries.Education_Experience.length}
                                                                </span>
                                                            </div>
                                                            {expandedCategories.Education_Experience ? (
                                                                <ChevronUp className="h-4 w-4 text-slate-500" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4 text-slate-500" />
                                                            )}
                                                        </button>
                                                        
                                                        {expandedCategories.Education_Experience !== false && (
                                                            <div className="p-4 space-y-3 divide-y divide-slate-100">
                                                                {groupedSummaries.Education_Experience.map((summaryItem, idx) => {
                                                                    const subTitles = summaryItem.subTitle || [];
                                                                    
                                                                    return (
                                                                        <div key={`edu_${idx}`} className="pt-3 first:pt-0">
                                                                            <h4 className="font-semibold text-slate-800 mb-2">
                                                                                {summaryItem.title || '—'}
                                                                            </h4>
                                                                            {subTitles.length > 0 && (
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {subTitles.map((sub, subIdx) => (
                                                                                        <span key={subIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                                                                            <FileText className="h-3 w-3" />
                                                                                            {sub}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Work Experience Group */}
                                                {groupedSummaries.Work_Experience.length > 0 && (
                                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => toggleCategory("Work_Experience")}
                                                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Briefcase className="h-5 w-5 text-slate-600" />
                                                                <h3 className="font-semibold text-slate-800">Work Experience</h3>
                                                                <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                                                                    {groupedSummaries.Work_Experience.length}
                                                                </span>
                                                            </div>
                                                            {expandedCategories.Work_Experience ? (
                                                                <ChevronUp className="h-4 w-4 text-slate-500" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4 text-slate-500" />
                                                            )}
                                                        </button>
                                                        
                                                        {expandedCategories.Work_Experience !== false && (
                                                            <div className="p-4 space-y-3 divide-y divide-slate-100">
                                                                {groupedSummaries.Work_Experience.map((summaryItem, idx) => {
                                                                    const subTitles = summaryItem.subTitle || [];
                                                                    
                                                                    return (
                                                                        <div key={`work_${idx}`} className="pt-3 first:pt-0">
                                                                            <h4 className="font-semibold text-slate-800 mb-2">
                                                                                {summaryItem.title || '—'}
                                                                            </h4>
                                                                            {subTitles.length > 0 && (
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {subTitles.map((sub, subIdx) => (
                                                                                        <span key={subIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                                                                            <FileText className="h-3 w-3" />
                                                                                            {sub}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Others Group */}
                                                {groupedSummaries.Others.length > 0 && (
                                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => toggleCategory("Others")}
                                                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <MoreHorizontal className="h-5 w-5 text-slate-600" />
                                                                <h3 className="font-semibold text-slate-800">Other Credentials</h3>
                                                                <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                                                                    {groupedSummaries.Others.length}
                                                                </span>
                                                            </div>
                                                            {expandedCategories.Others ? (
                                                                <ChevronUp className="h-4 w-4 text-slate-500" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4 text-slate-500" />
                                                            )}
                                                        </button>
                                                        
                                                        {expandedCategories.Others !== false && (
                                                            <div className="p-4 space-y-3 divide-y divide-slate-100">
                                                                {groupedSummaries.Others.map((summaryItem, idx) => {
                                                                    const subTitles = summaryItem.subTitle || [];
                                                                    
                                                                    return (
                                                                        <div key={`other_${idx}`} className="pt-3 first:pt-0">
                                                                            <h4 className="font-semibold text-slate-800 mb-2">
                                                                                {summaryItem.title || '—'}
                                                                            </h4>
                                                                            {subTitles.length > 0 && (
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {subTitles.map((sub, subIdx) => (
                                                                                        <span key={subIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                                                                            <FileText className="h-3 w-3" />
                                                                                            {sub}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {!isSummaryExpanded && needsSummaryTruncation && (
                                                <div className="sticky bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none -mt-16"></div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                ref={biographyRef}
                                                className={`space-y-3.5 text-sm leading-relaxed text-slate-700 ${!isBiographyExpanded && needsTruncation ? 'max-h-48 overflow-hidden relative' : ''}`}
                                                style={{ maxHeight: !isBiographyExpanded && needsTruncation ? '12rem' : 'none' }}
                                            >
                                                {displayedParagraphs.map((para, i) => (
                                                    <p key={i} className="text-justify">{para.trim() || "\u00A0"}</p>
                                                ))}
                                                {!isBiographyExpanded && needsTruncation && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                                                )}
                                            </div>

                                            {biographyParagraphs.length > 3 && (
                                                <div className="mt-4 border-t border-slate-100 pt-3 text-center">
                                                    <button
                                                        onClick={() => setIsBiographyExpanded(!isBiographyExpanded)}
                                                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-800 hover:text-blue-950 transition-colors"
                                                    >
                                                        {isBiographyExpanded ? (
                                                            <><span>Collapse Biography</span><ChevronUp className="h-3 w-3" /></>
                                                        ) : (
                                                            <><span>Read Full Biography</span><ChevronDown className="h-3 w-3" /></>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Legislative Track Record */}
                        <div id="legislative" className="scroll-mt-32">
                            <div className="rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-3 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-700" />
                                        Legislative Track Record
                                    </h2>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <div className="overflow-x-auto border border-slate-200 rounded">
                                        <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
                                            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold text-[11px]">
                                                <tr>
                                                    <th className="px-4 py-3 text-left border-b">Designation</th>
                                                    <th className="px-4 py-3 text-left border-b">Legislative Term</th>
                                                    <th className="px-4 py-3 text-center border-b w-32">Enacted Files</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                                                {termData.terms.length > 0 ? (
                                                    termData.terms.map((termItem, index) => (
                                                        <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                                                            <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                                                                {formatPositionForDisplay(termItem.Position) || formatPositionForDisplay(currentPosition) || "—"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-1.5">
                                                                    {termItem.term && (
                                                                        <span className="font-medium text-slate-900">
                                                                            {termItem.term.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                                                                        </span>
                                                                    )}
                                                                    {termItem.from && termItem.to && (
                                                                        <span className="text-slate-500 font-mono text-xs">
                                                                            ({termItem.from}–{termItem.to})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
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
                                                                        className="inline-flex items-center justify-center bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 px-2.5 py-1 rounded font-bold transition-all text-xs"
                                                                    >
                                                                        View Docs ({termItem.ordinanceCount})
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-slate-400 italic text-xs">None listed</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3" className="px-4 py-6 text-center text-sm text-slate-400 italic">
                                                            No deployment or term records available in this scope.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar for Desktop */}
                    <div className="hidden lg:block lg:w-64 flex-shrink-0">
                        <div className="sticky top-36 space-y-4">
                            <div className="rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50/40 transition-colors flex items-center justify-center min-h-[240px] p-4">
                                <div className="w-full h-56 bg-white flex items-center justify-center overflow-hidden">
                                    <img
                                        src={Transparency}
                                        alt="Transparency Seal"
                                        className="w-full h-full object-fill"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            </div>
                            <div className="rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50/40 transition-colors flex items-center justify-center min-h-[240px] p-4">
                                <div className="w-full h-56 bg-white flex items-center justify-center overflow-hidden">
                                    <img
                                        src={bagongpilipinas}
                                        alt="Bagong Pilipinas"
                                        className="w-full h-full object-fill"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            </div>
                            <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 pb-1 border-b border-slate-200 flex items-center gap-1">
                                    🏛️ Quick Directory Archive
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[11px] font-bold uppercase tracking-wide text-blue-900 mb-1.5">Ordinances Index</h4>
                                        {Object.keys(termData.ordinancesByYear).length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {Object.keys(termData.ordinancesByYear).map((year) => (
                                                    <span key={year} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200">
                                                        FY {year}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No historical index.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && modalData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{modalData.position} Documents</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700">✕</button>
                        </div>
                        <div className="p-4">
                            {modalData.items?.map((item, idx) => (
                                <div key={idx} className="py-2 border-b last:border-0">
                                    <p className="text-sm">{typeof item === 'string' ? item : item.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficialProfileLayout;
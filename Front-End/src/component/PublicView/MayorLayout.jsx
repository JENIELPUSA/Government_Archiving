import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Facebook, Globe, Clock, Mail, ArrowLeft } from "lucide-react";
import BannerImage from "./BannerImage";
import { SbMemberDisplayContext } from "../../contexts/SbContext/SbContext";
import Breadcrumb from "./Breadcrumb";

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
    // 🔹 Mount/Unmount Tracking
    useEffect(() => {
        console.log("OfficialProfileLayout mounted", { fullName, Position });
        // Example: track page view, initialize scroll, etc.

        return () => {
            console.log("OfficialProfileLayout unmounted", { fullName, Position });
            // Example: clear timers, reset scroll, cancel pending requests, etc.
        };
    }, [fullName, Position]); // Re-run if identity changes (optional)

    const {
        DisplayPublicAuthor,
        loading: contextLoading,
        isGroupPublicAuthor,
        DisplaySummaryTerm,
        isSummaryTerm,
    } = useContext(SbMemberDisplayContext);
    const [official, setOfficial] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isLoading = contextLoading || localLoading;

    // Track the current profile identity and fetch status
    const lastProfileKey = useRef(null);
    const hasFetched = useRef(false);

    // Effect to handle fetching based on fullName/Position
    useEffect(() => {
        const profileKey = `${fullName || ''}-${Position || ''}`;

        // If switching to a different official, reset everything
        if (profileKey !== lastProfileKey.current) {
            setOfficial(null);
            setLocalLoading(true);
            hasFetched.current = false;
            lastProfileKey.current = profileKey;
        }

        // Prevent duplicate fetch for same profile
        if (hasFetched.current) return;

        hasFetched.current = true;

        const fetchOfficial = async () => {
            try {
                const query = { search: fullName || "" };
                if (!fullName && Position) query.Position = Position;
                await DisplayPublicAuthor(query);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchOfficial();
    }, [fullName, Position, DisplayPublicAuthor]);

    // Update local `official` state when context data changes
    const lastFetchedProfile = useRef({ first: "", middle: "", last: "" });

    useEffect(() => {
        if (isGroupPublicAuthor?.length > 0) {
            const officialData = isGroupPublicAuthor[0];
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
                return; // Skip refetching summary for same person
            }

            lastFetchedProfile.current = { first: first_name, middle: middle_name, last: last_name };

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
    }, [isGroupPublicAuthor, DisplaySummaryTerm]);

    // Memoize ordinances/resolutions — only if official matches current data
    const { ordinancesByYear, resolutionsByYear } = useMemo(() => {
        // Guard against stale isSummaryTerm when official has changed
        if (!official || !isSummaryTerm || isSummaryTerm.length === 0) {
            return { ordinancesByYear: {}, resolutionsByYear: {} };
        }

        const ordMap = {};
        const resMap = {};

        isSummaryTerm[0].terms.forEach((termItem) => {
            // Ordinances
            if (termItem.titles && Array.isArray(termItem.titles)) {
                termItem.titles.forEach((titleObj) => {
                    const title = typeof titleObj === "string" ? titleObj : titleObj.title;
                    const date = typeof titleObj === "string" ? null : titleObj.date;
                    const year = extractYear(date) || "Unknown";
                    if (!ordMap[year]) ordMap[year] = [];
                    ordMap[year].push(title);
                });
            }

            // Resolutions
            if (termItem.summaries && Array.isArray(termItem.summaries)) {
                termItem.summaries.forEach((summaryObj) => {
                    const title = typeof summaryObj === "string" ? summaryObj : summaryObj.title;
                    const date = typeof summaryObj === "string" ? null : summaryObj.date;
                    const year = extractYear(date) || "Unknown";
                    if (!resMap[year]) resMap[year] = [];
                    resMap[year].push(title);
                });
            }
        });

        return { ordinancesByYear: ordMap, resolutionsByYear: resMap };
    }, [official]); // ← critical: depend on `official`

    const profileData = useMemo(() => {
        return official?.memberInfo || official || {};
    }, [official]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <BannerImage selection={Position} />

                {/* Breadcrumb Skeleton */}
                <div className="border-b bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-3">
                        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="mx-auto max-w-6xl px-4 py-8">
                    {/* Title Skeleton */}
                    <div className="mb-5 space-y-3">
                        <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200"></div>
                    </div>

                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* Profile Content Skeleton */}
                        <div className="flex-1 space-y-6">
                            {/* Avatar + Bio Card */}
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <div className="flex flex-col gap-6 md:flex-row">
                                    <div className="h-[340px] w-64 animate-pulse rounded-lg bg-gray-200"></div>
                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                                            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
                                            <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200"></div>
                                        </div>
                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <div className="mb-3 h-5 w-1/3 animate-pulse rounded bg-blue-200"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-3/4 animate-pulse rounded bg-blue-200"></div>
                                                <div className="h-4 w-1/2 animate-pulse rounded bg-blue-200"></div>
                                                <div className="h-4 w-2/3 animate-pulse rounded bg-blue-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Biography Skeleton */}
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <div className="mb-6 h-8 w-1/4 animate-pulse rounded bg-gray-200"></div>
                                <div className="space-y-3">
                                    <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                                    <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
                                    <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200"></div>
                                </div>
                            </div>

                            {/* Term Summary Table Skeleton */}
                            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                                <div className="mb-4 h-8 w-1/3 animate-pulse rounded bg-gray-200"></div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <th
                                                        key={i}
                                                        className="px-6 py-3"
                                                    >
                                                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[1, 2, 3].map((row) => (
                                                <tr
                                                    key={row}
                                                    className="border-b border-gray-200"
                                                >
                                                    {[1, 2, 3, 4].map((col) => (
                                                        <td
                                                            key={col}
                                                            className="px-6 py-4"
                                                        >
                                                            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Skeleton */}
                        <div className="flex-shrink-0 lg:w-64">
                            <div className="sticky top-24 rounded-xl bg-white p-4 shadow-sm">
                                <div className="space-y-4 border-t border-gray-200 pt-4">
                                    <div>
                                        <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-300"></div>
                                        <div className="space-y-2">
                                            {[1, 2].map((i) => (
                                                <div key={i}>
                                                    <div className="mb-1 h-3 w-12 animate-pulse rounded bg-blue-200"></div>
                                                    <div className="space-y-1">
                                                        <div className="h-2.5 w-4/5 animate-pulse rounded bg-gray-200"></div>
                                                        <div className="h-2.5 w-3/5 animate-pulse rounded bg-gray-200"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-300"></div>
                                        <div className="space-y-2">
                                            {[1, 2].map((i) => (
                                                <div key={i}>
                                                    <div className="mb-1 h-3 w-12 animate-pulse rounded bg-green-200"></div>
                                                    <div className="space-y-1">
                                                        <div className="h-2.5 w-4/5 animate-pulse rounded bg-gray-200"></div>
                                                        <div className="h-2.5 w-2/3 animate-pulse rounded bg-gray-200"></div>
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
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800">No Official Found</h2>
                    <p className="mt-2 text-gray-600">No {Position} is currently listed in the system.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BannerImage selection={Position} />
            <Breadcrumb
                position={Position}
                onBack={onBack}
            />
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-5">
                    <h1 className="mb-2 text-left text-4xl font-bold text-blue-600">HON. {official.fullName || "Name not available"}</h1>
                    <p className="text-left text-2xl font-medium text-gray-700">{profileData.Position || Position}</p>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Profile Content */}
                    <div className="flex-1">
                        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-8 md:flex-row">
                                <div className="flex-shrink-0">
                                    <img
                                        src={profileData.avatar?.url || official.avatar?.url || "/placeholder-avatar.png"}
                                        alt={official.fullName || "Official"}
                                        className="h-[340px] w-64 rounded-lg border border-gray-200 object-cover"
                                        onError={(e) => {
                                            e.target.src = "/placeholder-avatar.png";
                                        }}
                                    />
                                </div>

                                <div className="flex-1">
                                    <div className="mb-6">
                                        <p className="leading-relaxed text-gray-700">
                                            {official.bio
                                                ? official.bio
                                                : official.detailInfo
                                                  ? official.detailInfo.split("\n")[0] ||
                                                    official.detailInfo.substring(0, 200) + (official.detailInfo.length > 200 ? "..." : "")
                                                  : "Biography not available."}
                                        </p>
                                    </div>

                                    <div className="mb-6 rounded-lg bg-blue-50 p-4">
                                        <h3 className="mb-3 font-semibold text-gray-900">Office of the {profileData.Position || Position}</h3>
                                        <div className="space-y-2 text-sm">
                                            {profileData.district && (
                                                <div className="flex items-start gap-2">
                                                    <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600">📅</span>
                                                    <span className="text-gray-700">{profileData.district}</span>
                                                </div>
                                            )}
                                            {profileData.term_from && profileData.term_to && (
                                                <div className="flex items-start gap-2">
                                                    <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600">📅</span>
                                                    <span className="text-gray-700">
                                                        Term: {formatDate(profileData.term_from)} – {formatDate(profileData.term_to)}
                                                    </span>
                                                </div>
                                            )}
                                            {profileData.term && (
                                                <div className="flex items-start gap-2">
                                                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                                                    <span className="text-gray-700">
                                                        {profileData.term.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                                                    </span>
                                                </div>
                                            )}
                                            {profileData.email && (
                                                <div className="flex items-start gap-2">
                                                    <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                                                    <span className="text-gray-700">{profileData.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-6 border-b pb-2 text-2xl font-bold text-gray-900">Biography</h2>
                            <div className="space-y-4 leading-relaxed text-gray-700">
                                {(official.detailInfo || "Biography not available.").split("\n").map((para, i) => (
                                    <p key={i}>{para.trim() || "\u00A0"}</p>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b pb-2 text-2xl font-bold text-gray-900">Term Summary</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                                            >
                                                Position
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                                            >
                                                Term
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                                            >
                                                Ordinances
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                                            >
                                                Resolutions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {isSummaryTerm && isSummaryTerm.length > 0 ? (
                                            isSummaryTerm[0].terms.map((termItem, index) => (
                                                <tr key={index}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                        {termItem.Position || "—"}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        <div>
                                                            {termItem.term && (
                                                                <span>
                                                                    {termItem.term.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                                                                </span>
                                                            )}
                                                            {termItem.from && termItem.to && (
                                                                <span className="ml-2 text-gray-500">
                                                                    ({termItem.from}–{termItem.to})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
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
                                                                className="cursor-pointer font-medium text-blue-600 hover:underline"
                                                            >
                                                                {termItem.ordinanceCount}
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-500">0</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
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
                                                                className="cursor-pointer font-medium text-green-600 hover:underline"
                                                            >
                                                                {termItem.resolutionCount}
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-500">0</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                                >
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
                    <div className="flex-shrink-0 lg:w-64">
                        <div className="sticky top-24 rounded-xl bg-white p-4 shadow-sm">
                            <div className="border-t border-gray-200 pt-4">
                                <div className="mb-4">
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-700">Ordinances</h3>
                                    {Object.keys(ordinancesByYear).length > 0 ? (
                                        Object.entries(ordinancesByYear)
                                            .sort(([a], [b]) => {
                                                if (b === "Unknown") return -1;
                                                if (a === "Unknown") return 1;
                                                return b - a;
                                            })
                                            .map(([year, titles]) => (
                                                <div
                                                    key={year}
                                                    className="mb-2"
                                                >
                                                    <p className="text-[10px] font-medium text-blue-700">{year}</p>
                                                    <ul className="mt-1 space-y-1 text-[10px] text-gray-600">
                                                        {titles.map((title, i) => (
                                                            <li
                                                                key={i}
                                                                className="truncate"
                                                            >
                                                                {title}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-[10px] italic text-gray-500">None</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-700">Resolutions</h3>
                                    {Object.keys(resolutionsByYear).length > 0 ? (
                                        Object.entries(resolutionsByYear)
                                            .sort(([a], [b]) => {
                                                if (b === "Unknown") return -1;
                                                if (a === "Unknown") return 1;
                                                return b - a;
                                            })
                                            .map(([year, titles]) => (
                                                <div
                                                    key={year}
                                                    className="mb-2"
                                                >
                                                    <p className="text-[10px] font-medium text-green-700">{year}</p>
                                                    <ul className="mt-1 space-y-1 text-[10px] text-gray-600">
                                                        {titles.map((title, i) => (
                                                            <li
                                                                key={i}
                                                                className="truncate"
                                                            >
                                                                {title}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-[10px] italic text-gray-500">None</p>
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="border-b bg-gray-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {modalData.type === "ordinance" ? "Ordinance Titles" : "Resolution Summaries"}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {modalData.position} •{" "}
                                {modalData.term ? modalData.term.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Unknown Term"}
                            </p>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-6">
                            {modalData.items.length > 0 ? (
                                <ul className="list-disc space-y-2 pl-5 text-gray-700">
                                    {modalData.items.map((item, i) => (
                                        <li key={i}>{typeof item === "string" ? item : item.title || item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic text-gray-500">No data available.</p>
                            )}
                        </div>

                        <div className="border-t bg-gray-50 px-6 py-3 text-right">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
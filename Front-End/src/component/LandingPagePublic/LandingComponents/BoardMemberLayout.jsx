import React, { useState, useEffect, useContext } from "react";
import BannerImage from "./BannerImage";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import MayorLayout from "../LandingComponents/MayorLayout";
import { User } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
const TrackedMayorLayout = (props) => {
    useEffect(() => {
        console.log("MayorLayout mounted", props);
        return () => {
            console.log("MayorLayout unmounted", props);
        };
    }, []);

    return <MayorLayout {...props} />;
};

const BoardMemberLayout = ({ Position, onBack }) => {
    const {
        isGroupPublicAuthor,
        DisplayPublicAuthor,
        loading: contextLoading,
        currentPage,
        totalPages,
        setCurrentPage,
    } = useContext(SbMemberDisplayContext);

    const [activePosition, setActivePosition] = useState(Position || "Board_Member");
    const [localLoading, setLocalLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const isLoading = contextLoading || localLoading;

    useEffect(() => {
        if (Position) {
            setActivePosition(Position);
            setCurrentPage(1);
            setSelectedMember(null);
        }
    }, [Position, setCurrentPage]);

    useEffect(() => {
        if (activePosition === "Governor" || activePosition === "Vice_Governor") {
            return;
        }

        const fetchMembers = async () => {
            setLocalLoading(true);
            try {
                await DisplayPublicAuthor({
                    search: "",
                    Position: activePosition,
                    term_from: "",
                    term_to: "",
                    term: "",
                    page: currentPage,
                });
            } catch (error) {
                console.error("Failed to fetch members:", error);
            } finally {
                setLocalLoading(false);
            }
        };

        fetchMembers();
    }, [activePosition, currentPage, DisplayPublicAuthor]);

    const sidebarPositions = ["Governor", "Vice_Governor", "Board_Member"];

    const handlePositionSelect = (pos) => {
        setActivePosition(pos);
        setSelectedMember(null);
        if (pos !== "Governor" && pos !== "Vice_Governor") {
            setCurrentPage(1);
        }
    };

    if (selectedMember) {
        return (
            <TrackedMayorLayout
                fullName={selectedMember.fullName}
                member={selectedMember}
            />
        );
    }

    if (activePosition === "Governor") {
        return <TrackedMayorLayout Position="Governor" />;
    }

    if (activePosition === "Vice_Governor") {
        return <TrackedMayorLayout Position="Vice_Governor" />;
    }

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

    return (
        <div className="relative min-h-screen bg-blue-950">
            <BannerImage selection={activePosition} />
            <Breadcrumb
                position={Position}
                onBack={onBack}
            />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Main Content */}
                    <div className="flex-1">
                        <h1 className="mb-6 text-2xl font-bold text-gray-300">{activePosition || "Board Members"}</h1>

                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="animate-pulse rounded-lg bg-white p-4 shadow-sm"
                                    >
                                        {/* Reduced height on mobile for skeleton too */}
                                        <div className="max-sm:h-40 mb-4 h-64 w-full rounded-md bg-gray-200"></div>
                                        <div className="mb-2 h-4 rounded bg-gray-200"></div>
                                        <div className="mb-1 h-3 rounded bg-gray-200"></div>
                                        <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                                    </div>
                                ))}
                            </div>
                        ) : isGroupPublicAuthor?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {isGroupPublicAuthor.map((member) => {
                                    const key = member._id || member.id || `${member.fullName}-${member.position}`;
                                    return (
                                        <div
                                            key={key}
                                            className="rounded-lg bg-white p-4 text-center shadow-sm"
                                        >
                                            {member.memberInfo?.avatar?.url ? (
                                                <img
                                                    src={member.memberInfo.avatar.url}
                                                    alt={member.fullName || "Board Member"}
                                                    className="max-sm:h-40 mb-4 h-64 w-full cursor-pointer rounded-md object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                    }}
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="max-sm:h-40 mb-4 flex h-64 w-full cursor-pointer items-center justify-center rounded-md bg-gray-100"
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                    }}
                                                >
                                                    <User className="h-16 w-16 text-gray-400" />
                                                </div>
                                            )}
                                            <h3 className="text-sm font-semibold text-blue-800">Hon. {member.fullName || "Name not available"}</h3>
                                            <p className="mb-1 text-xs text-gray-600">
                                                {member.memberInfo?.Position || member.position || "Position not available"}
                                            </p>
                                            {member.district && <p className="text-xs text-gray-500">{member.district}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="col-span-full py-12 text-center text-gray-500">
                                No members found for position: <span className="font-medium text-gray-700">{activePosition}</span>
                            </div>
                        )}

                        {/* Pagination UI */}
                        {!isLoading && totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center space-x-2">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`rounded px-3 py-1 text-sm ${
                                        currentPage === 1
                                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let page;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else {
                                        const start = Math.max(1, currentPage - 2);
                                        const end = Math.min(totalPages, start + 4);
                                        page = start + i;
                                        if (page > end) return null;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`rounded px-3 py-1 text-sm ${
                                                currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`rounded px-3 py-1 text-sm ${
                                        currentPage === totalPages
                                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <div className="w-full flex-shrink-0 lg:w-64">
                        {isLoading && activePosition !== "Mayor" && activePosition !== "Vice Mayor" ? (
                            <div className="sticky top-24 animate-pulse rounded-lg bg-white p-4 shadow-sm">
                                <div className="mb-4 h-5 w-1/3 rounded bg-gray-200"></div>
                                <ul className="space-y-3">
                                    {sidebarPositions.map((_, i) => (
                                        <li
                                            key={i}
                                            className="h-4 rounded bg-gray-200"
                                        ></li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="sticky top-24 rounded-lg bg-white p-4 shadow-sm">
                                <h2 className="mb-4 text-lg font-bold text-gray-800">Positions</h2>
                                <ul className="space-y-2">
                                    {sidebarPositions.map((pos) => {
                                        // Mapping ng positions para sa display
                                        const displayPos =
                                            {
                                                Board_Member: "Board Member",
                                                Vice_Governor: "Vice Governor",
                                            }[pos] || pos;

                                        return (
                                            <li key={pos}>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePositionSelect(pos)}
                                                    className={`w-full rounded px-3 py-2 text-left text-sm ${
                                                        activePosition === pos
                                                            ? "bg-blue-100 font-medium text-blue-700"
                                                            : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {displayPos}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardMemberLayout;

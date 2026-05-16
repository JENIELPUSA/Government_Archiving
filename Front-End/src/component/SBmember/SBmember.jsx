import React, { useState, useEffect, useContext, useMemo } from "react";
import ProfileCard from "./ProfileCard";
import AddMemberForm from "./AddMemberForm";
import { SbMemberDisplayContext } from "../../contexts/SbContext/SbContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import { Database, ChevronDown, ChevronUp, Users, UserCheck, UserX } from "lucide-react";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { useDebounce } from "use-debounce";

const formatYear = (dateString) => {
    return dateString ? new Date(dateString).getFullYear() : "";
};

const SkeletonCard = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-700" />
            </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
            <div className="h-8 w-8 rounded bg-gray-300 dark:bg-gray-700" />
            <div className="h-8 w-8 rounded bg-gray-300 dark:bg-gray-700" />
        </div>
    </div>
);

const TermFolder = ({
    termGroup,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    searchTerm,
    loading
}) => {
    // Filter members based on search term only
    const { sanggunianMembers, exOfficialMembers } = useMemo(() => {
        if (!termGroup.members || !Array.isArray(termGroup.members)) {
            return { sanggunianMembers: [], exOfficialMembers: [] };
        }

        const sanggunian = [];
        const exOfficial = [];

        termGroup.members.forEach(member => {
            // Check if Ex-Official
            const isExOfficial = member.memberInfo?.isExOfficial === true || 
                               member.isExOfficial === true;
            
            // Apply search filter
            let passesSearchFilter = true;
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const fullName = member.fullName || `${member.first_name || ''} ${member.last_name || ''}` || "";
                if (!fullName.toLowerCase().includes(searchLower)) {
                    passesSearchFilter = false;
                }
            }

            if (passesSearchFilter) {
                if (isExOfficial) {
                    exOfficial.push(member);
                } else {
                    sanggunian.push(member);
                }
            }
        });

        // Sort both arrays by priorityNumber
        const sortByPriority = (arr) => {
            return [...arr].sort((a, b) => {
                const priorityA = Number(a.priorityNumber) || 9999;
                const priorityB = Number(b.priorityNumber) || 9999;
                return priorityA - priorityB;
            });
        };

        return {
            sanggunianMembers: sortByPriority(sanggunian),
            exOfficialMembers: sortByPriority(exOfficial)
        };
    }, [termGroup.members, searchTerm]);

    const hasSanggunianToShow = sanggunianMembers.length > 0;
    const hasExOfficialToShow = exOfficialMembers.length > 0;

    if (!termGroup.term_from || !termGroup.term_to) return null;
    if (!hasSanggunianToShow && !hasExOfficialToShow && searchTerm) return null;

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
            <div
                className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => onToggle(termGroup)}
            >
                <h3 className="text-lg font-semibold dark:text-white">
                    Term: {formatYear(termGroup.term_from)} - {formatYear(termGroup.term_to)}
                </h3>
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {isExpanded && (
                <div className="p-4">
                    {/* Sanggunian Members Section */}
                    {hasSanggunianToShow && (
                        <div className="mb-6">
                            <div className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
                                <Users size={20} className="text-blue-500" />
                                <h4 className="text-md font-semibold dark:text-white">
                                    Sangguniang Panlalawigan Members ({sanggunianMembers.length})
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={`sanggunian-skeleton-${idx}`} />)
                                ) : (
                                    sanggunianMembers.map(member => (
                                        <ProfileCard
                                            key={member._id}
                                            member={member}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ex-Official Members Section */}
                    {hasExOfficialToShow && (
                        <div>
                            <div className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
                                <UserCheck size={20} className="text-green-500" />
                                <h4 className="text-md font-semibold dark:text-white">
                                    Ex-Official Members ({exOfficialMembers.length})
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={`exofficial-skeleton-${idx}`} />)
                                ) : (
                                    exOfficialMembers.map(member => (
                                        <ProfileCard
                                            key={member._id}
                                            member={member}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* No results message */}
                    {!hasSanggunianToShow && !hasExOfficialToShow && (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            No members found matching your criteria
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

function SBmember() {
    const {
        isGroupFiles,
        DeleteSB,
        AddSbData,
        DisplayPerSb,
        UpdateSbmember,
        customError,
        loading,
        setLoading,
        terms
    } = useContext(SbMemberDisplayContext);

    const [isVerification, setVerification] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [memberToEdit, setMemberToEdit] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isDeleteID, setDeleteID] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [memberTypeFilter, setMemberTypeFilter] = useState("all");
    const [expandedTerm, setExpandedTerm] = useState(null);
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    // Function to get unique members by _id
    const getUniqueMembers = (members) => {
        const uniqueMap = new Map();
        members.forEach(member => {
            if (member._id && !uniqueMap.has(member._id)) {
                uniqueMap.set(member._id, member);
            }
        });
        return Array.from(uniqueMap.values());
    };

    // Filter term groups based on memberTypeFilter at i-ensure na unique ang members
    const filteredTermGroups = useMemo(() => {
        if (!isGroupFiles || !Array.isArray(isGroupFiles)) return [];

        return isGroupFiles.map(group => {
            if (!group.members || !Array.isArray(group.members)) {
                return { ...group, members: [] };
            }

            // Get unique members muna para walang duplicate sa source
            let uniqueMembers = getUniqueMembers(group.members);

            // Filter members based on memberTypeFilter
            let filteredMembers = uniqueMembers;
            
            if (memberTypeFilter === "sanggunian") {
                filteredMembers = uniqueMembers.filter(member => 
                    (member.memberInfo?.isExOfficial !== true && member.isExOfficial !== true)
                );
            } else if (memberTypeFilter === "exOfficial") {
                filteredMembers = uniqueMembers.filter(member => 
                    (member.memberInfo?.isExOfficial === true || member.isExOfficial === true)
                );
            }

            // Sort members by priorityNumber
            const sortedMembers = [...filteredMembers].sort((a, b) => {
                const priorityA = Number(a.priorityNumber) || 9999;
                const priorityB = Number(b.priorityNumber) || 9999;
                return priorityA - priorityB;
            });

            return {
                ...group,
                members: sortedMembers
            };
        }).filter(group => group.members.length > 0);
    }, [isGroupFiles, memberTypeFilter]);

    // Merge term groups by year range at i-ensure na unique ang members per term
    const mergedTermGroups = useMemo(() => {
        const map = new Map();

        filteredTermGroups.forEach(group => {
            if (!group.term_from || !group.term_to) return;

            const yearFrom = formatYear(group.term_from);
            const yearTo = formatYear(group.term_to);
            const key = `${yearFrom}-${yearTo}`;

            if (map.has(key)) {
                const existing = map.get(key);
                // Combine members at gawing unique
                const combinedMembers = getUniqueMembers([...existing.members, ...(group.members || [])]);
                map.set(key, {
                    ...existing,
                    members: combinedMembers
                });
            } else {
                map.set(key, {
                    ...group,
                    term_from: group.term_from,
                    term_to: group.term_to,
                    members: getUniqueMembers(group.members || [])
                });
            }
        });

        // Sort merged groups by term (newest first)
        return Array.from(map.values()).sort((a, b) => {
            const yearA = parseInt(formatYear(a.term_from)) || 0;
            const yearB = parseInt(formatYear(b.term_from)) || 0;
            return yearB - yearA;
        });
    }, [filteredTermGroups]);

    // Calculate statistics based on filtered data (unique members only)
    const statistics = useMemo(() => {
        let totalSanggunian = 0;
        let totalExOfficial = 0;

        mergedTermGroups.forEach(group => {
            if (group.members && Array.isArray(group.members)) {
                group.members.forEach(member => {
                    const isExOfficial = member.memberInfo?.isExOfficial === true || member.isExOfficial === true;
                    if (isExOfficial) {
                        totalExOfficial++;
                    } else {
                        totalSanggunian++;
                    }
                });
            }
        });

        return {
            total: totalSanggunian + totalExOfficial,
            sanggunian: totalSanggunian,
            exOfficial: totalExOfficial
        };
    }, [mergedTermGroups]);

    useEffect(() => {
        const initialFetch = async () => {
            setLoading(true);
            await DisplayPerSb();
            setLoading(false);
            setIsInitialLoad(false);
        };
        initialFetch();
    }, [DisplayPerSb, setLoading]);

    useEffect(() => {
        const fetchFilteredData = async () => {
            if (isInitialLoad) return;
            setLoading(true);
            await DisplayPerSb({ search: debouncedSearchTerm });
            setLoading(false);
        };
        fetchFilteredData();
    }, [debouncedSearchTerm, DisplayPerSb, setLoading, isInitialLoad]);

    const handleToggleTerm = (termGroup) => {
        const termKey = `${formatYear(termGroup.term_from)}-${formatYear(termGroup.term_to)}`;
        setExpandedTerm(expandedTerm === termKey ? null : termKey);
    };

    const handleEdit = (member) => {
        setMemberToEdit(member);
        setShowAddForm(true);
    };

    const handleCloseModal = () => {
        setVerification(false);
        setDeleteID(null);
    };

    const handleDelete = (id) => {
        setDeleteID(id);
        setVerification(true);
    };

    const handleConfirmDelete = async () => {
        if (isDeleteID) {
            setLoading(true);
            const result = await DeleteSB(isDeleteID);
            setLoading(false);

            if (result?.success) {
                setModalStatus("success");
                setDeleteID(null);
                setVerification(false);
                await DisplayPerSb();
            } else {
                setModalStatus("failed");
            }
            setShowModal(true);
        }
    };

    const handleCloseForm = () => {
        setShowAddForm(false);
        setMemberToEdit(null);
    };

    const handleAddOrUpdateMember = async (newMemberData) => {
        setLoading(true);
        try {
            let result;
            if (newMemberData._id) {
                result = await UpdateSbmember(newMemberData._id, newMemberData);
            } else {
                const memberToAdd = {
                    avatar: newMemberData.avatar,
                    first_name: newMemberData.first_name || "",
                    middle_name: newMemberData.middle_name || "",
                    last_name: newMemberData.last_name || "",
                    Position: newMemberData.Position,
                    detailInfo: newMemberData.detailInfo,
                    district: newMemberData.district,
                    email: newMemberData.email, 
                    subPosition: newMemberData.SubPosition,
                    term: newMemberData.term,
                    priorityNumber: Number(newMemberData.priorityNumber) || null,
                    term_from: newMemberData.term_from,
                    term_to: newMemberData.term_to,
                    selectedYearFrom: newMemberData.selectedYearFrom,
                    selectedYearTo: newMemberData.selectedYearTo,
                    isExOfficial: newMemberData.isExOfficial || false,
                    summary:newMemberData.summary
                };
                result = await AddSbData(memberToAdd);
            }

            if (result?.success) {
                setModalStatus("success");
                setShowModal(true);
                await DisplayPerSb();
            } else {
                setModalStatus("failed");
                setShowModal(true);
            }
        } catch (error) {
            console.error("Error in handleAddOrUpdateMember:", error);
            setModalStatus("failed");
            setShowModal(true);
        } finally {
            setLoading(false);
            handleCloseForm();
        }
    };

    return (
        <>
            <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto flex-1 px-4 py-8">
                    <div className="flex flex-col gap-6 lg:flex-row">
                        <main className="flex-1">
                            {/* Filter Section */}
                            <div className="mb-6 space-y-4">
                                {/* Search Bar and Add Button */}
                                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        disabled={loading}
                                        className={`w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white md:w-1/3 ${loading ? "cursor-not-allowed opacity-50" : ""
                                            }`}
                                    />
                                    <button
                                        onClick={() => {
                                            setMemberToEdit(null);
                                            setShowAddForm(true);
                                        }}
                                        disabled={loading}
                                        className={`flex w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition duration-300 hover:bg-blue-600 md:w-auto ${loading ? "cursor-not-allowed opacity-50" : ""
                                            }`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-1 h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Add Member
                                    </button>
                                </div>

                                {/* Member Type Filter Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setMemberTypeFilter("all")}
                                        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition duration-200 ${memberTypeFilter === "all"
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            }`}
                                    >
                                        <Users size={16} />
                                        All Members
                                    </button>
                                    <button
                                        onClick={() => setMemberTypeFilter("sanggunian")}
                                        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition duration-200 ${memberTypeFilter === "sanggunian"
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            }`}
                                    >
                                        <UserX size={16} />
                                        Sangguniang Member
                                    </button>
                                    <button
                                        onClick={() => setMemberTypeFilter("exOfficial")}
                                        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition duration-200 ${memberTypeFilter === "exOfficial"
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            }`}
                                    >
                                        <UserCheck size={16} />
                                        Ex-Official
                                    </button>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            {!loading && mergedTermGroups.length > 0 && (
                                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                        <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Members</h4>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                                            {statistics.total}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                        <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Sangguniang Members</h4>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                                            {statistics.sanggunian}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                                        <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">Ex-Official Members</h4>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                            {statistics.exOfficial}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Member List Section */}
                            <div className="space-y-6">
                                {loading && isInitialLoad ? (
                                    Array.from({ length: 2 }).map((_, index) => (
                                        <div key={`skeleton-folder-${index}`} className="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="h-6 w-1/4 rounded bg-gray-300 dark:bg-gray-700"></div>
                                                <div className="h-6 w-6 rounded bg-gray-300 dark:bg-gray-700"></div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={`skeleton-${index}-${idx}`} />)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        {mergedTermGroups.length > 0 ? (
                                            mergedTermGroups.map(termGroup => {
                                                const termKey = `${formatYear(termGroup.term_from)}-${formatYear(termGroup.term_to)}`;
                                                return (
                                                    <TermFolder
                                                        key={termKey}
                                                        termGroup={termGroup}
                                                        isExpanded={expandedTerm === termKey}
                                                        onToggle={handleToggleTerm}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                        searchTerm={debouncedSearchTerm}
                                                        loading={loading}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <div className="flex min-h-[600px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                                <Database className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                                                <p className="text-gray-500 dark:text-gray-400">No members found matching your criteria</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </main>
                    </div>
                </div>

                {showAddForm && (
                    <AddMemberForm
                        onAddMember={handleAddOrUpdateMember}
                        onClose={handleCloseForm}
                        memberToEdit={memberToEdit}
                        yearterm={terms}
                    />
                )}

                <SuccessFailed
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    status={modalStatus}
                    errorMessage={customError}
                />
                <StatusVerification
                    isOpen={isVerification}
                    onConfirmDelete={handleConfirmDelete}
                    onClose={handleCloseModal}
                />
            </div>
        </>
    );
}

export default SBmember;
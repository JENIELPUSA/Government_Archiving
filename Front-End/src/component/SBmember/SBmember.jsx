import React, { useState, useEffect, useContext, useMemo } from "react";
import ProfileCard from "./ProfileCard";
import AddMemberForm from "./AddMemberForm";
import LoadingOverlay from "../../ReusableFolder/LoadingOverlay";
import { SbMemberDisplayContext } from "../../contexts/SbContext/SbContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import { Database, ChevronDown, ChevronUp } from "lucide-react";
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
    positionFilter,
    searchTerm,
    onTermPageChange,
    loading
}) => {
    const filteredMembers = useMemo(() => {
        if (!termGroup.members || !Array.isArray(termGroup.members)) return [];

        return termGroup.members.filter(member => {
            if (positionFilter === "withPosition" && (!member.Position || member.Position.trim() === "")) return false;
            if (positionFilter === "withoutPosition" && (member.Position && member.Position.trim() !== "")) return false;

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const fullName = member.fullName || `${member.first_name} ${member.last_name}` || "";
                if (!fullName.toLowerCase().includes(searchLower)) return false;
            }

            return true;
        });
    }, [termGroup.members, positionFilter, searchTerm]);

    const getPaginationNumbers = () => {
        const pageNumbers = [];
        if (termGroup.totalPages <= 7) {
            for (let i = 1; i <= termGroup.totalPages; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(1);
            const left = Math.max(termGroup.currentPage - 1, 2);
            const right = Math.min(termGroup.currentPage + 1, termGroup.totalPages - 1);
            if (left > 2) pageNumbers.push("...");
            for (let i = left; i <= right; i++) pageNumbers.push(i);
            if (right < termGroup.totalPages - 1) pageNumbers.push("...");
            pageNumbers.push(termGroup.totalPages);
        }
        return pageNumbers;
    };

    const renderPageNumbers = () =>
        getPaginationNumbers().map((page, index) =>
            page === "..." ? (
                <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-gray-500 dark:text-gray-400"
                >
                    ...
                </span>
            ) : (
                <button
                    key={`page-${page}`}
                    onClick={() => onTermPageChange(termGroup.term_from, termGroup.term_to, page)}
                    className={`rounded px-3 py-1 ${
                        termGroup.currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                    {page}
                </button>
            )
        );

    if (!termGroup.term_from || !termGroup.term_to) return null;
    if (filteredMembers.length === 0 && searchTerm) return null;

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
            <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => onToggle(termGroup)}
            >
                <h3 className="dark:text-white text-lg font-semibold">
                    Term: {formatYear(termGroup.term_from)} - {formatYear(termGroup.term_to)}
                </h3>
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {isExpanded && (
                <>
                    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={`skeleton-${idx}`} />)
                        ) : (
                            filteredMembers.map(member => (
                                <ProfileCard
                                    key={member._id}
                                    member={member}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))
                        )}
                    </div>

                    {termGroup.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-end space-x-2 rounded-b-lg bg-gray-50 px-4 py-3 dark:bg-gray-700">
                            <button
                                onClick={() => onTermPageChange(termGroup.term_from, termGroup.term_to, termGroup.currentPage - 1)}
                                disabled={termGroup.currentPage === 1}
                                className={`rounded px-3 py-1 ${
                                    termGroup.currentPage === 1
                                        ? "cursor-not-allowed opacity-50"
                                        : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
                                }`}
                            >
                                Prev
                            </button>
                            {renderPageNumbers()}
                            <button
                                onClick={() => onTermPageChange(termGroup.term_from, termGroup.term_to, termGroup.currentPage + 1)}
                                disabled={termGroup.currentPage === termGroup.totalPages}
                                className={`rounded px-3 py-1 ${
                                    termGroup.currentPage === termGroup.totalPages
                                        ? "cursor-not-allowed opacity-50"
                                        : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
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
    } = useContext(SbMemberDisplayContext);

    const [isVerification, setVerification] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [memberToEdit, setMemberToEdit] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isDeleteID, setDeleteID] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [positionFilter, setPositionFilter] = useState("all");
    const [expandedTerm, setExpandedTerm] = useState(null);
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [isPaginated, setIsPaginated] = useState(false);

    // Merge all term groups with same year
    const mergedTermGroups = useMemo(() => {
        const map = new Map();

        isGroupFiles.forEach(group => {
            if (!group.term_from || !group.term_to) return;

            const yearFrom = formatYear(group.term_from);
            const yearTo = formatYear(group.term_to);
            const key = `${yearFrom}-${yearTo}`;

            if (map.has(key)) {
                const existing = map.get(key);
                map.set(key, {
                    ...existing,
                    members: [...existing.members, ...(group.members || [])],
                    totalPages: Math.max(existing.totalPages || 1, group.totalPages || 1),
                    currentPage: existing.currentPage || 1
                });
            } else {
                map.set(key, {
                    ...group,
                    term_from: group.term_from,
                    term_to: group.term_to,
                    members: group.members || [],
                    currentPage: group.currentPage || 1
                });
            }
        });

        return Array.from(map.values());
    }, [isGroupFiles]);

    useEffect(() => {
        const initialFetch = async () => {
            setLoading(true);
            await DisplayPerSb();
            setLoading(false);
            setIsInitialLoad(false);
        };
        initialFetch();
    }, []);

    useEffect(() => {
        const fetchFilteredData = async () => {
            if (isInitialLoad) return;
            setLoading(true);
            await DisplayPerSb({ search: debouncedSearchTerm });
            setLoading(false);
        };
        fetchFilteredData();
    }, [debouncedSearchTerm, positionFilter, DisplayPerSb]);

    const handleTermPageChange = async (term_from, term_to, page) => {
        const termGroup = mergedTermGroups.find(
            group => formatYear(group.term_from) === formatYear(term_from) && formatYear(group.term_to) === formatYear(term_to)
        );
        if (!termGroup || page < 1 || page > termGroup.totalPages) return;

        setLoading(true);
        const pageParam = `pageTerm${term_from}`;
        await DisplayPerSb({ term_from, term_to, [pageParam]: page, search: debouncedSearchTerm });
        setLoading(false);
        setIsPaginated(true);
    };

    const handleToggleTerm = async (termGroup) => {
        const termKey = `${formatYear(termGroup.term_from)}-${formatYear(termGroup.term_to)}`;
        if (expandedTerm === termKey) {
            setExpandedTerm(null);
            if (isPaginated) {
                setLoading(true);
                await DisplayPerSb();
                setLoading(false);
                setIsPaginated(false);
            }
        } else {
            setExpandedTerm(termKey);
        }
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
                    Position: newMemberData.position,
                    detailInfo: newMemberData.detailInfo,
                    district: newMemberData.district,
                    email: newMemberData.email,
                    term: newMemberData.term,
                    term_from: newMemberData.term_from,
                    term_to: newMemberData.term_to,
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
                            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={loading}
                                    className={`w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white md:w-1/3 ${
                                        loading ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                                />
                                <button
                                    onClick={() => {
                                        setMemberToEdit(null);
                                        setShowAddForm(true);
                                    }}
                                    disabled={loading}
                                    className={`flex w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition duration-300 hover:bg-blue-600 md:w-auto ${
                                        loading ? "cursor-not-allowed opacity-50" : ""
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

                            <div className="space-y-6">
                                {loading && isInitialLoad ? (
                                    Array.from({ length: 2 }).map((_, index) => (
                                        <div key={`skeleton-folder-${index}`} className="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="h-6 w-1/4 rounded bg-gray-300 dark:bg-gray-700"></div>
                                                <div className="h-6 w-6 rounded bg-gray-300 dark:bg-gray-700"></div>
                                            </div>
                                            <div className="dark:text-white grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                                                        className="dark:text-white"
                                                        termGroup={termGroup}
                                                        isExpanded={expandedTerm === termKey}
                                                        onToggle={handleToggleTerm}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                        positionFilter={positionFilter}
                                                        searchTerm={debouncedSearchTerm}
                                                        onTermPageChange={handleTermPageChange}
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

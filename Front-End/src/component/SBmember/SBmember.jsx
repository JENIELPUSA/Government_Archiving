import React, { useState, useEffect, useContext } from "react";
import ProfileCard from "./ProfileCard";
import AddMemberForm from "./AddMemberForm";
import LoadingOverlay from "../../ReusableFolder/LoadingOverlay";
import { SbMemberDisplayContext } from "../../contexts/SbContext/SbContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import { Database } from "lucide-react";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { useDebounce } from "use-debounce";

// Skeleton Loading Component
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

function SBmember() {
    const {
        isGroupFiles,
        DeleteSB,
        AddSbData,
        setCurrentPage,
        currentPage,
        totalPages,
        DisplayPerSb,
        UpdateSbmember,
        customError,
        loading,
        setLoading,
    } = useContext(SbMemberDisplayContext);
    const [members, setMembers] = useState([]);
    const [isVerification, setVerification] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [memberToEdit, setMemberToEdit] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isDeleteID, setDeleteID] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [positionFilter, setPositionFilter] = useState("all"); // New state for position filter

    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    useEffect(() => {
        setMembers(isGroupFiles || []);
        if (isGroupFiles.length > 0) {
            setIsInitialLoad(false);
        }
    }, [isGroupFiles]);

    useEffect(() => {
        if (typeof DisplayPerSb === "function") {
            console.log("Fetching data with search term:", debouncedSearchTerm, "and page:", currentPage);
            DisplayPerSb(currentPage, debouncedSearchTerm);
        }
    }, [currentPage, debouncedSearchTerm]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        } else if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage, setCurrentPage]);

    const goToPage = (page) => {
        if (loading || page < 1 || page > totalPages) return;
        setCurrentPage(page);
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
                DisplayPerSb(currentPage, searchTerm);
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
        console.log("conosle", newMemberData);
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
                };
                result = await AddSbData(memberToAdd);
            }

            if (result?.success) {
                setModalStatus("success");
                setShowModal(true);
                DisplayPerSb(currentPage, searchTerm);
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

    // Filter members based on position status
    const filteredMembers = members
        .filter(member => member && member._id)
        .filter(member => {
            if (positionFilter === "withPosition") {
                return member.Position && member.Position.trim() !== "";
            } else if (positionFilter === "withoutPosition") {
                return !member.Position || member.Position.trim() === "";
            }
            return true; // 'all' filter
        });

    const getPaginationNumbers = () => {
        const pageNumbers = [];
        const maxVisible = 5;
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            const left = Math.max(currentPage - 1, 2);
            const right = Math.min(currentPage + 1, totalPages - 1);
            if (left > 2) pageNumbers.push("...");
            for (let i = left; i <= right; i++) {
                pageNumbers.push(i);
            }
            if (right < totalPages - 1) pageNumbers.push("...");
            pageNumbers.push(totalPages);
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
                    onClick={() => goToPage(page)}
                    disabled={loading}
                    className={`rounded px-3 py-1 ${
                        currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                >
                    {page}
                </button>
            ),
        );

    return (
        <>
            <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto flex-1 px-4 py-8">
                    <div className="flex flex-col gap-6 lg:flex-row">
                        <main className="flex-1">
                            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                                {/* POSITION FILTER RADIO BUTTONS */}
                                <div className="flex w-full items-center space-x-4 md:w-auto">
                                    <span className="text-gray-700 dark:text-gray-300">Position:</span>
                                    <div className="flex items-center space-x-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="all"
                                                checked={positionFilter === "all"}
                                                onChange={() => setPositionFilter("all")}
                                                disabled={loading}
                                                className="form-radio h-4 w-4 text-blue-600"
                                            />
                                            <span className="ml-2 dark:text-white">All</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="withPosition"
                                                checked={positionFilter === "withPosition"}
                                                onChange={() => setPositionFilter("withPosition")}
                                                disabled={loading}
                                                className="form-radio h-4 w-4 text-blue-600"
                                            />
                                            <span className="ml-2 dark:text-white">With Position</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="withoutPosition"
                                                checked={positionFilter === "withoutPosition"}
                                                onChange={() => setPositionFilter("withoutPosition")}
                                                disabled={loading}
                                                className="form-radio h-4 w-4 text-blue-600"
                                            />
                                            <span className="ml-2 dark:text-white">Without Position</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
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

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {/* Skeleton Loading State */}
                                {loading && isInitialLoad ? (
                                    Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)
                                ) : (
                                    <>
                                        {/* Data Loaded State */}
                                        {filteredMembers.length > 0 ? (
                                            filteredMembers.map((member) => (
                                                <ProfileCard
                                                    key={member._id}
                                                    member={member}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            ))
                                        ) : (
                                            <div className="col-span-3 flex min-h-[600px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                                <Database className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                                                <p className="text-gray-500 dark:text-gray-400">No members found matching your criteria</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {totalPages >= 1 && (
                                <div className="mt-4 flex items-center justify-end space-x-2 rounded-b-lg bg-white px-2 py-4 dark:bg-gray-800">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1 || loading}
                                        className={`rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 ${
                                            currentPage === 1 || loading ? "cursor-not-allowed opacity-50" : ""
                                        }`}
                                    >
                                        Prev
                                    </button>
                                    {renderPageNumbers()}
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages || loading}
                                        className={`rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 ${
                                            currentPage === totalPages || loading ? "cursor-not-allowed opacity-50" : ""
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
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
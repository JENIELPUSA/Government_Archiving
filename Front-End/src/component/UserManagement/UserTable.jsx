import React, { useContext, useState } from "react";
import { Edit, Trash, Plus, ChevronLeft, ChevronRight, User, Database } from "lucide-react";
import { AdminDisplayContext } from "../../contexts/AdminContext/AdminContext";
import AddUserModal from "./AddUserModal";
import "react-toastify/dist/ReactToastify.css";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

const ITEMS_PER_PAGE = 5;

// Skeleton component para sa isang table row
const UserRowSkeleton = () => (
    <tr className="animate-pulse transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-white">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-gray-300">
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-gray-300">
            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm dark:text-gray-300">
            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
            <div className="flex justify-center gap-3">
                <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
        </td>
    </tr>
);

const UserTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const { DeleteAdmin, isAdmin, AddAminData, UpdateAdmin, customError, setCustomError } = useContext(AdminDisplayContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [loading, setLoading] = useState(false);
    const [isPageChanging, setIsPageChanging] = useState(false);

    const totalPages = Math.ceil((isAdmin?.length || 0) / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentAdmins = (isAdmin || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;

        setIsPageChanging(true);
        setTimeout(() => {
            setCurrentPage(page);
            setIsPageChanging(false);
        }, 500);
    };

    const handleFormSubmit = async (values) => {
        setLoading(true);
        try {
            if (values._id) {
                await UpdateAdmin(values._id, values);
            } else {
                await AddAminData(values);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
            setAddUserModalOpen(false);
            setEditingUser(null);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setAddUserModalOpen(true);
    };

    const handleCloseForm = () => {
        setAddUserModalOpen(false);
        setEditingUser(null);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await DeleteAdmin(id);
        } catch (error) {
            console.error("Error deleting category:", error);
        } finally {
            setLoading(false);
        }
    };
    const getAvatarUrl = (avatar) => {
        if (!avatar || !avatar.url) return null;
        
        if (avatar.url.startsWith('http')) {
            return avatar.url;
        }

        const baseURL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || '';
        const formattedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
        const formattedAvatarURL = avatar.url.startsWith('/') ? avatar.url : `/${avatar.url}`;
        
        return `${formattedBaseURL}${formattedAvatarURL}`;
    };

    return (
        <div className="relative w-full space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Management</h2>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setAddUserModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                    <Plus size={16} />
                    Add Admin
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="w-[5%] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Avatar
                            </th>
                            <th className="w-[10%] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Name
                            </th>
                            <th className="w-[6%] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Gender
                            </th>
                            <th className="w-[10%] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Email
                            </th>
                            <th className="w-[10%] px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800">
                        {isPageChanging || loading ? (
                            [...Array(ITEMS_PER_PAGE)].map((_, i) => <UserRowSkeleton key={i} />)
                        ) : currentAdmins.length > 0 ? (
                            currentAdmins.map((user) => {
                                const avatarUrl = getAvatarUrl(user.avatar);
                                return (
                                    <tr
                                        key={user.id || user._id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt="User Avatar"
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    onError={(e) => {
                                                        // If image fails to load, show default avatar
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400">
                                                    <User size={18} />
                                                </div>
                                            )}
                                            {/* Fallback avatar that's hidden by default */}
                                            <div 
                                                className="hidden h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                                            >
                                                <User size={18} />
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{`${user.first_name} ${user.middle_name ? user.middle_name + " " : ""}${user.last_name}`}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.gender}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id || user._id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-6 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            <Database className="h-10 w-10" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">No Documents Available</h3>
                                        <p className="text-center text-gray-500 dark:text-gray-400">
                                            There are no Users to display in the database.
                                            <br />
                                            Create a new data to get started.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, isAdmin?.length || 0)} of {isAdmin?.length || 0} admins
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1 || isPageChanging}
                                className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToPage(i + 1)}
                                    disabled={isPageChanging}
                                    className={`h-8 w-8 rounded-md text-sm ${
                                        currentPage === i + 1
                                            ? "bg-blue-600 text-white"
                                            : "border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages || isPageChanging}
                                className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={handleCloseForm}
                editableUser={editingUser}
                onFormSubmit={handleFormSubmit}
            />

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
        </div>
    );
};

export default UserTable;
import React, { useState, useEffect } from "react";
import AddUserModal from "./AddUserModal";
import { Database, UserPlus, Pencil, Trash2, ArrowLeft, Search, RefreshCw } from "lucide-react"; // Import Search and RefreshCw icons
import { motion } from "framer-motion";

const Dashboard = ({
    selectedRole,
    resetSelection,
    tableData,
    handleDeleteItem,
    showAddUserModal,
    setShowAddUserModal,
    newItem,
    editUserData,
    setEditUserData,
    handleInputChange,
    handleAddItem,
    handleEditData,
    formMessage,
    isSubmitting,
    setFormMessage,
    onRefresh, // New prop for refresh functionality
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredTableData, setFilteredTableData] = useState(tableData);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filteredData = tableData.filter(item =>
            (item.first_name && item.first_name.toLowerCase().includes(lowercasedSearchTerm)) ||
            (item.last_name && item.last_name.toLowerCase().includes(lowercasedSearchTerm)) ||
            (item.email && item.email.toLowerCase().includes(lowercasedSearchTerm)) ||
            (selectedRole !== "Admin" && item.department && item.department.toLowerCase().includes(lowercasedSearchTerm)) ||
            (item.gender && item.gender.toLowerCase().includes(lowercasedSearchTerm))
        );
        setFilteredTableData(filteredData);
    }, [searchTerm, tableData, selectedRole]);

    const handleEditItem = (item) => {
        setEditUserData(item);
        setShowAddUserModal(true);
    };

    const handleCloseModal = () => {
        setShowAddUserModal(false);
        setEditUserData(null);
        setFormMessage("");
    };

    const dropFade = {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    return (
        <motion.div
            variants={dropFade}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900 dark:text-white"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white dark:from-indigo-800 dark:to-purple-900">
                <div className="flex flex-col items-center justify-between md:flex-row">
                    <div className="flex items-center">
                        <div className="mr-4 rounded-lg bg-white/20 p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{selectedRole} Management</h1>
                            <p className="text-blue-200 dark:text-blue-300">
                                {tableData.length} user{tableData.length !== 1 ? 's' : ''} registered
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={resetSelection}
                        className="mt-4 flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 md:mt-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Selection
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Records</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage all {selectedRole.toLowerCase()} accounts in the system
                        </p>
                    </div>
                    <div className="flex items-center gap-4"> {/* Container for search, refresh, and add user buttons */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        </div>
                        {onRefresh && ( // Only show refresh button if onRefresh prop is provided
                            <button
                                onClick={onRefresh}
                                className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2.5 text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                title="Refresh Data"
                            >
                                <RefreshCw className="h-5 w-5" />
                                <span className="sr-only md:not-sr-only">Refresh</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setEditUserData(null);
                                setShowAddUserModal(true);
                            }}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        >
                            <UserPlus className="h-5 w-5" />
                            Add New User
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                {selectedRole !== "Admin" && (
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        ID
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Email
                                </th>
                                {selectedRole !== "Admin" && (
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Department
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Gender
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                            {filteredTableData.length > 0 ? (
                                filteredTableData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    >
                                        {selectedRole !== "Admin" && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {item.id}
                                            </td>
                                        )}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {item.first_name} {item.middle_name} {item.last_name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {item.email}
                                        </td>
                                        {selectedRole !== "Admin" && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {item.department}
                                            </td>
                                        )}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 
                                                ${item.gender === 'Male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
                                                    item.gender === 'Female' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200' :
                                                        'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'}`}>
                                                {item.gender}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleEditItem(item)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="flex items-center gap-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={selectedRole !== "Admin" ? 6 : 5} className="h-96">
                                        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800/50">
                                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                <Database className="h-10 w-10" />
                                            </div>
                                            <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
                                                No Users Found
                                            </h3>
                                            <p className="max-w-md text-gray-500 dark:text-gray-400">
                                                There are no {selectedRole.toLowerCase()} accounts in the system yet.
                                                Start by adding a new user.
                                            </p>
                                            <button
                                                onClick={() => setShowAddUserModal(true)}
                                                className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                Add First User
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddUserModal
                isOpen={showAddUserModal}
                onClose={handleCloseModal}
                formData={editUserData || newItem}
                onFormChange={handleInputChange}
                onFormSubmit={handleAddItem}
                onEditSubmit={handleEditData}
                message={formMessage}
                isSubmitting={isSubmitting}
                selectedRole={selectedRole}
                isEditing={!!editUserData}
            />
        </motion.div>
    );
};

export default Dashboard;
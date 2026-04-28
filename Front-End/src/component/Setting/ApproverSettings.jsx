import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApproverDisplayContext } from "../../contexts/ApproverContext/ApproverContext";

const ApproverSettings = ({ approvers }) => {
    const { AddAprover, RemoveApprover, UpdateApprover } = useContext(ApproverDisplayContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentApprover, setCurrentApprover] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        _id: "",
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false); // 🔹 para sa disable button

    const openAddModal = () => {
        setCurrentApprover({ first_name: "", last_name: "", middle_name: "", email: "", _id: "" });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (approver) => {
        setCurrentApprover({
            first_name: approver.first_name,
            last_name: approver.last_name,
            middle_name: approver.middle_name || "",
            email: approver.email,
            _id: approver._id, // 🔹 tamang field
        });
        setEditingId(approver._id); // 🔹 tama na ID
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!currentApprover.first_name || !currentApprover.last_name || !currentApprover.email) return;

        setLoading(true); // start loading
        try {
            if (editingId) {
                await UpdateApprover(currentApprover._id, currentApprover);
            } else {
                await AddAprover(currentApprover);
            }
            closeModal();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false); // end loading
        }
    };

    const handleRemoveApprover = async (ID) => {
        setLoading(true);
        try {
            await RemoveApprover(ID);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentApprover({ first_name: "", last_name: "", middle_name: "", email: "", _id: "" });
        setEditingId(null);
    };

    const formatName = (approver) => {
        return `${approver.first_name}${approver.middle_name ? ` ${approver.middle_name}` : ""} ${approver.last_name}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
        >
            <div className="mb-4 flex items-center justify-between mt-4">
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Approver Settings</h2>
                <button
                    onClick={openAddModal}
                    disabled={loading || (approvers && Object.keys(approvers).length > 0)} // 🔹 disable kapag busy o may approver na
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Add Approver
                </button>
            </div>

            <div className="mt-6">
                <h3 className="mb-2 font-medium text-gray-600 dark:text-gray-400">Approver</h3>
                <div className="space-y-3">
                    {!approvers || Object.keys(approvers).length === 0 ? (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">No approver added yet</div>
                    ) : (
                        <div className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-700">
                            <div>
                                <span className="block font-medium">{formatName(approvers)}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-300">{approvers.email}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => openEditModal(approvers)}
                                    disabled={loading}
                                    className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-600 dark:hover:bg-gray-500"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleRemoveApprover(approvers._id)}
                                    disabled={loading}
                                    className="rounded bg-red-100 px-3 py-1 text-red-600 hover:bg-red-200 disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">
                                {editingId ? "Edit Approver" : "Add New Approver"}
                            </h3>

                            {/* Form */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">First Name *</label>
                                        <input
                                            type="text"
                                            value={currentApprover.first_name}
                                            onChange={(e) => setCurrentApprover({ ...currentApprover, first_name: e.target.value })}
                                            className="w-full rounded-lg border px-4 py-2 dark:text-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Last Name *</label>
                                        <input
                                            type="text"
                                            value={currentApprover.last_name}
                                            onChange={(e) => setCurrentApprover({ ...currentApprover, last_name: e.target.value })}
                                            className="w-full rounded-lg border px-4 py-2 dark:text-black"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Middle Name</label>
                                    <input
                                        type="text"
                                        value={currentApprover.middle_name}
                                        onChange={(e) => setCurrentApprover({ ...currentApprover, middle_name: e.target.value })}
                                        className="w-full rounded-lg border px-4 py-2 dark:text-black"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Email *</label>
                                    <input
                                        type="email"
                                        value={currentApprover.email}
                                        onChange={(e) => setCurrentApprover({ ...currentApprover, email: e.target.value })}
                                        className="w-full rounded-lg border px-4 py-2 dark:text-black"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={closeModal}
                                    disabled={loading}
                                    className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !currentApprover.first_name || !currentApprover.last_name || !currentApprover.email}
                                    className={`rounded-lg px-4 py-2 text-white ${
                                        editingId ? "bg-blue-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    {loading ? "Saving..." : editingId ? "Update Approver" : "Add Approver"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ApproverSettings;

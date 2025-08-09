import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingOverlay from "../../ReusableFolder/LoadingOverlay";

export default function AppModal({ isOpen, onClose, fileData, handleApprove, handleRejects }) {
    const { authToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [animationType, setAnimationType] = useState(null);
    const [showContent, setShowContent] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimationType(null);
            setShowContent(true);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleApproveClick = async () => {
        setIsLoading(true);
        setShowContent(false);
        try {
            await handleApprove(fileData._id, { status: "Approved" });
            setAnimationType("approved");
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error("Error approving file:", error);
            setIsLoading(false);
            setShowContent(true);
        }
    };
const handleRejectClick = async () => {
  try {
    await handleRejects(fileData._id, { status: "Rejected" });
  } catch (error) {
    console.error("Error rejecting file:", error);
  }
};


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-inter fixed inset-0 z-[50] flex items-center justify-center bg-black bg-opacity-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="relative mx-auto flex min-h-[200px] w-full max-w-md items-center justify-center rounded-xl border border-gray-200 bg-white p-8 shadow-2xl"
                    >
                        <AnimatePresence mode="wait">
                            {showContent && (
                                <motion.div
                                    key="modalContent"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full"
                                >
                                    <button
                                        onClick={onClose}
                                        className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition duration-200 hover:bg-gray-100 hover:text-gray-600"
                                        aria-label="Close modal"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            ></path>
                                        </svg>
                                    </button>

                                    <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">Confirm Action</h2>
                                    <p className="mb-6 text-center text-gray-600">
                                        Are you sure you want to perform this action? Choose "Approve" or "Reject".
                                    </p>

                                    <div className="flex justify-center space-x-4">
                                        <motion.button
                                            onClick={handleApproveClick}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex flex-1 items-center justify-center rounded-lg bg-green-500 px-5 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                                        >
                                            Approve
                                        </motion.button>
                                        <motion.button
                                            onClick={handleRejectClick}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex flex-1 items-center justify-center rounded-lg bg-red-500 px-5 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                                        >
                                            Reject
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {isLoading && (
                                <motion.div
                                    key="loadingOverlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-white rounded-xl"
                                >
                                    <LoadingOverlay />
                                </motion.div>
                            )}

                            {animationType === "approved" && (
                                <motion.div
                                    key="approvedAnimation"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <Check className="h-24 w-24 stroke-2 text-green-500" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
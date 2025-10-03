import React, { useState, useMemo } from "react";
import { FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

// Animation variants for the modal
const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
        },
    },
};

const popupTableVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

// Function to determine status color
const getStatusColor = (status) => {
    if (!status) return "gray";
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes("approved") || statusLower.includes("passed") || statusLower.includes("active")) {
        return "green";
    } else if (statusLower.includes("pending") || statusLower.includes("review")) {
        return "yellow";
    } else if (statusLower.includes("rejected") || statusLower.includes("denied") || statusLower.includes("inactive")) {
        return "red";
    } else if (statusLower.includes("draft") || statusLower.includes("proposed")) {
        return "blue";
    } else {
        return "gray";
    }
};

// FileTableModal Component
const FileTableModal = ({ files, category, onClose }) => {
    // State for current page
    const [currentPage, setCurrentPage] = useState(1);
    const filesPerPage = 10;

    // Filter files based on the selected category
    const filteredFiles = useMemo(() => {
        return files.filter((file) => {
            if (category === "totalLaws") {
                return file.category === "Ordinance" || file.category === "Resolution";
            }
            return file.category === category;
        });
    }, [files, category]);

    // Calculate the files for the current page
    const paginatedFiles = useMemo(() => {
        const indexOfLastFile = currentPage * filesPerPage;
        const indexOfFirstFile = indexOfLastFile - filesPerPage;
        return filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
    }, [filteredFiles, currentPage]);

    const totalPages = Math.ceil(filteredFiles.length / filesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <motion.div
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black bg-opacity-60 p-4"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
        >
            <motion.div
                className="max-h-[90vh] w-11/12 max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl"
                variants={popupTableVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        {category === "totalLaws" ? "All Laws" : category === "Resolution" ? "Resolutions" : "Ordinances"}
                    </h3>
                    <motion.button
                        onClick={onClose}
                        className="text-2xl font-bold text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FaTimes />
                    </motion.button>
                </div>
                <div className="p-4">
                    {filteredFiles.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600">
                                        <th className="px-4 py-2 text-left text-sm font-semibold">Title</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold">Category</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedFiles.map((file, index) => {
                                        const statusColor = getStatusColor(file.status);
                                        return (
                                            <tr
                                                key={file._id}
                                                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                            >
                                                <td className="px-4 py-2 text-sm text-gray-800">{file.title}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600">{file.category}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                                                        ${statusColor === "green" ? "bg-green-100 text-green-800" : ""}
                                                        ${statusColor === "yellow" ? "bg-yellow-100 text-yellow-800" : ""}
                                                        ${statusColor === "red" ? "bg-red-100 text-red-800" : ""}
                                                        ${statusColor === "blue" ? "bg-blue-100 text-blue-800" : ""}
                                                        ${statusColor === "gray" ? "bg-gray-100 text-gray-800" : ""}
                                                    `}>
                                                        {file.status || "N/A"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No {category} files found.</p>
                    )}
                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center space-x-2">
                            {[...Array(totalPages).keys()].map((number) => (
                                <button
                                    key={number + 1}
                                    onClick={() => handlePageChange(number + 1)}
                                    className={`rounded-full px-4 py-2 font-semibold transition-colors duration-200 ${
                                        currentPage === number + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                    {number + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FileTableModal;
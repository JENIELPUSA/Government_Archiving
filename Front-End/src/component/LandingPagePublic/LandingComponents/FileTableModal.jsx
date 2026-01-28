import React, { useState, useMemo } from "react";
import { FaFileAlt, FaCalendar, FaTag, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const tableVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
        height: "auto",
        opacity: 1,
        transition: {
            height: { duration: 0.3, ease: "easeOut" },
            opacity: { duration: 0.2, delay: 0.1 }
        }
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: {
            height: { duration: 0.2 },
            opacity: { duration: 0.1 }
        }
    }
};

// FileTable Component
const FileTable = ({ files, category, member, isOpen, onToggle }) => {
    const getCategoryTitle = () => {
        switch (category) {
            case "Chairperson":
                return "As Chairperson";
            case "Vice-Chairperson":
                return "As Vice-Chairperson";
            case "Member":
                return "As Member";
            default:
                return "Files";
        }
    };

    const getCategoryColor = () => {
        switch (category) {
            case "Chairperson":
                return "blue";
            case "Vice-Chairperson":
                return "green";
            case "Member":
                return "purple";
            default:
                return "gray";
        }
    };

    const getCategoryDisplayName = () => {
        return category; // Direktang ibabalik na ang category
    };

    const filteredFiles =
        files?.filter((file) => {
            if (category === "Chairperson") return file.isChairperson;
            if (category === "Vice-Chairperson") return file.isViceChairperson;
            if (category === "Member") return file.isMember;
            return false;
        }) || [];

    const colorClasses = {
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-100",
            text: "text-blue-600",
            bgLight: "bg-blue-100",
            textDark: "text-blue-700",
        },
        green: {
            bg: "bg-green-50",
            border: "border-green-100",
            text: "text-green-600",
            bgLight: "bg-green-100",
            textDark: "text-green-700",
        },
        purple: {
            bg: "bg-purple-50",
            border: "border-purple-100",
            text: "text-purple-600",
            bgLight: "bg-purple-100",
            textDark: "text-purple-700",
        },
    };

    const colors = colorClasses[getCategoryColor()];

    return (
        <div className={`mt-3 overflow-hidden rounded-lg border ${colors.border} ${colors.bg}`}>
            {/* Table Header - Toggle Button */}
            <button
                onClick={() => {
                    console.log(`Table button clicked: ${getCategoryDisplayName()} (member_id: ${member?._id})`);
                    onToggle();
                }}
                className={`flex w-full items-center justify-between p-3 ${colors.bg} hover:${colors.bgLight} transition-colors duration-200`}
            >
                <div className="flex items-center">
                    <FaFileAlt className={`mr-2 ${colors.text}`} />
                    <span className={`font-medium ${colors.textDark}`}>
                        {getCategoryTitle()} ({filteredFiles.length} files)
                    </span>
                </div>
                <div className="flex items-center">
                    <span className={`mr-2 text-sm ${colors.text}`}>{isOpen ? "Hide" : "Show"} details</span>
                    {isOpen ? <FaChevronUp className={colors.text} /> : <FaChevronDown className={colors.text} />}
                </div>
            </button>

            {/* Table Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={tableVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                    >
                        <div className="max-h-64 overflow-y-auto p-2">
                            {filteredFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <FaFileAlt className={`text-2xl ${colors.text} mb-2 opacity-50`} />
                                    <p className={`text-sm ${colors.text} opacity-70`}>No files found for this category</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredFiles.map((file, index) => (
                                        <motion.div
                                            key={file.id || index}
                                            className="flex items-center justify-between rounded border border-gray-100 bg-white p-3 transition-shadow duration-200 hover:shadow-sm"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <FaFileAlt className={`${colors.text} text-sm`} />
                                                    <h3 className="truncate font-medium text-gray-900">{file.title || "Untitled File"}</h3>
                                                </div>

                                                {file.description && <p className="truncate text-xs text-gray-600">{file.description}</p>}

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {file.date && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                            <FaCalendar className="text-xs" />
                                                            {file.date}
                                                        </span>
                                                    )}
                                                    {file.type && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                            <FaTag className="text-xs" />
                                                            {file.type}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {file.link && (
                                                <a
                                                    href={file.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`ml-2 inline-flex items-center rounded px-3 py-1 text-xs font-medium ${colors.textDark} ${colors.bg} hover:${colors.bgLight} whitespace-nowrap transition-colors`}
                                                    onClick={(e) => {
                                                        console.log(
                                                            `View button clicked for file: ${file.title || "Untitled File"} - file_id: ${file._id || file.id || "N/A"}, member_id: ${member?._id}, role: ${getCategoryDisplayName()}`,
                                                        );
                                                    }}
                                                >
                                                    View
                                                </a>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FileTable;

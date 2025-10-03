import React, { useEffect, useState } from "react";
import { FaUserAlt, FaTimes, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import FileTableModal from "./FileTableModal";

// Animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
    hover: { y: -4, transition: { duration: 0.2, ease: "easeOut" } },
};

const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

const modalContentVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.1] },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const termLabels = {
    "1st_term": "1st Term",
    "2nd_term": "2nd Term",
    "3rd_term": "3rd Term",
};

// ✅ Member Card
export const MemberCard = ({ member, openModal }) => (
    <motion.div
        className="flex flex-col items-start rounded-lg border border-gray-100 bg-white p-3 shadow-sm hover:border-blue-100 sm:flex-row z-[999]"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        layout
    >
        {/* Avatar */}
        <div className="mb-3 flex w-full justify-center sm:mb-0 sm:mr-3 sm:block sm:w-24">
            <motion.img
                src={member.memberInfo?.avatar?.url || "https://randomuser.me/api/portraits/men/64.jpg"}
                alt="Profile Picture"
                className="h-28 w-20 rounded-lg object-cover shadow-sm xs:h-24 xs:w-16 2xs:h-20 2xs:w-14"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
            />
        </div>

        {/* Info */}
        <div className="flex-grow text-center sm:text-left">
            <h2 className="mb-1 flex items-center justify-center sm:justify-start text-sm font-bold text-gray-900 xs:text-xs 2xs:text-[11px]">
                <FaUserAlt className="mr-1 text-xs text-blue-600" />
                {member.memberInfo?.first_name} {member.memberInfo?.last_name}
            </h2>

            {(member.district || member.memberInfo?.district) && (
                <p className="mb-1 flex items-center justify-center sm:justify-start text-xs text-gray-600 xs:text-[11px] 2xs:text-[10px]">
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                    {member.district || member.memberInfo?.district}
                </p>
            )}

            <p className="mb-2 flex items-center justify-center sm:justify-start text-xs capitalize text-gray-600 xs:text-[11px] 2xs:text-[10px]">
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                {member.memberInfo?.Position || member.memberInfo?.position || "No position specified"}
            </p>

            <p className="mb-1 flex items-center justify-center sm:justify-start text-xs text-gray-600 xs:text-[11px] 2xs:text-[10px]">
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                {termLabels[member.term || member.memberInfo?.term] || "No term specified"}
            </p>

            <motion.button
                onClick={() => openModal(member)}
                className="mt-1 flex items-center justify-center sm:justify-start text-xs font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800 focus:outline-none xs:text-[11px] 2xs:text-[10px]"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 500 }}
            >
                <span className="mr-1 border-b border-dotted border-blue-600 hover:border-blue-800">View Full Profile</span>
                <FaChevronRight className="text-xs" />
            </motion.button>
        </div>
    </motion.div>
);

export const MemberModal = ({ member, closeModal }) => {
    const [showFileTable, setShowFileTable] = useState(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "unset"; };
    }, []);

    if (!member) return null;
    const district = member.district || member.memberInfo?.district;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[888] flex items-start justify-center pt-6 xs:pt-20  2xs:pt-20  xs-max:pt-20 pb-4 bg-black/40 p-4 backdrop-blur-sm sm:items-center"
                variants={modalBackdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={closeModal}
            >
                <motion.div
                    // ✅ Reduced max height: from max-h-screen to max-h-[80vh]
                    className="w-11/12 max-w-4xl max-h-[80vh] overflow-y-auto rounded-xl bg-white shadow-2xl xs:w-full xs:rounded-lg 2xs:w-full"
                    variants={modalContentVariants}
                    onClick={(e) => e.stopPropagation()}
                    layout
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-3 xs:p-2">
                        <h2 className="text-lg font-bold text-gray-800 xs:text-base 2xs:text-sm">Member Profile</h2>
                        <motion.button
                            onClick={closeModal}
                            className="rounded-full p-1 text-xl font-bold text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaTimes />
                        </motion.button>
                    </div>

                    {/* Body - Reduced padding */}
                    <div className="p-3 xs:p-2 2xs:p-1">
                        <div className="flex flex-col items-start space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                            {/* Profile Picture */}
                            <motion.div className="flex w-full flex-col items-center md:w-1/3">
                                <img
                                    src={member.memberInfo?.avatar?.url || "https://randomuser.me/api/portraits/men/64.jpg"}
                                    alt="Member Profile Picture"
                                    className="h-auto w-full max-w-[160px] rounded-lg object-cover shadow-md xs:max-w-[110px] 2xs:max-w-[90px]"
                                />
                                <div className="mt-2 w-full text-center">
                                    <h2 className="text-base font-bold text-gray-900 xs:text-sm 2xs:text-xs">
                                        Hon. {member.memberInfo?.first_name} {member.memberInfo?.last_name}
                                    </h2>
                                    <p className="mt-1 text-sm capitalize text-gray-600 xs:text-xs 2xs:text-[10px]">
                                        {member.memberInfo?.Position || member.memberInfo?.position}
                                    </p>
                                    {district && <p className="mt-1 text-sm text-gray-600 xs:text-xs 2xs:text-[10px]">{district}</p>}
                                </div>
                            </motion.div>

                            {/* Details */}
                            <motion.div className="w-full md:w-2/3">
                                <div className="mb-3">
                                    <h3 className="mb-1 border-b pb-1 text-sm font-semibold text-gray-800 xs:text-xs">About</h3>
                                    <p className="text-gray-700 text-sm xs:text-xs 2xs:text-[11px]">
                                        {member.memberInfo?.detailInfo || "No additional information available."}
                                    </p>
                                </div>

                                {/* Counters - compact */}
                                <motion.div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <button
                                        onClick={() => setShowFileTable("totalLaws")}
                                        className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-center transition-colors hover:bg-blue-100"
                                    >
                                        <p className="text-lg font-bold text-blue-700 xs:text-base">{member.count || 0}</p>
                                        <p className="mt-1 text-xs text-blue-600">Total Laws</p>
                                    </button>
                                    <button
                                        onClick={() => setShowFileTable("Resolution")}
                                        className="rounded-lg border border-green-100 bg-green-50 p-2 text-center transition-colors hover:bg-green-100"
                                    >
                                        <p className="text-lg font-bold text-green-700 xs:text-base">{member.resolutionCount || 0}</p>
                                        <p className="mt-1 text-xs text-green-600">Total Resolutions</p>
                                    </button>
                                    <button
                                        onClick={() => setShowFileTable("Ordinance")}
                                        className="rounded-lg border border-purple-100 bg-purple-50 p-2 text-center transition-colors hover:bg-purple-100"
                                    >
                                        <p className="text-lg font-bold text-purple-700 xs:text-base">{member.ordinanceCount || 0}</p>
                                        <p className="mt-1 text-xs text-purple-600">Total Ordinances</p>
                                    </button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Nested Modal */}
            <AnimatePresence>
                {showFileTable && (
                    <FileTableModal
                        files={member.files}
                        category={showFileTable}
                        onClose={() => setShowFileTable(null)}
                    />
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};

export const SkeletonCard = () => (
    <motion.div
        className="flex items-start rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <div className="mr-3 h-32 w-20 animate-pulse rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 xs:h-24 xs:w-16 2xs:h-20 2xs:w-14"></div>
        <div className="flex-grow">
            <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gradient-to-r from-gray-100 to-gray-200"></div>
            <div className="mb-1 h-3 w-1/2 animate-pulse rounded bg-gradient-to-r from-gray-100 to-gray-200"></div>
            <div className="mb-1 h-3 w-2/3 animate-pulse rounded bg-gradient-to-r from-gray-100 to-gray-200"></div>
            <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-gradient-to-r from-gray-100 to-gray-200"></div>
        </div>
    </motion.div>
);

export const SkeletonFilter = () => (
    <motion.div
        className="animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <div className="mb-2 h-4 w-1/3 rounded bg-gradient-to-r from-gray-100 to-gray-200"></div>
        <div className="h-12 w-full rounded-md bg-gradient-to-r from-gray-100 to-gray-200"></div>
    </motion.div>
);

export default {
    MemberCard,
    MemberModal,
    SkeletonCard,
    SkeletonFilter,
};
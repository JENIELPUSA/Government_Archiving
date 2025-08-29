import React, { useEffect, useState } from "react";
import { FaUserAlt, FaTimes, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import FileTableModal from "./FileTableModal";

// Animation variants for consistent animations
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3
    }
  }
};

const modalContentVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.175, 0.885, 0.32, 1.1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

// MemberCard Component with animation
export const MemberCard = ({ member, openModal }) => (
  <motion.div
    className="flex flex-col sm:flex-row items-start bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:border-blue-100"
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    layout
  >
    <div className="w-full sm:w-24 mb-3 sm:mb-0 sm:mr-3 flex justify-center sm:block">
      <motion.img
        src={member.memberInfo?.avatar?.url || "https://randomuser.me/api/portraits/men/64.jpg"}
        alt="Profile Picture"
        className="h-32 w-20 object-cover rounded-lg shadow-sm"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
      />
    </div>
    <div className="flex-grow">
      <h2 className="mb-1 flex items-center text-base font-bold text-gray-900">
        <FaUserAlt className="mr-1 text-blue-600 text-xs" />
        {member.memberInfo?.first_name} {member.memberInfo?.last_name}
      </h2>
      <p className="flex items-center text-xs text-gray-600 mb-1">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
        {member.district || member.memberInfo?.district || "No district specified"}
      </p>
      <p className="flex items-center text-xs capitalize text-gray-600 mb-2">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
        {member.memberInfo?.Position || member.memberInfo?.position || "No position specified"}
      </p>
      <motion.button
        onClick={() => openModal(member)}
        className="mt-1 flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 focus:outline-none"
        whileHover={{ x: 3 }}
        transition={{ type: "spring", stiffness: 500 }}
      >
        <span className="mr-1 border-b border-dotted border-blue-600 hover:border-blue-800">
          View Full Profile
        </span>
        <FaChevronRight className="text-xs" />
      </motion.button>
    </div>
  </motion.div>
);


// MemberModal Component with enhancements
export const MemberModal = ({ member, closeModal }) => {
  const [showFileTable, setShowFileTable] = useState(null); // 'totalLaws', 'Resolution', 'Ordinance'

  useEffect(() => {
    // Prevent scrolling when main modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!member) return null;
  const district = member.district || member.memberInfo?.district;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={closeModal}
      >
        <motion.div 
          className="max-h-screen w-11/12 max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          variants={modalContentVariants}
          onClick={(e) => e.stopPropagation()}
          layout
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
            <h2 className="text-xl font-bold text-gray-800">Member Profile</h2>
            <motion.button
              onClick={closeModal}
              className="text-2xl font-bold text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 p-1 rounded-full"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <motion.div 
                className="w-full md:w-1/3 flex flex-col items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <img
                  src={(
                    member.memberInfo?.avatar?.url ||
                    "https://randomuser.me/api/portraits/men/64.jpg"
                  ).replace("112x176", "300x450")}
                  alt="Member Profile Picture"
                  className="h-auto w-full max-w-xs object-cover rounded-lg shadow-md"
                />
                <div className="mt-4 w-full text-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {member.memberInfo?.first_name} {member.memberInfo?.last_name}
                  </h2>
                  <p className="text-sm text-gray-600 capitalize mt-1">
                    {member.memberInfo?.Position || member.memberInfo?.position}
                  </p>
                  {district && <p className="text-sm text-gray-600 mt-1">District {district}</p>}
                </div>
              </motion.div>
              <motion.div 
                className="w-full md:w-2/3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">About</h3>
                  <p className="text-gray-700">
                    {member.memberInfo?.detailInfo || "No additional information available."}
                  </p>
                </div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <button
                    onClick={() => setShowFileTable('totalLaws')}
                    className="rounded-xl bg-blue-50 p-4 text-center border border-blue-100 transition-colors hover:bg-blue-100"
                  >
                    <p className="text-3xl font-bold text-blue-700">{member.count || 0}</p>
                    <p className="text-sm font-medium text-blue-600 mt-1">Total Laws</p>
                  </button>
                  <button
                    onClick={() => setShowFileTable('Resolution')}
                    className="rounded-xl bg-green-50 p-4 text-center border border-green-100 transition-colors hover:bg-green-100"
                  >
                    <p className="text-3xl font-bold text-green-700">{member.resolutionCount || 0}</p>
                    <p className="text-sm font-medium text-green-600 mt-1">Total Resolutions</p>
                  </button>
                  <button
                    onClick={() => setShowFileTable('Ordinance')}
                    className="rounded-xl bg-purple-50 p-4 text-center border border-purple-100 transition-colors hover:bg-purple-100"
                  >
                    <p className="text-3xl font-bold text-purple-700">{member.ordinanceCount || 0}</p>
                    <p className="text-sm font-medium text-purple-600 mt-1">Total Ordinances</p>
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

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

// SkeletonCard Component with animation
export const SkeletonCard = () => (
  <motion.div 
    className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-gray-100"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mr-3 h-32 w-20 animate-pulse rounded-lg bg-gradient-to-r from-gray-100 to-gray-200"></div>
    <div className="flex-grow">
      <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gradient-to-r from-gray-100 to-gray-200"></div>
      <div className="mb-1 h-3 w-1/2 animate-pulse rounded bg-gradient-to-r from-gray-100 to-gray-200"></div>
      <div className="mb-1 h-3 w-2/3 animate-pulse rounded bg-gradient-to-r from-gray-100 to-gray-200"></div>
      <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-gradient-to-r from-gray-100 to-gray-200"></div>
    </div>
  </motion.div>
);

// SkeletonFilter Component with animation
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
  SkeletonFilter
};
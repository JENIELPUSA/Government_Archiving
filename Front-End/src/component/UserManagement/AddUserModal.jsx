import React, { useContext } from "react";
import { motion } from "framer-motion";
import { DepartmentContext } from "../../contexts/DepartmentContext/DepartmentContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faBuilding,
  faVenusMars,
  faSignature,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";

const AddUserModal = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onFormSubmit,
  onEditSubmit,
  message,
  isSubmitting,
  selectedRole,
  isEditing,
}) => {
  const { isDepartment } = useContext(DepartmentContext);
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      onEditSubmit(formData);
    } else {
      onFormSubmit();
    }
  };

  const dropIn = {
    hidden: { opacity: 0, y: "-30%" },
    visible: { opacity: 1, y: "0", transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: "-20%", transition: { duration: 0.2 } },
  };

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur">
      <motion.div
        variants={dropIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl w-full max-w-xl relative text-gray-800 dark:text-white"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-gray-600 dark:text-gray-300 hover:text-red-500"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit User" : "Add New User"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto"
        >
          {/* First Name */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faUser} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
            />
            <input
              name="first_name"
              placeholder="First Name"
              value={formData.first_name || ""}
              onChange={onFormChange}
              className="w-full pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded p-2"
              required
            />
          </div>

          {/* Middle Name */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faIdCard} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
            />
            <input
              name="middle_name"
              placeholder="Middle Name"
              value={formData.middle_name || ""}
              onChange={onFormChange}
              className="w-full pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded p-2"
            />
          </div>

          {/* Last Name */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faSignature} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
            />
            <input
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name || ""}
              onChange={onFormChange}
              className="w-full pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded p-2"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faEnvelope} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email || ""}
              onChange={onFormChange}
              className="w-full pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded p-2"
              required
            />
          </div>

          {/* Department */}
          {selectedRole !== "Admin" && (
            <div className="relative">
              <FontAwesomeIcon 
                icon={faBuilding} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
              />
              <select
                name="department"
                value={formData.department || ""}
                onChange={onFormChange}
                className="w-full pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded p-2"
                required
              >
                <option value="">Select Department</option>
                {isDepartment.map(dep => (
                  <option key={dep._id} value={dep._id}>
                    {dep.department}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Gender */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faVenusMars} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" 
            />
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={onFormChange}
              className="w-full pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded p-2"
              required
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </form>

        <div className="mt-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save Changes"
                : "Add User"}
          </button>

          {message && (
            <p
              className={`mt-2 text-sm text-center ${
                message.includes("Error")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AddUserModal;
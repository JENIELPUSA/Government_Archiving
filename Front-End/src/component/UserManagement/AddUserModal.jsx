import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faVenusMars,
  faSignature,
  faIdCard,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";

const AddUserModal = ({ isOpen, onClose, editableUser, onFormSubmit }) => {
  if (!isOpen) return null;

  const isEditing = !!editableUser;

  const initialFormState = {
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    gender: "",
    avatar: null, // Idinagdag para sa File object
    avatarPreview: null, // Idinagdag para sa preview URL
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null); // Reference para sa file input

  useEffect(() => {
    if (isEditing) {
      setFormData({
        _id: editableUser._id,
        first_name: editableUser.first_name || "",
        middle_name: editableUser.middle_name || "",
        last_name: editableUser.last_name || "",
        email: editableUser.email || "",
        gender: editableUser.gender || "",
        avatar: null, // Walang file na kasama sa simula para iwas-conflict
        // Gamitin ang kasalukuyang avatar URL ng user para sa preview
        avatarPreview: editableUser.avatar?.url || "https://i.pravatar.cc/150?img=64",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editableUser]);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        avatar: file,
        avatarPreview: URL.createObjectURL(file), 
      }));
    }
  };

  const triggerFileInput = () => {
    if (!isSubmitting) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.gender) {
      setMessage("Error: Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await onFormSubmit(formData);
      setMessage(`Success: User ${isEditing ? "updated" : "added"} successfully.`);
      onClose();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div
              onClick={triggerFileInput}
              className={`relative h-32 w-32 rounded-full overflow-hidden border-4 ${
                isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } border-blue-500 dark:border-blue-400 shadow-md transition-transform transform hover:scale-105`}
            >
              {formData.avatarPreview ? (
                <img
                  src={formData.avatarPreview}
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400">
                  <FontAwesomeIcon icon={faCamera} className="text-4xl" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-blue-500 dark:bg-blue-600 p-1 rounded-full text-white">
                <FontAwesomeIcon icon={faCamera} />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
              disabled={isSubmitting}
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>

            {/* Gender */}
            <div className="relative col-span-full">
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
                disabled={isSubmitting}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 w-full">
            <button
              type="submit"
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
        </form>
      </motion.div>
    </div>
  );
};

export default AddUserModal;
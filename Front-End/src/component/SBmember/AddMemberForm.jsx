import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

function AddMemberForm({ onAddMember, onClose, memberToEdit }) {
  const [newMember, setNewMember] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    detailInfo: "",
    position: "councilor",
    district: "",
    email: "",
    avatar: null,
    preview: null,
  });
  // ✅ 1. Magdagdag ng state para sa loading
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  useEffect(() => {
    if (memberToEdit) {
      setNewMember({
        first_name: memberToEdit.memberInfo?.first_name || "",
        middle_name: memberToEdit.memberInfo?.middle_name || "",
        last_name: memberToEdit.memberInfo?.last_name || "",
        detailInfo: memberToEdit.detailInfo || "",
        position: memberToEdit.Position || "councilor",
        district: memberToEdit.district || "",
        email: memberToEdit.memberInfo.email || "",
        avatar: null,
        preview: memberToEdit.memberInfo?.avatar?.url || "https://randomuser.me/api/portraits/men/64.jpg",
      });
    } else {
      setNewMember({
        first_name: "",
        middle_name: "",
        last_name: "",
        detailInfo: "",
        position: "councilor",
        district: "",
        email: "",
        avatar: null,
        preview: null,
      });
    }
  }, [memberToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMember((prev) => ({
        ...prev,
        avatar: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  const triggerFileInput = () => {
    // ✅ I-disable ang button kapag naglo-load
    if (!isLoading) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ I-set ang loading sa true bago simulan ang proseso
    setIsLoading(true);

    try {
      const memberData = memberToEdit ? { ...newMember, _id: memberToEdit._id } : newMember;
      
      // I-assume na ang `onAddMember` ay isang asynchronous function
      await onAddMember(memberData);

      // Ang loading ay magiging false na matapos ang proseso
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      // ✅ Siguraduhin na ang loading ay magiging false, kahit may error
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: -50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -50, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-gray-800"
      >
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {memberToEdit ? "Edit Member" : "Add New Member"}
          </h2>
          <button
            onClick={onClose}
            // ✅ I-disable ang close button
            disabled={isLoading}
            className={`text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Profile Picture */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div
                onClick={triggerFileInput}
                className={`relative mb-4 flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-200 dark:border-gray-500 dark:bg-gray-700 ${
                  isLoading ? "cursor-not-allowed" : ""
                }`}
              >
                {newMember.preview ? (
                  <img
                    src={newMember.preview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400 dark:text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
              <button
                type="button"
                onClick={triggerFileInput}
                // ✅ I-disable ang upload button
                disabled={isLoading}
                className={`text-sm font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-4 py-2 rounded-md border border-blue-500 ${
                  isLoading ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {newMember.preview ? "Change Photo" : "Upload Photo"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                // ✅ I-disable ang file input
                disabled={isLoading}
              />

              {/* Position Selector */}
              <div className="w-full mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <select
                  name="position"
                  value={newMember.position}
                  onChange={handleInputChange}
                  // ✅ I-disable ang select field
                  disabled={isLoading}
                  className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                    isLoading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <option value="mayor">Mayor</option>
                  <option value="vice-mayor">Vice Mayor</option>
                  <option value="councilor">Councilor</option>
                </select>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="w-full md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={newMember.first_name}
                    onChange={handleInputChange}
                    // ✅ I-disable ang input field
                    disabled={isLoading}
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                      isLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    required
                  />
                </div>

                {/* Middle Name */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={newMember.middle_name}
                    onChange={handleInputChange}
                    // ✅ I-disable ang input field
                    disabled={isLoading}
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                      isLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  />
                </div>

                {/* Last Name */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={newMember.last_name}
                    onChange={handleInputChange}
                    // ✅ I-disable ang input field
                    disabled={isLoading}
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                      isLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    required
                  />
                </div>

                {/* district */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    district *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={newMember.district}
                    onChange={handleInputChange}
                    // ✅ I-disable ang input field
                    disabled={isLoading}
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                      isLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newMember.email}
                    onChange={handleInputChange}
                    // ✅ I-disable ang input field
                    disabled={isLoading}
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                      isLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Info
                </label>
                <textarea
                  name="detailInfo"
                  value={newMember.detailInfo}
                  onChange={handleInputChange}
                  rows="4"
                  // ✅ I-disable ang textarea
                  disabled={isLoading}
                  className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                    isLoading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  // ✅ I-disable ang cancel button
                  disabled={isLoading}
                  className={`rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 ${
                    isLoading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  // ✅ I-disable ang submit button
                  disabled={isLoading}
                  className={`rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 ${
                    isLoading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  {/* ✅ Magpakita ng loading state sa button */}
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {memberToEdit ? "Saving..." : "Adding..."}
                    </span>
                  ) : (
                    <>{memberToEdit ? "Save Changes" : "Add Member"}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AddMemberForm;
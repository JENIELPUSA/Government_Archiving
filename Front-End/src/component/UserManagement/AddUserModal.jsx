import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faVenusMars, faSignature, faIdCard, faCamera, faUserShield } from "@fortawesome/free-solid-svg-icons";

const AddUserModal = ({ isOpen, onClose, editableUser, onFormSubmit, modalType = "admin" }) => {
    if (!isOpen) return null;

    const isEditing = !!editableUser;

    console.log("editableUser", editableUser);

    const initialFormState = {
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        gender: "",
        role: "Uploader", // Default role
        avatar: null,
        avatarPreview: null,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const fileInputRef = useRef(null);

    // Helper function para makuha ang tamang URL ng avatar
    const getAvatarUrl = (avatar) => {
        if (!avatar || !avatar.url) return null;

        // Kung ang URL ay may 'http' na, ibig sabihin galing ito sa web
        if (avatar.url.startsWith("http")) {
            return avatar.url;
        }

        // Para sa mga local files (e.g., '/uploads/12.JPG')
        const baseURL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "";
        const formattedBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
        const formattedAvatarURL = avatar.url.startsWith("/") ? avatar.url : `/${avatar.url}`;

        return `${formattedBaseURL}${formattedAvatarURL}`;
    };

    useEffect(() => {
        if (isEditing) {
            // Gamitin ang getAvatarUrl function para sa tamang preview URL
            const avatarPreviewUrl = getAvatarUrl(editableUser.avatar);

            setFormData({
                _id: editableUser._id,
                first_name: editableUser.first_name || "",
                middle_name: editableUser.middle_name || "",
                last_name: editableUser.last_name || "",
                email: editableUser.email || "",
                gender: editableUser.gender || "",
                role: editableUser.role || "Uploader", // Idagdag ang role field
                avatar: null,
                avatarPreview: avatarPreviewUrl,
            });
        } else {
            // For new users, set role based on modalType
            setFormData({
                ...initialFormState,
                role: modalType === "admin" ? "admin" : "officer",
            });
        }
    }, [editableUser, isEditing, modalType]);

    const onFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Gumamit ng FileReader para sa instant preview ng bagong file
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prevData) => ({
                    ...prevData,
                    avatar: file,
                    avatarPreview: reader.result, // Ito ay Base64 string para sa preview
                }));
            };
            reader.readAsDataURL(file);
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

        // Validation para sa mga required fields
        // IMPORTANT: Kapag edit mode, hindi na kailangan i-validate ang role
        const requiredFields = ["first_name", "last_name", "email", "gender"];

        // For new users only, add role to required fields
        if (!isEditing) {
            requiredFields.push("role");
        }

        for (const field of requiredFields) {
            if (!formData[field]) {
                setMessage(`Error: Please fill in all required fields. Missing: ${field}`);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            // Prepare data for submission
            const submitData = { ...formData };

            // Kung edit mode, huwag na isama ang role sa data
            if (isEditing) {
                delete submitData.role;
            }

            await onFormSubmit(submitData);
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
                className="relative w-full max-w-xl rounded-xl bg-white p-6 text-gray-800 shadow-xl dark:bg-gray-900 dark:text-white"
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-3 text-xl text-gray-600 hover:text-red-500 dark:text-gray-300"
                >
                    ×
                </button>

                <h2 className="mb-4 text-xl font-bold">Add User</h2>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center"
                >
                    {/* Avatar Section */}
                    <div className="mb-6 flex flex-col items-center">
                        <div
                            onClick={triggerFileInput}
                            className={`relative h-32 w-32 overflow-hidden rounded-full border-4 ${
                                isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                            } transform border-blue-500 shadow-md transition-transform hover:scale-105 dark:border-blue-400`}
                        >
                            {formData.avatarPreview ? (
                                <img
                                    src={formData.avatarPreview}
                                    alt="User Avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400 dark:bg-gray-700">
                                    <FontAwesomeIcon
                                        icon={faCamera}
                                        className="text-4xl"
                                    />
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-1 text-white dark:bg-blue-600">
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
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                        {/* First Name */}
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faUser}
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                            />
                            <input
                                name="first_name"
                                placeholder="First Name"
                                value={formData.first_name || ""}
                                onChange={onFormChange}
                                className="w-full rounded border border-gray-300 p-2 pl-10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Middle Name */}
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faIdCard}
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                            />
                            <input
                                name="middle_name"
                                placeholder="Middle Name"
                                value={formData.middle_name || ""}
                                onChange={onFormChange}
                                className="w-full rounded border border-gray-300 p-2 pl-10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Last Name */}
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faSignature}
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                            />
                            <input
                                name="last_name"
                                placeholder="Last Name"
                                value={formData.last_name || ""}
                                onChange={onFormChange}
                                className="w-full rounded border border-gray-300 p-2 pl-10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faEnvelope}
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email || ""}
                                onChange={onFormChange}
                                className="w-full rounded border border-gray-300 p-2 pl-10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Gender */}
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faVenusMars}
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                            />
                            <select
                                name="gender"
                                value={formData.gender || ""}
                                onChange={onFormChange}
                                className="w-full rounded border border-gray-300 p-2 pl-10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        {/* Role Dropdown - HIDDEN WHEN EDITING */}
                        {!isEditing && (
                            <div className="relative">
                                <FontAwesomeIcon
                                    icon={faUserShield}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                                />
                                <select
                                    name="role"
                                    value={formData.role || ""}
                                    onChange={onFormChange}
                                    className="w-full rounded border border-gray-300 p-2 pl-10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="officer">Uploader</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 w-full">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        >
                            {isSubmitting ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save Changes" : "Add User"}
                        </button>
                        {message && (
                            <p className={`mt-2 text-center text-sm ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>{message}</p>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddUserModal;

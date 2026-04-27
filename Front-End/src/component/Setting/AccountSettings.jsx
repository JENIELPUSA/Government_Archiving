import React, { useState, useEffect, useContext, useRef } from "react";
import { FaUser, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaCamera, FaTimes, FaCheck, FaCalendarAlt } from "react-icons/fa";

// Contexts
import { AuthContext } from "../../contexts/AuthContext";
import { AdminDisplayContext } from "../../contexts/AdminContext/AdminContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

const AccountSettings = ({ showPassword, setShowPassword }) => {
    const { role, email, linkId, Profile, fetchProfile, updateAvatar, UpdateProfileInfo } = useContext(AuthContext);
    const { UpdateAdmin } = useContext(AdminDisplayContext);

    // Modal & Feedback States
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");

    // Profile States
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [gender, setGender] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    // Image States
    const [previewImage, setPreviewImage] = useState(null);
    const [tempImage, setTempImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    // Password States
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Initial Fetch
    useEffect(() => {
        fetchProfile();
    }, []);

    // Sync Profile Data to States
    useEffect(() => {
        if (Profile && linkId) {
            const userProfile = Array.isArray(Profile) ? Profile.find((p) => p._id === linkId) : Profile;
            if (userProfile) {
                setFirstName(userProfile.first_name || "");
                setLastName(userProfile.last_name || "");
                setMiddleName(userProfile.middle_name || "");
                setGender(userProfile.gender || "");
                if (userProfile.created_at) {
                    const date = new Date(userProfile.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    });
                    setCreatedAt(date);
                }
                if (userProfile.avatar?.url) {
                    setPreviewImage(userProfile.avatar.url);
                }
            }
        }
    }, [Profile, linkId]);

    // Handle Image Selection from PC
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result);
                setIsModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- UPLOAD HANDLER (IMAGE ONLY) ---
    const handleUploadImage = async () => {
        if (!imageFile) return;

        try {
            // Tatawagin ang function sa AuthContext
            await updateAvatar(imageFile);

            // Success Feedback
            setPreviewImage(tempImage);
            setIsModalOpen(false);
            setModalStatus("success");
            setShowModal(true);
            fetchProfile();
        } catch (error) {
            console.error("Upload Error:", error);
            setModalStatus("failed");
            setCustomError(error.response?.data?.message || "Failed to update profile picture.");
            setShowModal(true);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            first_name: firstName,
            last_name: lastName,
            middle_name: middleName,
            gender: gender,
            email: email,
        };

        try {
            await UpdateAdmin(linkId, payload);
            setModalStatus("success");
            setShowModal(true);
        } catch (err) {
            setModalStatus("failed");
            setCustomError("Unable to update personal information.");
            setShowModal(true);
        }
    };
    return (
        <div className="mx-auto max-w-5xl px-2 py-6 outline-none">
            {/* AVATAR SECTION */}
            <div className="mb-10 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <div className="size-36 overflow-hidden rounded-full border-4 border-blue-500/20 bg-blue-50 shadow-2xl dark:border-blue-500/30 dark:bg-slate-800">
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-blue-500/50">
                                <FaUser size={60} />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-1 right-2 flex size-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700 active:scale-95"
                    >
                        <FaCamera size={16} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{`${firstName} ${lastName}`}</h2>
                    <p className="text-sm font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">{role}</p>
                </div>
            </div>

            {/* PREVIEW MODAL (Bago i-save) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b p-6 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Update Photo</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col items-center space-y-6 p-10 text-center">
                            <div className="size-48 overflow-hidden rounded-full border-4 border-blue-500 shadow-xl">
                                <img
                                    src={tempImage}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <p className="text-sm font-medium italic text-gray-500">Save this as your new profile picture?</p>
                        </div>
                        <div className="grid grid-cols-2 border-t dark:border-gray-800">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-4 font-semibold text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadImage}
                                className="flex items-center justify-center space-x-2 bg-blue-600 p-4 font-bold text-white transition-colors hover:bg-blue-700"
                            >
                                <FaCheck /> <span>Save Photo</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN FORMS */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                {/* Personal Info */}
                <div className="flex flex-col space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700/50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-3 border-b pb-4 dark:border-gray-700">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30">
                            <FaUser size={20} />
                        </div>
                        <h4 className="text-lg font-bold">Personal Information</h4>
                    </div>
                    <form
                        onSubmit={handleProfileSubmit}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-slate-900"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-slate-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">Middle Name</label>
                                <input
                                    type="text"
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-slate-900"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">Gender</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-slate-900"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-400">Email Address</label>
                            <div className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-gray-100 p-3.5 text-gray-500 dark:border-gray-600 dark:bg-slate-800">
                                <FaEnvelope size={14} /> <span className="text-sm">{email}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-400">Member Since</label>
                            <div className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-gray-500 dark:border-gray-600 dark:bg-slate-900/50">
                                <FaCalendarAlt
                                    size={14}
                                    className="text-blue-500"
                                />{" "}
                                <span className="text-sm font-medium">{createdAt || "N/A"}</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-[0.98]"
                        >
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Security/Password */}
                <div className="flex flex-col space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700/50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-3 border-b pb-4 dark:border-gray-700">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30">
                            <FaLock size={20} />
                        </div>
                        <h4 className="text-lg font-bold">Security Settings</h4>
                    </div>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="space-y-5"
                    >
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-400">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 text-gray-400 hover:text-blue-500"
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">New Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-slate-900"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">Confirm Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-slate-900"
                                />
                            </div>
                        </div>
                        <button className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-black active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-700">
                            Change Password
                        </button>
                    </form>
                </div>
            </div>

            {/* FEEDBACK MODAL (Success or Fail) */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
        </div>
    );
};

export default AccountSettings;

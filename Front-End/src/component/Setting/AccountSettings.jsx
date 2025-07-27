import {
  FaUser,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaBriefcase,
  FaLock,
  FaKey,
} from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";
import React, { useState, useEffect, useContext } from "react";
import { AdminDisplayContext } from "../../contexts/AdminContext/AdminContext";
import { UpdateDisplayContext } from "../../contexts/UpdateContext/updateContext";

const AccountSettings = ({ showPassword, setShowPassword }) => {
  const { role, email, linkId } = useContext(AuthContext);
  const { UpdateAdmin, isAdminProfile } = useContext(AdminDisplayContext);
  const { UpdatePasswordData } = useContext(UpdateDisplayContext);

  const [fullName, setFullName] = useState(
    `${isAdminProfile.first_name || ""} ${isAdminProfile.last_name || ""}`
  );
  const [middleName, setMiddleName] = useState(isAdminProfile.middle_name || "");
  const [department, setDepartment] = useState(isAdminProfile.specialty || "");
  const [position, setPosition] = useState(role);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (isAdminProfile) {
      setFullName(`${isAdminProfile.first_name || ""} ${isAdminProfile.last_name || ""}`);
      setMiddleName(isAdminProfile.middle_name || "");
      setDepartment(isAdminProfile.specialty || "");
    }
  }, [isAdminProfile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const [first, ...rest] = fullName.trim().split(" ");
    const last = rest.join(" ");

    const payload = {
      first_name: first,
      last_name: last,
      middle_name: middleName,
      specialty: department,
      email,
    };

    await UpdateAdmin(linkId, payload);
    console.log("🔄 Updating profile with data:", payload);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("❌ New passwords do not match!");
      return;
    }

    const payload = {
      currentPassword,
      password: newPassword,
      confirmPassword,
    };

    try {
      await UpdatePasswordData(payload);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("❌ Failed to update password:", error);
      alert("❌ Password update failed!");
    }
  };

  return (
    <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-700">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full border-4 border-white bg-blue-100 p-5 shadow-lg dark:border-gray-800 dark:bg-blue-900/50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-white">
            <FaUser className="text-3xl" />
          </div>
        </div>
      </div>

      <h3 className="mb-6 flex items-center justify-center text-xl font-bold">
        <FaUser className="mr-3 text-blue-500" /> Account Settings
      </h3>

      <div className="space-y-6">
        {/* Profile Update Form */}
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h4 className="mb-4 flex items-center text-lg font-semibold">
            <FaUser className="mr-2 text-blue-500" /> Profile Information
          </h4>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full Name */}
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Middle Name */}
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
                Middle Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Department */}
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
                Department
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaBriefcase className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Position */}
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
                Position
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaBriefcase className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={position}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative col-span-full">
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={email}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 py-2.5 pl-10 pr-4 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition duration-200 hover:bg-blue-700"
          >
            <FaUser className="mr-2" /> Update Profile
          </button>
        </form>

        {/* Password Change Form */}
        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h4 className="mb-4 flex items-center text-lg font-semibold">
            <FaLock className="mr-2 text-blue-500" /> Password Settings
          </h4>

          {/* Current Password */}
          <div className="mb-5">
            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
              Current Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaKey className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="mb-5">
            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition duration-200 hover:bg-blue-700"
          >
            <FaKey className="mr-2" /> Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;

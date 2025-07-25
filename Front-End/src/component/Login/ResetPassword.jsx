import React, { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";
import { FaLock } from "react-icons/fa";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/resetPassword/${token}`,
        { password, confirmPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.status === "Success") {
        toast.success("Password updated successfully!");
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Reset error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <motion.div
        className="relative w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl border border-blue-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <FaLock className="text-blue-600 text-2xl" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              autoComplete="off"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold tracking-wide transition duration-200"
          >
            Save New Password
          </button>
        </form>

        <ToastContainer position="bottom-right" autoClose={3000} />
      </motion.div>
    </div>
  );
}

export default ResetPassword;

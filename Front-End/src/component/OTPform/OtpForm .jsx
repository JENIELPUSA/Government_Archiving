import React, { useState } from "react";
import { motion } from "framer-motion";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axios from "axios";
import { toast } from "react-toastify";

const OtpForm = ({ isOpen, onClose, userId }) => {
    const [otp, setOtp] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        const fullOtp = otp.trim();

        if (fullOtp.length !== 4) {
            return setError("Please enter a complete 4-digit OTP.");
        }
        if (!userId) {
            return setError("User ID is missing. Cannot verify.");
        }

        setLoading(true);

        try {
            await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/mail-verification`, {
                otp: fullOtp,
                userId: userId,
            });
            setModalStatus("success");
            setShowModal(true);
            setLoading(false);
            toast.success("OTP verification successful!");
            localStorage.removeItem("userIdForVerification");
            onClose();
        } catch (err) {
            setLoading(false);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Verification failed. Please try again or check your network.");
            }
            console.error("OTP Verification Error:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900"
            >
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleConfirm}
                    className="flex flex-col space-y-5 text-center"
                >
                    <h2 className="text-2xl font-bold dark:text-white md:text-3xl">Confirm OTP</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 md:text-base">Enter the OTP we just sent you.</p>

                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        maxLength={4}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-lg font-medium placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        {loading ? "Verifying..." : "Confirm"}
                    </button>
                </form>
            </motion.div>

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </div>
    );
};

export default OtpForm;

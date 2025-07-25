import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OfficerDisplayContext } from "../../../contexts/OfficerContext/OfficerContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../../ReusableFolder/LoadingOverlay";
const RecieverForm = ({ isOpen, onClose, categoryData }) => {
    const { isOfficer } = useContext(OfficerDisplayContext);
    const { InsertOfficer } = useContext(FilesDisplayContext);
    const navigate = useNavigate();
    const [receiver, setReceiver] = useState(""); // This holds the _id
    const [matchedCategories, setMatchedCategories] = useState([]);
    const [submissionMessage, setSubmissionMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (isOfficer && categoryData) {
            const matched = isOfficer.filter((officer) => officer.department === categoryData.department);

            setMatchedCategories(matched);
            if (matched.length > 0) {
                setReceiver(matched[0]._id);
            } else {
                setReceiver("");
            }
        }
    }, [isOfficer, categoryData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!receiver) {
                setSubmissionMessage("Please select a receiver.");
                setTimeout(() => setSubmissionMessage(null), 3000);
                return;
            }

            const selectedOfficer = matchedCategories.find((officer) => officer._id === receiver);

            if (!selectedOfficer) {
                setSubmissionMessage("Receiver not found.");
                return;
            }
            const result = await InsertOfficer(categoryData._id, { officer: selectedOfficer._id });
            if (result.success) {
                onClose();
                navigate("/dashboard/view-documents");
            }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const backdropVariants = {
        visible: { opacity: 1, backdropFilter: "blur(5px)" },
        hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    };

    const modalVariants = {
        hidden: {
            y: "-100vh",
            opacity: 0,
        },
        visible: {
            y: "0",
            opacity: 1,
            transition: { delay: 0.1, duration: 0.5, type: "spring", stiffness: 120 },
        },
        exit: {
            y: "100vh",
            opacity: 0,
            transition: { duration: 0.3 },
        },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-600 bg-opacity-50 p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    style={{ backdropFilter: "blur(5px)" }}
                >
                    <motion.div
                        className="font-inter relative w-full max-w-lg transform space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-gray-600"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            &times;
                        </button>

                        <h2 className="mb-6 text-center text-3xl font-extrabold text-gray-800">Archive Document</h2>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {/* Receiver Dropdown Field */}
                            <div>
                                <label
                                    htmlFor="receiver"
                                    className="mb-1 block text-sm font-semibold text-gray-700"
                                >
                                    Name of Receiver
                                </label>
                                <div className="relative">
                                    <select
                                        id="receiver"
                                        className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-gray-800 shadow-sm transition duration-200 ease-in-out hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500"
                                        value={receiver}
                                        onChange={(e) => setReceiver(e.target.value)}
                                        disabled={matchedCategories.length === 0}
                                    >
                                        {matchedCategories.length === 0 ? (
                                            <option value="">No receivers available</option>
                                        ) : (
                                            matchedCategories.map((officer) => (
                                                <option
                                                    key={officer._id}
                                                    value={officer._id}
                                                >
                                                    {officer.first_name} {officer.last_name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg
                                            className="h-4 w-4 fill-current"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Submission Message */}
                            {submissionMessage && (
                                <div
                                    className="relative rounded-lg border border-green-400 bg-green-100 px-4 py-3 text-green-700"
                                    role="alert"
                                >
                                    <span className="block sm:inline">{submissionMessage}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full transform rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-bold text-white shadow-lg transition duration-200 ease-in-out hover:scale-105 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                Submit Document
                            </button>
                        </form>
                        {isLoading && <LoadingOverlay message="Submitting to Officer..." />}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RecieverForm;

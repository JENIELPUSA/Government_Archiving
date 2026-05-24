// src/pages/SettingsPage.js
import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import GeneralSettings from "../../component/Setting/GeneralSettings";
import AccountSettings from "../../component/Setting/AccountSettings";
import StorageSettings from "../../component/Setting/StorageSettings";
import ApproverSettings from "../../component/Setting/ApproverSettings";
import PictureUploadSettings from "../../component/Setting/UploadPicture/PictureUploadSettings";
import { ApproverDisplayContext } from "../../contexts/ApproverContext/ApproverContext";
import Suggestionsetting from "../../component/SuggestionComponent/SuggestionTable/SuggestionTable"
import { SuggestionContext } from "../../contexts/SuggestionContext/SuggestionContext";

const SettingsPage = () => {
    const { approver, setApprover } = useContext(ApproverDisplayContext);

    // 1. Kunin ang pagination data at loading state mula sa SuggestionContext
    const {
        suggestions,
        pagination,
        loading,
        currentFilters,
        getAllSuggestions, deleteSuggestion
    } = useContext(SuggestionContext);

    const [autoMoveArchive, setAutoMoveArchive] = useState(true);
    const [fileRetention, setFileRetention] = useState(365);
    const [storageQuota, setStorageQuota] = useState(50);
    const [showPassword, setShowPassword] = useState(false);

    // 2. Opsyonal: Tumakbo sa unang load para siguradong may data agad ang table gamit ang default parameters
    useEffect(() => {
        getAllSuggestions({ page: 1, limit: 10 });
    }, [getAllSuggestions]);

    return (
        <div className="text-gray-800 dark:text-gray-100">
            <div>
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center"
                ></motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
                >
                    <GeneralSettings
                        autoMoveArchive={autoMoveArchive}
                        setAutoMoveArchive={setAutoMoveArchive}
                        fileRetention={fileRetention}
                        setFileRetention={setFileRetention}
                    />

                    <AccountSettings
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                    />

                    <StorageSettings />

                    {/* 3. Ipasa ang pagination props dito para magamit sa loob ng Table component */}
                    <Suggestionsetting
                        suggestions={suggestions}
                        pagination={pagination}
                        loading={loading}
                        currentFilters={currentFilters}
                        onFetchData={getAllSuggestions}
                        deleteSuggestion={deleteSuggestion}
                    />

                    <PictureUploadSettings />
                </motion.div>
            </div>
        </div>
    );
};

export default SettingsPage;
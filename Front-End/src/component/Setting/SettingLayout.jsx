// src/pages/SettingsPage.js
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import GeneralSettings from "../../component/Setting/GeneralSettings";
import AccountSettings from "../../component/Setting/AccountSettings";
import StorageSettings from "../../component/Setting/StorageSettings";
import ApproverSettings from "../../component/Setting/ApproverSettings";
import PictureUploadSettings from "../../component/Setting/UploadPicture/PictureUploadSettings";
import { ApproverDisplayContext } from "../../contexts/ApproverContext/ApproverContext";

const SettingsPage = () => {
    const { approver, setApprover } = useContext(ApproverDisplayContext);
    const [autoMoveArchive, setAutoMoveArchive] = useState(true);
    const [fileRetention, setFileRetention] = useState(365);
    const [storageQuota, setStorageQuota] = useState(50);
    const [showPassword, setShowPassword] = useState(false);

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
                    {/*<ApproverSettings
                      
                      approvers={approver}
                        setApprover={setApprover}
                    />
                    */}
                    <StorageSettings/>
                    <PictureUploadSettings />
                </motion.div>
            </div>
        </div>
    );
};

export default SettingsPage;

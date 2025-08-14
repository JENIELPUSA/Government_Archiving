// src/pages/SettingsPage.js
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import GeneralSettings from '../../component/Setting/GeneralSettings';
import AccountSettings from '../../component/Setting/AccountSettings';
import StorageSettings from '../../component/Setting/StorageSettings';
import ApproverSettings from '../../component/Setting/ApproverSettings';
import PictureUploadSettings from '../../component/Setting/UploadPicture/PictureUploadSettings';
import { ApproverDisplayContext } from '../../contexts/ApproverContext/ApproverContext';

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
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
        >
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg"
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

          <StorageSettings storageQuota={storageQuota} />
          
          {/* Picture Upload Component */}
          <PictureUploadSettings />
          
          <ApproverSettings 
            approvers={approver} 
            setApprover={setApprover} 
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
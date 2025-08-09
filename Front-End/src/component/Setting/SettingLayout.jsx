import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaSave } from 'react-icons/fa';
import GeneralSettings from './GeneralSettings';
import AccountSettings from './AccountSettings';
import StorageSettings from './StorageSettings';
import ApproverSettings from './ApproverSettings';
import { ApproverDisplayContext } from '../../contexts/ApproverContext/ApproverContext';

const SettingsPage = () => {
  const { approver, setApprover } = useContext(ApproverDisplayContext); // single data lang, not array

  const [autoMoveArchive, setAutoMoveArchive] = useState(true);
  const [fileRetention, setFileRetention] = useState(365);
  const [storageQuota, setStorageQuota] = useState(50);
  const [showPassword, setShowPassword] = useState(false);

  console.log("APPROVER DATA:", approver);

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

          {/* Pass single approver object */}
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

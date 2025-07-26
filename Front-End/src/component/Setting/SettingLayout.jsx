import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCog, FaUser, FaDatabase,
  FaSave, FaEye, FaEyeSlash, FaArchive
} from 'react-icons/fa';

const SettingsPage = () => {
  const [autoMoveArchive, setAutoMoveArchive] = useState(true);
  const [fileRetention, setFileRetention] = useState(365);
  const [storageQuota, setStorageQuota] = useState(50);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FaCog className="mr-3 text-blue-500" /> System Settings
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Configure your File Archiving System preferences
            </p>
          </div>
          {/* Dark Mode button removed */}
        </motion.div>

        {/* Main Content - Consolidated into General Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FaCog className="mr-3 text-blue-500" /> General Settings
          </h2>

          {/* Original General Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
              <div>
                <h3 className="font-semibold">Auto Move Archive</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Automatically move files to archive after retention period
                </p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  checked={autoMoveArchive}
                  onChange={() => setAutoMoveArchive(!autoMoveArchive)}
                  className="sr-only"
                  id="auto-archive"
                />
                <label
                  htmlFor="auto-archive"
                  className={`block h-6 w-12 rounded-full cursor-pointer ${
                    autoMoveArchive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      autoMoveArchive ? 'transform translate-x-6' : ''
                    }`}
                  ></span>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
              <h3 className="font-semibold mb-4">File Retention Period</h3>
              <div className="flex items-center">
                <input
                  type="range"
                  min="30"
                  max="730"
                  step="30"
                  value={fileRetention}
                  onChange={(e) => setFileRetention(e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-4 w-20 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-center">
                  {fileRetention} days
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Files will be automatically archived after this period
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
              <h3 className="font-semibold mb-4">System Logs</h3>
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  View Logs
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                  Download Logs
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Clear Logs
                </button>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <FaUser className="mr-3 text-blue-500" /> Account Settings
            </h3>

            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                <h4 className="font-semibold mb-4">Profile Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Alex Johnson"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue="alex.johnson@example.com"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Position</label>
                    <input
                      type="text"
                      defaultValue="Archiving Manager"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <input
                      type="text"
                      defaultValue="Records Management"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                    />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Update Profile
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                <h4 className="font-semibold mb-4">Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Storage Settings Section */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <FaDatabase className="mr-3 text-blue-500" /> Storage Settings
            </h3>

            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Storage Usage</h4>
                  <span className="text-sm font-medium">{storageQuota}% of 1TB used</span>
                </div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                    style={{ width: `${storageQuota}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>0 GB</span>
                  <span>1 TB</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                <h4 className="font-semibold mb-4">Storage Allocation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900">
                    <div className="text-2xl font-bold mb-2">Documents</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">325 GB</div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900">
                    <div className="text-2xl font-bold mb-2">Images</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">125 GB</div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                <h4 className="font-semibold mb-4">Storage Optimization</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Auto-compress files</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Compress files older than 6 months</p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only"
                        id="compress"
                      />
                      <label
                        htmlFor="compress"
                        className="block h-6 w-12 rounded-full cursor-pointer bg-blue-500"
                      >
                        <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform translate-x-6"></span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Auto-delete temporary files</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Delete temporary files after 30 days</p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only"
                        id="delete-temp"
                      />
                      <label
                        htmlFor="delete-temp"
                        className="block h-6 w-12 rounded-full cursor-pointer bg-blue-500"
                      >
                        <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform translate-x-6"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center">
                <FaSave className="mr-2" /> Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
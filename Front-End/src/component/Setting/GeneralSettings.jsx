import React, { useState, useContext, useEffect } from 'react';
import { FaCog } from 'react-icons/fa';
import { RetentionContext } from '../../contexts/RetentionContext/RetentionContext';

const GeneralSettings = ({
  autoMoveArchive,
  setAutoMoveArchive,
  fileRetention,
  setFileRetention,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  const { AddRetention, isRetention } = useContext(RetentionContext);

  // Sync retention values from context if available
  useEffect(() => {
    if (isRetention) {
      setFileRetention(isRetention.retentionDays || 30);
      setAutoMoveArchive(isRetention.enabled ?? false);
    }
  }, [isRetention]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleAutoMoveToggle = () => {
    const newStatus = !autoMoveArchive;
    setAutoMoveArchive(newStatus);
    AddRetention(fileRetention, newStatus);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <FaCog className="mr-3 text-blue-500" /> General Settings
      </h2>

      <div className="space-y-6">
        {/* Auto Move Archive */}
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
              onChange={handleAutoMoveToggle}
              className="sr-only"
              id="auto-archive"
            />
            <label
              htmlFor="auto-archive"
              className={`block h-6 w-12 rounded-full cursor-pointer ${
                autoMoveArchive
                  ? 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
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
              onChange={(e) => {
                setFileRetention(e.target.value);
                setAutoMoveArchive(false); // Turn off toggle when changed
                AddRetention(e.target.value, false); // Update immediately with disabled
              }}
              className="w-full h-2 bg-gray-200 dark:bg-blue-300 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-4 w-20 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-center">
              {fileRetention} days
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Files will be automatically archived after this period
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
          <div>
            <h3 className="font-semibold">Theme</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Switch between Light and Dark mode
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
              className="sr-only"
              id="theme-toggle"
            />
            <label
              htmlFor="theme-toggle"
              className={`block h-6 w-12 rounded-full cursor-pointer ${
                isDarkMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  isDarkMode ? 'transform translate-x-6' : ''
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneralSettings;

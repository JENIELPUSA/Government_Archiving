import React, { useState, useEffect, useContext } from "react";
import { FaDatabase, FaBell, FaTrash, FaInfoCircle } from "react-icons/fa";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import { StorageOptimizationContext } from "../../contexts/StorageOptimization/StorageOptimization";

const StorageSettings = () => {
    const { isFile } = useContext(FilesDisplayContext);
    const { AddOptimized, isOptimized } = useContext(StorageOptimizationContext);

    const [isOptimizationEnabled, setIsOptimizationEnabled] = useState(false);
    const [fileData, setFileData] = useState([]);
    const [optimizationSettings, setOptimizationSettings] = useState({
        "auto-delete-notification": false,
        "auto-delete-temp": false,
    });

    console.log("OPY",isOptimized)

    // Sync from isOptimized (context value)
    useEffect(() => {
        if (isOptimized && typeof isOptimized.enabled === 'boolean') {
            setIsOptimizationEnabled(isOptimized.enabled);

            setOptimizationSettings({
                "auto-delete-notification": isOptimized.enabled,
                "auto-delete-temp": isOptimized.enabled,
            });
        }
    }, [isOptimized]);

    useEffect(() => {
        const standardized = isFile.map((file) => ({
            ...file,
            fileSize: file.fileSize ?? 0,
        }));
        setFileData(standardized);
    }, [isFile]);

    const toggleMasterOptimization = () => {
        setIsOptimizationEnabled((prev) => {
            const newState = !prev;

            if (newState) {
                const updatedSettings = {
                    "auto-delete-notification": true,
                    "auto-delete-temp": true,
                };
                setOptimizationSettings(updatedSettings);
                AddOptimized(30, true);
            } else {
                setOptimizationSettings({
                    "auto-delete-notification": false,
                    "auto-delete-temp": false,
                });
                AddOptimized(30, false);
            }

            return newState;
        });
    };

    const calculateStorageAllocation = () => {
        let documentsSize = 0;
        let imagesSize = 0;
        let otherSize = 0;

        fileData.forEach((file) => {
            const sizeInGB = file.fileSize / (1024 * 1024 * 1024);
            if (file.category && ["Memorandum", "Resolutions & Ordinances", "Official Letters", "Executive Orders"].includes(file.category)) {
                documentsSize += sizeInGB;
            } else if (file.fileName && /\.(jpg|jpeg|png|gif)$/i.test(file.fileName)) {
                imagesSize += sizeInGB;
            } else {
                otherSize += sizeInGB;
            }
        });

        const totalQuotaGB = 1000;
        return [
            {
                label: "Documents",
                value: `${documentsSize.toFixed(2)} GB`,
                percent: ((documentsSize / totalQuotaGB) * 100).toFixed(2),
                color: "bg-blue-500",
            },
            {
                label: "Images",
                value: `${imagesSize.toFixed(2)} GB`,
                percent: ((imagesSize / totalQuotaGB) * 100).toFixed(2),
                color: "bg-green-500",
            },
            {
                label: "Other",
                value: `${otherSize.toFixed(2)} GB`,
                percent: ((otherSize / totalQuotaGB) * 100).toFixed(2),
                color: "bg-yellow-500",
            },
        ];
    };

    const allocationData = calculateStorageAllocation();
    const totalUsedBytes = fileData.reduce((sum, file) => sum + file.fileSize, 0);
    const totalUsedGBForDisplay = totalUsedBytes / (1024 * 1024 * 1024);
    const totalQuotaGB = 1000;
    const currentStorageQuotaPercent = ((totalUsedGBForDisplay / totalQuotaGB) * 100).toFixed(2);

    return (
        <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="mb-6 flex items-center">
                <div className="mr-4 rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50">
                    <FaDatabase className="text-xl text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Storage Settings</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your storage space and optimization preferences</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Optimization */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h4 className="mb-5 font-semibold text-gray-700 dark:text-gray-300">Storage Optimization</h4>

                    <div className="flex items-start justify-between border-b border-gray-100 py-3 dark:border-gray-700">
                        <div className="flex items-start">
                            <div className="mt-0.5">
                                <FaDatabase className="mr-3 text-purple-500" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">Enable Storage Optimization</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Turn on to enable automatic storage management features.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleMasterOptimization}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isOptimizationEnabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
                            aria-pressed={isOptimizationEnabled}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOptimizationEnabled ? "translate-x-6" : "translate-x-1"}`}
                            />
                        </button>
                    </div>

                    <div className={`mt-4 space-y-6 ${!isOptimizationEnabled ? "pointer-events-none opacity-50" : ""}`}>
                        {[
                            {
                                label: "Auto-delete Notification",
                                desc: "Delete Notification after 30 days",
                                id: "auto-delete-notification",
                                icon: <FaBell className="mr-3 text-blue-500" />,
                            },
                            {
                                label: "Auto-delete temporary files",
                                desc: "Delete temporary files after 30 days",
                                id: "auto-delete-temp",
                                icon: <FaTrash className="mr-3 text-green-500" />,
                            },
                        ].map((setting, idx) => (
                            <div
                                key={idx}
                                className="flex items-start justify-between border-b border-gray-100 py-3 last:border-0 dark:border-gray-700"
                            >
                                <div className="flex items-start">
                                    <div className="mt-0.5">{setting.icon}</div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{setting.label}</p>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{setting.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StorageSettings;

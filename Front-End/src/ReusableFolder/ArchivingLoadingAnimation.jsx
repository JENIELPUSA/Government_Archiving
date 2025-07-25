import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ArchiveLoadingAnimation = () => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [floatingFiles, setFloatingFiles] = useState([]);

    // Generate floating file icons
    useEffect(() => {
        if (isComplete) return;
        
        const files = Array.from({ length: 3 }, (_, i) => ({
            id: i,
            x: Math.random() * 200 - 100,
            delay: i * 0.3
        }));
        setFloatingFiles(files);
    }, [isComplete]);

    // Progress simulation
    useEffect(() => {
        let interval;
        if (!isComplete) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setIsComplete(true), 500);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);
        }
        return () => clearInterval(interval);
    }, [isComplete]);

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <motion.div 
                className="relative flex h-52 w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-2xl shadow-black/30 border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
            >
                {/* Animated folder with floating files */}
                <div className="relative mb-8">
                    <motion.div
                        className="text-yellow-500"
                        animate={{ 
                            y: [0, -8, 0],
                            rotate: [0, -2, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 2,
                            ease: "easeInOut"
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="60"
                            height="60"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-yellow-400/90"
                        >
                            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                        </svg>
                    </motion.div>

                    <AnimatePresence>
                        {!isComplete && floatingFiles.map((file) => (
                            <motion.div
                                key={file.id}
                                className="absolute top-0 left-0 text-blue-500"
                                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                animate={{ 
                                    x: file.x, 
                                    y: [-20, -40, -60],
                                    opacity: [0, 1, 1, 0],
                                    scale: [0.8, 1, 0.8]
                                }}
                                transition={{
                                    delay: file.delay,
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    ease: "easeInOut"
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="text-blue-400"
                                >
                                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                </svg>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Progress bar with glow effect */}
                <div className="relative w-4/5 mb-10">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span
                            className="text-xs font-medium text-gray-500"
                            animate={{ opacity: isComplete ? 0 : 1 }}
                        >
                            {progress}%
                        </motion.span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200 overflow-hidden shadow-inner">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-lg shadow-blue-400/40"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Status area with smooth transitions */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={isComplete ? "complete" : "loading"}
                        className="absolute bottom-5 w-full px-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isComplete ? (
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className="text-green-500 mb-2"
                                    initial={{ scale: 0 }}
                                    animate={{ 
                                        scale: [0, 1.2, 1],
                                        rotate: [0, 10, -5, 0] 
                                    }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 500, 
                                        damping: 15,
                                        duration: 0.5 
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="50"
                                        height="50"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <path d="m9 11 3 3L22 4" />
                                    </svg>
                                </motion.div>
                                <p className="text-center font-medium text-green-600">
                                    Archiving Complete!<br />
                                    <span className="text-gray-600 text-sm">
                                        Check your <strong className="text-gray-700">Drafts</strong> to review
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <p className="text-center text-sm font-medium text-gray-600">
                                Archiving your documents...
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ArchiveLoadingAnimation;
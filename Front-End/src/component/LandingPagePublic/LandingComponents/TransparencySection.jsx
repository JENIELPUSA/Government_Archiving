import React, { useState, useEffect } from "react";
import { mockResolutions } from "../data/mockResolutions";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaFileAlt, FaSearch, FaFacebook } from "react-icons/fa";
import LatestBills from "./LatestBill";
import Hotline from "./Hotline";
import background from "../../../assets/random1.jpg";
import Transparency from "../../../assets/Transparency.svg";
import logoBiliran from "../../../assets/bagongpilipinas.png";

const TransparencySection = ({ onViewFile }) => {
    const [activeId, setActiveId] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const toggleAccordion = (id) => {
        setActiveId(activeId === id ? null : id);
    };

    // Scroll animation trigger
    useEffect(() => {
        const handleScroll = () => {
            const section = document.getElementById('transparency');
            if (section) {
                const sectionTop = section.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (sectionTop < windowHeight * 0.75) {
                    setIsVisible(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on initial load

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                duration: 0.8
            }
        }
    };

    const itemVariants = {
        hidden: { 
            opacity: 0, 
            y: 50,
            scale: 0.9
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const slideInLeft = {
        hidden: { 
            opacity: 0, 
            x: -100 
        },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const slideInRight = {
        hidden: { 
            opacity: 0, 
            x: 100 
        },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const fadeInUp = {
        hidden: { 
            opacity: 0, 
            y: 30 
        },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.section
            id="transparency"
            className="relative min-h-full overflow-hidden py-20"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={containerVariants}
        >
            {/* BACKGROUND WITHOUT GRAYSCALE AND STRETCHED */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${background})`,
                    backgroundSize: "100% 100%", // Stretched to fill entire container
                    backgroundPosition: "center",
                    zIndex: 1,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
            ></motion.div>

            {/* OVERLAY FOR BETTER READABILITY */}
            <motion.div 
                className="z-2 absolute inset-0 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            ></motion.div>

            {/* CONTENT */}
            <div className="relative z-10 mx-auto w-full max-w-screen-xl px-4">
                <motion.div
                    variants={fadeInUp}
                    className="mb-12 text-center"
                >
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                        Transparency & Accountability
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-white/90">
                        Access the latest resolutions, ordinances, and official documents approved by the Sangguniang Panlalawigan.
                    </p>
                </motion.div>

                <motion.div 
                    className="grid grid-cols-1 gap-8 lg:grid-cols-3"
                    variants={containerVariants}
                >
                    {/* Left Column: Documents List (2/3) */}
                    <motion.div 
                        className="lg:col-span-2"
                        variants={slideInLeft}
                    >
                        <LatestBills onFileView={onViewFile} />
                    </motion.div>
                    
                    {/* Right Column */}
                    <motion.div 
                        className="flex w-full flex-col items-center space-y-6 lg:col-span-1"
                        variants={slideInRight}
                    >
                        {/* Transparency Image - SMALLER SIZE */}
                        <motion.div 
                            className="w-full max-w-xs p-4" // Added max-w-xs to limit width
                            variants={itemVariants}
                            whileHover={{ 
                                scale: 1.05,
                                transition: { duration: 0.3 }
                            }}
                        >
                            <img
                                src={Transparency}
                                alt="Transparency"
                                className="w-full object-contain" // Changed from w-full to w-auto
                                style={{ maxHeight: '200px' }} // Added maxHeight
                            />
                        </motion.div>

                        {/* Logo Biliran - SMALLER SIZE */}
                        <motion.div 
                            className="w-full max-w-xs p-4" // Added max-w-xs to limit width
                            variants={itemVariants}
                            whileHover={{ 
                                scale: 1.05,
                                transition: { duration: 0.3 }
                            }}
                        >
                            <img
                                src={logoBiliran}
                                alt="Logo Biliran"
                                className="w-full object-contain" // Changed from w-full to w-auto
                                style={{ maxHeight: '150px' }} // Added maxHeight
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Floating Elements for Visual Interest */}
                <motion.div
                    className="absolute top-1/4 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-60"
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-10 w-6 h-6 bg-green-400 rounded-full opacity-40"
                    animate={{
                        y: [0, 15, 0],
                        opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
            </div>
        </motion.section>
    );
};

export default TransparencySection;
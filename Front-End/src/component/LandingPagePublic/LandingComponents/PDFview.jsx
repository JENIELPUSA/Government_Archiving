import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, MapPin, Clock, Phone, Navigation, Building } from "lucide-react";
import ViewOnly from "../../PdfViewer/ViewOnly";
import logo from "../../../assets/logo-login.png";
import bannerBg from "../../../assets/headbackground.jpg";

export default function PDFview({ fileId, fileData }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLoadComplete = useCallback(() => {
        setIsLoading(false);
    }, []);

    const bannerVariants = {
        loading: { y: 0, opacity: 1 },
        loaded: {
            y: 20,
            opacity: 1,
            transition: { type: "spring", stiffness: 60, damping: 15, mass: 0.5 },
        },
    };

    const logoVariants = {
        loading: { scale: 1, opacity: 1 },
        loaded: { scale: 0.8, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const textVariants = {
        loading: { opacity: 0 },
        loaded: { opacity: 1, transition: { delay: 0.5, duration: 1 } },
    };

    return (
        <div
            className={`max-xs:pl-2 max-xs:pr-2 flex flex-col overflow-x-hidden font-sans xs:pl-2 xs:pr-2 pt-[20px] ${
                isLoading ? "h-screen justify-center" : "min-h-screen justify-start"
            } items-center`}
        >
            {/* Banner */}
            <motion.div
                className={`relative flex w-full max-w-7xl flex-col items-center justify-center rounded-xl p-4 xs:p-2 xs-max:p-2 overflow-hidden${
                    !isLoading ? "border border-gray-200 bg-blue-300 shadow-lg" : ""
                }`}
                initial="loading"
                animate={isLoading ? "loading" : "loaded"}
                variants={bannerVariants}
            >
                {/* Background Image with Opacity - show only after loading */}
                {!isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 rounded-xl bg-cover bg-center"
                        style={{ backgroundImage: `url(${bannerBg})` }}
                    ></motion.div>
                )}

                {/* Foreground Content */}
                <motion.img
                    src={logo}
                    alt="Logo"
                    className="relative z-10 h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-lg"
                    variants={logoVariants}
                    animate={
                        isLoading
                            ? {
                                  scale: [1, 1.1, 1],
                                  opacity: 1,
                                  transition: { duration: 1, repeat: Infinity },
                              }
                            : "loaded"
                    }
                />

                {!isLoading && (
                    <motion.div
                        className="relative z-10 mt-4 text-center px-2 sm:px-0"
                        variants={textVariants}
                    >
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                            Biliran Sangguniang Panlalawigan
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg mt-1 sm:mt-2 text-gray-300 leading-snug">
                            Serving Community with integrity and dedication
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* PDF Viewer */}
            <div className={`mt-4 sm:mt-6 flex w-full flex-grow justify-center overflow-auto ${isLoading ? "hidden" : ""}`}>
                <div className="w-full max-w-7xl px-2 sm:px-4">
                    <div className="flex flex-col overflow-hidden rounded-xl border shadow-2xl xs:h-[600px]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                                <span className="text-xs sm:text-sm font-medium text-gray-900">Document Preview</span>
                            </div>
                        </div>

                        {/* PDF Content Container - FIXED HEIGHT */}
                        <div className="relative flex-grow bg-gray-100" style={{ height: 'calc(100% - 57px)' }}>
                            {/* Main PDF Viewer */}
                            <div className={`h-full ${isMobile ? 'overflow-hidden' : ''}`}>
                                <ViewOnly
                                    fileId={fileId}
                                    fileData={fileData}
                                    onLoadComplete={handleLoadComplete}
                                />
                            </div>
                            
                            {/* Blur Overlay Container */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Mobile View - Glass effect with centered text */}
                                {isMobile ? (
                                    <>
                                        {/* Glass Overlay - Covering 70% of bottom */}
                                        <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-gradient-to-t from-white/90 via-white/70 to-transparent backdrop-blur-sm border-t border-white/30">
                                            {/* Centered Content */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                                <div className="text-center max-w-xs backdrop-blur-sm p-2 ">
                                                    <motion.p
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3, duration: 0.5 }}
                                                        className="text-lg font-bold text-red-700 "
                                                    >
                                                        Visit for Full Access
                                                    </motion.p>
                                                    
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4, duration: 0.5 }}
                                                        className="mb-5"
                                                    >
                                                        <div className="flex items-center justify-center gap-2 mb-3">
                                                            <Building className="h-5 w-5 text-blue-700" />
                                                            <p className="text-sm font-bold text-gray-900">
                                                                Biliran Provincial Capitol
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-center gap-2 mb-3">
                                                            <MapPin className="h-4 w-4 text-red-600" />
                                                            <p className="text-xs font-semibold text-gray-800">
                                                                Barangay Calumpang, Naval
                                                            </p>
                                                        </div>
                                                    </motion.div>

                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.5, duration: 0.5 }}
                                                        className="text-xs text-gray-700"
                                                    >
                                                        <div className="flex items-center justify-center gap-2 mb-3">
                                                            <Clock className="h-4 w-4 text-green-700" />
                                                            <p className="text-xs font-medium text-gray-800">
                                                                8:00 AM - 5:00 PM, Mon-Fri
                                                            </p>
                                                        </div>
                                                        <p className="text-[11px] text-gray-600 mt-4 bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                                                            <span className="font-semibold text-blue-700">↑ Scroll up to preview</span><br/>
                                                            First few pages are visible above.<br/>
                                                            Visit the Capitol for complete document access.
                                                        </p>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Desktop View - Bottom Portion Blurred */
                                    <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm flex items-center justify-center">
                                        <div className="text-center px-6 max-w-2xl">
                                            <motion.p
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3, duration: 0.5 }}
                                                className="text-2xl font-bold text-red-600 mb-6"
                                            >
                                                For Full Document Access
                                            </motion.p>
                                            
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4, duration: 0.5 }}
                                                className="mb-8"
                                            >
                                                <div className="flex items-center justify-center gap-3 mb-3">
                                                    <Building className="h-7 w-7 text-blue-600" />
                                                    <p className="text-xl font-bold text-gray-800">
                                                        Biliran Provincial Capitol (Capitolio)
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-center gap-2 mb-3">
                                                    <MapPin className="h-6 w-6 text-red-600" />
                                                    <p className="text-lg font-semibold text-gray-800">
                                                        Official Location:
                                                    </p>
                                                </div>
                                                <p className="text-gray-700 text-lg">
                                                    <span className="font-bold text-blue-700">Barangay Calumpang, Naval, Biliran</span>
                                                </p>
                                                <p className="text-gray-700 text-lg mt-1">
                                                    Within the <span className="font-medium">Capitol Compound</span>
                                                </p>
                                                <p className="text-gray-600 mt-4 text-sm">
                                                    The Biliran Provincial Capitol, commonly referred to as "Capitolio," 
                                                    is the official seat of the provincial government, located in the 
                                                    capital town of Naval. It serves as the administrative center for 
                                                    the entire province of Biliran.
                                                </p>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5, duration: 0.5 }}
                                                className="mb-6"
                                            >
                                                <div className="flex items-center justify-center gap-3 mb-3">
                                                    <Clock className="h-6 w-6 text-green-600" />
                                                    <p className="text-lg font-semibold text-gray-800">
                                                        Office Hours:
                                                    </p>
                                                </div>
                                                <p className="text-lg text-gray-700">
                                                    Monday to Friday, 8:00 AM - 5:00 PM
                                                </p>
                                                <p className="text-gray-600 text-sm mt-2">
                                                    (Closed on weekends and public holidays)
                                                </p>
                                            </motion.div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer under PDF */}
                    <div className="mt-4 sm:mt-6 text-center">
                        <p className="text-xs sm:text-sm text-gray-400 px-2">
                            {isMobile 
                                ? "Preview available • Visit Biliran Provincial Capitol for complete access" 
                                : "Document viewer • Use keyboard shortcuts or mouse controls for navigation"
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
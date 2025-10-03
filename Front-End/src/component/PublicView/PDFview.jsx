import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import ViewOnly from "../PdfViewer/ViewOnly";
import logo from "../../../src/assets/logo-login.png";
import bannerBg from "../../../src/assets/headbackground.jpg";

export default function PDFview({ fileId, fileData }) {
    const [isLoading, setIsLoading] = useState(true);

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
            className={`max-xs:pl-2 max-xs:pr-2 flex flex-col overflow-x-hidden font-sans xs:pl-2 xs:pr-2 ${
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
                    className="relative z-10 h-20 w-20 rounded-full shadow-lg"
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
                        className="relative z-10 mt-4 text-center xs:mt-4"
                        variants={textVariants}
                    >
                        <h1 className="max-xs:text-[15px] max-xs:leading-4 text-2xl font-extrabold text-white md:text-3xl xs:text-[15px] xs:leading-4">
                            Biliran Sangguniang Panlalawigan
                        </h1>
                        <p className="max-xs:text-[12px] max-xs:leading-4 mt-1 text-base text-gray-300 md:text-lg xs:text-[12px] xs:leading-4">
                            Serving Community with integrity and dedication
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* PDF Viewer */}
            <div className={`mt-6 flex w-full flex-grow justify-center overflow-auto ${isLoading ? "hidden" : ""}`}>
                <div className="w-full max-w-7xl">
                    <div className="flex flex-col overflow-hidden rounded-xl border shadow-2xl xs:h-[600px]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">Document Preview</span>
                            </div>
                        </div>

                        {/* PDF Content */}
                        <div className="flex-grow overflow-auto bg-gray-100 p-4 xs:overflow-visible xs-max:overflow-visible">
                            <ViewOnly
                                fileId={fileId}
                                fileData={fileData}
                                onLoadComplete={handleLoadComplete}
                            />
                        </div>
                    </div>

                    {/* Footer under PDF */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400 xs-max:text-[12px] xs:text-[12px]">Document viewer • Use keyboard shortcuts or mouse controls for navigation</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import SBMembers from "../PublicView/SBMember";
import Home from "./Home/Home";
import Documents from "./Document";
import Navbar from "./Navbar";
import MyLogo from "../../assets/logo-login.png";
import PDFview from "./PDFview";
import NewsContent from "./NewandInformation/NewsContent";
import NewandInformation from "./NewandInformation/NewsandInformation";
import NewsandLatest from "./NewandInformation/NewsandLatest";
import { FaFacebook, FaEnvelope } from "react-icons/fa";

const App = () => {
    const [currentPage, setCurrentPage] = useState("home");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedNews, setSelectedNews] = useState(null);

    const aboutUsRef = useRef(null);

    const handleViewFile = (fileId, fileData, fileName) => {
        setSelectedFile({ fileId, fileData, fileName });
        setCurrentPage("pdf-view");
    };

    const handleViewNews = (news) => {
        setSelectedNews(news);
        setCurrentPage("newsLatest");
    };

    const scrollToAboutUs = () => {
        setCurrentPage("home");
        setTimeout(() => {
            aboutUsRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // Animation variants
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        in: {
            opacity: 1,
            y: 0
        },
        out: {
            opacity: 0,
            y: -20
        }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5
    };

    const renderMainContent = () => {
        switch (currentPage) {
            case "home":
                return (
                    <motion.div
                        key="home"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <Home aboutUsRef={aboutUsRef} />
                    </motion.div>
                );
            case "sb-members":
                return (
                    <motion.div
                        key="sb-members"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <SBMembers />
                    </motion.div>
                );
            case "news-and-information":
                return (
                    <motion.div
                        key="news-and-information"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <NewandInformation
                            onViewLatestNews={handleViewNews}
                            selectedNews={selectedNews}
                        />
                    </motion.div>
                );
            case "newsLatest":
                return selectedNews ? (
                    <motion.div
                        key="newsLatest"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <NewsContent
                            news={selectedNews}
                            onBack={() => setCurrentPage("news-and-information")}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="newsLatest-default"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <NewsandLatest onViewLatestNews={handleViewNews} />
                    </motion.div>
                );

            case "documents":
                return (
                    <motion.div
                        key="documents"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <Documents
                            searchKeyword={searchKeyword}
                            onViewFile={handleViewFile}
                        />
                    </motion.div>
                );
            case "pdf-view":
                return selectedFile ? (
                    <motion.div
                        key="pdf-view"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <PDFview
                            fileId={selectedFile.fileId}
                            file={selectedFile.fileData}
                            fileName={selectedFile.fileName}
                            onClose={() => setCurrentPage("documents")}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="pdf-view-default"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <Documents
                            searchKeyword={searchKeyword}
                            onViewFile={handleViewFile}
                        />
                    </motion.div>
                );
            default:
                return (
                    <motion.div
                        key="home-default"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <Home aboutUsRef={aboutUsRef} />
                    </motion.div>
                );
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-screen w-full flex-col bg-blue-100"
        >
            {/* Flag Banner */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex w-full"
            >
                <div className="h-4 w-1/2 bg-blue-800"></div>
                <div className="h-4 w-1/2 bg-red-700"></div>
            </motion.div>
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="h-4 w-full bg-yellow-400"
            ></motion.div>

            {/* Header */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white shadow-lg"
            >
                <div className="container mx-auto flex items-center px-6 py-4 2xs:px-2 xs:px-2 xs:py-2 xm:px-6">
                    <div className="flex items-center space-x-4 xs:space-x-4">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                            className="flex items-center justify-center space-x-2"
                        >
                            {[...Array(3)].map((_, i) => (
                                <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-yellow-400 xs:h-3 xs:w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </motion.div>
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                            className="relative lg:h-16 lg:w-16 xs:h-12 xs:w-12 xs-max:h-14 xs-max:w-14 xm:h-14 xm:w-14"
                        >
                            <div className="absolute inset-0 flex items-center justify-center rounded-full">
                                <img
                                    src={MyLogo}
                                    alt="Logo"
                                    className="h-15 w-15"
                                />
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                            className="ml-4"
                        >
                            <h1 className="text-2xl font-bold text-blue-800 2xs:text-lg 2xs:leading-5 xs:text-[15px] xs:leading-4 xs-max:text-[15px] xs-max:text-sm xs-max:leading-4 xm:text-2xl xm:leading-7">
                                Sangguniang Panlalawigan Archiving System
                            </h1>

                            <p className="font-semibold text-red-700 2xs:text-sm 2xs:leading-4 xs:text-[10px] xs:text-base xs:leading-4 xs-max:text-[10px] xs-max:text-lg xs-max:leading-5 xm:text-base xm:leading-5">
                                Biliran Province
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Navbar */}
            <Navbar
                currentPage={currentPage}
                setCurrentPage={(page) => {
                    if (page === "about-us") scrollToAboutUs();
                    else setCurrentPage(page);
                }}
                searchKeyword={searchKeyword}
                setSearchKeyword={setSearchKeyword}
            />

            {/* Main Content */}
            <motion.div
                key={currentPage}
                initial="initial"
                animate="in"
                variants={pageVariants}
                transition={pageTransition}
                className="flex-1"
            >
                {renderMainContent()}
            </motion.div>

            {/* Footer */}
            <motion.footer 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mt-4 bg-blue-800 py-8 text-white"
            >
                <div className="container mx-auto px-6 2xs:px-2 xs:px-4 xm:px-6">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        {/* Logo & Info */}
                        <motion.div 
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="mb-2 flex items-center justify-center space-x-4">
                                <img
                                    src={MyLogo}
                                    alt="Logo"
                                    className="h-20 w-20 xs:h-10 xs:w-10"
                                />
                            </div>
                            <h3 className="mb-2 text-xl font-bold 2xs:text-lg xs:text-[15px] xs:leading-4 xm:text-xl">
                                Sangguniang Panlalawigan Archiving System
                            </h3>
                            <p className="text-sm 2xs:text-xs xs:text-[12px] xs:leading-4 xm:text-sm">Biliran Province</p>
                            <p className="mt-2 text-sm 2xs:text-xs xs:text-[12px] xs:leading-4 xm:text-sm">Tel: (632) 8931-5001</p>

                            {/* Social Icons */}
                            <motion.div 
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                                className="mt-4 flex space-x-6"
                            >
                                <a
                                    href="https://web.facebook.com/provincialgovernmentofbiliran"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white transition-colors hover:text-yellow-300"
                                >
                                    <FaFacebook className="text-[20px] text-white xs:text-[15px] xs-max:text-[18px] xm:text-[24px]" />
                                </a>
                                <a
                                    href="#"
                                    className="text-white transition-colors hover:text-yellow-300"
                                >
                                    <FaEnvelope className="text-[20px] text-white xs:text-[15px] xs-max:text-[18px] xm:text-[24px]" />
                                </a>
                            </motion.div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div 
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="2xs:hidden xs:hidden xs-max:block xm:block"
                        >
                            <h4 className="mb-4 font-bold 2xs:text-sm xs:text-base xm:text-base">Quick Links</h4>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => setCurrentPage("home")}
                                        className="transition-colors hover:text-yellow-300"
                                    >
                                        Home
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollToAboutUs()}
                                        className="transition-colors hover:text-yellow-300"
                                    >
                                        About Us
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setCurrentPage("sb-members")}
                                        className="transition-colors hover:text-yellow-300"
                                    >
                                        SP Members
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setCurrentPage("news-and-information")}
                                        className="transition-colors hover:text-yellow-300"
                                    >
                                        News and Information
                                    </button>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </motion.footer>
        </motion.div>
    );
};

export default App;
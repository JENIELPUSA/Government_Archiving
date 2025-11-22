import React, { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./LandingComponents/Navbar";
import Hero from "./LandingComponents/Hero";
import MissionVisionSection from "./LandingComponents/MissionVisionSection";
import NewsSection from "./LandingComponents/NewsSection";
import TransparencySection from "./LandingComponents/TransparencySection";
import GallerySection from "./LandingComponents/GallerySection";
import MapSection from "./LandingComponents/MapSection";
import AboutContactSection from "./LandingComponents/AboutContactSection";
import Footer from "./LandingComponents/Footer";
import HotlineCarousel from "./LandingComponents/HotlineCarousel";

// Import your components for Officials and Legislative
import SBMembers from "./LandingComponents/SBMember";
import BoardMemberLayout from "./LandingComponents/BoardMemberLayout";
import MayorLayout from "./LandingComponents/MayorLayout";
import Documents from "./LandingComponents/Document";
import PDFview from "./LandingComponents/PDFview";
import BiliranLegislativeHistory from "./LandingComponents/BiliranLegislativeHistory";

import LogoCarousel from "./LandingComponents/LogoCarousel";

function LandingPageLayout() {
    const [activeSection, setActiveSection] = useState("hero");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedOfficialRole, setSelectedOfficialRole] = useState("");
    const [selectedDocumentType, setSelectedDocumentType] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previousSection, setPreviousSection] = useState("hero");

    // Create a ref for the scroll container
    const scrollContainerRef = useRef(null);

    // Function to handle file viewing
    const handleViewFile = (fileId, fileData, fileName) => {
        setPreviousSection(activeSection);
        setSelectedFile({ fileId, fileData, fileName });
        setActiveSection("pdf-view");
    };

    // Function to handle closing PDF view
    const handleClosePDF = () => {
        setSelectedFile(null);
        setActiveSection(previousSection);
    };

    // Function to handle setting officials or legislative
    const handleSetOfficial = (role) => {
        const legislativeTypes = ["resolution", "ordinance", "executive-order"];

        if (legislativeTypes.includes(role)) {
            setSelectedDocumentType(role);
            setSelectedOfficialRole("");
            setActiveSection("legislative");
        } else {
            setSelectedOfficialRole(role);
            setSelectedDocumentType("");
            setActiveSection("officials");
        }
    };

    // Reusable LogoCarousel component with sticky behavior
    const StickyLogoCarousel = () => (
        <div className="sticky top-[70px] z-30 w-full border-b border-t border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-300">
            <LogoCarousel />
        </div>
    );

    const renderContent = () => {
        if (activeSection === "pdf-view" && selectedFile) {
            return (
                <PDFview
                    fileId={selectedFile.fileId}
                    file={selectedFile.fileData}
                    fileName={selectedFile.fileName}
                    onClose={handleClosePDF}
                />
            );
        }

        if (activeSection === "hero") {
            return (
                <div className="relative flex w-full flex-col">
                    <Hero scrollContainerRef={scrollContainerRef} />

                    {/* Single instance of LogoCarousel */}
                    <StickyLogoCarousel />
                    <MissionVisionSection />
     <NewsSection />


                    <StickyLogoCarousel />
                    <TransparencySection onViewFile={handleViewFile} />
                    <GallerySection />
                    <BiliranLegislativeHistory />
                    <MapSection />
                    <AboutContactSection />
                    <HotlineCarousel />
                </div>
            );
        }

        if (activeSection === "officials") {
            if (selectedOfficialRole === "Board Member") {
                return (
                    <BoardMemberLayout
                        Position={selectedOfficialRole}
                        onBack={() => setActiveSection("hero")}
                        onViewFile={handleViewFile}
                    />
                );
            } else if (selectedOfficialRole === "Mayor" || selectedOfficialRole === "Vice-Mayor") {
                return (
                    <MayorLayout
                        Position={selectedOfficialRole}
                        onBack={() => setActiveSection("hero")}
                        onViewFile={handleViewFile}
                    />
                );
            } else {
                return (
                    <SBMembers
                        Position={selectedOfficialRole}
                        onBack={() => setActiveSection("hero")}
                        onViewFile={handleViewFile}
                    />
                );
            }
        }

        if (activeSection === "legislative") {
            return (
                <Documents
                    searchKeyword={searchKeyword}
                    onViewFile={handleViewFile}
                    documentType={selectedDocumentType}
                    onBack={() => setActiveSection("hero")}
                />
            );
        }

        switch (activeSection) {
            case "mission":
                return <MissionVisionSection />;
            case "news":
                return <NewsSection />;
            case "transparency":
                return <TransparencySection onViewFile={handleViewFile} />;
            case "gallery":
                return <GallerySection />;
            case "map":
                return <MapSection />;
            case "about":
                return <AboutContactSection />;
            default:
                return (
                    <div className="relative flex w-full flex-col">
                        <Hero scrollContainerRef={scrollContainerRef} />
                        <StickyLogoCarousel />
                        <MissionVisionSection />
                        <NewsSection onViewFile={handleViewFile} />
                        <TransparencySection onViewFile={handleViewFile} />
                        <GallerySection />
                        <MapSection />
                        <AboutContactSection />
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-blue-50 font-sans text-slate-800 antialiased">
            <Navbar
                currentPage={activeSection}
                setCurrentPage={setActiveSection}
                searchKeyword={searchKeyword}
                setSearchKeyword={setSearchKeyword}
                setOfficial={handleSetOfficial}
            />

            <main
                ref={scrollContainerRef}
                className="scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-100 relative w-full flex-1 overflow-y-auto overflow-x-hidden"
                style={{ height: "calc(100vh - 70px)" }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection === "pdf-view" ? "main-content" : activeSection}
                        initial={{ opacity: 0, y: 100, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -100, filter: "blur(10px)" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={`w-full max-w-full ${activeSection === "pdf-view" ? "pointer-events-none" : ""}`}
                    >
                        <div className="w-full max-w-full pt-[70px]">
                            {activeSection !== "pdf-view" && renderContent()}
                            {activeSection !== "pdf-view" && <Footer />}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Render PDF view separately as an overlay */}
                {activeSection === "pdf-view" && selectedFile && (
                    <PDFview
                        fileId={selectedFile.fileId}
                        file={selectedFile.fileData}
                        fileName={selectedFile.fileName}
                        onClose={handleClosePDF}
                    />
                )}
            </main>
        </div>
    );
}

export default LandingPageLayout;

import React, { useState, useRef, useCallback, useEffect } from "react";
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
import NewsContent from "./LandingComponents/NewsContent";
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
    const [selectedNews, setSelectedNews] = useState(null);
    const [currentVisibleSection, setCurrentVisibleSection] = useState("hero");

    // Create a ref for the scroll container
    const scrollContainerRef = useRef(null);

    // Function to scroll to top of main container
    const scrollToTop = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    // Function to handle file viewing
    const handleViewFile = (fileId, fileData, fileName) => {
        setPreviousSection(activeSection);
        setSelectedFile({ fileId, fileData, fileName });
        setActiveSection("pdf-view");
        scrollToTop();
    };

    // Function to handle closing PDF view
    const handleClosePDF = () => {
        setSelectedFile(null);
        setActiveSection(previousSection);
        scrollToTop();
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
        scrollToTop();
    };

    // Function to handle viewing news content
    const handleViewNews = (news) => {
        setPreviousSection(activeSection);
        setSelectedNews(news);
        setActiveSection("news-content");
        scrollToTop();
    };

    // Function to handle closing news content view
    const handleCloseNews = () => {
        setSelectedNews(null);
        setActiveSection(previousSection);
        scrollToTop();
    };
    // Function to go back to home/hero section
    const handleBackToHome = useCallback(() => {
        setActiveSection("hero");
        setSelectedOfficialRole("");
        setSelectedDocumentType("");
        setSelectedFile(null);
        setSelectedNews(null);
        scrollToTop();
    }, [scrollToTop]);

    // Track which section is currently visible (for Footer highlighting)
    useEffect(() => {
        if (activeSection !== "hero") return;

        const handleScroll = () => {
            if (!scrollContainerRef.current) return;

            const container = scrollContainerRef.current;
            const scrollPosition = container.scrollTop + 100; // Offset for navbar

            // Define section positions
            const sections = [
                { id: 'hero', element: document.getElementById('hero-section') },
                { id: 'mission', element: document.getElementById('mission-section') },
                { id: 'news', element: document.getElementById('news-section') },
                { id: 'transparency', element: document.getElementById('transparency-section') },
                { id: 'gallery', element: document.getElementById('gallery-section') },
                { id: 'legislative-history', element: document.getElementById('legislative-history-section') },
                { id: 'map', element: document.getElementById('map-section') },
                { id: 'contact', element: document.getElementById('contact-section') }
            ].filter(section => section.element);

            // Find current visible section
            let currentSection = 'hero';
            for (const section of sections) {
                const elementTop = section.element.offsetTop;
                const elementBottom = elementTop + section.element.offsetHeight;
                
                if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
                    currentSection = section.id;
                    break;
                }
            }

            setCurrentVisibleSection(currentSection);
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            // Initial check
            handleScroll();
            
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [activeSection]);

    // Scroll to top whenever activeSection changes (key fix!)
    useEffect(() => {
        scrollToTop();
    }, [activeSection, scrollToTop]);

    // Animation variants
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    };

    const pageTransition = {
        duration: 0.3,
        ease: "easeInOut"
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
                <div className="min-h-screen bg-white">
                    <PDFview
                        fileId={selectedFile.fileId}
                        file={selectedFile.fileData}
                        fileName={selectedFile.fileName}
                        onClose={handleClosePDF}
                    />
                </div>
            );
        }

        if (activeSection === "news-content" && selectedNews) {
            return (
                <div className="min-h-screen bg-white">
                    <NewsContent
                        news={selectedNews}
                        onBack={handleCloseNews}
                    />
                </div>
            );
        }

        if (activeSection === "hero") {
            return (
                <div className="relative flex w-full flex-col">
                    <div id="hero-section" className="h-screen">
                        <Hero scrollContainerRef={scrollContainerRef} />
                    </div>

                    {/* Single instance of LogoCarousel */}
                    <StickyLogoCarousel />
                    <div id="mission-section">
                        <MissionVisionSection />
                    </div>
                    {/* Pass handleViewNews prop to NewsSection */}
                    <div id="news-section">
                        <NewsSection onNewsView={handleViewNews} />
                    </div>

                    <StickyLogoCarousel />
                    <div id="transparency-section">
                        <TransparencySection onViewFile={handleViewFile} />
                    </div>
                    <div id="gallery-section">
                        <GallerySection />
                    </div>
                    <div id="legislative-history-section">
                        <BiliranLegislativeHistory />
                    </div>
                    <div id="map-section">
                        <MapSection />
                    </div>
                    <div id="contact-section">
                        <AboutContactSection />
                    </div>
                    <HotlineCarousel />
                </div>
            );
        }

        if (activeSection === "officials") {
            if (selectedOfficialRole === "Board_Member") {
                return (
                    <div className="min-h-screen bg-white">
                        <BoardMemberLayout
                            Position={selectedOfficialRole}
                            onBack={handleBackToHome}
                            onViewFile={handleViewFile}
                        />
                    </div>
                );
            } else if (selectedOfficialRole === "Governor" || selectedOfficialRole === "Vice_Governor") {
                return (
                    <div className="min-h-screen bg-white">
                        <MayorLayout
                            Position={selectedOfficialRole}
                            onBack={handleBackToHome}
                            onViewFile={handleViewFile}
                        />
                    </div>
                );
            } else {
                return (
                    <div className="min-h-screen bg-white">
                        <SBMembers
                            Position={selectedOfficialRole}
                            onBack={handleBackToHome}
                            onViewFile={handleViewFile}
                        />
                    </div>
                );
            }
        }

        if (activeSection === "legislative") {
            return (
                <div className="min-h-screen bg-white">
                    <Documents
                        searchKeyword={searchKeyword}
                        onViewFile={handleViewFile}
                        documentType={selectedDocumentType}
                        onBack={handleBackToHome}
                    />
                </div>
            );
        }

        switch (activeSection) {
            case "mission":
                return <MissionVisionSection />;
            case "news":
                // For direct navigation to news section
                return <NewsSection onNewsView={handleViewNews} />;
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
                        <div className="h-screen">
                            <Hero scrollContainerRef={scrollContainerRef} />
                        </div>
                        <StickyLogoCarousel />
                        <MissionVisionSection />
                        <NewsSection onNewsView={handleViewNews} />
                        <TransparencySection onViewFile={handleViewFile} />
                        <GallerySection />
                        <MapSection />
                        <AboutContactSection />
                        <HotlineCarousel />
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-slate-800 antialiased">
            <Navbar
                currentPage={activeSection}
                setCurrentPage={setActiveSection}
                searchKeyword={searchKeyword}
                setSearchKeyword={setSearchKeyword}
                setOfficial={handleSetOfficial}
            />

            <main
                ref={scrollContainerRef}
                className="scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-100 relative w-full flex-1 overflow-y-auto overflow-x-hidden bg-white"
                style={{ 
                    height: "calc(100vh - 70px)",
                    // Ito ang important fix:
                    WebkitOverflowScrolling: "touch"
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full max-w-full bg-white"
                    >
                        <div className="w-full max-w-full bg-white pt-[70px]">
                            {renderContent()}
                            {/* Avoid double footer in pdf-view and news-content */}
                            {!["pdf-view", "news-content"].includes(activeSection) && (
                                <Footer 
                                    currentPage={activeSection}
                                    setCurrentPage={setActiveSection}
                                    searchKeyword={searchKeyword}
                                    setSearchKeyword={setSearchKeyword}
                                    setOfficial={handleSetOfficial}
                                />
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

export default LandingPageLayout;
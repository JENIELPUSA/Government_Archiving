import React, { useState, useRef, useCallback, useEffect, useContext } from "react";
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
import { LandingPageContext } from "../../contexts/LandingPageContext/LandingPageContext";
import CalendarEvent from "./LandingComponents/CalendarEvent";
import { SuggestionContext } from "../../contexts/SuggestionContext/SuggestionContext";

// Pulse Skeleton Loading Component
const PulseSkeletonLoader = () => (
    <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section Skeleton */}
            <div className="mb-12 h-[500px] w-full animate-pulse rounded-2xl bg-gray-200"></div>

            {/* Mission Vision Section Skeleton */}
            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="h-8 w-1/3 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="h-32 w-full animate-pulse rounded-lg bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-8 w-1/3 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="h-32 w-full animate-pulse rounded-lg bg-gray-200"></div>
                </div>
            </div>

            {/* News Section Skeleton */}
            <div className="mb-12">
                <div className="mb-6 h-10 w-1/4 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-48 w-full animate-pulse rounded-xl bg-gray-200"></div>
                            <div className="h-6 w-3/4 animate-pulse rounded-lg bg-gray-200"></div>
                            <div className="h-4 w-full animate-pulse rounded-lg bg-gray-200"></div>
                            <div className="h-4 w-2/3 animate-pulse rounded-lg bg-gray-200"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transparency Section Skeleton */}
            <div className="mb-12">
                <div className="mb-6 h-10 w-1/4 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 w-full animate-pulse rounded-lg bg-gray-200"></div>
                    ))}
                </div>
            </div>

            {/* Gallery Section Skeleton */}
            <div className="mb-12">
                <div className="mb-6 h-10 w-1/4 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 w-full animate-pulse rounded-xl bg-gray-200"></div>
                    ))}
                </div>
            </div>

            {/* Map Section Skeleton */}
            <div className="mb-12">
                <div className="mb-6 h-10 w-1/4 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-96 w-full animate-pulse rounded-xl bg-gray-200"></div>
            </div>

            {/* Contact Section Skeleton */}
            <div className="mb-12">
                <div className="mb-6 h-10 w-1/4 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200"></div>
                    <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200"></div>
                </div>
            </div>
        </div>
    </div>
);

function LandingPageLayout() {
    const [activeSection, setActiveSection] = useState("hero");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedOfficialRole, setSelectedOfficialRole] = useState("");
    const [selectedDocumentType, setSelectedDocumentType] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previousSection, setPreviousSection] = useState("hero");
    const [selectedNews, setSelectedNews] = useState(null);
    const [currentVisibleSection, setCurrentVisibleSection] = useState("hero");
    const [refreshKey, setRefreshKey] = useState(0); // For forcing component remount/reintegration
    const { landingData, loading, refetchLandingData } = useContext(LandingPageContext);
    const { createSuggestion } = useContext(SuggestionContext);

    // State para sa Images (Existing + New)
    const [previews, setPreviews] = useState([]);
    // Initial State para sa Form
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        Mission: '',
        Vission: '',
    });

    const scrollContainerRef = useRef(null);

    const heroSectionIds = ["hero", "mission", "news", "transparency", "gallery", "map", "contact", "about", "legislative-history"];

    // Sync context data to local state
    useEffect(() => {
        if (landingData) {
            setFormData({
                title: landingData.title || '',
                subtitle: landingData.subtitle || '',
                Mission: landingData.Mission || '',
                Vission: landingData.Vission || '',
            });

            if (landingData.avatar && Array.isArray(landingData.avatar)) {
                const existingImages = landingData.avatar.map((img, index) => ({
                    id: img.id || `existing-${index}`,
                    url: img.url,
                    name: `Current Image ${index + 1}`,
                    file: null
                }));
                setPreviews(existingImages);
            }
        }
    }, [landingData]);

    // IMPROVED: Force scroll to top with multiple strategies
    const scrollToTop = useCallback(() => {
        if (scrollContainerRef.current) {
            // Immediate scroll
            scrollContainerRef.current.scrollTop = 0;
            // Smooth scroll as backup
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            // Double-check scroll after a tiny delay (for any async rendering)
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = 0;
                }
            }, 50);
            // Third check after render cycle
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = 0;
                }
            }, 150);
        }
        // Also try to scroll window as fallback
        window.scrollTo(0, 0);
    }, []);

    // Function to force reintegration of current section
    const forceReintegration = useCallback((section, role = null, docType = null) => {
        // Increment refresh key to force component remount
        setRefreshKey(prev => prev + 1);

        // For officials - refresh data
        if (section === "officials" && role) {
            setSelectedOfficialRole("");
            setTimeout(() => {
                setSelectedOfficialRole(role);
            }, 50);
        }

        // For legislative - refresh documents
        if (section === "legislative" && docType) {
            setSelectedDocumentType("");
            setTimeout(() => {
                setSelectedDocumentType(docType);
            }, 50);
        }

        // For hero section with specific subsections
        if (section !== "hero" && !role && !docType && !heroSectionIds.includes(section)) {
            setActiveSection("");
            setTimeout(() => {
                setActiveSection(section);
            }, 50);
        }

        // For hero main page or subsections - refresh landing data
        if (heroSectionIds.includes(section) || section === "hero") {
            if (typeof refetchLandingData === 'function') {
                refetchLandingData();
            }
        }
    }, [refetchLandingData, heroSectionIds]);

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

    // Function to handle viewing news content
    const handleViewNews = (news) => {
        setPreviousSection(activeSection);
        setSelectedNews(news);
        setActiveSection("news-content");
    };

    // Function to handle closing news content view
    const handleCloseNews = () => {
        setSelectedNews(null);
        setActiveSection(previousSection);
    };

    // Function to go back to home/hero section
    const handleBackToHome = useCallback(() => {
        setActiveSection("hero");
        setSelectedOfficialRole("");
        setSelectedDocumentType("");
        setSelectedFile(null);
        setSelectedNews(null);
    }, []);

    // Track which section is currently visible (for Footer highlighting)
    useEffect(() => {
        if (activeSection !== "hero") return;

        const handleScroll = () => {
            if (!scrollContainerRef.current) return;

            const container = scrollContainerRef.current;
            const scrollPosition = container.scrollTop + 100;

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
            handleScroll();
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [activeSection]);

    // CRITICAL FIX: Scroll to top whenever activeSection changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            scrollToTop();
        }, 10);
        return () => clearTimeout(timeoutId);
    }, [activeSection, scrollToTop, refreshKey]);

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
        // Show skeleton loader while loading
        if (loading) {
            return <PulseSkeletonLoader key={`skeleton-${refreshKey}`} />;
        }

        if (activeSection === "pdf-view" && selectedFile) {
            return (
                <div className="min-h-screen bg-white" key={`pdf-${selectedFile.fileId}-${refreshKey}`}>
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
                <div className="min-h-screen bg-white" key={`news-${selectedNews.id}-${refreshKey}`}>
                    <NewsContent
                        news={selectedNews}
                        onBack={handleCloseNews}
                    />
                </div>
            );
        }

        if (activeSection === "hero") {
            return (
                <div className="relative flex w-full flex-col" key={`hero-${refreshKey}`}>
                    <div id="hero-section" className="h-screen">
                        <Hero scrollContainerRef={scrollContainerRef} formData={formData} />
                    </div>
                    <div id="mission-section">
                        <MissionVisionSection formData={formData} previews={previews} />
                    </div>
                    <div id="news-section">
                        <NewsSection onNewsView={handleViewNews} key={`news-section-${refreshKey}`} />
                    </div>
                    <CalendarEvent />

                    <div id="transparency-section">
                        <TransparencySection onViewFile={handleViewFile} key={`transparency-${refreshKey}`} />
                    </div>
                    <div id="legislative-history-section">
                        <BiliranLegislativeHistory key={`history-${refreshKey}`} />
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
                    <div className="min-h-screen bg-white" key={`board-${selectedOfficialRole}-${refreshKey}`}>
                        <BoardMemberLayout
                            Position={selectedOfficialRole}
                            onBack={handleBackToHome}
                            onViewFile={handleViewFile}
                        />
                    </div>
                );
            } else if (selectedOfficialRole === "Governor" || selectedOfficialRole === "Vice_Governor") {
                return (
                    <div className="min-h-screen bg-white" key={`mayor-${selectedOfficialRole}-${refreshKey}`}>
                        <MayorLayout
                            Position={selectedOfficialRole}
                            onBack={handleBackToHome}
                            onViewFile={handleViewFile}
                        />
                    </div>
                );
            } else {
                return (
                    <div className="min-h-screen bg-white" key={`sb-${selectedOfficialRole}-${refreshKey}`}>
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
                <div className="min-h-screen" key={`legislative-${selectedDocumentType}-${refreshKey}`}>
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
                return <MissionVisionSection key={`mission-${refreshKey}`} />;
            case "news":
                return <NewsSection onNewsView={handleViewNews} key={`news-section-${refreshKey}`} />;
            case "transparency":
                return <TransparencySection onViewFile={handleViewFile} key={`transparency-${refreshKey}`} />;
            case "gallery":
                return <GallerySection key={`gallery-${refreshKey}`} />;
            case "map":
                return <MapSection key={`map-${refreshKey}`} />;
            case "about":
                return <AboutContactSection key={`about-${refreshKey}`} />;
            default:
                return (
                    <div className="relative flex w-full flex-col" key={`default-${refreshKey}`}>
                        <div className="h-screen">
                            <Hero scrollContainerRef={scrollContainerRef} />
                        </div>
                        <StickyLogoCarousel />
                        <MissionVisionSection />
                        <NewsSection onNewsView={handleViewNews} />
                        <TransparencySection onViewFile={handleViewFile} />
                        <MapSection />
                        <AboutContactSection />
                        <HotlineCarousel />
                    </div>
                );
        }
    };

    // Function to handle navigation from Navbar/Footer
    const handleNavigation = useCallback((section, role = null) => {
        setActiveSection(section);
        if (role) {
            handleSetOfficial(role);
        }

        // Immediate scroll to top
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [handleSetOfficial]);

    // Handle navigation to hero subsections
    const handleNavigateToSection = useCallback((sectionId) => {
        if (activeSection === sectionId) {
            forceReintegration(sectionId);
        } else {
            setActiveSection(sectionId);
        }
        scrollToTop();
    }, [activeSection, forceReintegration, scrollToTop]);

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-slate-800 antialiased">
            <Navbar
                currentPage={activeSection}
                setCurrentPage={handleNavigation}
                searchKeyword={searchKeyword}
                setSearchKeyword={setSearchKeyword}
                setOfficial={handleSetOfficial}
                onNavigateToSection={handleNavigateToSection}
                onReintegrate={forceReintegration}
            />

            <main
                ref={scrollContainerRef}
                className="scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-100 relative w-full flex-1 overflow-y-auto overflow-x-hidden bg-white"
                style={{
                    height: "calc(100vh - 70px)",
                    WebkitOverflowScrolling: "touch"
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${activeSection}-${refreshKey}`}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="w-full max-w-full bg-white"
                    >
                        <div className="w-full max-w-full bg-white pt-[70px]">
                            {renderContent()}
                            {!loading && !["pdf-view", "news-content"].includes(activeSection) && (
                                <Footer
                                    currentPage={activeSection}
                                    setCurrentPage={handleNavigation}
                                    searchKeyword={searchKeyword}
                                    setSearchKeyword={setSearchKeyword}
                                    setOfficial={handleSetOfficial}
                                    createSuggestion={createSuggestion}
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
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
    const { landingData, loading } = useContext(LandingPageContext)
    // State para sa Images (Existing + New)
    const [previews, setPreviews] = useState([]);
    // Initial State para sa Form
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        Mission: '',
        Vission: '', // Note: Double 's' base sa iyong data object
    });

    const scrollContainerRef = useRef(null);

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

    const handleViewFile = (fileId, fileData, fileName) => {
        setPreviousSection(activeSection);
        setSelectedFile({ fileId, fileData, fileName });
        setActiveSection("pdf-view");
        // scrollToTop will be called by the useEffect below
    };

    // Function to handle closing PDF view
    const handleClosePDF = () => {
        setSelectedFile(null);
        setActiveSection(previousSection);
        // scrollToTop will be called by the useEffect below
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
        // scrollToTop will be called by the useEffect below
    };

    // Function to handle viewing news content
    const handleViewNews = (news) => {
        setPreviousSection(activeSection);
        setSelectedNews(news);
        setActiveSection("news-content");
        // scrollToTop will be called by the useEffect below
    };

    // Function to handle closing news content view
    const handleCloseNews = () => {
        setSelectedNews(null);
        setActiveSection(previousSection);
        // scrollToTop will be called by the useEffect below
    };
    
    // Function to go back to home/hero section
    const handleBackToHome = useCallback(() => {
        setActiveSection("hero");
        setSelectedOfficialRole("");
        setSelectedDocumentType("");
        setSelectedFile(null);
        setSelectedNews(null);
        // scrollToTop will be called by the useEffect below
    }, []);

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

    // CRITICAL FIX: Scroll to top whenever activeSection changes, with proper timing
    useEffect(() => {
        // Small delay to ensure DOM is updated before scrolling
        const timeoutId = setTimeout(() => {
            scrollToTop();
        }, 10);
        
        return () => clearTimeout(timeoutId);
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
        // Show skeleton loader while loading
        if (loading) {
            return <PulseSkeletonLoader />;
        }

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
                        <Hero scrollContainerRef={scrollContainerRef} formData={formData} />
                    </div>
                    <div id="mission-section">
                        <MissionVisionSection formData={formData} previews={previews} />
                    </div>
                    {/* Pass handleViewNews prop to NewsSection */}
                    <div id="news-section">
                        <NewsSection onNewsView={handleViewNews} />
                    </div>


                    <div id="transparency-section">
                        <TransparencySection onViewFile={handleViewFile} />
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
                <div className="min-h-screen">
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

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-slate-800 antialiased">
            <Navbar
                currentPage={activeSection}
                setCurrentPage={handleNavigation}
                searchKeyword={searchKeyword}
                setSearchKeyword={setSearchKeyword}
                setOfficial={handleSetOfficial}
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
                            {!loading && !["pdf-view", "news-content"].includes(activeSection) && (
                                <Footer
                                    currentPage={activeSection}
                                    setCurrentPage={handleNavigation}
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
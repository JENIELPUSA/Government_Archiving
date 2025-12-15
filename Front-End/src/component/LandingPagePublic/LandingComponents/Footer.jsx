import React, { useState, useEffect, useRef } from "react";
import logo from "../../../assets/republic.png";

const FooterQuickAccess = ({
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    setOfficial,
    onNavigateToSection // NEW: Add this prop
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const desktopMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const lastClickedPageRef = useRef(null);

    const pages = [
        { id: "hero", label: "Home" },
        { id: "news", label: "News & Info" },
        { id: "gallery", label: "Tourism" },
        { id: "about", label: "About Us" }
    ];

    const governmentLinks = [
        { name: "Office of the President", url: "#" },
        { name: "Office of the Vice President", url: "https://www.ovp.gov.ph" },
        { name: "Senate of the Philippines", url: "https://legacy.senate.gov.ph" },
        { name: "House of Representatives", url: "https://www.congress.gov.ph" },
        { name: "Sandiganbayan", url: "https://sb.judiciary.gov.ph" },
        { name: "Supreme Court", url: "https://sc.judiciary.gov.ph" },
        { name: "GOV.PH", url: "https://www.gov.ph" }
    ];

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const top = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    const handlePageClick = (pageId) => {
        // NEW: Use onNavigateToSection if provided
        if (onNavigateToSection) {
            onNavigateToSection(pageId);
            setMobileMenuOpen(false);
            return;
        }
        
        const isSamePage = lastClickedPageRef.current === pageId && currentPage === pageId;

        if (isSamePage) {
            scrollToSection(pageId);
            return;
        }

        setCurrentPage(pageId);
        lastClickedPageRef.current = pageId;
        setMobileMenuOpen(false);

        if (pageId === "hero") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            scrollToSection(pageId);
        }
    };

    useEffect(() => {
        const clickOutside = (e) => {
            if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target)) {
                setOpenSubmenu(null);
            }
            if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setMobileMenuOpen(false);
                setOpenSubmenu(null);
            }
        };
        document.addEventListener("mousedown", clickOutside);
        return () => document.removeEventListener("mousedown", clickOutside);
    }, [mobileMenuOpen]);

    return (
        <>
            {/* DESKTOP FOOTER - IMPROVED LAYOUT */}
            <footer
                ref={desktopMenuRef}
                className="bg-blue-950 border-t border-blue-800 shadow-lg hidden md:block"
            >
                <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
                    {/* MAIN FOOTER CONTENT - 3 COLUMN LAYOUT */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        
                        {/* COLUMN 1: BRAND & DESCRIPTION */}
                        <div className="space-y-4">
                            <div className="flex flex-col items-center md:items-start">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-16 w-16 flex-shrink-0">
                                        <img
                                            src={logo}
                                            alt="Republic of the Philippines Seal"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            Republic of the Philippines
                                        </h3>
                                        <p className="text-xs text-blue-300 mt-1">
                                            Province of Biliran
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-blue-200 text-center md:text-left">
                                    Serving with integrity, transparency, and dedication for 
                                    the progress of every Biliranon.
                                </p>
                            </div>
                            
                            {/* PUBLIC DOMAIN NOTE */}
                            <div className="mt-6">
                                <p className="text-xs text-blue-300 italic">
                                    All content is in the public domain unless otherwise stated.
                                </p>
                            </div>
                        </div>

                        {/* COLUMN 2: QUICK LINKS */}
                        <div>
                            <h4 className="text-white font-bold mb-6 pb-2 border-b-2 border-red-600 text-lg">
                                Quick Links
                            </h4>
                            <ul className="space-y-3">
                                {pages.map((p) => (
                                    <li key={p.id}>
                                        <button
                                            onClick={() => handlePageClick(p.id)}
                                            className={`text-left text-sm transition-colors duration-200 w-full flex items-center ${
                                                currentPage === p.id 
                                                ? 'text-yellow-300 font-semibold' 
                                                : 'text-blue-200 hover:text-yellow-300'
                                            }`}
                                        >
                                            <span className="mr-2">•</span>
                                            {p.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* COLUMN 3: GOVERNMENT LINKS */}
                        <div>
                            <h4 className="text-white font-bold mb-6 pb-2 border-b-2 border-red-600 text-lg">
                                Government Links
                            </h4>
                            <ul className="space-y-3">
                                {governmentLinks.map((link, index) => (
                                    <li key={index}>
                                        <a 
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-200 hover:text-yellow-300 text-sm transition-colors duration-200 flex items-center"
                                        >
                                            <span className="mr-2">•</span>
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* BOTTOM BAR */}
                    <div className="mt-8 pt-6 border-t border-blue-800">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-blue-300 text-sm text-center md:text-left">
                                &copy; {new Date().getFullYear()} Sangguniang Panlalawigan ng Biliran. 
                                All rights reserved.
                            </p>
                            <div className="flex gap-6">
                                <a className="text-blue-300 hover:text-white cursor-pointer text-sm transition-colors duration-200">
                                    Privacy Policy
                                </a>
                                <a className="text-blue-300 hover:text-white cursor-pointer text-sm transition-colors duration-200">
                                    Terms of Service
                                </a>
                                <a className="text-blue-300 hover:text-white cursor-pointer text-sm transition-colors duration-200">
                                    Sitemap
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* MOBILE FOOTER - IMPROVED */}
            <footer
                ref={mobileMenuRef}
                className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-300 shadow-2xl md:hidden"
            >
                {/* MOBILE MENU TOGGLE */}
                <div className="flex justify-between items-center px-4 py-3 bg-blue-950">
                    <button 
                        onClick={() => handlePageClick("hero")}
                        className="flex items-center"
                    >
                        <img 
                            src={logo} 
                            alt="Philippines Seal" 
                            className="h-10 w-10"
                        />
                        <span className="ml-2 text-white font-bold text-sm">
                            Biliran Province
                        </span>
                    </button>

                    <button
                        className="p-2 rounded-lg bg-blue-800 text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="w-6 h-6 flex flex-col justify-center items-center">
                            <span className={`h-0.5 w-6 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                            <span className={`h-0.5 w-6 bg-white my-1 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`h-0.5 w-6 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
                        </div>
                    </button>
                </div>

                {/* EXPANDABLE MENU */}
                <div
                    className={`transition-all duration-300 bg-white overflow-y-auto ${
                        mobileMenuOpen 
                        ? "max-h-[80vh] opacity-100 py-4" 
                        : "max-h-0 opacity-0"
                    }`}
                >
                    {/* QUICK LINKS */}
                    <div className="px-4 mb-6">
                        <h4 className="font-bold text-gray-800 mb-3 text-lg pb-2 border-b-2 border-red-600">
                            Quick Links
                        </h4>
                        <div className="space-y-2">
                            {pages.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handlePageClick(p.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                                        currentPage === p.id
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                        : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* GOVERNMENT LINKS (MOBILE) */}
                    <div className="px-4 mb-6">
                        <h4 className="font-bold text-gray-800 mb-3 text-lg pb-2 border-b-2 border-red-600">
                            Government Links
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 gap-2">
                                {governmentLinks.slice(0, 4).map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm py-2 px-3 rounded hover:bg-blue-50 transition-colors duration-200"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FOOTER INFO */}
                    <div className="px-4 py-3 bg-gray-50 border-t">
                        <p className="text-gray-600 text-xs text-center">
                            &copy; {new Date().getFullYear()} Sangguniang Panlalawigan
                        </p>
                        <div className="flex justify-center space-x-4 mt-2">
                            <a className="text-blue-600 text-xs hover:underline">
                                Privacy
                            </a>
                            <a className="text-blue-600 text-xs hover:underline">
                                Terms
                            </a>
                            <a className="text-blue-600 text-xs hover:underline">
                                Sitemap
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default FooterQuickAccess;
import React, { useState, useEffect, useRef } from "react";
import logo from "../../../assets/republic.png";

const FooterQuickAccess = ({
    currentPage,
    setCurrentPage,
    onNavigateToSection
}) => {
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
        if (onNavigateToSection) {
            onNavigateToSection(pageId);
            return;
        }
        
        const isSamePage = lastClickedPageRef.current === pageId && currentPage === pageId;

        if (isSamePage) {
            scrollToSection(pageId);
            return;
        }

        setCurrentPage(pageId);
        lastClickedPageRef.current = pageId;

        if (pageId === "hero") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            scrollToSection(pageId);
        }
    };

    return (
        <footer className="bg-blue-950 border-t border-blue-800 shadow-lg">
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* MAIN FOOTER CONTENT - RESPONSIVE LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
                    
                    {/* COLUMN 1: BRAND & DESCRIPTION - Full width on mobile, 2 cols on medium, 1 col on large */}
                    <div className="sm:col-span-2 md:col-span-1">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
                                    <img
                                        src={logo}
                                        alt="Republic of the Philippines Seal"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div className="text-center sm:text-left">
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
                        
                        {/* PUBLIC DOMAIN NOTE - Hidden on small mobile, shown on larger */}
                        <div className="mt-4 sm:mt-6">
                            <p className="text-xs text-blue-300 italic">
                                All content is in the public domain unless otherwise stated.
                            </p>
                        </div>
                    </div>

                    {/* COLUMN 2: QUICK LINKS */}
                    <div className="mt-4 sm:mt-0">
                        <h4 className="text-white font-bold mb-4 md:mb-6 pb-2 border-b-2 border-red-600 text-base md:text-lg">
                            Quick Links
                        </h4>
                        <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
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
                                        <span className="mr-2 text-xs">›</span>
                                        {p.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* COLUMN 3: GOVERNMENT LINKS */}
                    <div className="mt-4 sm:mt-0">
                        <h4 className="text-white font-bold mb-4 md:mb-6 pb-2 border-b-2 border-red-600 text-base md:text-lg">
                            Government Links
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3">
                            {governmentLinks.map((link, index) => (
                                <li key={index}>
                                    <a 
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-200 hover:text-yellow-300 text-xs sm:text-sm transition-colors duration-200 flex items-center"
                                    >
                                        <span className="mr-2 text-xs">›</span>
                                        <span className="truncate">{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-blue-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
                        <p className="text-blue-300 text-xs sm:text-sm text-center md:text-left order-2 md:order-1">
                            &copy; {new Date().getFullYear()} Sangguniang Panlalawigan ng Biliran. 
                            All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 order-1 md:order-2 mb-3 md:mb-0">
                            <a className="text-blue-300 hover:text-white cursor-pointer text-xs sm:text-sm transition-colors duration-200">
                                Privacy Policy
                            </a>
                            <a className="text-blue-300 hover:text-white cursor-pointer text-xs sm:text-sm transition-colors duration-200">
                                Terms of Service
                            </a>
                            <a className="text-blue-300 hover:text-white cursor-pointer text-xs sm:text-sm transition-colors duration-200">
                                Sitemap
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterQuickAccess;
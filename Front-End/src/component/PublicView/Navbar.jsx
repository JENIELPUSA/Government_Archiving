import React, { useState, useEffect } from "react";
import BiliranHeader from "../../../src/assets/Biliran-header.webp";

const NavbarWithScroll = ({ currentPage, setCurrentPage, searchKeyword, setSearchKeyword }) => {
    const [showScrollNavbar, setShowScrollNavbar] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const pages = [
        { id: "home", label: "Home" },
        { id: "sb-members", label: "SB Members" },
        { id: "documents", label: "Documents" },
        { id: "news-and-information", label: "News & Information" },
        { id: "about-us", label: "About Us" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Update scroll state for background opacity
            setIsScrolled(currentScrollY > 50);

            // Show/hide scroll navbar logic
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
                setShowScrollNavbar(true);
            } else if (currentScrollY < lastScrollY) {
                setShowScrollNavbar(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const handlePageClick = (page) => {
        setCurrentPage("");
        setTimeout(() => setCurrentPage(page), 50);
        setMobileMenuOpen(false);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuOpen && !event.target.closest("nav")) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [mobileMenuOpen]);

    return (
        <>
            {/* Original Static Navbar - Desktop & Tablet */}
            <nav className="hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg md:block">
                <div className="container mx-auto px-6 py-4">
                    <ul className="flex items-center justify-center space-x-8">
                        {pages.map((page) => (
                            <li key={page.id}>
                                <button
                                    onClick={() => handlePageClick(page.id)}
                                    className={`group relative px-4 py-2 font-semibold transition-all duration-300 ${
                                        currentPage === page.id ? "text-amber-300" : "text-white hover:text-amber-200"
                                    }`}
                                >
                                    {page.label}
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 bg-amber-300 transition-all duration-300 ${
                                            currentPage === page.id ? "w-full" : "w-0 group-hover:w-full"
                                        }`}
                                    ></span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Floating Scroll Navbar - Desktop */}
            <nav
                className={`fixed left-1/2 top-6 z-[999] hidden w-full max-w-6xl -translate-x-1/2 transform rounded-2xl border border-white/20 px-6 py-3 shadow-2xl transition-all duration-500 ease-out md:flex ${
                    showScrollNavbar ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-20 opacity-0"
                } ${isScrolled ? "bg-gray-200" : "bg-gray-200"}`}
            >
                {/* Logo */}
                <div className="flex items-center">
                    <img
                        src={BiliranHeader}
                        alt="Biliran Header"
                        className="h-12 w-auto transition-all duration-300"
                    />
                </div>

                {/* Center Navigation */}
                <div className="flex flex-1 items-center justify-center">
                    <ul className="flex items-center space-x-6">
                        {pages.map((page) => (
                            <li key={page.id}>
                                <button
                                    onClick={() => handlePageClick(page.id)}
                                    className={`group relative px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                                        currentPage === page.id ? "text-blue-600" : "text-gray-600 hover:text-blue-500"
                                    }`}
                                >
                                    {page.label}
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 bg-blue-700 transition-all duration-300 ${
                                            currentPage === page.id ? "w-full" : "w-0 group-hover:w-full"
                                        }`}
                                    ></span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Search Bar (Documents page only) */}
                <div className="flex items-center">
                    {currentPage === "documents" && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-64 rounded-full border border-black bg-black/10 px-4 py-2 pl-10 text-sm text-gray-800 placeholder-black/70 backdrop-blur-sm transition-all duration-300 focus:border-amber-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                            />
                            <svg
                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/70"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Scroll Navbar */}
            <nav
                className={`fixed left-0 right-0 top-0 z-50 block border-b border-white/20 shadow-2xl backdrop-blur-xl transition-all duration-500 md:hidden ${
                    showScrollNavbar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
                } ${isScrolled ? "bg-white/10" : "bg-blue-900/90"}`}
            >
                <div className="flex items-center justify-between p-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <img
                            src={BiliranHeader}
                            alt="Biliran Header"
                            className="h-12 w-auto transition-all duration-300"
                        />
                    </div>

                    {/* Hamburger Button */}
                    <button
                        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg text-white transition-all duration-300 hover:bg-white/20 focus:outline-none"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <div className="relative">
                            <span
                                className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                                    mobileMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5"
                                }`}
                            ></span>
                            <span
                                className={`block h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`}
                            ></span>
                            <span
                                className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                                    mobileMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5"
                                }`}
                            ></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <div
                    className={`overflow-hidden transition-all duration-500 ease-out ${
                        mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="border-t border-white/20 bg-gradient-to-b from-blue-900/95 to-blue-800/95 px-4 py-6 backdrop-blur-xl">
                        {/* Search Bar for Documents page */}
                        {currentPage === "documents" && (
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-3 pl-10 text-center text-white placeholder-white/70 backdrop-blur-sm transition-all duration-300 focus:border-amber-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                                    />
                                    <svg
                                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <ul className="space-y-2">
                            {pages.map((page, index) => (
                                <li key={page.id}>
                                    <button
                                        onClick={() => handlePageClick(page.id)}
                                        className={`group relative w-full rounded-xl px-4 py-3 text-left font-semibold transition-all duration-300 ${
                                            currentPage === page.id
                                                ? "bg-amber-300/20 text-amber-300"
                                                : "text-white hover:bg-white/10 hover:text-amber-200"
                                        }`}
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        <span className="relative z-10">{page.label}</span>
                                        <div
                                            className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/20 to-amber-300/20 transition-all duration-300 ${
                                                currentPage === page.id ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                                            }`}
                                        ></div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default NavbarWithScroll;

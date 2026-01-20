import React, { useState, useEffect, useRef, useCallback } from "react";
import headlogo from "../../../assets/logo-login.png";

const NavbarWithScroll = ({ 
    currentPage, 
    setCurrentPage, 
    searchKeyword, 
    setSearchKeyword, 
    setOfficial,
    onNavigateToSection
}) => {
    const [showScrollNavbar, setShowScrollNavbar] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [desktopOpenSubmenu, setDesktopOpenSubmenu] = useState(null);

    const lastScrollYRef = useRef(0);
    const desktopMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const lastClickedPageRef = useRef(null);

    const pages = [
        { id: "hero", label: "Home" },
        {
            id: "officials",
            label: "Officials",
            subItems: [
                { id: "Governor", label: "Governor" },
                { id: "Vice_Governor", label: "Vice-Governor" },
                { id: "sb-members", label: "SP Members" },
                { id: "Board_Member", label: "Board Members" },
            ],
        },
        {
            id: "transparency",
            label: "Legislative",
            subItems: [
                { id: "resolution", label: "Resolution" },
                { id: "ordinance", label: "Ordinance" },
                { id: "executive-order", label: "Executive Order" },
            ],
        },
        { id: "news", label: "News & Information" },
        { id: "gallery", label: "Tourism" },
        { id: "about", label: "About Us" },
    ];

    const heroSectionIds = ["hero", "mission", "news", "transparency", "gallery", "map", "contact", "about", "legislative-history"];

    const isSubpageOf = (pageId, parentId) => {
        const parent = pages.find((p) => p.id === parentId);
        return parent?.subItems?.some((sub) => sub.id === pageId);
    };

    const shouldShowSearchBar = currentPage === "documents" || currentPage === "transparency" || isSubpageOf(currentPage, "transparency");

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        setIsScrolled(currentScrollY > 50);

        const last = lastScrollYRef.current;

        if (currentScrollY < 50) {
            setShowScrollNavbar(true);
        } else if (currentScrollY > last && currentScrollY > 150) {
            setShowScrollNavbar(false);
        } else if (currentScrollY < last) {
            setShowScrollNavbar(true);
        }

        lastScrollYRef.current = currentScrollY;
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth"
            });
        }
    };

    const handlePageClick = (pageId, parentId = null, href = null) => {
        if (href) {
            window.location.href = href;
            return;
        }

        if (onNavigateToSection && heroSectionIds.includes(pageId)) {
            onNavigateToSection(pageId);
            setDesktopOpenSubmenu(null);
            setMobileMenuOpen(false);
            setOpenSubmenu(null);
            return;
        }

        const isSamePage = lastClickedPageRef.current === pageId && currentPage === pageId;

        if (isSamePage) {
            if (pageId === "hero") {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            } else {
                scrollToSection(pageId);
            }
            
            setDesktopOpenSubmenu(null);
            setMobileMenuOpen(false);
            setOpenSubmenu(null);
            return;
        }

        setCurrentPage(pageId);
        lastClickedPageRef.current = pageId;

        if (parentId && ["officials", "transparency"].includes(parentId)) {
            if (typeof setOfficial === "function") {
                setOfficial("");
                setTimeout(() => setOfficial(pageId), 0);
            }
        }

        if (pageId === "hero") {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } else {
            scrollToSection(pageId);
        }

        setDesktopOpenSubmenu(null);
        setMobileMenuOpen(false);
        setOpenSubmenu(null);
    };

    const handleDesktopSubmenuHover = (menuId) => setDesktopOpenSubmenu(menuId);
    const handleDesktopSubmenuLeave = () => setDesktopOpenSubmenu(null);
    const handleMobileSubmenuToggle = (menuId, e) => {
        e.stopPropagation();
        setOpenSubmenu(openSubmenu === menuId ? null : menuId);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target)) {
                setDesktopOpenSubmenu(null);
            }
            if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
                setOpenSubmenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileMenuOpen]);

    return (
        <>
            {/* Desktop Navbar */}
            <nav
                ref={desktopMenuRef}
                className={`fixed left-0 right-0 top-0 z-[50] hidden w-full transition-all duration-300 ease-in-out md:block ${
                    showScrollNavbar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
                } ${isScrolled ? "border-b border-blue-800 bg-blue-950 shadow-lg" : "bg-blue-950 backdrop-blur-md"}`}
            >
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        {/* Logo Section */}
                        <div
                            className="flex cursor-pointer items-center gap-3 transition-transform duration-200 hover:scale-105"
                            onClick={() => handlePageClick("hero")}
                        >
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden md:h-16 md:w-16">
                                <img
                                    src={headlogo}
                                    alt="Province of Biliran Official Logo"
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <div className="flex flex-col text-white">
                                <span className="text-xs font-semibold leading-tight md:text-sm">Republic of the Philippines</span>
                                <div className="my-1 h-px w-full bg-white"></div>
                                <span className="text-xs leading-tight">Province of Biliran</span>
                                <span className="text-xs italic leading-tight">Official Website</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex items-center">
                            <ul className="flex items-center space-x-1">
                                {pages.map((page) => (
                                    <li
                                        key={page.id}
                                        className="relative"
                                    >
                                        {page.subItems ? (
                                            <div
                                                className="group relative"
                                                onMouseEnter={() => handleDesktopSubmenuHover(page.id)}
                                                onMouseLeave={handleDesktopSubmenuLeave}
                                            >
                                                <button
                                                    className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:text-blue-300"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDesktopOpenSubmenu(desktopOpenSubmenu === page.id ? null : page.id);
                                                    }}
                                                >
                                                    {page.label}
                                                    <svg
                                                        className={`h-4 w-4 transition-transform ${desktopOpenSubmenu === page.id ? "rotate-180" : ""}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                </button>

                                                {/* Desktop Submenu */}
                                                <div
                                                    className={`absolute left-0 top-full z-20 w-56 rounded-xl border border-blue-800 bg-blue-900 p-2 shadow-xl transition-all duration-200 ${
                                                        desktopOpenSubmenu === page.id
                                                            ? "visible translate-y-0 opacity-100"
                                                            : "invisible -translate-y-2 opacity-0"
                                                    }`}
                                                >
                                                    <div className="space-y-1">
                                                        {page.subItems.map((subItem) => (
                                                            <button
                                                                key={subItem.id}
                                                                onClick={() => handlePageClick(subItem.id, page.id)}
                                                                className={`flex w-full items-center rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                                                                    currentPage === subItem.id
                                                                        ? "bg-blue-800 text-white shadow-sm"
                                                                        : "text-blue-100 hover:bg-blue-800 hover:text-white"
                                                                }`}
                                                            >
                                                                <span className="flex-1">{subItem.label}</span>
                                                                {currentPage === subItem.id && (
                                                                    <svg
                                                                        className="h-4 w-4"
                                                                        fill="currentColor"
                                                                        viewBox="0 0 20 20"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handlePageClick(page.id)}
                                                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:text-blue-300"
                                            >
                                                {page.label}
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Search Bar */}
                        {shouldShowSearchBar && (
                            <div className="relative ml-6">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
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
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-72 rounded-lg border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Navbar - SAME COLOR AS DESKTOP */}
            <nav
                ref={mobileMenuRef}
                className={`fixed left-0 right-0 top-0 z-[999] block transition-all duration-300 md:hidden ${
                    showScrollNavbar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
                } ${isScrolled ? "border-b border-blue-800 bg-blue-950 shadow-lg" : "bg-blue-950 backdrop-blur-md"}`}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo Section */}
                    <div
                        className="flex cursor-pointer items-center gap-3 transition-transform duration-200 hover:scale-105"
                        onClick={() => handlePageClick("hero")}
                    >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden">
                            <img
                                src={headlogo}
                                alt="Province of Biliran Official Logo"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="flex flex-col text-white">
                            <span className="text-xs font-semibold leading-tight">Republic of the Philippines</span>
                            <div className="my-1 h-px w-full bg-white"></div>
                            <span className="text-xs leading-tight">Province of Biliran</span>
                            <span className="text-xs italic leading-tight">Official Website</span>
                        </div>
                    </div>

                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors duration-200 hover:bg-blue-800 focus:outline-none"
                        onClick={() => {
                            setMobileMenuOpen(!mobileMenuOpen);
                            if (!mobileMenuOpen) setOpenSubmenu(null);
                        }}
                    >
                        <div className="relative h-5 w-5">
                            <span
                                className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                                    mobileMenuOpen ? "top-2 rotate-45" : "top-0"
                                }`}
                            ></span>
                            <span
                                className={`absolute left-0 top-2 block h-0.5 w-5 bg-current transition-all duration-300 ${
                                    mobileMenuOpen ? "opacity-0" : "opacity-100"
                                }`}
                            ></span>
                            <span
                                className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                                    mobileMenuOpen ? "top-2 -rotate-45" : "top-4"
                                }`}
                            ></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Menu Content */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="border-t border-blue-800 bg-blue-950 px-4 py-4">
                        {shouldShowSearchBar && (
                            <div className="mb-4">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg
                                            className="h-4 w-4 text-gray-400"
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
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        className="w-full rounded-lg border border-blue-700 bg-blue-900 py-2 pl-10 pr-4 text-sm text-white placeholder-blue-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        <ul className="space-y-1">
                            {pages.map((page) => (
                                <li key={page.id}>
                                    {page.subItems ? (
                                        <>
                                            <button
                                                onClick={(e) => handleMobileSubmenuToggle(page.id, e)}
                                                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                                                    currentPage === page.id ||
                                                    isSubpageOf(currentPage, "officials") ||
                                                    isSubpageOf(currentPage, "transparency")
                                                        ? "bg-blue-800 text-white shadow-sm"
                                                        : "text-white hover:bg-blue-800"
                                                }`}
                                            >
                                                <span>{page.label}</span>
                                                <svg
                                                    className={`h-5 w-5 transition-transform duration-200 ${openSubmenu === page.id ? "rotate-180" : ""}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>

                                            <div
                                                className={`overflow-hidden transition-all duration-200 ${
                                                    openSubmenu === page.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                                }`}
                                            >
                                                <ul className="mt-1 space-y-1 pl-4">
                                                    {page.subItems.map((subItem) => (
                                                        <li key={subItem.id}>
                                                            <button
                                                                onClick={() => handlePageClick(subItem.id, page.id)}
                                                                className={`flex w-full items-center rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150 ${
                                                                    currentPage === subItem.id
                                                                        ? "bg-blue-800 text-white shadow-sm"
                                                                        : "text-blue-100 hover:bg-blue-800"
                                                                }`}
                                                            >
                                                                {subItem.label}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handlePageClick(page.id)}
                                            className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                                                currentPage === page.id
                                                    ? "bg-blue-800 text-white shadow-sm"
                                                    : "text-white hover:bg-blue-800"
                                            }`}
                                        >
                                            {page.label}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                    onClick={() => {
                        setMobileMenuOpen(false);
                        setOpenSubmenu(null);
                    }}
                />
            )}
        </>
    );
};

export default NavbarWithScroll;
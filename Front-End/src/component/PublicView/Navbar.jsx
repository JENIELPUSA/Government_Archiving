import React, { useState, useEffect, useRef, useCallback } from "react";

const NavbarWithScroll = ({
  currentPage,
  setCurrentPage,
  searchKeyword,
  setSearchKeyword,
  setOfficial,
}) => {
  const [showScrollNavbar, setShowScrollNavbar] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const lastScrollYRef = useRef(0);

  const pages = [
    { id: "hero", label: "Home" },
    {
      id: "officials",
      label: "Officials",
      subItems: [
        { id: "Mayor", label: "Mayor" },
        { id: "Vice-Mayor", label: "Vice-Mayor" },
        { id: "sb-members", label: "SP Members" },
        { id: "Board Member", label: "Board Members" },
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
    {
      id: "gallery",
      label: "Tourism",
    },
    { id: "about", label: "About Us" },
  ];

  const isSubpageOf = (pageId, parentId) => {
    const parent = pages.find((p) => p.id === parentId);
    return parent?.subItems?.some((sub) => sub.id === pageId);
  };

  const shouldShowSearchBar =
    currentPage === "documents" ||
    currentPage === "transparency" ||
    isSubpageOf(currentPage, "transparency");

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

  const handlePageClick = (pageId, parentId = null, href = null) => {
    if (href) {
      window.location.href = href;
      return;
    }

    if (parentId && ["officials", "transparency"].includes(parentId)) {
      if (typeof setOfficial === "function") {
        setOfficial("");
        setTimeout(() => setOfficial(pageId), 0);
      }
    }
    
    setCurrentPage(pageId);
    if (!parentId) setOpenSubmenu(null);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest("nav")) {
        setMobileMenuOpen(false);
        setOpenSubmenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Desktop Navbar - Full Width */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[50] hidden md:flex w-full h-20 bg-white shadow-lg border-b border-gray-200 transition-all duration-500 ease-out ${
          showScrollNavbar
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => handlePageClick('hero')}
          >
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg group-hover:scale-105 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-blue-900 text-xl tracking-tight">BILIRAN</span>
              <span className="text-xs text-gray-500 -mt-1">Local Government</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex items-center justify-center">
            <ul className="flex items-center space-x-8">
              {pages.map((page) => (
                <li key={page.id} className="relative">
                  {page.subItems ? (
                    <div className="group relative">
                      <button
                        className={`flex items-center gap-2 px-4 py-3 text-lg font-semibold transition-all duration-300 rounded-lg ${
                          currentPage === page.id ||
                          isSubpageOf(currentPage, "officials") ||
                          isSubpageOf(currentPage, "transparency")
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        {page.label}
                        <svg
                          className="h-4 w-4 transition-transform group-hover:rotate-180"
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

                      <div className="absolute left-1/2 top-full z-10 hidden w-56 -translate-x-1/2 rounded-xl bg-white p-3 shadow-2xl border border-gray-200 group-hover:block">
                        {page.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handlePageClick(subItem.id, page.id)}
                            className={`block w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-all duration-300 ${
                              currentPage === subItem.id
                                ? "bg-blue-100 text-blue-700 shadow-sm"
                                : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                            }`}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePageClick(page.id)}
                      className={`px-4 py-3 text-lg font-semibold transition-all duration-300 rounded-lg ${
                        currentPage === page.id
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      {page.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Search Bar */}
          <div className="flex items-center">
            {shouldShowSearchBar && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-80 rounded-full border border-gray-300 bg-white px-6 py-3 pl-12 text-lg text-gray-800 placeholder-gray-500 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-200"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar - Full Width */}
      <nav
        className={`fixed left-0 right-0 top-0 z-[999] block md:hidden w-full bg-white shadow-2xl border-b border-gray-200 transition-all duration-500 ${
          showScrollNavbar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => handlePageClick('hero')}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-blue-900 text-lg tracking-tight">BILIRAN</span>
                <span className="text-xs text-gray-500 -mt-1">Local Government</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="relative z-10 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white transition-all duration-300 hover:bg-blue-700 focus:outline-none"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (!mobileMenuOpen) setOpenSubmenu(null);
              }}
            >
              <div className="relative">
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                    mobileMenuOpen ? "translate-y-1.5 rotate-45" : "-translate-y-1"
                  }`}
                ></span>
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                    mobileMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-1"
                  }`}
                ></span>
              </div>
            </button>
          </div>

          {/* Mobile Search Bar */}
          {shouldShowSearchBar && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 pl-12 text-base text-gray-800 placeholder-gray-500 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="absolute left-8 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out border-t border-gray-200 ${
            mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white px-4 py-4 shadow-inner">
            <ul className="space-y-2">
              {pages.map((page) => (
                <li key={page.id}>
                  {page.subItems ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenSubmenu(openSubmenu === page.id ? null : page.id)
                        }
                        className={`group relative flex w-full items-center justify-between rounded-xl px-4 py-4 text-lg font-semibold transition-all duration-300 ${
                          currentPage === page.id ||
                          isSubpageOf(currentPage, "officials") ||
                          isSubpageOf(currentPage, "transparency")
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{page.label}</span>
                        <svg
                          className={`h-5 w-5 transition-transform ${
                            openSubmenu === page.id ? "rotate-180" : ""
                          }`}
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

                      {openSubmenu === page.id && (
                        <ul className="mt-2 space-y-2 pl-6 border-l-2 border-gray-200">
                          {page.subItems.map((subItem) => (
                            <li key={subItem.id}>
                              <button
                                onClick={() => handlePageClick(subItem.id, page.id)}
                                className={`block w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-all duration-300 ${
                                  currentPage === subItem.id 
                                    ? "bg-blue-100 text-blue-700" 
                                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                                }`}
                              >
                                {subItem.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handlePageClick(page.id)}
                      className={`group relative w-full rounded-xl px-4 py-4 text-lg font-semibold transition-all duration-300 ${
                        currentPage === page.id
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {page.label}
                      </span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden"
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
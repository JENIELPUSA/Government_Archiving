import React, { useState, useEffect, useRef, useCallback } from "react";
import BiliranHeader from "../../../src/assets/Biliran-header.webp";

const NavbarWithScroll = ({
  currentPage,
  setCurrentPage,
  searchKeyword,
  setSearchKeyword,
  setOfficial,
}) => {
  const [showScrollNavbar, setShowScrollNavbar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const lastScrollYRef = useRef(0);

  const pages = [
  { id: "home", label: "Home" },
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
    id: "legislative",
    label: "Legislative",
    subItems: [
      { id: "resolution", label: "Resolution" },
      { id: "ordinance", label: "Ordinance" },
      { id: "executive-order", label: "Executive Order" },
    ],
  },
  { id: "news-and-information", label: "News & Information" },
  {
    id: "tourism",
    label: "Tourism",
    href: "https://www.tripadvisor.com.ph/Attractions-g612370-Activities-Biliran_Island_Visayas.html",
  },
  { id: "about-us", label: "About Us" },
  
];


  const isSubpageOf = (pageId, parentId) => {
    const parent = pages.find((p) => p.id === parentId);
    return parent?.subItems?.some((sub) => sub.id === pageId);
  };

  const shouldShowSearchBar =
    currentPage === "documents" ||
    currentPage === "legislative" ||
    isSubpageOf(currentPage, "legislative");

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setIsScrolled(currentScrollY > 50);

    const last = lastScrollYRef.current;

    if (currentScrollY > last && currentScrollY > 150) {
      setShowScrollNavbar(true);
    } else if (currentScrollY < last) {
      setShowScrollNavbar(false);
    }

    lastScrollYRef.current = currentScrollY;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // -----------------------------
  // Force-refresh on same page or dropdown click
  // -----------------------------
const handlePageClick = (pageId, parentId = null, href = null) => {
  if (href) {
    window.location.href = href; // diretso sa URL sa parehong tab
    return; // huwag nang i-set ang currentPage
  }

  // SPA logic
  if (parentId && ["officials", "legislative"].includes(parentId)) {
    if (typeof setOfficial === "function") {
      setOfficial("");
      setTimeout(() => setOfficial(pageId), 0);
    }
  } else {
    setCurrentPage("");
    setTimeout(() => setCurrentPage(pageId), 0);
    if (!parentId) setOpenSubmenu(null);
  }

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
      {/* Desktop Navbar */}
      <nav
        className={`fixed left-1/2 top-6 z-[50] hidden w-full max-w-6xl -translate-x-1/2 transform rounded-2xl border border-white/20 px-6 py-3 shadow-2xl transition-all duration-500 ease-out md:flex ${
          showScrollNavbar
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-20 opacity-0"
        } bg-gray-200`}
      >
        <div className="flex items-center">
          <img
            src={BiliranHeader}
            alt="Biliran Header"
            className="h-12 w-auto transition-all duration-300"
          />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <ul className="flex items-center space-x-6">
            {pages.map((page) => (
              <li key={page.id} className="relative">
                {page.subItems ? (
                  <div className="group relative">
                    <button
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                        currentPage === page.id ||
                        isSubpageOf(currentPage, "officials") ||
                        isSubpageOf(currentPage, "legislative")
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-blue-500"
                      }`}
                    >
                      {page.label}
                      <svg
                        className="h-4 w-4 transition-transform"
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

                    <div className="absolute left-1/2 top-full z-10 hidden w-48 -translate-x-1/2 rounded-lg bg-white p-2 shadow-xl group-hover:block">
                      {page.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handlePageClick(subItem.id, page.id)}
                          className={`block w-full rounded px-3 py-2 text-left text-sm font-medium transition-colors ${
                            currentPage === subItem.id
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-700 hover:bg-gray-100"
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
                    className={`group relative px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                      currentPage === page.id
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    {page.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center">
          {shouldShowSearchBar && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-64 rounded-full border border-black bg-black/10 px-4 py-2 pl-10 text-sm text-gray-800 placeholder-black/70 backdrop-blur-sm transition-all duration-300 focus:border-amber-300 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
              />
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav
        className={`fixed left-0 right-0 top-0 z-[999] block border-b shadow-2xl transition-all duration-500 md:hidden ${
          showScrollNavbar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        } ${isScrolled ? "bg-white" : "bg-blue-700"}`}
      >
        <div className="flex items-center justify-between p-3 xs:p-2">
          <div className="flex-shrink-0">
            <img
              src={BiliranHeader}
              alt="Biliran Header"
              className="h-9 w-auto transition-all duration-300 xs:h-8"
            />
          </div>

          <button
            className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-all duration-300 hover:bg-blue-600 focus:outline-none xs:h-8 xs:w-8"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (!mobileMenuOpen) setOpenSubmenu(null);
            }}
          >
            <div className="relative">
              <span
                className={`block h-0.5 w-5 bg-current transition-all duration-300 xs:w-4 ${
                  mobileMenuOpen ? "translate-y-1.5 rotate-45" : "-translate-y-1"
                }`}
              ></span>
              <span
                className={`block h-0.5 w-5 bg-current transition-all duration-300 xs:w-4 ${
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></span>
              <span
                className={`block h-0.5 w-5 bg-current transition-all duration-300 xs:w-4 ${
                  mobileMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-1"
                }`}
              ></span>
            </div>
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-gradient-to-b from-blue-800 to-gray-700 px-3 py-4 shadow-inner xs:px-2 xs:py-3">
            {shouldShowSearchBar && (
              <div className="mb-4 xs:mb-3">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full rounded-full border border-blue-300 bg-white px-3 py-2 pl-8 text-sm text-blue-900 placeholder-blue-400 transition-all duration-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 xs:px-2 xs:py-1.5 xs:pl-7 xs:text-xs"
                />
              </div>
            )}

            <ul className="space-y-2 xs:space-y-1.5">
              {pages.map((page) => (
                <li key={page.id}>
                  {page.subItems ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenSubmenu(openSubmenu === page.id ? null : page.id)
                        }
                        className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 xs:px-2 xs:py-1.5 xs:text-xs ${
                          currentPage === page.id ||
                          isSubpageOf(currentPage, "officials") ||
                          isSubpageOf(currentPage, "legislative")
                            ? "bg-orange-500 text-white shadow-md"
                            : "text-white hover:bg-blue-600"
                        }`}
                      >
                        <span>{page.label}</span>
                        <svg
                          className={`h-4 w-4 transition-transform ${
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
                        <ul className="mt-1 space-y-1 pl-4">
                          {page.subItems.map((subItem) => (
                            <li key={subItem.id}>
                              <button
                                onClick={() => handlePageClick(subItem.id, page.id)}
                                className={`block w-full rounded px-3 py-1.5 text-left text-xs font-medium text-white hover:bg-blue-600 ${
                                  currentPage === subItem.id ? "bg-orange-500" : ""
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
                      className={`group relative w-full rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 xs:px-2 xs:py-1.5 xs:text-xs ${
                        currentPage === page.id
                          ? "bg-orange-500 text-white shadow-md"
                          : "text-white hover:bg-blue-600"
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

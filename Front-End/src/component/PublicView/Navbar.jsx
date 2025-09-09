// Navbar.jsx
import React from "react";

const Navbar = ({ currentPage, setCurrentPage, searchKeyword, setSearchKeyword }) => {

  // Helper function to handle page click and force refresh
  const handlePageClick = (page) => {
    setCurrentPage(""); // temporarily clear the page
    setTimeout(() => setCurrentPage(page), 0); // then set target page
  };

  return (
    <nav className="bg-blue-800 p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Navigation Links */}
        <ul className="flex flex-wrap justify-center space-x-1 font-medium text-white md:space-x-4">
          <li>
            <a
              href="#"
              className={`px-2 py-1 ${currentPage === "home" ? "text-yellow-300 underline" : "hover:text-yellow-300"}`}
              onClick={() => handlePageClick("home")}
            >
              HOME
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`px-2 py-1 ${currentPage === "sb-members" ? "text-yellow-300 underline" : "hover:text-yellow-300"}`}
              onClick={() => handlePageClick("sb-members")}
            >
              SP MEMBERS
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`px-2 py-1 ${currentPage === "documents" ? "text-yellow-300 underline" : "hover:text-yellow-300"}`}
              onClick={() => handlePageClick("documents")}
            >
              DOCUMENTS
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`px-2 py-1 ${currentPage === "about-us" ? "text-yellow-300 underline" : "hover:text-yellow-300"}`}
              onClick={() => handlePageClick("about-us")}
            >
              ABOUT US
            </a>
          </li>
        </ul>

        {/* Search Bar for Documents Page */}
        {currentPage === "documents" && (
          <div className="relative mt-4 w-full md:mt-0 md:w-auto">
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-800"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// App.jsx
import React, { useState } from "react";
import SBMembers from "../PublicView/SBMember";
import Home from "./Home/Home";
import Documents from "./Document";
import Navbar from "./Navbar";
import AboutUs from "./AboutUs"

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [searchKeyword, setSearchKeyword] = useState("");

  const renderMainContent = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "sb-members":
        return <SBMembers />;
      case "documents":
        return <Documents searchKeyword={searchKeyword} />;
      case "about-us":
     <  AboutUs/>
      default:
        return <AboutUs />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 font-sans">
      {/* Philippines Flag Banner */}
      <div className="flex w-full">
        <div className="h-4 w-1/2 bg-blue-800"></div>
        <div className="h-4 w-1/2 bg-red-700"></div>
      </div>
      <div className="h-4 w-full bg-yellow-400"></div>

      {/* Header with Philippine Flag Theme */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto flex items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-blue-800">
                Sangguniang Panlalawigan Archiving System
              </h1>
              <p className="font-semibold text-red-700">
                Biliran Province
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - now a component */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
      />

      {/* Main Content */}
      {renderMainContent()}

      {/* Footer */}
      <footer className="mt-12 bg-blue-800 py-8 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-xl font-bold">Sangguniang Panlalawigan Archiving System</h3>
              <p className="text-sm">Biliran Province</p>
              <p className="mt-2 text-sm">Tel: (632) 8931-5001</p>
            </div>
            <div>
              <h4 className="mb-4 font-bold">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="transition-colors hover:text-yellow-300">Home</a></li>
                <li><a href="#" className="transition-colors hover:text-yellow-300">SB Members</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
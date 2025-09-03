import React, { useState, useRef } from "react";
import SBMembers from "../PublicView/SBMember";
import Home from "./Home/Home";
import Documents from "./Document";
import Navbar from "./Navbar";
import MyLogo from "../../assets/logo-login.png";
import PDFview from "./PDFview";

const App = () => {
    const [currentPage, setCurrentPage] = useState("home");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    // Ref for AboutUs DOM element
    const aboutUsRef = useRef(null);

    const handleViewFile = (fileId, fileData) => {
        setSelectedFile({ fileId, fileData });
        setCurrentPage("pdf-view");
    };

    const scrollToAboutUs = () => {
        setCurrentPage("home");
        setTimeout(() => {
            aboutUsRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const renderMainContent = () => {
        switch (currentPage) {
            case "home":
                return <Home aboutUsRef={aboutUsRef} />;
            case "sb-members":
                return <SBMembers />;
            case "documents":
                return (
                    <Documents
                        searchKeyword={searchKeyword}
                        onViewFile={handleViewFile}
                    />
                );
            case "pdf-view":
                return selectedFile ? (
                    <PDFview
                        fileId={selectedFile.fileId}
                        file={selectedFile.file}
                        fileName={selectedFile.fileName}
                        onClose={() => setCurrentPage("documents")}
                    />
                ) : (
                    <Documents
                        searchKeyword={searchKeyword}
                        onViewFile={handleViewFile}
                    />
                );
            default:
                return <Home aboutUsRef={aboutUsRef} />;
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

            {/* Header */}
            <div className="bg-white shadow-lg">
                <div className="container mx-auto flex items-center px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center space-x-2">
                            {[...Array(3)].map((_, i) => (
                                <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-yellow-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <div className="relative h-16 w-16">
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-yellow-400">
                                <img
                                    src={MyLogo}
                                    alt="Logo"
                                    className="h-15 w-15"
                                />
                            </div>
                        </div>
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold text-blue-800">Sangguniang Panlalawigan Archiving System</h1>
                            <p className="font-semibold text-red-700">Biliran Province</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <Navbar
                currentPage={currentPage}
                setCurrentPage={(page) => {
                    if (page === "about-us") {
                        scrollToAboutUs();
                    } else {
                        setCurrentPage(page);
                    }
                }}
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
                                <li>
                                    <button
                                        onClick={() => setCurrentPage("home")}
                                        className="transition-colors hover:text-yellow-300"
                                    >
                                        Home
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setCurrentPage("about-us")}
                                        className="transition-colors hover:text-yellow-300"
                                    >
                                        About Us
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setCurrentPage("sb-members")}
                                        className="transition-colors hover:text-yellow-300"
                                    >
                                        SB Members
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;

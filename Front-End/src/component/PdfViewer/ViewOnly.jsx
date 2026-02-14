import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { ZoomIn, ZoomOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ViewOnly = React.memo(({ fileData, fileId, onLoadComplete }) => {
    const { authToken } = useContext(AuthContext);
    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1); // for navigation
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const abortControllerRef = useRef(null);
    const cachedPdfRef = useRef({ fileId: null, url: null, bytes: null });
    const menuRef = useRef(null);

    // Screen size detection
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScale(0.6);
                setIsMobile(true);
            } else {
                setScale(1.0);
                setIsMobile(false);
                setMobileMenuOpen(false);
            }
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Click outside to close mobile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch PDF
    const fetchPDF = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsLoading(true);

        try {
            if (cachedPdfRef.current.fileId === fileId && cachedPdfRef.current.url) {
                setFileUrl(cachedPdfRef.current.url);
                setIsLoading(false);
                if (onLoadComplete) onLoadComplete();
                return;
            }

            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/streampublic/${fileId}`, {
                responseType: "blob",
                signal,
            });

            const currentPdfBytes = await res.data.arrayBuffer();
            const newUrl = URL.createObjectURL(new Blob([currentPdfBytes], { type: "application/pdf" }));

            cachedPdfRef.current = { fileId, url: newUrl, bytes: currentPdfBytes };
            setFileUrl(newUrl);
        } catch (error) {
            if (error.name !== "CanceledError") console.error("Failed to load PDF:", error);
        } finally {
            setIsLoading(false);
            if (onLoadComplete) onLoadComplete();
        }
    }, [fileId, onLoadComplete]);

    useEffect(() => {
        if (fileId) fetchPDF();
    }, [fileId, fetchPDF]);

    // Document load success
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    // Navigation
    const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));

    // Zoom
    const handleZoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.2, 2.0)), []);
    const handleZoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.2, 0.5)), []);

    return (
        <>
            <style>
                {`
                .pdf-viewer-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    position: relative;
                    background-color: #f0f0f0;
                    padding: 10px;
                }

                @media (max-width: 768px) {
                    .pdf-viewer-container {
                        overflow: hidden !important;
                        touch-action: none;
                    }
                }

                .pdf-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }

                .pdf-page-container {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    background: white;
                    border: 1px solid #eaeaea;
                    margin-bottom: 10px; /* space between pages */
                }

                /* Toolbar with blur */
                .toolbar {
                    position: sticky;
                    top: 15px;
                    display: flex;
                    gap: 12px;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    z-index: 20;
                    margin-bottom: 20px;
                }

                .toolbar button {
                    background-color: #f8fafc;
                    border: 1px solid #cbd5e0;
                    border-radius: 6px;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .page-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    margin-left: 8px;
                }

                .mobile-floating-button {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background-color: #3b82f6;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    border: none;
                }

                .mobile-menu {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .mobile-menu button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                `}
            </style>

            <div className="pdf-viewer-container">
                {/* Desktop toolbar */}
                {!isMobile && (
                    <div className="toolbar print-hidden">
                        <button onClick={handleZoomIn} title="Zoom In"><ZoomIn size={20} /></button>
                        <button onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={20} /></button>
    
                    </div>
                )}

                {/* Mobile floating button and menu */}
                {isMobile && (
                    <>
                        <button className="mobile-floating-button print-hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        {mobileMenuOpen && (
                            <div className="mobile-menu print-hidden" ref={menuRef}>
                                <button onClick={handleZoomIn}><ZoomIn size={20} /> Zoom In</button>
                                <button onClick={handleZoomOut}><ZoomOut size={20} /> Zoom Out</button>
                            </div>
                        )}
                    </>
                )}

                <div className="pdf-content">
                    {isLoading && <p>Loading...</p>}

                    {fileUrl ? (
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            key={fileId}
                        >
                            {/* Render only the current page (for navigation) */}
                            <div className="pdf-page-container">
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                />
                            </div>
                        </Document>
                    ) : (
                        !isLoading && <p>No file selected.</p>
                    )}
                </div>
            </div>
        </>
    );
});

export default ViewOnly;
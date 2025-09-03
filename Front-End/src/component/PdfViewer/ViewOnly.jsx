import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ViewOnly = React.memo(({ fileData, fileId, onLoadComplete }) => {
    const { authToken } = useContext(AuthContext);
    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef(null);
    const cachedPdfRef = useRef({ fileId: null, url: null, bytes: null });

    useEffect(() => {
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    const fetchPDF = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsLoading(true);
        setNumPages(null);
        setCurrentPage(1);

        try {
            if (cachedPdfRef.current.fileId === fileId && cachedPdfRef.current.url) {
                setFileUrl(cachedPdfRef.current.url);
                setIsLoading(false);
                if (onLoadComplete) onLoadComplete(); // Call callback when loading is finished
                return;
            }

            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/streampublic/${fileId}`, {
                responseType: "blob",
                signal,
            });

            const originalBlob = res.data;
            const currentPdfBytes = await originalBlob.arrayBuffer();
            const newUrl = URL.createObjectURL(new Blob([currentPdfBytes], { type: "application/pdf" }));

            cachedPdfRef.current = {
                fileId,
                url: newUrl,
                bytes: currentPdfBytes,
            };

            setFileUrl(newUrl);
        } catch (error) {
            if (error.name !== "CanceledError") {
                console.error("Failed to load PDF:", error);
            }
        } finally {
            setIsLoading(false);
            // This is the correct place to handle the loading completion, as it runs regardless of success or failure.
            if (onLoadComplete) onLoadComplete();
        }
    }, [fileId, authToken, onLoadComplete]);

    useEffect(() => {
        if (fileId) fetchPDF();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fileId, fetchPDF]);

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
    }, []);

    const handleZoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.2, 2.0)), []);
    const handleZoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.2, 0.5)), []);

    const goToPrevPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, numPages || 1));
    }, [numPages]);

    const goToPage = useCallback((pageNum) => {
        const page = parseInt(pageNum);
        if (page >= 1 && page <= (numPages || 1)) {
            setCurrentPage(page);
        }
    }, [numPages]);

    const handleDownload = useCallback(async () => {
        if (!cachedPdfRef.current.bytes) {
            alert("PDF not loaded.");
            return;
        }

        try {
            const blob = new Blob([cachedPdfRef.current.bytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${fileData.title || "document"}.pdf`;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                a.remove();
                URL.revokeObjectURL(url);
            }, 100);
        } catch (err) {
            console.error("Error during PDF download:", err);
            alert("Error downloading PDF.");
        }
    }, [fileData]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                goToPrevPage();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                goToNextPage();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [goToPrevPage, goToNextPage]);

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
                    overflow-y: auto;
                    position: relative;
                    background-color: #f0f0f0;
                    padding: 10px;
                }

                .pdf-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                }

                .react-pdf__Document {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    max-width: fit-content;
                }

                .page-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                }

                .pdf-page-container {
                    position: relative;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    background: white;
                    border: 1px solid #eaeaea;
                }

                .toolbar {
                    position: sticky;
                    top: 15px;
                    display: flex;
                    gap: 12px;
                    padding: 12px 16px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    z-index: 100;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .toolbar button {
                    background-color: #f8fafc;
                    border: 1px solid #cbd5e0;
                    border-radius: 6px;
                    padding: 8px 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    min-width: 40px;
                    height: 40px;
                }

                .toolbar button:hover:not(:disabled) {
                    background-color: #e2e8f0;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .toolbar button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background-color: #f1f5f9;
                }

                .toolbar .download-btn {
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                }

                .toolbar .download-btn:hover {
                    background-color: #2563eb;
                    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
                }

                .page-navigation {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-left: 8px;
                    padding-left: 8px;
                    border-left: 1px solid #cbd5e0;
                }

                .page-info {
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 500;
                    margin: 0 8px;
                    white-space: nowrap;
                }

                .page-input {
                    width: 50px;
                    padding: 4px 8px;
                    border: 1px solid #cbd5e0;
                    border-radius: 4px;
                    text-align: center;
                    font-size: 14px;
                }

                .page-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(255, 255, 255, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10;
                    flex-direction: column;
                }

                .loading-spinner {
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    border-top: 4px solid #3b82f6;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 10px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media print {
                    .print-hidden {
                        display: none !important;
                    }
                    .print-pdf-container {
                        box-shadow: none !important;
                        border: none !important;
                        margin-bottom: 0 !important;
                    }
                    .react-pdf__Page canvas {
                        width: 100% !important;
                        height: auto !important;
                    }
                }

                @media (max-width: 768px) {
                    .toolbar {
                        gap: 8px;
                        padding: 8px 12px;
                    }
                    
                    .page-info {
                        font-size: 12px;
                        margin: 0 4px;
                    }
                    
                    .page-input {
                        width: 40px;
                        font-size: 12px;
                    }
                }
                `}
            </style>

            <div className="pdf-viewer-container">
                <div className="toolbar print-hidden">
                    <button
                        onClick={handleZoomIn}
                        title="Zoom In (Ctrl + +)"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        title="Zoom Out (Ctrl + -)"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="download-btn"
                        title="Download PDF"
                    >
                        <Download size={20} />
                    </button>

                    {numPages && (
                        <div className="page-navigation">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage <= 1}
                                title="Previous Page (←)"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            <input
                                type="number"
                                min="1"
                                max={numPages}
                                value={currentPage}
                                onChange={(e) => goToPage(e.target.value)}
                                className="page-input"
                                title="Go to page"
                            />
                            
                            <span className="page-info">of {numPages}</span>
                            
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage >= numPages}
                                title="Next Page (→)"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="pdf-content">
                    {isLoading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                            <p className="text-gray-600">Loading PDF...</p>
                        </div>
                    )}

                    {fileUrl ? (
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={console.error}
                            key={fileUrl}
                        >
                            <div className="page-wrapper">
                                <div className="pdf-page-container print-pdf-container">
                                    <Page
                                        pageNumber={currentPage}
                                        scale={scale}
                                        renderAnnotationLayer={false}
                                        renderTextLayer={false}
                                    />
                                </div>
                            </div>
                        </Document>
                    ) : (
                        !isLoading && <p>Select a PDF to view.</p>
                    )}
                </div>
            </div>
        </>
    );
});

export default ViewOnly;
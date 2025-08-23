import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { ResizableBox } from "react-resizable";
import { AuthContext } from "../../contexts/AuthContext";
import "react-resizable/css/styles.css";
import { Download, ZoomIn, ZoomOut, Type } from "lucide-react";
import approvedImage from "../../assets/approved-logo.png";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const applyAnnotationsToPdf = async (originalPdfBytes, numPages, placedSignatures, placedTexts, pdfWrapperRef) => {
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pageDimensions = [];
    for (let i = 0; i < numPages; i++) {
        const page = pdfDoc.getPages()[i];
        pageDimensions.push(page.getSize());
    }

    const pageElements = pdfWrapperRef.current.querySelectorAll(".react-pdf__Page");

    const processBatch = async (items, processFn) => {
        for (let i = 0; i < items.length; i += 10) {
            const batch = items.slice(i, i + 10);
            await Promise.all(batch.map(processFn));
        }
    };

    await processBatch(placedSignatures, async (sig) => {
        const { page: pageNum } = sig;
        const page = pdfDoc.getPages()[pageNum - 1];
        const { width: pdfPageWidth, height: pdfPageHeight } = pageDimensions[pageNum - 1];

        const renderedPage = pageElements[pageNum - 1];
        if (!renderedPage) return;

        const renderedPageWidth = renderedPage.offsetWidth;
        const renderedPageHeight = renderedPage.offsetHeight;

        const scaleX = pdfPageWidth / renderedPageWidth;
        const scaleY = pdfPageHeight / renderedPageHeight;

        const imageBytes = await fetch(sig.src).then((res) => res.arrayBuffer());
        const pdfImage = sig.src.includes("png") ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);

        page.drawImage(pdfImage, {
            x: sig.x * scaleX,
            y: pdfPageHeight - sig.y * scaleY - sig.height * scaleY,
            width: sig.width * scaleX,
            height: sig.height * scaleY,
        });
    });

    placedTexts.forEach((text) => {
        const { page: pageNum } = text;
        const page = pdfDoc.getPages()[pageNum - 1];
        const { width: pdfPageWidth, height: pdfPageHeight } = pageDimensions[pageNum - 1];

        const renderedPage = pageElements[pageNum - 1];
        if (!renderedPage) return;

        const renderedPageWidth = renderedPage.offsetWidth;
        const renderedPageHeight = renderedPage.offsetHeight;

        const scaleX = pdfPageWidth / renderedPageWidth;
        const scaleY = pdfPageHeight / renderedPageHeight;

        page.drawText(text.value, {
            x: text.x * scaleX,
            y: pdfPageHeight - text.y * scaleY - text.fontSize * scaleY,
            font,
            size: text.fontSize * scaleY,
            color: rgb(
                parseInt(text.fontColor.slice(1, 3), 16) / 255,
                parseInt(text.fontColor.slice(3, 5), 16) / 255,
                parseInt(text.fontColor.slice(5, 7), 16) / 255,
            ),
            maxWidth: text.width * scaleX,
            lineHeight: text.fontSize * scaleY * 1.2,
        });
    });

    return await pdfDoc.save();
};

const ViewOnly = React.memo(({ fileData, fileId }) => {
    const { authToken } = useContext(AuthContext);
    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);
    const pdfWrapperRef = useRef(null);
    const [placedSignatures, setPlacedSignatures] = useState([]);
    const [placedTexts, setPlacedTexts] = useState([]);
    const nextSignatureId = useRef(0);
    const nextTextId = useRef(0);
    const [activeSignatureId, setActiveSignatureId] = useState(null);
    const [activeTextId, setActiveTextId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef(null);
    const cachedPdfRef = useRef({ fileId: null, url: null, bytes: null });
    const [pageDimensions, setPageDimensions] = useState([]);

    useEffect(() => {
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    useEffect(() => {
        setPlacedSignatures([]);
        setPlacedTexts([]);
        nextSignatureId.current = 0;
        nextTextId.current = 0;
        setActiveSignatureId(null);
        setActiveTextId(null);
    }, [fileId]);

    const fetchPDF = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsLoading(true);
        setNumPages(null);

        try {
            if (cachedPdfRef.current.fileId === fileId && cachedPdfRef.current.url) {
                setFileUrl(cachedPdfRef.current.url);
                setIsLoading(false);
                return;
            }

            const meta = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${fileId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
                signal,
            });

            const { status } = meta.data;

            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/streampublic/${fileId}`, {
                responseType: "blob",
            });

            let originalBlob = res.data;
            let currentPdfBytes = await originalBlob.arrayBuffer();

            if (status === "Approved") {
                try {
                    const pdfDoc = await PDFDocument.load(currentPdfBytes);
                    const pages = pdfDoc.getPages();

                    const imageBytes = await fetch(approvedImage).then((res) => res.arrayBuffer());
                    const pngImage = await pdfDoc.embedPng(imageBytes);

                    const imgWidth = 400;
                    const imgHeight = 400;

                    for (const page of pages) {
                        const { width, height } = page.getSize();
                        page.drawImage(pngImage, {
                            x: (width - imgWidth) / 2 + 10,
                            y: (height - imgHeight) / 2,
                            width: imgWidth,
                            height: imgHeight,
                            opacity: 0.4,
                            rotate: degrees(45),
                        });
                    }

                    currentPdfBytes = await pdfDoc.save();
                } catch (err) {
                    console.error("❗ Failed to add image watermark. Using original PDF.", err);
                }
            }
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
        }
    }, [fileId, authToken]);

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

    const onPageLoadSuccess = useCallback((page, index) => {
        const { width, height } = page;
        setPageDimensions((prev) => {
            const newDimensions = [...prev];
            newDimensions[index] = { width, height };
            return newDimensions;
        });
    }, []);

    const handleZoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.2, 2.0)), []);

    const handleZoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.2, 0.5)), []);

    const handleAddText = useCallback(() => {
        const newText = {
            id: nextTextId.current++,
            page: 1,
            x: 50,
            y: 50,
            width: 150,
            height: 30,
            value: "Enter text here",
            fontSize: 12,
            fontColor: "#000000",
        };
        setPlacedTexts((prev) => [...prev, newText]);
        setActiveTextId(newText.id);
        setActiveSignatureId(null);
    }, []);

    const handleDownload = useCallback(async () => {
        if (!cachedPdfRef.current.bytes) {
            alert("PDF not loaded.");
            return;
        }

        try {
            const pdfBytes = await applyAnnotationsToPdf(cachedPdfRef.current.bytes, numPages, placedSignatures, placedTexts, pdfWrapperRef);

            const blob = new Blob([pdfBytes], { type: "application/pdf" });
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
    }, [fileData, numPages, placedSignatures, placedTexts]);

    const handleRemoveSignature = useCallback(
        (idToRemove) => {
            setPlacedSignatures((prev) => prev.filter((sig) => sig.id !== idToRemove));
            if (activeSignatureId === idToRemove) setActiveSignatureId(null);
        },
        [activeSignatureId],
    );
    const handleRemoveText = useCallback(
        (idToRemove) => {
            setPlacedTexts((prev) => prev.filter((text) => text.id !== idToRemove));
            if (activeTextId === idToRemove) setActiveTextId(null);
        },
        [activeTextId],
    );

    const handleTextClick = useCallback((e, textId) => {
        e.stopPropagation();
        setActiveTextId(textId);
        setActiveSignatureId(null);
    }, []);

    const handleTextChange = useCallback((id, newValue) => {
        setPlacedTexts((prev) => prev.map((text) => (text.id === id ? { ...text, value: newValue } : text)));
    }, []);

    const handleUpdateTextFontSize = useCallback((id, newFontSize) => {
        setPlacedTexts((prev) => prev.map((text) => (text.id === id ? { ...text, fontSize: newFontSize } : text)));
    }, []);

    const handleDocumentClick = useCallback(() => {
        setActiveSignatureId(null);
        setActiveTextId(null);
    }, []);

    const handleKeyDown = useCallback(
        (e) => {
            const step = 5;
            const pageElements = pdfWrapperRef.current?.querySelectorAll(".react-pdf__Page");
            const activePage = pageElements?.[0]?.getBoundingClientRect() || { width: 595, height: 842 };

            const handleMove = (items, setItems, activeId, removeHandler) => {
                setItems((prev) => {
                    return prev
                        .map((item) => {
                            if (item.id === activeId) {
                                let newX = item.x;
                                let newY = item.y;

                                switch (e.key) {
                                    case "ArrowUp":
                                        newY = Math.max(0, newY - step);
                                        break;
                                    case "ArrowDown":
                                        newY = Math.min(activePage.height - item.height, newY + step);
                                        break;
                                    case "ArrowLeft":
                                        newX = Math.max(0, newX - step);
                                        break;
                                    case "ArrowRight":
                                        newX = Math.min(activePage.width - item.width, newX + step);
                                        break;
                                    case "Delete":
                                    case "Backspace":
                                        removeHandler(item.id);
                                        return null;
                                    default:
                                        return item;
                                }

                                return { ...item, x: newX, y: newY };
                            }
                            return item;
                        })
                        .filter(Boolean);
                });
            };

            if (activeSignatureId !== null) {
                e.preventDefault();
                handleMove(placedSignatures, setPlacedSignatures, activeSignatureId, handleRemoveSignature);
            }

            if (activeTextId !== null) {
                e.preventDefault();
                handleMove(placedTexts, setPlacedTexts, activeTextId, handleRemoveText);
            }
        },
        [activeSignatureId, activeTextId, placedSignatures, placedTexts, handleRemoveSignature, handleRemoveText],
    );

    useEffect(() => {
        document.addEventListener("click", handleDocumentClick);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleDocumentClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleDocumentClick, handleKeyDown]);

    const handleDrop = useCallback((e, pageNum) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 120));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 60));

        const sigData = e.dataTransfer.getData("signature");
        const sigId = e.dataTransfer.getData("signatureId");
        const textData = e.dataTransfer.getData("text");
        const textId = e.dataTransfer.getData("textId");

        if (sigData && !sigId) {
            setPlacedSignatures((prev) => [
                ...prev,
                {
                    id: nextSignatureId.current++,
                    page: pageNum,
                    x,
                    y,
                    src: sigData,
                    width: 120,
                    height: 60,
                },
            ]);
            setActiveSignatureId(nextSignatureId.current - 1);
            setActiveTextId(null);
        } else if (sigId) {
            const signatureId = parseInt(sigId);
            setPlacedSignatures((prev) => prev.map((sig) => (sig.id === signatureId ? { ...sig, x, y, page: pageNum } : sig)));
            setActiveSignatureId(signatureId);
            setActiveTextId(null);
        } else if (textData && !textId) {
            const newText = {
                id: nextTextId.current++,
                page: pageNum,
                x,
                y,
                width: 150,
                height: 30,
                value: "Enter text here",
                fontSize: 12,
                fontColor: "#000000",
            };
            setPlacedTexts((prev) => [...prev, newText]);
            setActiveTextId(newText.id);
            setActiveSignatureId(null);
        } else if (textId) {
            const textIdNum = parseInt(textId);
            setPlacedTexts((prev) => prev.map((text) => (text.id === textIdNum ? { ...text, x, y, page: pageNum } : text)));
            setActiveTextId(textIdNum);
            setActiveSignatureId(null);
        }
    }, []);

    const handleResizeSignature = useCallback((id, size) => {
        setPlacedSignatures((prev) => prev.map((sig) => (sig.id === id ? { ...sig, width: size.width, height: size.height } : sig)));
    }, []);

    const handleResizeText = useCallback((id, size) => {
        setPlacedTexts((prev) => prev.map((text) => (text.id === id ? { ...text, width: size.width, height: size.height } : text)));
    }, []);

    const handleDragStart = useCallback((e, id, type) => {
        e.dataTransfer.setData(`${type}Id`, id);
    }, []);

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
                }

                .toolbar button:hover {
                    background-color: #e2e8f0;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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

                .signature-item, .text-item {
                    cursor: grab;
                    border: 1px dashed transparent;
                }

                .signature-item.active, .text-item.active {
                    border: 1px dashed #3b82f6;
                }

                .remove-button {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background-color: #ef4444;
                    color: white;
                    border-radius: 50%;
                    width: 22px;
                    height: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 14px;
                    line-height: 1;
                    z-index: 60;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .remove-button:hover {
                    background-color: #dc2626;
                }

                .text-input {
                    width: 100%;
                    height: 100%;
                    border: none;
                    background: transparent;
                    resize: none;
                    padding: 5px;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
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

                .react-resizable-handle {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background-repeat: no-repeat;
                    background-position: bottom right;
                    padding: 0 3px 3px 0;
                }
                .react-resizable-handle-se {
                    bottom: 0;
                    right: 0;
                    cursor: se-resize;
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
                `}
            </style>

            <div
                className="pdf-viewer-container"
                ref={pdfWrapperRef}
            >
                <div className="toolbar print-hidden">
                    <button
                        onClick={handleZoomIn}
                        title="Zoom In"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        title="Zoom Out"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="download-btn"
                        title="Download"
                    >
                        <Download size={20} />
                    </button>
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
                            {Array.from({ length: numPages || 0 }, (_, index) => {
                                const pageNum = index + 1;
                                const pageSignatures = placedSignatures.filter((sig) => sig.page === pageNum);
                                const pageTexts = placedTexts.filter((text) => text.page === pageNum);

                                return (
                                    <div
                                        key={`page_wrapper_${pageNum}`}
                                        className="page-wrapper"
                                    >
                                        <div
                                            className="pdf-page-container print-pdf-container"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleDrop(e, pageNum)}
                                        >
                                            <Page
                                                pageNumber={pageNum}
                                                scale={scale}
                                                renderAnnotationLayer={false}
                                                renderTextLayer={false}
                                                onLoadSuccess={(page) => onPageLoadSuccess(page, index)}
                                            />

                                            {pageSignatures.map((sig) => (
                                                <ResizableBox
                                                    key={sig.id}
                                                    width={sig.width}
                                                    height={sig.height}
                                                    minConstraints={[50, 25]}
                                                    maxConstraints={[300, 150]}
                                                    onResizeStop={(e, { size }) => {
                                                        setPlacedSignatures((prev) =>
                                                            prev.map((s) => (s.id === sig.id ? { ...s, width: size.width, height: size.height } : s)),
                                                        );
                                                    }}
                                                    style={{
                                                        left: sig.x,
                                                        top: sig.y,
                                                        position: "absolute",
                                                        zIndex: sig.id === activeSignatureId ? 50 : 10,
                                                    }}
                                                    className={`signature-item ${sig.id === activeSignatureId ? "active" : ""}`}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        setActiveSignatureId(sig.id);
                                                        setActiveTextId(null);
                                                    }}
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData("signatureId", sig.id);
                                                    }}
                                                    draggable
                                                >
                                                    {sig.id === activeSignatureId && (
                                                        <button
                                                            className="remove-button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveSignature(sig.id);
                                                            }}
                                                            title="Remove Signature"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                    <img
                                                        src={sig.src}
                                                        alt="signature"
                                                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                                    />
                                                </ResizableBox>
                                            ))}

                                            {pageTexts.map((text) => (
                                                <ResizableBox
                                                    key={text.id}
                                                    width={text.width}
                                                    height={text.height}
                                                    minConstraints={[50, 20]}
                                                    maxConstraints={[400, 100]}
                                                    onResizeStop={(e, { size }) => {
                                                        setPlacedTexts((prev) =>
                                                            prev.map((t) =>
                                                                t.id === text.id ? { ...t, width: size.width, height: size.height } : t,
                                                            ),
                                                        );
                                                    }}
                                                    style={{
                                                        left: text.x,
                                                        top: text.y,
                                                        position: "absolute",
                                                        zIndex: text.id === activeTextId ? 50 : 10,
                                                    }}
                                                    className={`text-item ${text.id === activeTextId ? "active" : ""}`}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        setActiveTextId(text.id);
                                                        setActiveSignatureId(null);
                                                    }}
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData("textId", text.id);
                                                    }}
                                                    draggable
                                                >
                                                    {text.id === activeTextId && (
                                                        <>
                                                            <button
                                                                className="remove-button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveText(text.id);
                                                                }}
                                                                title="Remove Text"
                                                            >
                                                                ×
                                                            </button>
                                                            <input
                                                                type="range"
                                                                min="8"
                                                                max="48"
                                                                value={text.fontSize}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleUpdateTextFontSize(text.id, parseInt(e.target.value));
                                                                }}
                                                                style={{
                                                                    position: "absolute",
                                                                    bottom: -30,
                                                                    left: 0,
                                                                    width: "100%",
                                                                    zIndex: 70,
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                    <textarea
                                                        className="text-input"
                                                        value={text.value}
                                                        onChange={(e) => handleTextChange(text.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            fontSize: `${text.fontSize}px`,
                                                            color: text.fontColor,
                                                            pointerEvents: text.id === activeTextId ? "auto" : "none",
                                                        }}
                                                    />
                                                </ResizableBox>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
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

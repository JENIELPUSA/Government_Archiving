import React, { useEffect, useRef, useState } from "react";
import {
    ZoomIn,
    ZoomOut,
    Send,
    ArrowLeft,
    ArrowRight,
    Download,
    Signature,
    Upload,
    PenLine,
    TypeOutline,
    Plus,
    CheckCircle,
    Minus,
    Save,
} from "lucide-react";
import { Document, Page } from "react-pdf";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext } from "react";

const Sidebar = ({
    onZoomIn,
    onZoomOut,
    onDownload,
    onSave,
    scale,
    numPages,
    pageNumber,
    setPageNumber,
    fileUrl,
    uploadedSignature,
    setUploadedSignature,
    onAddText,
    activeTextId,
    activeText,
    onUpdateTextFontSize,
    fileData,
    onPreview,
    ApprovedReview,
}) => {
    const { role } = useContext(AuthContext);
    const [showSignatureOptions, setShowSignatureOptions] = useState(false);
    const [pdfInstance, setPdfInstance] = useState(null);
    const handleUploadSignature = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d", { willReadFrequently: true });

                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        if (r > 200 && g > 200 && b > 200) {
                            data[i + 3] = 0;
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);
                    const transparentBase64 = canvas.toDataURL("image/png");
                    setUploadedSignature(transparentBase64);
                };
            };
            reader.readAsDataURL(file);
        } else {
            const messageBox = document.createElement("div");
            messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        text-align: center;
        color: black;
      `;
            messageBox.innerHTML = `
        <p>Please upload a valid image file (PNG or JPG). PNG is recommended for transparency.</p>
        <button onclick="this.parentNode.remove()" style="margin-top: 15px; padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
      `;
            document.body.appendChild(messageBox);
        }
    };

    const handleFontSizeChange = (increment) => {
        if (activeTextId === null || !activeText) return;
        let newFontSize = (activeText.fontSize || 12) + increment;
        if (newFontSize < 8) newFontSize = 8;
        if (newFontSize > 72) newFontSize = 72;
        onUpdateTextFontSize(activeTextId, newFontSize);
    };

    useEffect(() => {
        return () => {
            if (pdfInstance?.destroy) {
                pdfInstance.destroy();
            }
        };
    }, [pdfInstance]);

    return (
        <nav className="print-hidden left-0 top-0 z-50 mb-8 flex max-h-[100vh] w-64 flex-col gap-4 overflow-y-auto rounded-[2rem] border-r bg-white/60 p-4 text-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] backdrop-blur-md dark:border-blue-700 dark:bg-slate-800/50 dark:text-white dark:backdrop-blur-md">
            {/* Zoom Controls */}
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onZoomIn}
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        title="Zoom In"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onZoomOut}
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        title="Zoom Out"
                    >
                        <ZoomOut className="h-5 w-5" />
                    </button>
                </div>
                <span className="rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-white">
                    Zoom: {(scale * 100).toFixed(0)}%
                </span>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-700">
                    <button
                        onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                        disabled={pageNumber <= 1}
                        className="flex items-center justify-center px-2 py-1 text-black disabled:opacity-50 dark:text-white"
                        title="Previous Page"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-black dark:text-white">
                        Page {pageNumber} of {numPages || 1}
                    </span>
                    <button
                        onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
                        disabled={pageNumber >= numPages}
                        className="flex items-center justify-center px-2 py-1 text-black disabled:opacity-50 dark:text-white"
                        title="Next Page"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
                {fileData.Archived !== true && (
                    <>
                        {!fileData.officer && fileData.status !== "Approved" && (
                            <button
                                onClick={onPreview}
                                className="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                title={fileData.status === "Draft" ? "Done Review" : "Save"}
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        )}
                        {role !== "admin" && fileData.status !== "Approved" && fileData.status !== "Rejected" &&  (
                            <button
                                onClick={() => setShowSignatureOptions((prev) => !prev)}
                                className="flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                title="Add Signature"
                            >
                                <Signature className="h-5 w-5" />
                            </button>
                        )}

                        {showSignatureOptions && (
                            <div className="col-span-2 flex flex-col gap-2">
                                <label className="flex cursor-pointer items-center justify-center rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                                    <Upload className="h-4 w-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUploadSignature}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    onClick={() => {
                                        const messageBox = document.createElement("div");
                                        messageBox.style.cssText = `
                      position: fixed;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      background-color: white;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                      z-index: 1000;
                      text-align: center;
                      color: black;
                    `;
                                        messageBox.innerHTML = `
                      <p>Create Signature functionality not yet implemented</p>
                      <button onclick="this.parentNode.remove()" style="margin-top: 15px; padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
                    `;
                                        document.body.appendChild(messageBox);
                                    }}
                                    className="flex items-center justify-center rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                >
                                    <PenLine className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        {role !== "admin" && fileData.status !== "Approved" && fileData.status !== "Rejected" &&  (
                            <button
                                onClick={onAddText}
                                className="col-span-2 flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                                title="Add Text"
                            >
                                <TypeOutline className="h-5 w-5" />
                            </button>
                        )}
                    </>
                )}
                <button
                    onClick={onDownload}
                    className="flex items-center justify-center rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
                    title="Download"
                >
                    <Download className="h-5 w-5" />
                </button>
                {role !== "admin" && (role === "officer" || fileData.status === "Pending")&& fileData.status !== "Rejected"  && (
                    <button
                        onClick={ApprovedReview}
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        title="Done Review"
                    >
                        <CheckCircle className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Font Size Controls */}
            {activeTextId !== null && activeText && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                    <span className="text-sm font-medium text-black dark:text-white">Font Size: {activeText.fontSize || 12}px</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleFontSizeChange(-1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            title="Decrease font size"
                            disabled={activeText.fontSize <= 8}
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleFontSizeChange(1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 p-1 text-white hover:bg-green-600"
                            title="Increase font size"
                            disabled={activeText.fontSize >= 72}
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Signature Preview */}
            {uploadedSignature && (
                <div className="mt-2 flex flex-col items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Preview:</p>
                    <img
                        src={uploadedSignature}
                        alt="Uploaded Signature"
                        className="mt-1 max-h-24 cursor-move rounded border border-gray-400 shadow"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("signature", uploadedSignature);
                        }}
                    />
                    <button
                        onClick={() => setUploadedSignature(null)}
                        className="mt-2 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                    >
                        Remove
                    </button>
                </div>
            )}

            {/* Page Previews with Enhanced Hover */}
            <div className="mt-4 flex max-h-[50vh] flex-col items-center gap-2 overflow-y-auto">
                <h3 className="text-center text-sm font-medium text-black dark:text-white">Page Previews</h3>
                {fileUrl && numPages > 0 && (
                    <Document
                        file={fileUrl}
                        onLoadError={(err) => console.error("PDF preview load error:", err)}
                    >
                        {Array.from({ length: numPages }, (_, index) => (
                            <div
                                key={index}
                                className={`cursor-pointer rounded-md p-1 transition-all duration-200 ease-in-out ${
                                    pageNumber === index + 1
                                        ? "bg-blue-600 text-white"
                                        : "hover:scale-[1.02] hover:bg-gray-200 hover:shadow-md hover:dark:bg-gray-700"
                                }`}
                                onClick={() => setPageNumber(index + 1)}
                            >
                                <Page
                                    pageNumber={index + 1}
                                    scale={0.2}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="border border-gray-600"
                                />
                                <p className="mt-1 text-center text-xs text-black dark:text-white">Page {index + 1}</p>
                            </div>
                        ))}
                    </Document>
                )}
            </div>
        </nav>
    );
};

export default Sidebar;

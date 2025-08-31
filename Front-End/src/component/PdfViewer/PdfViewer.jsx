import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?worker";
import Sidebar from "./SidebarPDF"; // Siguraduhin na tama ang path
import { AuthContext } from "../../contexts/AuthContext";
import ApprovedRejectForm from "../PdfViewer/ApproveRejectForm";
import approvedImage from "../../assets/logobond.png";
import Notes from "../../component/PdfViewer/notecomponents";
import LoadingOverlay from "../../ReusableFolder/LoadingOverlay";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import RecieverForm from "../AdminDashboard/Document/RecieverForm"; // Make sure this path is correct

pdfjs.GlobalWorkerOptions.workerPort = new pdfWorker();

const PdfViewer = () => {
    const { FetchOfficerFiles } = useContext(OfficerDisplayContext);
    const navigate = useNavigate();
    const location = useLocation();
    const fileData = location.state?.fileData;
    const { authToken } = useContext(AuthContext);
    const { fileId } = useParams();

    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const pdfWrapperRef = useRef(null); // Reference sa pangunahing PDF viewer scrollable container
    const pageContainerRef = useRef(null); // Reference sa partikular na div na naglalaman ng kasalukuyang pahina ng PDF
    const [uploadedSignature, setUploadedSignature] = useState(null); // Not used in the provided code
    const [placedSignatures, setPlacedSignatures] = useState([]);
    const [isApproved, setApproved] = useState(false);
    const [isApproveData, setApprovedData] = useState([]);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteData, setNoteData] = useState(null);
    const [placedTexts, setPlacedTexts] = useState([]);
    const [isRecieveForm, setRecieveForm] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");
    const originalPdfBytesRef = useRef(null);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    useEffect(() => {
        let canceled = false;
        let objectUrl;

        const fetchPDF = async () => {
            try {
                const meta = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${fileId}`);
                const fileData = meta.data.data;
                const status = fileData.status;

                const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/stream/${fileId}`, {
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
                            });
                        }

                        currentPdfBytes = await pdfDoc.save();
                    } catch (err) {
                        setModalStatus("failed");
                        setShowModal(true);
                        setCustomError(err?.message || "Failed to apply Approved watermark to the PDF.");
                        return; // stop execution
                    }
                }

                originalPdfBytesRef.current = currentPdfBytes;

                const objectUrl = URL.createObjectURL(new Blob([currentPdfBytes], { type: "application/pdf" }));
                if (!canceled) setFileUrl(objectUrl);
            } catch (error) {
                setModalStatus("failed");
                setShowModal(true);
                setCustomError(error.response?.data?.message || "Not Found Data!.");
            }
        };

        if (fileId) fetchPDF();

        return () => {
            canceled = true;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            setFileUrl(null);
        };
    }, [fileId]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const handleRejects = (ID, status) => {
        setNoteData({ ID, status });
        setShowNoteModal(true);
    };

    const handlePrint = async () => {
        try {
            const pdfDoc = await PDFDocument.load(originalPdfBytesRef.current);
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = url;
            document.body.appendChild(iframe);

            iframe.onload = () => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                // Tanggalin ang iframe at i-revoke ang URL kapag sarado na ang print dialog
                iframe.contentWindow.onafterprint = () => {
                    document.body.removeChild(iframe);
                    URL.revokeObjectURL(url);
                };
            };
        } catch (err) {
            console.error("❌ Error during PDF print:", err);
            alert("May error habang nagpi-print ng PDF. Tingnan ang console.");
        }
    };

    const handleZoomIn = () => setScale((prev) => prev + 0.2);
    const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5)); // Minimum scale ng 0.5

    const handleDownload = async () => {
        try {
            const pdfDoc = await PDFDocument.load(originalPdfBytesRef.current);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boundingBox = pageContainerRef.current?.getBoundingClientRect();
            const renderedPageWidth = boundingBox?.width ?? 1;
            const renderedPageHeight = boundingBox?.height ?? 1;

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();
                const scaleX = pdfPageWidth / renderedPageWidth;
                const scaleY = pdfPageHeight / renderedPageHeight;

                for (const sig of placedSignatures.filter((s) => s.page === i + 1)) {
                    const imageBytes = await fetch(sig.src).then((res) => res.arrayBuffer());
                    const pdfImage = sig.src.includes("png") ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);

                    const scaledX = sig.x * scaleX;
                    const scaledY = sig.y * scaleY;
                    const scaledWidth = sig.width * scaleX;
                    const scaledHeight = sig.height * scaleY;
                    const adjustedX = scaledX + 10;
                    const adjustedY = pdfPageHeight - scaledY - scaledHeight - 2;
                    page.drawImage(pdfImage, {
                        x: adjustedX,
                        y: adjustedY,
                        width: scaledWidth,
                        height: scaledHeight,
                    });
                }
                for (const text of placedTexts.filter((t) => t.page === i + 1)) {
                    const scaledX = text.x * scaleX;
                    const scaledY = text.y * scaleY;
                    const scaledFontSize = text.fontSize * scaleY;

                    const adjustedTextX = scaledX - 30;
                    const adjustedTextY = pdfPageHeight - scaledY - scaledFontSize - 16;

                    const calculatedMaxWidth = (text.width + 40) * scaleX;

                    // Measure actual text width and compute center
                    const textWidth = font.widthOfTextAtSize(text.value, scaledFontSize);
                    const centerX = adjustedTextX + (calculatedMaxWidth - textWidth) / 2;

                    console.log("🔤 Text:", {
                        id: text.id,
                        value: text.value,
                        originalX: text.x,
                        originalY: text.y,
                        scaledX,
                        scaledY,
                        adjustedTextX,
                        adjustedTextY,
                        textWidth,
                        centerX,
                        fontSize: text.fontSize,
                        scaledFontSize,
                        maxWidth: calculatedMaxWidth,
                    });

                    page.drawText(text.value, {
                        x: centerX,
                        y: adjustedTextY,
                        font,
                        size: scaledFontSize,
                        color: rgb(
                            parseInt(text.fontColor.slice(1, 3), 16) / 255,
                            parseInt(text.fontColor.slice(3, 5), 16) / 255,
                            parseInt(text.fontColor.slice(5, 7), 16) / 255,
                        ),
                        maxWidth: calculatedMaxWidth,
                        lineHeight: scaledFontSize * 1.2,
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "document_with_changes.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("❌ Error during PDF download:", err);
            alert("May error habang dini-download ang PDF. Tingnan ang console.");
        }
    };

    const handleSave = async () => {
        try {
            const pdfDoc = await PDFDocument.load(originalPdfBytesRef.current);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const boundingBox = pageContainerRef.current?.getBoundingClientRect();
            const renderedPageWidth = boundingBox?.width ?? 1;
            const renderedPageHeight = boundingBox?.height ?? 1;

            // Apply signatures and text
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();
                const scaleX = pdfPageWidth / renderedPageWidth;
                const scaleY = pdfPageHeight / renderedPageHeight;

                // Signatures - with centered logo for approved
                for (const sig of placedSignatures.filter((s) => s.page === i + 1)) {
                    const imageBytes = await fetch(sig.src).then((res) => res.arrayBuffer());
                    const pdfImage = sig.src.includes("png") ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);

                    const scaledX = sig.x * scaleX;
                    const scaledY = sig.y * scaleY;
                    const scaledWidth = sig.width * scaleX;
                    const scaledHeight = sig.height * scaleY;
                    const adjustedY = pdfPageHeight - scaledY - scaledHeight - 2;

                    // Center the approved logo horizontally
                    const adjustedX = sig.isApprovedLogo
                        ? (pdfPageWidth - scaledWidth) / 10 // Center horizontally
                        : scaledX + 70; // Regular positioning
                    page.drawImage(pdfImage, {
                        x: adjustedX,
                        y: adjustedY,
                        width: scaledWidth,
                        height: scaledHeight,
                    });
                }

                // Text elements
                for (const text of placedTexts.filter((t) => t.page === i + 1)) {
                    const scaledX = text.x * scaleX;
                    const scaledY = text.y * scaleY;
                    const scaledFontSize = text.fontSize * scaleY;
                    const adjustedTextY = pdfPageHeight - scaledY - scaledFontSize - 16;
                    const calculatedMaxWidth = (text.width + 40) * scaleX;
                    const textWidth = font.widthOfTextAtSize(text.value, scaledFontSize);

                    // Center text horizontally
                    const centerX = scaledX + (calculatedMaxWidth - textWidth) / 2;

                    page.drawText(text.value, {
                        x: centerX,
                        y: adjustedTextY,
                        font,
                        size: scaledFontSize,
                        color: rgb(
                            parseInt(text.fontColor.slice(1, 3), 16) / 255,
                            parseInt(text.fontColor.slice(3, 5), 16) / 255,
                            parseInt(text.fontColor.slice(5, 7), 16) / 255,
                        ),
                        maxWidth: calculatedMaxWidth,
                        lineHeight: scaledFontSize * 1.2,
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const originalName = fileData?.fileName || "document.pdf";
            const baseMatch = originalName.match(/^(.*?)(?:_v(\d+))?\.pdf$/i);
            let baseName = baseMatch?.[1] || "document";
            let currentVersion = baseMatch?.[2] ? parseInt(baseMatch[2]) : 0;
            const newVersion = currentVersion + 1;
            const newFilename = `${baseName}_v${newVersion}.pdf`;
            const formData = new FormData();
            formData.append("file", blob, newFilename);
            formData.append("fileId", fileData._id);
            formData.append("title", fileData.title);
            formData.append("category", fileData.categoryID);
            formData.append("summary", fileData.summary || "");
            formData.append("resolutionNumber", fileData.resolutionNumber || "");
            formData.append("dateOfResolution", fileData.dateOfResolution || "");
            formData.append("admin", fileData.admin);
            formData.append("status", "Approved");
            if (fileData.author) {
                formData.append("author", fileData.author || "");
            }
            if (fileData.approverID) {
                formData.append("approverID", fileData.approverID);
            }
            if (fileData.officer) {
                formData.append("officer", fileData.officer);
            }

            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/UpdateCloudinary`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                FetchOfficerFiles();
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1500);
            } else {
                alert("⚠️ Update failed. Please try again.");
            }
        } catch (err) {
            console.error("❌ Error during PDF save:", err);

            if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.message || "Unknown server error";
                const errorDetails = err.response.data?.error;

                console.error("📡 Server error:", {
                    status,
                    message,
                    errorDetails,
                });

                alert(`❗Server Error (${status}): ${message}`);
            } else if (err.request) {
                console.error("📭 No response received:", err.request);
                alert("❗Walang natanggap na response mula sa server.");
            } else {
                console.error("⚠️ Request setup error:", err.message);
                alert("❗May nangyaring error habang naghahanda ng request.");
            }
        }
    };
    const handleApprovedReject = () => {
        setApproved(true);
        setApprovedData(fileData);
    };

    const handleCloseModal = () => {
        setRecieveForm(false);
        setApproved(false);
        setShowNoteModal(false);
    };

    const hanndlepreview = () => {
        setRecieveForm(true);
    };

    return (
        <div className="flex h-screen w-full">
            <div
                className="flex flex-1 justify-center overflow-y-auto"
                ref={pdfWrapperRef}
            >
                {fileUrl ? (
                    <div className="w-full max-w-4xl">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                        >
                            <div
                                ref={pageContainerRef}
                                className="relative flex w-full items-center justify-center"
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="border border-gray-200"
                                />
                            </div>
                        </Document>
                    </div>
                ) : (
                    <LoadingOverlay message="Loading PDF..." />
                )}
            </div>

            {/* Sidebar - nasa kanan */}
            <div className="w-[300px]">
                <Sidebar
                    onPrint={handlePrint}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onDownload={handleDownload}
                    onSave={handleSave}
                    scale={scale}
                    numPages={numPages}
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    fileUrl={fileUrl}
                    fileData={fileData}
                    onPreview={hanndlepreview}
                    ApprovedReview={handleApprovedReject}
                />
            </div>

            {/* Modals and Popups */}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
            <Notes
                data={noteData}
                isOpen={showNoteModal}
                onClose={handleCloseModal}
            />
            <RecieverForm
                isOpen={isRecieveForm}
                onClose={handleCloseModal}
                categoryData={fileData}
            />
            <ApprovedRejectForm
                isOpen={isApproved}
                onClose={handleCloseModal}
                fileData={isApproveData}
                handleApprove={handleSave}
                handleRejects={handleRejects}
            />
        </div>
    );
};

export default PdfViewer;

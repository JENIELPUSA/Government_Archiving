import React, { useEffect, useState, useRef, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { PDFDocument, rgb } from "pdf-lib";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?worker";
import Sidebar from "./SidebarPDF";
import { AuthContext } from "../../contexts/AuthContext";
import ApprovedRejectForm from "../PdfViewer/ApproveRejectForm";
import approvedImage from "../../assets/logobond.png";
import Notes from "../../component/PdfViewer/notecomponents";
import LoadingOverlay from "../../ReusableFolder/LoadingOverlay";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import RecieverForm from "../AdminDashboard/Document/RecieverForm";

pdfjs.GlobalWorkerOptions.workerPort = new pdfWorker();

const PdfViewer = () => {
    const { FetchOfficerFiles } = useContext(OfficerDisplayContext);
    const navigate = useNavigate();
    const location = useLocation();
    const fileData = location.state?.fileData;
    const { authToken } = useContext(AuthContext);
    const { fileId } = useParams();
    const pdfTaskRef = useRef(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const pdfWrapperRef = useRef(null);
    const pageContainerRef = useRef(null);
    const [isApproved, setApproved] = useState(false);
    const [isApproveData, setApprovedData] = useState([]);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteData, setNoteData] = useState(null);
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
        if (!fileId) return;

        let canceled = false;
        let objectUrl;

        const fetchPDF = async () => {
            try {
                const [metaRes, streamRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${fileId}`),
                    axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/stream/${fileId}`, { responseType: "blob" }),
                ]);

                const fileData = metaRes.data.data;
                let pdfBytes = await streamRes.data.arrayBuffer();

                if (fileData.status === "Approved") {
                    try {
                        const pdfDoc = await PDFDocument.load(pdfBytes);
                        const pages = pdfDoc.getPages();
                        const imageBytes = await fetch(approvedImage).then((r) => r.arrayBuffer());
                        const pngImage = await pdfDoc.embedPng(imageBytes);

                        for (const page of pages) {
                            const { width, height } = page.getSize();
                            page.drawImage(pngImage, {
                                x: (width - 400) / 2 + 10,
                                y: (height - 400) / 2,
                                width: 400,
                                height: 400,
                                opacity: 0.4,
                            });
                        }

                        pdfBytes = await pdfDoc.save();
                    } catch (err) {
                        if (!canceled) {
                            setModalStatus("failed");
                            setShowModal(true);
                            setCustomError(err?.message || "Failed to apply Approved watermark to the PDF.");
                        }
                        return;
                    }
                }

                originalPdfBytesRef.current = pdfBytes;
                objectUrl = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));

                if (!canceled) setFileUrl(objectUrl);
            } catch (err) {
                if (!canceled) {
                    setModalStatus("failed");
                    setShowModal(true);
                    setCustomError(err.response?.data?.message || "Not Found Data!.");
                }
            }
        };

        fetchPDF();

        return () => {
            canceled = true;

            if (pdfTaskRef.current) {
                pdfTaskRef.current.destroy();
                pdfTaskRef.current = null;
            }

            if (objectUrl) URL.revokeObjectURL(objectUrl);
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
    const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

    const handleDownload = async () => {
        try {
            const pdfDoc = await PDFDocument.load(originalPdfBytesRef.current);
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "document.pdf";
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
                alert(`❗Server Error (${err.response.status}): ${err.response.data?.message || "Unknown error"}`);
            } else {
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

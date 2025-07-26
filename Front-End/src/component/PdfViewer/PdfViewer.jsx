import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import axios from "axios";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?worker";
import Sidebar from "./SidebarPDF"; // Siguraduhin na tama ang path
import { ResizableBox } from "react-resizable";
import { AuthContext } from "../../contexts/AuthContext";
import "react-resizable/css/styles.css";
import { useLocation } from "react-router-dom";
import RecieverForm from "../AdminDashboard/Document/RecieverForm";
import { DepartmentContext } from "../../contexts/DepartmentContext/DepartmentContext";
import ApprovedRejectForm from "../PdfViewer/ApproveRejectForm";
import approvedImage from "../../assets/approved-logo.png";
import Notes from "../../component/PdfViewer/notecomponents";
import LoadingOverlay from "../../ReusableFolder/LoadingOverlay";
pdfjs.GlobalWorkerOptions.workerPort = new pdfWorker();
import SuccessFailed from "../../ReusableFolder/SuccessandField";
const PdfViewer = () => {
    const location = useLocation();
    const { isCategory } = useContext(DepartmentContext);
    const fileData = location.state?.fileData;
    const { authToken } = useContext(AuthContext);
    const { fileId } = useParams();
    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const pdfWrapperRef = useRef(null); // Reference sa pangunahing PDF viewer scrollable container
    const pageContainerRef = useRef(null); // Reference sa partikular na div na naglalaman ng kasalukuyang pahina ng PDF
    const [uploadedSignature, setUploadedSignature] = useState(null);
    const [placedSignatures, setPlacedSignatures] = useState([]);
    const nextSignatureId = useRef(0);
    const [isApproved, setApproved] = useState(false);
    const [isApproveData, setApprovedData] = useState([]);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteData, setNoteData] = useState(null);
    const [placedTexts, setPlacedTexts] = useState([]);
    const nextTextId = useRef(0);
    const [isRecieveForm, setRecieveForm] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const draggingSignatureId = useRef(null);
    const [activeSignatureId, setActiveSignatureId] = useState(null);
    const [activeTextId, setActiveTextId] = useState(null);
    const [hoveredSignatureId, setHoveredSignatureId] = useState(null);
    const [hoveredTextId, setHoveredTextId] = useState(null);
    const originalPdfBytesRef = useRef(null);

    useEffect(() => {
        let canceled = false;
        let objectUrl;

        const fetchPDF = async () => {
            try {
                const meta = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${fileId}`);
                const { status } = meta.data;

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
                                rotate: degrees(45),
                            });
                        }

                        currentPdfBytes = await pdfDoc.save();
                    } catch (err) {
                        console.error("❗ Failed to add image watermark. Using original PDF.", err);
                    }
                }

                originalPdfBytesRef.current = currentPdfBytes;

                const objectUrl = URL.createObjectURL(new Blob([currentPdfBytes], { type: "application/pdf" }));
                if (!canceled) setFileUrl(objectUrl);
            } catch (error) {
                console.error("❗ Failed to load PDF:", error);
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

                    console.log("🖋 Signature:", {
                        id: sig.id,
                        originalX: sig.x,
                        originalY: sig.y,
                        scaledX,
                        scaledY,
                        adjustedX,
                        adjustedY,
                        scaledWidth,
                        scaledHeight,
                    });

                    page.drawImage(pdfImage, {
                        x: adjustedX,
                        y: adjustedY,
                        width: scaledWidth,
                        height: scaledHeight,
                    });
                }

                // TEXTS (CENTERED)
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
        if (!originalPdfBytesRef.current) {
            alert("❗Hindi pa na-load ang orihinal na PDF.");
            return;
        }

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

                // Signatures
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

                // Text
                for (const text of placedTexts.filter((t) => t.page === i + 1)) {
                    const scaledX = text.x * scaleX;
                    const scaledY = text.y * scaleY;
                    const scaledFontSize = text.fontSize * scaleY;
                    const adjustedTextX = scaledX - 30;
                    const adjustedTextY = pdfPageHeight - scaledY - scaledFontSize - 16;
                    const calculatedMaxWidth = (text.width + 40) * scaleX;
                    const textWidth = font.widthOfTextAtSize(text.value, scaledFontSize);
                    const centerX = adjustedTextX + (calculatedMaxWidth - textWidth) / 2;

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
            const originalName = fileData?.originalname || "document";
            const baseName = originalName.replace(/\.[^/.]+$/, ""); // remove extension like .pdf
            const newFilename = `${baseName}_v1.pdf`;
            const formData = new FormData();
            formData.append("file", blob, newFilename); // <- dynamic filename
            formData.append("fileId", fileData._id);
            formData.append("title", fileData.title);
            formData.append("category", fileData.categoryID);
            formData.append("department", fileData.departmentID);
            formData.append("summary", fileData.summary || "");
            formData.append("author", fileData.author || "");
            formData.append("admin", fileData.admin);
            formData.append("officer", fileData.officer);
            formData.append("status", "Approved");

            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/UpdateCloudinary`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
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

    const handleRemoveSignature = (idToRemove) => {
        setPlacedSignatures((prevSignatures) => prevSignatures.filter((sig) => sig.id !== idToRemove));
        if (activeSignatureId === idToRemove) {
            setActiveSignatureId(null);
        }
    };
    const handleApprovedReject = () => {
        setApproved(true);
        setApprovedData(fileData);
    };
    const handleSignatureClick = (e, sigId) => {
        e.stopPropagation(); // Pigilan ang pag-click ng dokumento mula sa pag-deselect
        setActiveSignatureId(sigId);
        setActiveTextId(null); // I-deselect ang text
    };

    const handleRemoveText = (idToRemove) => {
        setPlacedTexts((prevTexts) => prevTexts.filter((text) => text.id !== idToRemove));
        if (activeTextId === idToRemove) {
            setActiveTextId(null);
        }
    };

    const handleTextClick = (e, textId) => {
        e.stopPropagation(); // Pigilan ang pag-click ng dokumento mula sa pag-deselect
        setActiveTextId(textId);
        setActiveSignatureId(null); // I-deselect ang pirma
    };

    const handleCloseModal = () => {
        setRecieveForm(false);
        setApproved(false);
        setShowNoteModal(false);
    };

    const hanndlepreview = () => {
        setRecieveForm(true);
    };

    const handleAddText = () => {
        const defaultWidth = 150;
        const defaultHeight = 30;

        let initialX = 50; // Fallback default
        let initialY = 50; // Fallback default

        // Kalkulahin ang gitnang posisyon kung available ang pageContainerRef
        if (pageContainerRef.current) {
            // Mas maaasahan na makuha ang mga dimensyon ng aktwal na canvas sa loob ng page container
            const canvas = pageContainerRef.current.querySelector(".react-pdf__Page__canvas");

            if (canvas) {
                const pageWidth = canvas.offsetWidth;
                const pageHeight = canvas.offsetHeight;
                initialX = pageWidth / 2 - defaultWidth / 2;
                initialY = pageHeight / 2 - defaultHeight / 2;
            } else {
                // Fallback sa mga dimensyon ng container kung hindi agad makita ang canvas (hindi gaanong ideal)
                const pageRect = pageContainerRef.current.getBoundingClientRect();
                initialX = pageRect.width / 2 - defaultWidth / 2;
                initialY = pageRect.height / 2 - defaultHeight / 2;
            }
        }

        const newText = {
            id: nextTextId.current++,
            page: pageNumber,
            x: initialX,
            y: initialY,
            width: defaultWidth,
            height: defaultHeight,
            value: "Ilagay ang text dito", // Changed default text to Filipino
            fontSize: 12, // Paunang laki ng font
            fontColor: "#000000",
        };
        setPlacedTexts((prev) => [...prev, newText]);
        setActiveTextId(newText.id); // Awtomatikong piliin ang bagong text box
        setActiveSignatureId(null);
    };

    // Function para i-update ang nilalaman ng text ng isang text box
    const handleTextChange = (id, newValue) => {
        setPlacedTexts((prev) => prev.map((text) => (text.id === id ? { ...text, value: newValue } : text)));
    };

    // Function para i-update ang laki ng font ng isang text box
    const handleUpdateTextFontSize = (id, newFontSize) => {
        setPlacedTexts((prev) => prev.map((text) => (text.id === id ? { ...text, fontSize: newFontSize } : text)));
    };

    // I-deselect ang anumang aktibong item kapag nag-click sa labas
    const handleDocumentClick = () => {
        setActiveSignatureId(null);
        setActiveTextId(null);
    };

    // Keyboard navigation at pagtanggal para sa mga aktibong item
    const handleKeyDown = useCallback(
        (e) => {
            const step = 5; // Hakbang ng paggalaw para sa mga arrow key

            // Pangasiwaan ang paggalaw/pagtanggal ng pirma
            if (activeSignatureId !== null) {
                setPlacedSignatures((prevSignatures) => {
                    const updatedSignatures = prevSignatures.map((sig) => {
                        if (sig.id === activeSignatureId) {
                            let newX = sig.x;
                            let newY = sig.y;

                            switch (e.key) {
                                case "ArrowUp":
                                    newY -= step;
                                    e.preventDefault();
                                    break;
                                case "ArrowDown":
                                    newY += step;
                                    e.preventDefault();
                                    break;
                                case "ArrowLeft":
                                    newX -= step;
                                    e.preventDefault();
                                    break;
                                case "ArrowRight":
                                    newX += step;
                                    e.preventDefault();
                                    break;
                                case "Delete":
                                case "Backspace": // Parehong delete keys
                                    handleRemoveSignature(sig.id);
                                    e.preventDefault();
                                    return null; // Markahan para tanggalin
                                default:
                                    return sig; // Walang pagbabago
                            }
                            return { ...sig, x: newX, y: newY };
                        }
                        return sig;
                    });
                    return updatedSignatures.filter(Boolean); // I-filter ang mga null (tinanggal na item)
                });
            }

            // Pangasiwaan ang paggalaw/pagtanggal ng text box
            if (activeTextId !== null) {
                setPlacedTexts((prevTexts) => {
                    const updatedTexts = prevTexts.map((text) => {
                        if (text.id === activeTextId) {
                            let newX = text.x;
                            let newY = text.y;

                            switch (e.key) {
                                case "ArrowUp":
                                    newY -= step;
                                    e.preventDefault();
                                    break;
                                case "ArrowDown":
                                    newY += step;
                                    e.preventDefault();
                                    break;
                                case "ArrowLeft":
                                    newX -= step;
                                    e.preventDefault();
                                    break;
                                case "ArrowRight":
                                    newX += step;
                                    e.preventDefault();
                                    break;
                                case "Delete":
                                case "Backspace":
                                    handleRemoveText(text.id);
                                    e.preventDefault();
                                    return null;
                                default:
                                    return text;
                            }
                            return { ...text, x: newX, y: newY };
                        }
                        return text;
                    });
                    return updatedTexts.filter(Boolean);
                });
            }
        },
        [activeSignatureId, activeTextId, handleRemoveSignature, handleRemoveText],
    );

    // Magdagdag/magtanggal ng global event listeners para sa mga click at key press
    useEffect(() => {
        document.addEventListener("click", handleDocumentClick);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleDocumentClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]); // I-run muli kung magbabago ang handleKeyDown (dahil sa dependencies nito)

    // Kunin ang aktibong text object para ipasa ang laki ng font nito sa sidebar
    const activeText = placedTexts.find((t) => t.id === activeTextId);

    return (
        <>
            <style>
                {`
        /* Mga Estilo para sa Pag-print */
        @media print {
          .print-hidden { display: none !important; }
          .print-pdf-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .print-pdf-container .react-pdf__Page__canvas {
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          body {
            margin: 0 !important;
          }
        }
        /* Pangunahing Estilo ng Container ng PDF Viewer */
        .pdf-viewer-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        /* Container para sa Kasalukuyang Pahina ng PDF */
        .pdf-page-container {
          height: 100%; /* Tinitiyak na kukuha ito ng buong taas sa loob ng flex parent nito */
          display: flex;
          justify-content: center;
          align-items: center;
        }
        /* Karaniwang Estilo para sa mga Draggable/Resizable na Item */
        .signature-item, .text-item {
          transition: left 0.1s ease-out, top 0.1s ease-out; /* Maayos na paggalaw */
          position: absolute;
          border: 1px solid transparent; /* Default na walang border */
          box-sizing: border-box; /* Isama ang padding/border sa lapad/taas */
        }
        /* Estilo ng Border ng Aktibong Item */
        .signature-item.active, .text-item.active {
            border: 1px dashed #007bff; /* Dashed na asul na border para sa mga aktibong item */
        }
        /* Itago ang react-resizable handles bilang default */
        .react-resizable-handle {
          opacity: 0;
          transition: opacity 0.2s ease-in-out; /* Maayos na transition para sa mga handle */
        }
        /* Ipakita ang react-resizable handles kapag aktibo ang item O naka-hover */
        .signature-item:hover .react-resizable-handle,
        .text-item:hover .react-resizable-handle,
        .signature-item.active .react-resizable-handle,
        .text-item.active .react-resizable-handle {
          opacity: 1;
        }
        /* Estilo para sa remove button */
        .remove-button {
          position: absolute;
          top: -10px;
          right: -10px;
          background-color: #ef4444; /* Kulay pula */
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          border: none;
          padding: 0;
          line-height: 1; /* Para sa vertical alignment ng 'x' */
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 10; /* Tiyakin na nasa itaas ito ng iba pang mga elemento */
        }
        .remove-button:hover {
          background-color: #dc2626; /* Mas madilim na pula sa hover */
        }
        /* Estilo para sa text input sa loob ng text box */
        .text-input {
            width: 100%;
            height: 100%;
            border: none;
            background: transparent;
            padding: 2px;
            resize: none; /* I-disable ang native textarea resize handle */
            font-family: sans-serif; /* Default na font */
            color: #000; /* Default na kulay ng text */
        }
        .text-input:focus {
            outline: none; /* Tanggalin ang outline sa focus */
            border: none; /* Tiyakin na walang border sa focus */
        }
      `}
            </style>

            <div className="flex h-screen w-full">
                {/* Pangunahing Lugar ng Nilalaman ng PDF */}
                <div
                    className="pdf-viewer-container flex min-h-[130vh] flex-1 justify-center overflow-y-auto"
                    ref={pdfWrapperRef}
                    onClick={handleDocumentClick} // I-deselect ang mga item sa pag-click sa background
                >
                    {fileUrl ? (
                        <div className="print-pdf-container w-full max-w-4xl overflow-hidden">
                            <Document
                                file={fileUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                            >
                                <div
                                    ref={pageContainerRef}
                                    className="pdf-page-container print-pdf-container relative w-full"
                                    onDragOver={(e) => e.preventDefault()} // Payagan ang drops
                                    onDrop={(e) => {
                                        // Logic para sa pag-drop ng bago o umiiral na mga pirma/text box
                                        const sigData = e.dataTransfer.getData("signature");
                                        const sigIdBeingMoved = e.dataTransfer.getData("signatureId");
                                        const textData = e.dataTransfer.getData("text");
                                        const textIdBeingMoved = e.dataTransfer.getData("textId");

                                        const rect = e.currentTarget.getBoundingClientRect(); // Kunin ang mga hangganan ng drop target
                                        const x = e.clientX - rect.left; // Kalkulahin ang X na may kaugnayan sa pahina
                                        const y = e.clientY - rect.top; // Kalkulahin ang Y na may kaugnayan sa pahina

                                        if (sigData && !sigIdBeingMoved) {
                                            // Nag-drop ng bagong pirma mula sa sidebar
                                            setPlacedSignatures((prev) => [
                                                ...prev,
                                                {
                                                    id: nextSignatureId.current++,
                                                    page: pageNumber,
                                                    x,
                                                    y,
                                                    src: sigData,
                                                    width: 120, // Default na lapad
                                                    height: 60, // Default na taas
                                                },
                                            ]);
                                            setActiveSignatureId(nextSignatureId.current - 1);
                                            setActiveTextId(null);
                                        } else if (sigIdBeingMoved) {
                                            // Naglilipat ng umiiral na pirma sa pahina
                                            const signatureId = parseInt(sigIdBeingMoved);
                                            const indexToUpdate = placedSignatures.findIndex((s) => s.id === signatureId);

                                            if (indexToUpdate !== -1) {
                                                setPlacedSignatures((prev) => {
                                                    const updated = [...prev];
                                                    updated[indexToUpdate] = {
                                                        ...updated[indexToUpdate],
                                                        x,
                                                        y,
                                                    };
                                                    return updated;
                                                });
                                                setActiveSignatureId(signatureId);
                                                setActiveTextId(null);
                                            }
                                        } else if (textData && !textIdBeingMoved) {
                                            // Nag-drop ng bagong text box (bagaman karaniwang idinadagdag ng button)
                                            const newText = {
                                                id: nextTextId.current++,
                                                page: pageNumber,
                                                x,
                                                y,
                                                width: 150,
                                                height: 30,
                                                value: textData,
                                                fontSize: 12,
                                                fontColor: "#000000",
                                            };
                                            setPlacedTexts((prev) => [...prev, newText]);
                                            setActiveTextId(newText.id);
                                            setActiveSignatureId(null);
                                        } else if (textIdBeingMoved) {
                                            // Naglilipat ng umiiral na text box sa pahina
                                            const textId = parseInt(textIdBeingMoved);
                                            const indexToUpdate = placedTexts.findIndex((t) => t.id === textId);

                                            if (indexToUpdate !== -1) {
                                                setPlacedTexts((prev) => {
                                                    const updated = [...prev];
                                                    updated[indexToUpdate] = {
                                                        ...updated[indexToUpdate],
                                                        x,
                                                        y,
                                                    };
                                                    return updated;
                                                });
                                                setActiveTextId(textId);
                                                setActiveSignatureId(null);
                                            }
                                        }
                                        draggingSignatureId.current = null; // I-reset ang dragging state
                                    }}
                                >
                                    <Page
                                        pageNumber={pageNumber}
                                        scale={scale}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="border border-gray-200"
                                    />

                                    {/* I-render ang mga Inilagay na Pirma */}
                                    {placedSignatures
                                        .filter((sig) => sig.page === pageNumber)
                                        .map((sig) => (
                                            <div
                                                key={sig.id}
                                                className={`signature-item ${activeSignatureId === sig.id ? "active" : ""}`}
                                                style={{ position: "absolute", top: sig.y, left: sig.x }}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.stopPropagation(); // Pigilan ang pag-drag ng dokumento mula sa panghihimasok
                                                    e.dataTransfer.setData("signatureId", sig.id); // Itakda ang ID para sa paglilipat
                                                    draggingSignatureId.current = sig.id;
                                                    setActiveSignatureId(sig.id);
                                                    setActiveTextId(null);
                                                }}
                                                onDragEnd={(e) => {
                                                    draggingSignatureId.current = null;
                                                }}
                                                onClick={(e) => handleSignatureClick(e, sig.id)}
                                                onMouseEnter={() => setHoveredSignatureId(sig.id)} // Itakda ang hovered state
                                                onMouseLeave={() => setHoveredSignatureId(null)} // I-clear ang hovered state
                                            >
                                                {activeSignatureId === sig.id && ( // Ipakita ang remove button lamang kapag aktibo
                                                    <button
                                                        className="remove-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveSignature(sig.id);
                                                        }}
                                                        title="Tanggalin ang pirma"
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                                <ResizableBox
                                                    width={sig.width || 120}
                                                    height={sig.height || 60}
                                                    minConstraints={[50, 30]} // Minimum na laki
                                                    maxConstraints={[300, 150]} // Maximum na laki
                                                    // Ipakita ang mga handle lamang kung aktibo O naka-hover
                                                    resizeHandles={activeSignatureId === sig.id || hoveredSignatureId === sig.id ? ["se"] : []}
                                                    onResizeStop={(e, data) => {
                                                        const indexToUpdate = placedSignatures.findIndex((s) => s.id === sig.id);
                                                        if (indexToUpdate === -1) return;

                                                        setPlacedSignatures((prev) => {
                                                            const updated = [...prev];
                                                            updated[indexToUpdate] = {
                                                                ...updated[indexToUpdate],
                                                                width: data.size.width,
                                                                height: data.size.height,
                                                            };
                                                            return updated;
                                                        });
                                                        setActiveSignatureId(sig.id); // Piliin muli pagkatapos ng resize
                                                    }}
                                                >
                                                    <img
                                                        src={sig.src}
                                                        alt="pirma"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "contain", // Tiyakin na kasya ang pirma sa loob ng box
                                                            cursor: "grab",
                                                        }}
                                                    />
                                                </ResizableBox>
                                            </div>
                                        ))}

                                    {/* I-render ang mga Inilagay na Text */}
                                    {placedTexts
                                        .filter((text) => text.page === pageNumber)
                                        .map((text) => (
                                            <div
                                                key={text.id}
                                                className={`text-item ${activeTextId === text.id ? "active" : ""}`}
                                                style={{ position: "absolute", top: text.y, left: text.x }}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.stopPropagation();
                                                    e.dataTransfer.setData("textId", text.id);
                                                    e.dataTransfer.setData("text", text.value); // Ipasa ang kasalukuyang text value para sa consistency
                                                    setActiveTextId(text.id);
                                                    setActiveSignatureId(null);
                                                }}
                                                onDragEnd={(e) => {
                                                    // Walang partikular na aksyon na kailangan dito
                                                }}
                                                onClick={(e) => handleTextClick(e, text.id)}
                                                onMouseEnter={() => setHoveredTextId(text.id)} // Itakda ang hovered state
                                                onMouseLeave={() => setHoveredTextId(null)} // I-clear ang hovered state
                                            >
                                                {activeTextId === text.id && ( // Ipakita ang remove button lamang kapag aktibo
                                                    <button
                                                        className="remove-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveText(text.id);
                                                        }}
                                                        title="Tanggalin ang text box"
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                                <ResizableBox
                                                    width={text.width}
                                                    height={text.height}
                                                    minConstraints={[50, 20]}
                                                    maxConstraints={[400, 100]}
                                                    // Ipakita ang mga handle lamang kung aktibo O naka-hover
                                                    resizeHandles={activeTextId === text.id || hoveredTextId === text.id ? ["se"] : []}
                                                    onResizeStop={(e, data) => {
                                                        const indexToUpdate = placedTexts.findIndex((t) => t.id === text.id);
                                                        if (indexToUpdate === -1) return;

                                                        setPlacedTexts((prev) => {
                                                            const updated = [...prev];
                                                            updated[indexToUpdate] = {
                                                                ...updated[indexToUpdate],
                                                                width: data.size.width,
                                                                height: data.size.height,
                                                            };
                                                            return updated;
                                                        });
                                                        setActiveTextId(text.id); // Piliin muli pagkatapos ng resize
                                                    }}
                                                >
                                                    <textarea
                                                        className="text-input"
                                                        value={text.value}
                                                        onChange={(e) => handleTextChange(text.id, e.target.value)}
                                                        style={{
                                                            fontSize: `${text.fontSize}px`, // I-apply ang dynamic na laki ng font
                                                            color: text.fontColor,
                                                            // Tiyakin na ang text ay vertically centered kung pinapayagan ng taas
                                                            lineHeight: `${text.height}px`, // Tumutulong sa single-line vertical centering
                                                            overflow: "hidden", // Itago ang scrollbar kung umaapaw ang text
                                                        }}
                                                        onFocus={(e) => e.stopPropagation()} // Pigilan ang pag-deselect kapag nagpo-focus sa textarea
                                                        onClick={(e) => e.stopPropagation()} // Pigilan ang pag-deselect kapag nagki-click sa textarea
                                                    />
                                                </ResizableBox>
                                            </div>
                                        ))}
                                </div>
                            </Document>
                        </div>
                    ) : (
                        <LoadingOverlay message="Loading PDF..." />
                    )}
                </div>

                <SuccessFailed
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    status={modalStatus}
                />

                <Sidebar
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onDownload={handleDownload}
                    onSave={handleSave}
                    scale={scale}
                    numPages={numPages}
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    fileUrl={fileUrl}
                    uploadedSignature={uploadedSignature}
                    setUploadedSignature={setUploadedSignature}
                    onAddText={handleAddText}
                    activeTextId={activeTextId}
                    activeText={activeText}
                    onUpdateTextFontSize={handleUpdateTextFontSize}
                    fileData={fileData}
                    onPreview={hanndlepreview}
                    ApprovedReview={handleApprovedReject}
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
        </>
    );
};

export default PdfViewer;

import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?worker";
import LoadingOverlay from "../../ReusableFolder/LoadingOverlay";

// Components
import Sidebar from "./SidebarPDF";
import ApprovedRejectForm from "../PdfViewer/ApproveRejectForm";
import Notes from "../../component/PdfViewer/notecomponents";

import SuccessFailed from "../../ReusableFolder/SuccessandField";
import RecieverForm from "../AdminDashboard/Document/RecieverForm";

// Contexts & Assets
import { AuthContext } from "../../contexts/AuthContext";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext";
import approvedImage from "../../assets/logobond.png";

// Icons
import { X, FileText, Shield, Lock, Loader2, Clock, Database, ShieldCheck, Cloud, Key, CheckCircle } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerPort = new pdfWorker();

/**
 * DEBOUNCE UTILITY HOOK
 */
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

/**
 * PROFESSIONAL LOADING SCREEN COMPONENT - COMPACT VERSION
 * Nagpapakita ng elegant at informative loading experience sa mas compact na design
 */
const ProfessionalLoadingScreen = ({ progress = 0, currentStep = "Initializing", steps = [], estimatedTime = null, fileName = "" }) => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Animated Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 -left-1/3 h-2/3 w-2/3 animate-pulse-slow bg-gradient-to-r from-blue-50/20 via-transparent to-blue-50/10 dark:from-blue-900/10 dark:via-transparent dark:to-blue-900/5 rounded-full"></div>
        <div className="absolute -bottom-1/3 -right-1/3 h-2/3 w-2/3 animate-pulse-slower bg-gradient-to-l from-gray-50/10 via-transparent to-gray-50/5 dark:from-gray-800/10 dark:via-transparent dark:to-gray-800/5 rounded-full"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                              linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}></div>
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Logo/Brand Area - Compact */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-4">
            {/* Outer Glow */}
            <div className="absolute -inset-3 animate-ping rounded-full bg-blue-100/30 dark:bg-blue-900/20"></div>
            
            {/* Animated Rings */}
            <div className="absolute -inset-2 rounded-full border-2 border-blue-200/50 dark:border-blue-700/30 animate-spin-slow"></div>
            
            {/* Main Icon */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 dark:from-blue-700 dark:via-blue-600 dark:to-blue-800 shadow-lg">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/10 to-transparent"></div>
              <Shield className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-gray-900 bg-green-500 shadow-md">
              <Loader2 className="h-3 w-3 animate-spin text-white" />
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Secure Document Viewer</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Loading protected content</p>
          
          {fileName && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-white/50 dark:bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              <FileText className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              <span className="max-w-[220px] truncate text-xs font-medium text-gray-700 dark:text-gray-300">{fileName}</span>
            </div>
          )}
        </div>

        {/* Progress Container - Compact */}
        <div className="mb-6 w-full space-y-3">
          {/* Progress Bar with Glow */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-400/20 to-blue-600/20 dark:from-blue-600/10 dark:to-blue-700/10 blur"></div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer Effect on Progress */}
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Progress Text & Time - Compact */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentStep}</span>
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 rounded-full bg-gray-200 dark:bg-gray-800">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
            </div>
            
            {estimatedTime && (
              <div className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1">
                <Clock className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-300">{estimatedTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Steps Timeline - Compact */}
        <div className="mb-6 w-full space-y-2">
          {steps.slice(0, 3).map((step, index) => ( // Limit to 3 steps for compact design
            <div key={index} className="flex items-start gap-2 rounded-lg p-2 transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-white/5">
              <div className="relative">
                {/* Step Circle - Compact */}
                <div className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
                  step.completed 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : step.active 
                    ? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200/50 dark:shadow-blue-900/50 animate-pulse'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'
                }`}>
                  {step.completed ? (
                    <>
                      <span className="text-xs font-bold">✓</span>
                    </>
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm truncate transition-all duration-300 ${
                    step.completed 
                      ? 'text-gray-600 dark:text-gray-400' 
                      : step.active 
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {step.details && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{step.details}</span>
                  )}
                </div>
                
                {step.active && (
                  <div className="mt-1 flex items-center gap-1">
                    <Loader2 className="h-2.5 w-2.5 animate-spin text-blue-500 dark:text-blue-400" />
                    <span className="text-xs text-blue-500 dark:text-blue-400">Processing...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Show remaining steps count if more than 3 */}
          {steps.length > 3 && (
            <div className="text-center pt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{steps.length - 3} more steps
              </span>
            </div>
          )}
        </div>

        {/* Security & Status Indicators - Compact Grid */}
        <div className="grid w-full grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-white/60 dark:bg-white/5 px-3 py-2 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">256-bit SSL</span>
          </div>
          
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700/50 bg-white/60 dark:bg-white/5 px-3 py-2 backdrop-blur-sm">
            <Lock className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Encrypted</span>
          </div>
        </div>

        {/* Loading Tips - Compact */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-gray-50 dark:from-blue-900/20 dark:to-gray-900/20 px-3 py-1.5">
            <Key className="h-3 w-3 text-blue-500 dark:text-blue-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Tip:</span> Secure loading in progress
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="absolute bottom-4 text-center">
        <p className="text-[9px] text-gray-500 dark:text-gray-400">
          Secured by DMS • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

/**
 * PAGE TRANSITION LOADING COMPONENT
 * Ito ang ipinapakita kapag naglo-load ang susunod na page
 */
const PageTransitionLoader = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <div className="absolute inset-0 animate-ping rounded-full bg-white/20"></div>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-white">Loading next page...</p>
          <p className="text-sm text-white/70">Preparing document content</p>
        </div>
      </div>
    </div>
  );
};

/**
 * POPUP MODAL WRAPPER - IMPROVED VERSION
 */
const PopupModal = ({ isVisible, onClose, children, disableBackdropClose = false }) => {
  const modalRef = useRef(null);
  
  if (!isVisible) return null;
  
  const handleBackdropClick = (e) => {
    // Only close if clicking on the backdrop, not the modal content
    if (modalRef.current && !modalRef.current.contains(e.target) && !disableBackdropClose) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-900/80 p-4 backdrop-blur-md transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="animate-in fade-in zoom-in relative flex h-full max-h-[97vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-gray-50 dark:bg-gray-900 shadow-2xl dark:shadow-2xl dark:shadow-black/50 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click inside modal
      >
        {/* Global Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-4 z-[110] rounded-full border border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-2 text-gray-400 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-700 hover:text-red-500"
        >
          <X size={20} />
        </button>

        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

const PdfViewer = ({ isVisible, onClose, file, item }) => {
  const { FetchOfficerFiles } = useContext(OfficerDisplayContext);
  const { authToken } = useContext(AuthContext);

  // Props Handling
  const fileId = file?._id || file;
  const fileData = file;

  // States
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(0.7); // Default zoom 70%
  const [isApproved, setApproved] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteData, setNoteData] = useState(null);
  const [isRecieveForm, setRecieveForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [customError, setCustomError] = useState("");
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const originalPdfBytesRef = useRef(null);
  const printIframeRef = useRef(null);

  // Debounce hooks
  const debouncedSetPageNumber = useDebounce((page) => {
    setPageNumber(page);
    setIsLoadingPage(false);
  }, 1000); // 300ms debounce delay para sa page change

  const debouncedNextPage = useDebounce(() => {
    if (pageNumber < numPages) {
      setPageNumber(prev => prev + 1);
      setIsLoadingPage(false);
    }
  }, 1000);

  const debouncedPrevPage = useDebounce(() => {
    if (pageNumber > 1) {
      setPageNumber(prev => prev - 1);
      setIsLoadingPage(false);
    }
  }, 1000);

  // Debounced close handler
  const debouncedCloseRef = useRef(null);

  // Loading States
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing secure session...");
  const [estimatedTime, setEstimatedTime] = useState("~2-5s");
  const [loadingSteps, setLoadingSteps] = useState([
    { 
      label: "Initializing session", 
      completed: false, 
      active: true 
    },
    { 
      label: "Fetching metadata", 
      completed: false, 
      active: false 
    },
    { 
      label: "Downloading content", 
      completed: false, 
      active: false 
    },
    { 
      label: "Security protocols", 
      completed: false, 
      active: false 
    },
    { 
      label: "Rendering preview", 
      completed: false, 
      active: false 
    },
  ]);

  // DEBOUNCED onClose handler
  const handleClose = useCallback(() => {
    // Gumamit ng debounce para sa pag-close
    if (debouncedCloseRef.current) {
      clearTimeout(debouncedCloseRef.current);
    }

    debouncedCloseRef.current = setTimeout(() => {
      // Clean up print iframe if exists
      if (printIframeRef.current && document.body.contains(printIframeRef.current)) {
        document.body.removeChild(printIframeRef.current);
        printIframeRef.current = null;
      }
      
      // Reset states
      setFileUrl(null);
      setScale(0.7);
      setIsPrinting(false);
      setPageNumber(1); // Reset to first page
      
      // Call the original onClose
      onClose();
    }, 200); // 200ms debounce para sa pag-close
  }, [onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (printIframeRef.current && document.body.contains(printIframeRef.current)) {
        document.body.removeChild(printIframeRef.current);
      }
      
      // Clear debounced timeouts
      if (debouncedCloseRef.current) {
        clearTimeout(debouncedCloseRef.current);
      }
    };
  }, []);

  // Update loading progress
  const updateLoadingStep = (stepIndex, completed = true, active = false, details = null) => {
    setLoadingSteps(prev => prev.map((step, index) => ({
      ...step,
      completed: index < stepIndex ? true : step.completed,
      active: index === stepIndex ? active : false,
      details: index === stepIndex ? details : step.details
    })));
    
    const newProgress = ((stepIndex + 1) / loadingSteps.length) * 100;
    setLoadingProgress(newProgress);
    
    // Update estimated time based on progress
    if (newProgress < 30) {
      setEstimatedTime("~10s");
    } else if (newProgress < 60) {
      setEstimatedTime("~5s");
    } else if (newProgress < 90) {
      setEstimatedTime("~2s");
    } else {
      setEstimatedTime("~1s");
    }
  };

  // Debounced page change handler
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= numPages && newPage !== pageNumber) {
      // Mag-set ng loading state
      setIsLoadingPage(true);
      
      // Gamitin ang debounced setPageNumber
      debouncedSetPageNumber(newPage);
    }
  }, [numPages, pageNumber, debouncedSetPageNumber]);

  // Debounced next page handler
  const handleNextPage = useCallback(() => {
    if (pageNumber < numPages) {
      setIsLoadingPage(true);
      debouncedNextPage();
    }
  }, [pageNumber, numPages, debouncedNextPage]);

  // Debounced previous page handler
  const handlePrevPage = useCallback(() => {
    if (pageNumber > 1) {
      setIsLoadingPage(true);
      debouncedPrevPage();
    }
  }, [pageNumber, debouncedPrevPage]);

  // Enhanced download handler
  const handleDownload = async () => {
    if (!originalPdfBytesRef.current) {
      console.error("No PDF data available for download");
      return;
    }

    try {
      setIsLoadingPage(true);
      
      // Create blob from original PDF bytes
      const blob = new Blob([originalPdfBytesRef.current], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileData?.fileName || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setIsLoadingPage(false);
      }, 100);
      
    } catch (error) {
      console.error("Download error:", error);
      setIsLoadingPage(false);
      setModalStatus("failed");
      setCustomError("Failed to download document");
      setShowModal(true);
    }
  };

  // FIXED Print handler - DOES NOT AUTO-CLOSE MODAL
  const handlePrint = async () => {
    if (!originalPdfBytesRef.current) {
      console.error("No PDF data available for printing");
      return;
    }

    try {
      setIsPrinting(true);
      
      // Create blob from original PDF bytes
      const blob = new Blob([originalPdfBytesRef.current], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      // OPTION 1: Try to open in new tab (most reliable)
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        // Successfully opened new window
        // Wait for PDF to load then trigger print
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (printError) {
            console.log("Print may require user interaction:", printError);
            // If print fails, at least PDF is open for manual printing
          }
          
          // Don't auto-close the window, let user decide
          setIsPrinting(false);
          
          // Clean up URL after some time
          setTimeout(() => URL.revokeObjectURL(url), 10000);
          
        }, 1000);
        
      } else {
        // OPTION 2: Popup blocked, use iframe method
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.zIndex = '9999';
        iframe.style.background = 'white';
        iframe.style.display = 'block';
        
        // Add to document body (not inside modal)
        document.body.appendChild(iframe);
        printIframeRef.current = iframe;
        
        // Set PDF source
        iframe.src = url;
        
        // Handle load
        iframe.onload = () => {
          // Small delay to ensure PDF is rendered
          setTimeout(() => {
            try {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            } catch (e) {
              console.error("Iframe print failed:", e);
            }
            
            // Remove iframe after print dialog
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
                printIframeRef.current = null;
              }
              URL.revokeObjectURL(url);
              setIsPrinting(false);
            }, 3000);
          }, 1000);
        };
        
        // Error handling
        iframe.onerror = () => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
            printIframeRef.current = null;
          }
          URL.revokeObjectURL(url);
          setIsPrinting(false);
          setModalStatus("failed");
          setCustomError("Failed to load PDF for printing");
          setShowModal(true);
        };
        
        // Fallback timeout
        setTimeout(() => {
          if (printIframeRef.current && document.body.contains(printIframeRef.current)) {
            document.body.removeChild(printIframeRef.current);
            printIframeRef.current = null;
          }
          URL.revokeObjectURL(url);
          setIsPrinting(false);
        }, 15000);
      }
      
    } catch (error) {
      console.error("Print setup error:", error);
      setIsPrinting(false);
      setModalStatus("failed");
      setCustomError("Failed to prepare document for printing");
      setShowModal(true);
    }
  };

  // PDF Fetching & Watermarking Logic with loading states
  useEffect(() => {
    if (!isVisible || !fileId) return;

    let canceled = false;
    let objectUrl;

    const fetchPDF = async () => {
      try {
        // Reset loading states
        setLoadingProgress(0);
        setLoadingSteps(prev => prev.map(step => ({ ...step, completed: false, active: false })));
        updateLoadingStep(0, false, true, "Starting...");

        // Step 1: Fetch metadata
        setCurrentStep("Fetching document metadata...");
        updateLoadingStep(1, false, true, "Contacting server...");

        const [metaRes, streamRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${fileId}`),
          axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/stream/${fileId}`, { 
            responseType: "blob",
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                updateLoadingStep(2, false, true, `${percent}%`);
              }
            }
          }),
        ]);

        updateLoadingStep(1, true, false, "Received");
        setCurrentStep("Downloading encrypted content...");
        updateLoadingStep(2, false, true, "Starting...");

        const metaData = metaRes.data.data;
        let pdfBytes = await streamRes.data.arrayBuffer();

        updateLoadingStep(2, true, false, "Complete");
        setCurrentStep("Applying security protocols...");
        updateLoadingStep(3, false, true, "Processing...");

        // Apply Watermark if Approved
        if (metaData.status === "Approved") {
          try {
            updateLoadingStep(3, false, true, "Watermark...");
            
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
                opacity: 0.3,
              });
            }
            pdfBytes = await pdfDoc.save();
            
            updateLoadingStep(3, false, true, "Applied");
          } catch (err) {
            console.error("Watermark error", err);
            updateLoadingStep(3, false, true, "Skipped");
          }
        }

        originalPdfBytesRef.current = pdfBytes;
        objectUrl = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));

        updateLoadingStep(3, true, false, "Done");
        setCurrentStep("Rendering document preview...");
        updateLoadingStep(4, false, true, "Preparing...");

        if (!canceled) {
          // Simulate rendering delay for smooth UX
          setTimeout(() => {
            setFileUrl(objectUrl);
            updateLoadingStep(4, true, false, "Ready");
            setLoadingProgress(100);
            setEstimatedTime("Ready");
          }, 500);
        }
      } catch (err) {
        if (!canceled) {
          console.error("Document loading error:", err);
          
          // Update loading steps to show error state
          updateLoadingStep(loadingSteps.length - 1, false, false, "Failed");
          setCurrentStep("Failed to load document");
          
          setTimeout(() => {
            setModalStatus("failed");
            setShowModal(true);
            setCustomError(err.response?.data?.message || "Unable to load document. Please try again.");
          }, 800);
        }
      }
    };

    fetchPDF();

    return () => {
      canceled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setFileUrl(null);
      setLoadingProgress(0);
      setLoadingSteps(loadingSteps.map(step => ({ ...step, completed: false, active: false })));
      setScale(0.7); // Reset zoom to 70% when closing
      setPageNumber(1); // Reset page number
    };
  }, [fileId, isVisible]);

  const handleSave = async () => {
    try {
      const pdfDoc = await PDFDocument.load(originalPdfBytesRef.current);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      const formData = new FormData();
      formData.append("file", blob, `${fileData.fileName || "updated"}.pdf`);
      formData.append("fileId", fileData._id);
      formData.append("status", "Approved");

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
        setTimeout(() => handleCloseAll(), 2000);
      }
    } catch (err) {
      console.error("Save error", err);
      setModalStatus("failed");
      setShowModal(true);
    }
  };

  const handleCloseAll = () => {
    setRecieveForm(false);
    setApproved(false);
    setShowNoteModal(false);
    setShowModal(false);
    handleClose();
  };

  // Document loading handler
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <PopupModal
      isVisible={isVisible}
      onClose={handleClose}
      disableBackdropClose={isPrinting} // Prevent closing while printing
    >
      {/* Show Professional Loading Screen while loading */}
      {(!fileUrl || loadingProgress < 100) && (
        <ProfessionalLoadingScreen 
          progress={loadingProgress}
          currentStep={currentStep}
          steps={loadingSteps}
          estimatedTime={estimatedTime}
          fileName={fileData?.fileName || item?.fileName}
        />
      )}

      {/* Show Page Transition Loader when changing pages */}
      <PageTransitionLoader isLoading={isLoadingPage} />

      {/* Show Printing Overlay */}
      {isPrinting && (
        <div className="fixed inset-0 z-[195] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-100"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800 dark:text-white">Opening Print Dialog...</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Preparing document for printing...
                <br />
                <span className="text-xs text-gray-500">
                  (This modal will remain open. Print dialog will open separately)
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TOP NAVIGATION BAR --- */}
      <div className="z-20 flex h-16 shrink-0 items-center justify-between border-b bg-white dark:bg-gray-900 dark:border-gray-700 px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-2 text-white shadow-md">
              <FileText size={20} />
            </div>
            {fileData?.status === "Approved" && (
              <div className="absolute -right-1 -top-1 rounded-full bg-green-500 p-0.5">
                <CheckCircle size={12} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <h2 className="max-w-[250px] truncate text-sm font-bold text-gray-800 dark:text-white">{fileData?.fileName || item?.fileName}</h2>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${
                fileData?.status === "Approved" ? 'bg-green-500' :
                fileData?.status === "Rejected" ? 'bg-red-500' :
                'bg-yellow-500 animate-pulse'
              }`}></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {fileData?.status || "In Review"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {fileUrl && (
            <button
              onClick={handleDownload}
              className="rounded-lg p-2 text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
              title="Download"
              disabled={isLoadingPage || isPrinting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex flex-1 overflow-hidden bg-slate-100/50 dark:bg-gray-800">
        {/* PDF SCROLLABLE VIEWER - Hidden during loading */}
        {fileUrl && !isLoadingPage ? (
          <div className="custom-scrollbar relative flex flex-1 justify-center overflow-auto p-4 md:p-8">
            <div className="relative mb-10 rounded-md bg-white dark:bg-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-200">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex h-[600px] w-[800px] items-center justify-center">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                        <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 dark:bg-blue-900/30"></div>
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-gray-700 dark:text-white">Finalizing Document</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Preparing the last details for display...</p>
                    </div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="overflow-hidden rounded-md"
                  loading={
                    <div className="flex h-[600px] items-center justify-center bg-white dark:bg-gray-900">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-600" />
                    </div>
                  }
                />
              </Document>
            </div>
          </div>
        ) : fileUrl ? (
          // Empty container during page transition
          <div className="flex flex-1 items-center justify-center bg-slate-100/50 dark:bg-gray-800">
            {/* Content is hidden during loading */}
          </div>
        ) : (
          // Initial loading state (handled by ProfessionalLoadingScreen)
          <div className="flex flex-1 items-center justify-center bg-slate-100/50 dark:bg-gray-800">
            {/* Content is hidden during initial loading */}
          </div>
        )}

        {/* INTEGRATED SIDEBAR */}
        <div className="hidden w-[320px] flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 xl:flex">
          <Sidebar
            onPrint={handlePrint} // Pass the enhanced print function
            onZoomIn={() => setScale((s) => s + 0.1)} // Reduced zoom increment for better control
            onZoomOut={() => setScale((s) => Math.max(s - 0.1, 0.3))} // Minimum zoom 30%
            onSave={handleSave}
            onDownload={handleDownload} // Pass download function to sidebar
            onNextPage={handleNextPage} // Pass debounced next page function
            onPrevPage={handlePrevPage} // Pass debounced previous page function
            scale={scale}
            numPages={numPages}
            pageNumber={pageNumber}
            setPageNumber={handlePageChange}
            fileUrl={fileUrl}
            fileData={fileData}
            ApprovedReview={() => setApproved(true)}
            isLoading={!fileUrl || loadingProgress < 100 || isPrinting}
            isPageLoading={isLoadingPage} // Pass loading state to sidebar
          />
        </div>
      </div>

      {/* --- FLOATING OVERLAYS & MODALS --- */}
      <SuccessFailed
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
        error={customError}
      />

      {/* Modal Context para sa Form Actions */}
      {(showNoteModal || isRecieveForm || isApproved) && (
        <div className="animate-in fade-in fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 p-4 backdrop-blur-sm duration-300">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
            {showNoteModal && (
              <Notes
                data={noteData}
                isOpen={showNoteModal}
                onClose={() => setShowNoteModal(false)}
              />
            )}
            {isRecieveForm && (
              <RecieverForm
                isOpen={isRecieveForm}
                onClose={() => setRecieveForm(false)}
                categoryData={fileData}
              />
            )}
            {isApproved && (
              <ApprovedRejectForm
                isOpen={isApproved}
                onClose={() => setApproved(false)}
                fileData={fileData}
                handleApprove={handleSave}
                handleRejects={(id, status) => {
                  setNoteData({ id, status });
                  setShowNoteModal(true);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.1; }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.05; }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-spin-slower {
          animation: spin-slower 12s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
      `}</style>
    </PopupModal>
  );
};

export default PdfViewer;
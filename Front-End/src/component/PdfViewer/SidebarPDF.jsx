import React, { useContext, useRef, useEffect, useState, useCallback } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  CheckCircle, 
  Loader2, 
  FileText,
  Maximize2,
  Minimize2,
  Settings,
  Type,
  Calendar,
  Tag,
  User,
  Award,
  UserCheck,
  UsersIcon,
  Clock
} from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";

const Sidebar = ({
  onPrint,
  onZoomIn,
  onZoomOut,
  onSave,
  onDownload,
  scale,
  numPages,
  pageNumber,
  setPageNumber,
  fileUrl,
  fileData,
  ApprovedReview,
  isLoading = false,
  isPageLoading = false,
  isNextPageLoading = false,
  isPrevPageLoading = false,
  isInitialLoadComplete = false,
  navigationDebounce = true,
  onToggleFullscreen,
  isFullscreen = false,
  onNextPage,
  onPrevPage,
}) => {
  const { role, user } = useContext(AuthContext);
  
  const isDocumentLoading = isLoading || !isInitialLoadComplete;
  const isDocumentLoaded = fileUrl && numPages > 0;
  
  // Track mounted state
  const isMountedRef = useRef(true);
  const [previewError, setPreviewError] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState('');
  const [currentZoom, setCurrentZoom] = useState(scale || 1);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Update currentZoom when scale prop changes
  useEffect(() => {
    if (scale && scale !== currentZoom) {
      setCurrentZoom(scale);
    }
  }, [scale]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  // Reset preview error when fileUrl changes
  useEffect(() => {
    setPreviewError(false);
  }, [fileUrl]);

  // STRICT PAGE NAVIGATION HANDLERS WITH DEBOUNCE
  const handlePreviousPage = () => {
    if (
      isDocumentLoading || 
      isPageLoading || 
      isPrevPageLoading || 
      !fileUrl || 
      pageNumber <= 1 || 
      !isInitialLoadComplete ||
      navigationDebounce
    ) {
      return;
    }
    
    // Visual feedback
    setIsNavigating(true);
    
    // Tawagin ang callback na binigay ng parent
    if (onPrevPage) {
      onPrevPage();
    }
    
    // Reset navigating state after debounce
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setIsNavigating(false);
      }
    }, 3000);
    
    setDebounceTimer(timer);
  };

  const handleNextPage = () => {
    if (
      isDocumentLoading || 
      isPageLoading || 
      isNextPageLoading || 
      !fileUrl || 
      pageNumber >= numPages || 
      !isInitialLoadComplete ||
      navigationDebounce
    ) {
      return;
    }
    
    // Visual feedback
    setIsNavigating(true);
    
    // Tawagin ang callback na binigay ng parent
    if (onNextPage) {
      onNextPage();
    }
    
    // Reset navigating state after debounce
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setIsNavigating(false);
      }
    }, 3000);
    
    setDebounceTimer(timer);
  };

  // Handle direct page input
  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const value = parseInt(goToPageInput);
      if (!isNaN(value) && value >= 1 && value <= numPages && !isPageLoading && isInitialLoadComplete && !navigationDebounce) {
        // Use parent's setPageNumber
        if (setPageNumber) {
          setPageNumber(value);
          setGoToPageInput('');
        }
      }
    }
  };

  // Handle page input change
  const handlePageInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= numPages)) {
      setGoToPageInput(value);
    }
  };

  // Handle zoom in with local state update
  const handleZoomIn = () => {
    if (onZoomIn) {
      onZoomIn();
      if (scale) setCurrentZoom(scale);
    } else {
      const newZoom = Math.min(currentZoom + 0.1, 3);
      setCurrentZoom(newZoom);
    }
  };

  // Handle zoom out with local state update
  const handleZoomOut = () => {
    if (onZoomOut) {
      onZoomOut();
      if (scale) setCurrentZoom(scale);
    } else {
      const newZoom = Math.max(currentZoom - 0.1, 0.1);
      setCurrentZoom(newZoom);
    }
  };

  // Default implementations for missing functions
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileData?.title || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleToggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  const handleApprovedReview = () => {
    if (ApprovedReview) {
      ApprovedReview();
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Strict keyboard navigation - hindi gagana kapag may loading o debounce
      if (e.key === 'ArrowLeft' && !isPageLoading && !isPrevPageLoading && !isDocumentLoading && isInitialLoadComplete && !navigationDebounce) {
        e.preventDefault();
        handlePreviousPage();
      } else if (e.key === 'ArrowRight' && !isPageLoading && !isNextPageLoading && !isDocumentLoading && isInitialLoadComplete && !navigationDebounce) {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'Escape' && isFullscreen) {
        handleToggleFullscreen();
      } else if (e.ctrlKey && e.key === '+') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePreviousPage, handleNextPage, isFullscreen, handleZoomIn, handleZoomOut, isPageLoading, isNextPageLoading, isPrevPageLoading, isDocumentLoading, isInitialLoadComplete, navigationDebounce]);

  const canApproveReject = role !== "admin" &&
    (role === "officer" || fileData?.status === "Pending") &&
    fileData?.status !== "Rejected" &&
    fileData?.status !== "Approved";

  // Calculate if buttons should be disabled
  const isNavigationDisabled = isDocumentLoading || !isDocumentLoaded || previewError || isPageLoading || !isInitialLoadComplete || navigationDebounce;
  const isPrevDisabled = isNavigationDisabled || pageNumber <= 1 || isPrevPageLoading;
  const isNextDisabled = isNavigationDisabled || pageNumber >= numPages || isNextPageLoading;

  // Format document information from fileData
  const documentTitle = fileData?.title || 'Untitled Document';
  const documentSize = fileData?.fileSize ? `${(fileData.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A';
  const uploadDate = fileData?.createdAt ? new Date(fileData.createdAt).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';
  
  const resolutionDate = fileData?.dateOfResolution ? new Date(fileData.dateOfResolution).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';
  
  const category = fileData?.category || 'N/A';
  const tags = fileData?.tags || [];
  const status = fileData?.status || 'Unknown';
  const summary = fileData?.summary || 'No summary available';
  
  // People involved in the resolution
  const chairpersons = fileData?.chairpersons || [];
  const viceChairpersons = fileData?.viceChairpersons || [];
  const members = fileData?.members || [];
  const author = fileData?.author || null;

  // Helper function to format name from first_name and last_name
  const formatPersonName = (person) => {
    if (!person) return 'Unknown';
    
    if (typeof person === 'string') {
      return person;
    }
    
    if (person.first_name && person.last_name) {
      return `${person.first_name} ${person.last_name}`;
    }
    
    if (person.name) {
      return person.name;
    }
    
    if (person.fullName) {
      return person.fullName;
    }
    
    return person.toString();
  };

  // Filter and get unique persons (remove duplicates)
  const getUniquePersons = (persons) => {
    if (!persons || persons.length === 0) return [];
    
    const uniqueMap = new Map();
    persons.forEach(person => {
      const name = formatPersonName(person);
      if (!uniqueMap.has(name)) {
        uniqueMap.set(name, person);
      }
    });
    
    return Array.from(uniqueMap.values());
  };

  // Get unique formatted lists
  const uniqueChairpersons = getUniquePersons(chairpersons);
  const uniqueViceChairpersons = getUniquePersons(viceChairpersons);
  const uniqueMembers = getUniquePersons(members);

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '??';
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    
    return name.charAt(0).toUpperCase();
  };

  // Function to render list of people with fallback
  const renderPeopleList = (people, emptyMessage = "No data available") => {
    if (!people || people.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          {emptyMessage}
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {people.map((person, index) => {
          const name = formatPersonName(person);
          const initials = getInitials(name);
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {name}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {person.position && (
                    <span className="truncate">{person.position}</span>
                  )}
                  {person.department && (
                    <span className="truncate">• {person.department}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render debounce indicator
  const renderDebounceIndicator = () => {
    if (!isInitialLoadComplete && fileUrl) {
      return (
        <div className="rounded-xl bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 dark:from-yellow-500/20 dark:to-yellow-600/20 p-3 border border-yellow-200/50 dark:border-yellow-500/20 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30"></div>
            </div>
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-300">Initializing Navigation...</p>
              <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
                Please wait while navigation is being prepared
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <nav className="print-hidden left-0 top-0 flex h-full w-full flex-col gap-6 overflow-y-auto border-l border-gray-300/50 dark:border-gray-700/50 bg-gradient-to-b from-white to-gray-50/80 p-6 text-gray-800 backdrop-blur-xl dark:from-gray-900 dark:to-gray-800/80 dark:text-gray-200 shadow-xl dark:shadow-2xl">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Document Viewer</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Resolution Document</p>
          </div>
        </div>
      </div>

      {/* Show debounce indicators */}
      {renderDebounceIndicator()}

      {/* Show SPECIFIC loading indicators */}
      {isNextPageLoading && (
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 p-3 border border-blue-200/50 dark:border-blue-500/20 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30"></div>
            </div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">Loading Next Page...</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Preparing page {pageNumber + 1} of {numPages}</p>
            </div>
          </div>
        </div>
      )}

      {isPrevPageLoading && (
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 p-3 border border-blue-200/50 dark:border-blue-500/20 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30"></div>
            </div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">Loading Previous Page...</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Preparing page {pageNumber - 1} of {numPages}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Controls - Zoom, Pagination, Actions */}
      <div className="space-y-6">
        {/* Zoom Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Zoom Controls</h3>
            <Type className="h-4 w-4 text-gray-400" />
          </div>
          
          {/* Zoom Percentage Display */}
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {(currentZoom * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current Zoom Level</p>
            </div>
          </div>
          
          {/* Zoom In/Out Buttons - Responsive */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <button 
              onClick={handleZoomOut} 
              disabled={isNavigationDisabled}
              className="group flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 px-3 sm:px-5 py-2.5 sm:py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm hover:shadow" 
              title="Zoom Out (Ctrl + -)"
            >
              <ZoomOut className="h-5 sm:h-6 w-5 sm:w-6 group-hover:scale-110 transition-transform" />
            </button>
            
            <button 
              onClick={handleZoomIn} 
              disabled={isNavigationDisabled}
              className="group flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 px-3 sm:px-5 py-2.5 sm:py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm hover:shadow" 
              title="Zoom In (Ctrl + +)"
            >
              <ZoomIn className="h-5 sm:h-6 w-5 sm:w-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          {/* Fullscreen Button - Responsive */}
          <div className="pt-2">
            <button
              onClick={handleToggleFullscreen}
              disabled={isNavigationDisabled}
              className="w-full group flex items-center justify-center gap-1 sm:gap-2 rounded-xl bg-white dark:bg-gray-800 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:shadow"
              title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 sm:h-4 w-4 sm:w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                  <span className="sm:hidden">Exit FS</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 sm:h-4 w-4 sm:w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="hidden sm:inline">Enter Fullscreen</span>
                  <span className="sm:hidden">Enter FS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Page Navigation</h3>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            {/* Page Number Display */}
            <div className="text-center mb-4">
              <div className="relative inline-block">
                {isPageLoading || isNextPageLoading || isPrevPageLoading ? (
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent animate-pulse">
                    {pageNumber}
                  </div>
                ) : (
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {pageNumber}
                  </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  of <span className="font-semibold">{numPages || '?'}</span> pages
                </div>
                {(isNavigating || isPageLoading || isNextPageLoading || isPrevPageLoading) && (
                  <div className="absolute -top-2 -right-2">
                    <div className="h-3 w-3 animate-ping rounded-full bg-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation Buttons - Responsive WITH LOADING STATES ONLY (NO COUNTDOWN) */}
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <button
                onClick={handlePreviousPage}
                disabled={isPrevDisabled}
                className={`group flex items-center justify-center rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 flex-1 min-w-[120px] sm:min-w-[140px] text-sm sm:text-base ${
                  isPrevDisabled 
                    ? "opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400" 
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm hover:shadow"
                }`}
                title={
                  !isInitialLoadComplete ? "Navigation initializing..." :
                  navigationDebounce ? "Please wait..." :
                  isPrevPageLoading ? "Loading previous page..." :
                  isPrevDisabled ? "Cannot go previous" : 
                  "Previous page (←)"
                }
              >
                {!isInitialLoadComplete ? (
                  <>
                    <div className="relative">
                      <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin text-yellow-500 flex-shrink-0" />
                      <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30"></div>
                    </div>
                    <span className="ml-1 sm:ml-2 font-medium hidden sm:inline">Initializing</span>
                    <span className="ml-1 font-medium sm:hidden">Init</span>
                  </>
                ) : isPrevPageLoading || (navigationDebounce && isNavigating) ? (
                  <>
                    <div className="relative">
                      <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin text-blue-500 flex-shrink-0" />
                      <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30"></div>
                    </div>
                    <span className="ml-1 sm:ml-2 font-medium hidden sm:inline">Processing</span>
                    <span className="ml-1 font-medium sm:hidden">Proc</span>
                  </>
                ) : (
                  <>
                    <ChevronLeft className="h-4 sm:h-5 w-4 sm:w-5 group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
                    <span className="ml-1 sm:ml-2 font-medium hidden sm:inline">Previous</span>
                    <span className="ml-1 font-medium sm:hidden">Prev</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
                className={`group flex items-center justify-center rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 flex-1 min-w-[120px] sm:min-w-[140px] text-sm sm:text-base ${
                  isNextDisabled 
                    ? "opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400" 
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm hover:shadow"
                }`}
                title={
                  !isInitialLoadComplete ? "Navigation initializing..." :
                  navigationDebounce ? "Please wait..." :
                  isNextPageLoading ? "Loading next page..." :
                  isNextDisabled ? "Cannot go next" : 
                  "Next page (→)"
                }
              >
                {!isInitialLoadComplete ? (
                  <>
                    <span className="mr-1 font-medium sm:hidden">Init</span>
                    <span className="mr-1 sm:mr-2 font-medium hidden sm:inline">Initializing</span>
                    <div className="relative">
                      <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin text-yellow-500 flex-shrink-0" />
                      <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30"></div>
                    </div>
                  </>
                ) : isNextPageLoading || (navigationDebounce && isNavigating) ? (
                  <>
                    <span className="mr-1 font-medium sm:hidden">Proc</span>
                    <span className="mr-1 sm:mr-2 font-medium hidden sm:inline">Processing</span>
                    <div className="relative">
                      <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin text-blue-500 flex-shrink-0" />
                      <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="mr-1 font-medium sm:hidden">Next</span>
                    <span className="mr-1 sm:mr-2 font-medium hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </>
                )}
              </button>
            </div>

            {/* Page Input */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={numPages}
                  value={goToPageInput}
                  onChange={handlePageInputChange}
                  onKeyDown={handlePageInput}
                  placeholder={`Go to page (1-${numPages})`}
                  className="w-full text-center text-sm px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isNavigationDisabled}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
                {!isInitialLoadComplete ? "Navigation initializing..." : "Press Enter to navigate"}
              </p>
            </div>

            {/* Progress Bar */}
            {numPages > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Reading Progress</span>
                  <span>{Math.round((pageNumber / numPages) * 100) || 0}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${(pageNumber / numPages) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Document Actions</h3>
            <Settings className="h-4 w-4 text-gray-400" />
          </div>
          
          {/* Action Buttons Container - Responsive */}
          <div className="space-y-2">
            {/* Primary Actions Row - Responsive */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleDownload} 
                disabled={isNavigationDisabled}
                className="group flex items-center justify-center gap-1 sm:gap-2 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 px-2 sm:px-4 py-2.5 sm:py-3 text-white hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base" 
                title="Download PDF"
              >
                <Download className="h-4 sm:h-5 w-4 sm:w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="font-semibold hidden sm:inline">Download</span>
                <span className="font-semibold sm:hidden text-xs">DL</span>
              </button>

              <button 
                onClick={handlePrint} 
                disabled={isNavigationDisabled}
                className="group flex items-center justify-center gap-1 sm:gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-2 sm:px-4 py-2.5 sm:py-3 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base" 
                title="Print (Ctrl + P)"
              >
                <Printer className="h-4 sm:h-5 w-4 sm:w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="font-semibold hidden sm:inline">Print</span>
                <span className="font-semibold sm:hidden text-xs">Print</span>
              </button>
            </div>

            {/* Secondary Action - Full Width */}
            {canApproveReject && (
              <button
                onClick={handleApprovedReview}
                disabled={isNavigationDisabled}
                className="w-full group flex items-center justify-center gap-1 sm:gap-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-3 sm:px-5 py-3 sm:py-3.5 text-white hover:from-green-600 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base"
                title="Approve/Reject Document"
              >
                <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="font-semibold hidden sm:inline">Review & Approve</span>
                <span className="font-semibold sm:hidden text-xs">Review</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Document Info */}
      <div className="mb-2">
        
        {/* Document Info */}
        <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={documentTitle}>
              {documentTitle}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'Approved' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                : status === 'Rejected'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}>
              {status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Size</p>
              <p className="font-medium">{documentSize}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Pages</p>
              <p className="font-medium">{numPages || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Uploaded</p>
              <p className="font-medium">{uploadDate}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Category</p>
              <p className="font-medium">{category}</p>
            </div>
          </div>
          
          {/* Resolution Date */}
          {resolutionDate && (
            <div className="flex items-center gap-2 text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-2">
              <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-600 dark:text-gray-300">Resolution Date:</span>
              <span className="font-medium text-blue-700 dark:text-blue-300">{resolutionDate}</span>
            </div>
          )}
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md text-gray-500 dark:text-gray-400">
                    +{tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* People Involved Section */}
        <div className="space-y-3">
          {/* Author */}
          {author && (
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-3 border border-blue-200/50 dark:border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Author</h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(author)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{author}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Document Author</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Chairpersons */}
          <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 p-3 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Chairperson/s</h4>
              </div>
              <span className="text-xs px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                {uniqueChairpersons.length}
              </span>
            </div>
            {renderPeopleList(uniqueChairpersons, "No chairperson assigned")}
          </div>
          
          {/* Vice-Chairpersons */}
          <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 p-3 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Vice-Chairperson/s</h4>
              </div>
              <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
                {uniqueViceChairpersons.length}
              </span>
            </div>
            {renderPeopleList(uniqueViceChairpersons, "No vice-chairperson assigned")}
          </div>
          
          {/* Members */}
          <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 p-3 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Members</h4>
              </div>
              <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                {uniqueMembers.length}
              </span>
            </div>
            {renderPeopleList(uniqueMembers, "No members assigned")}
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="space-y-3">
        {!isInitialLoadComplete && fileUrl && (
          <div className="rounded-xl bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 dark:from-yellow-500/20 dark:to-yellow-600/20 p-3 border border-yellow-200/50 dark:border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Loader2 className="h-5 w-5 animate-spin text-yellow-600 dark:text-yellow-400" />
                <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30"></div>
              </div>
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">Navigation Initializing</p>
                <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
                  Please wait while navigation is being prepared
                </p>
              </div>
            </div>
          </div>
        )}

        {isDocumentLoading && (
          <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 p-3 border border-blue-200/50 dark:border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30"></div>
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300">Loading document...</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Preparing document for viewing</p>
              </div>
            </div>
          </div>
        )}

        {isDocumentLoaded && !isDocumentLoading && !previewError && !isPageLoading && !isNextPageLoading && !isPrevPageLoading && isInitialLoadComplete && (
          <div className="rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 p-3 border border-green-200/50 dark:border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">Document Ready</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">Navigation is now enabled</p>
              </div>
            </div>
          </div>
        )}

        {previewError && (
          <div className="rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 p-3 border border-red-200/50 dark:border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">!</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">Preview Unavailable</p>
                <p className="text-xs text-red-600/70 dark:text-red-400/70">Unable to load document preview</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Keyboard Shortcuts</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">←</kbd>
              <span className="text-xs">Previous page</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">→</kbd>
              <span className="text-xs">Next page</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Ctrl</kbd>
              <span className="text-xs">+</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">+</kbd>
              <span className="text-xs">Zoom in</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Ctrl</kbd>
              <span className="text-xs">+</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">-</kbd>
              <span className="text-xs">Zoom out</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Default props for optional functions
Sidebar.defaultProps = {
  onPrint: null,
  onZoomIn: null,
  onZoomOut: null,
  onDownload: null,
  onToggleFullscreen: null,
  onClose: null,
  onSetZoom: null,
  onNextPage: null,
  onPrevPage: null,
  isFullscreen: false,
  scale: 1,
  isPageLoading: false,
  isNextPageLoading: false,
  isPrevPageLoading: false,
  isInitialLoadComplete: false,
  navigationDebounce: true,
};

export default Sidebar;
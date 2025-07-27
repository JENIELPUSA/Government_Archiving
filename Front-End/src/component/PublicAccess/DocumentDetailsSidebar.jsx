import React, { useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import PdfViewerTab from './PdfViewerTab';
import DetailsTab from './DetailsTab';
import CommentsTab from './CommentsTab';
import { CommentsDisplayContext } from '../../contexts/CommentsContext/CommentsContext';

export default function DocumentDetailsSidebar({
    selectedPdfForComments,
    closeSidebar,
    sidebarVariants,
    activeSidebarTab,
    setActiveSidebarTab,
    downloadPdf,
    sharePdf,
    bookmarkedPdfs,
    toggleBookmark,
    truncateText,
    userRating,
    averageRating,
    totalRatingsCount,
    handleRating,
    commentLoading,
    newCommentText,
    setNewCommentText,
    addComment
}) {
    const { getCommentsByPdfId, isComments: contextComments, commentLoading: contextCommentLoading } = useContext(CommentsDisplayContext);

    useEffect(() => {
        if (activeSidebarTab === 'comments' && selectedPdfForComments) {
            getCommentsByPdfId(selectedPdfForComments.id);
        }
    }, [activeSidebarTab, selectedPdfForComments, getCommentsByPdfId]);

    const commentsToPass = contextComments;
    const loadingToPass = commentLoading || contextCommentLoading;

    return (
        <AnimatePresence>
            {selectedPdfForComments && (
                <motion.aside
                    id="comments-sidebar"
                    className="fixed inset-y-0 right-0 w-full md:w-1/3 lg:w-1/4 bg-white shadow-xl z-50 flex flex-col p-6 border-l border-gray-200"
                    variants={sidebarVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-2xl font-bold text-gray-800">{selectedPdfForComments.title}</h2>
                        <button
                            onClick={closeSidebar}
                            className="text-gray-500 hover:text-gray-700 text-3xl transition duration-150 ease-in-out"
                            aria-label="Close Sidebar"
                            title="Close Sidebar"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="flex mb-4">
                        <button
                            className={`flex-1 py-2 text-center text-lg font-medium ${activeSidebarTab === 'pdf' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                            onClick={() => setActiveSidebarTab('pdf')}
                        >
                            PDF Viewer
                        </button>
                        <button
                            className={`flex-1 py-2 text-center text-lg font-medium ${activeSidebarTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                            onClick={() => setActiveSidebarTab('details')}
                        >
                            Details
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto">
                        {activeSidebarTab === 'pdf' && (
                            <PdfViewerTab
                                pdf={selectedPdfForComments}
                                downloadPdf={downloadPdf}
                                sharePdf={sharePdf}
                            />
                        )}
                        {activeSidebarTab === 'details' && (
                            <DetailsTab
                                pdf={selectedPdfForComments}
                                bookmarkedPdfs={bookmarkedPdfs}
                                toggleBookmark={toggleBookmark}
                                truncateText={truncateText}
                                userRating={userRating}
                                averageRating={averageRating}
                                totalRatingsCount={totalRatingsCount}
                                handleRating={handleRating}
                            />
                        )}
                    
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import Header from "./Header";
import AdvancedSearch from "./AdvanceSearch";
import CategoriesSidebar from "./CategoriesSidebar";
import DocumentList from "./DocumentList";
import DocumentDetailsSidebar from "./DocumentDetailsSidebar";
import { CommentsDisplayContext } from "../../contexts/CommentsContext/CommentsContext";
import { RatingDisplayContext } from "../../contexts/RatingContext/RatingContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Footer from "./publicfooter";
export const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export const advancedSearchVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.3 } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

export const sidebarVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
};

export default function PublicAccess() {
    const { isPublicData } = useContext(FilesDisplayContext);
    const { createComment, isComments } = useContext(CommentsDisplayContext);
    const { createRatings, getRatingsByPdfId, isRatings } = useContext(RatingDisplayContext);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId] = useState("Guest User");
    const [currentCategory, setCurrentCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPdfs, setFilteredPdfs] = useState([]);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advAuthor, setAdvAuthor] = useState("");
    const [advApprovalDate, setAdvApprovalDate] = useState("");
    const [advSelectedTags, setAdvSelectedTags] = useState([]);
    const [selectedPdfForComments, setSelectedPdfForComments] = useState(null);
    const [activeSidebarTab, setActiveSidebarTab] = useState("pdf");
    const [newCommentText, setNewCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatingsCount, setTotalRatingsCount] = useState(0);
    const [ratingsLoading, setRatingsLoading] = useState(false);
    const [bookmarkedPdfs, setBookmarkedPdfs] = useState({});
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [hasNewApprovedFiles, setHasNewApprovedFiles] = useState(false);

    const lawData = useMemo(() => {
        return (
            isPublicData?.map((item) => ({
                id: item._id,
                title: item.title,
                filename: item.fileName,
                description: item.summary,
                plainSummary: item.summary,
                author: item.author,
                approvalDate: new Date(item.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
                createdAt: new Date(item.createdAt),
                tags: item.tags,
                category: item.category,
                accessLevel: item.status === "Approved" ? "public" : "restricted",
                fileUrl: item.fileUrl,
                archivedStatus: item.ArchivedStatus,
                originalStatus: item.status,
            })) || []
        );
    }, [isPublicData]);

    useEffect(() => {
        if (lawData.length === 0) return;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const hasNewFiles = lawData.some((pdf) => pdf.archivedStatus === "Active" && pdf.accessLevel === "public" && pdf.createdAt >= thirtyDaysAgo);

        setHasNewApprovedFiles(hasNewFiles);
    }, [lawData]);

    const categories = useMemo(() => {
        return Array.from(new Set(lawData.map((pdf) => pdf.category).filter(Boolean))).map((categoryName) => ({
            id: `category-${categoryName.replace(/\s+/g, "-").toLowerCase()}`,
            name: categoryName,
        }));
    }, [lawData]);

    const allUniqueTags = useMemo(() => {
        const tags = new Set();
        lawData.forEach((pdf) => {
            pdf.tags.forEach((tag) => tags.add(tag));
        });
        return Array.from(tags);
    }, [lawData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setBookmarkedPdfs({});
    }, []);

    useEffect(() => {
        let pdfsToDisplay = [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (showBookmarks) {
            pdfsToDisplay = lawData.filter((pdf) => pdf.accessLevel === "public" && bookmarkedPdfs[pdf.id]);
        } else if (currentCategory === "new_approved_files") {
            pdfsToDisplay = lawData.filter(
                (pdf) => pdf.archivedStatus === "Active" && pdf.accessLevel === "public" && pdf.createdAt >= thirtyDaysAgo,
            );
        } else if (currentCategory) {
            pdfsToDisplay = lawData.filter(
                (pdf) => pdf.archivedStatus === "Active" && pdf.category === categories.find((cat) => cat.id === currentCategory)?.name,
            );
        } else {
            pdfsToDisplay = lawData.filter((pdf) => pdf.archivedStatus === "Active");
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            pdfsToDisplay = pdfsToDisplay.filter(
                (pdf) =>
                    pdf.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                    pdf.description.toLowerCase().includes(lowerCaseSearchTerm) ||
                    pdf.author.toLowerCase().includes(lowerCaseSearchTerm) ||
                    pdf.approvalDate.toLowerCase().includes(lowerCaseSearchTerm) ||
                    pdf.tags.some((tag) => tag.toLowerCase().includes(lowerCaseSearchTerm)),
            );
        } else {
            if (advAuthor || advApprovalDate || advSelectedTags.length > 0) {
                const lowerAdvAuthor = advAuthor.toLowerCase();
                const lowerAdvApprovalDate = advApprovalDate.toLowerCase();

                pdfsToDisplay = pdfsToDisplay.filter((pdf) => {
                    const matchesAuthor = advAuthor ? pdf.author.toLowerCase().includes(lowerAdvAuthor) : true;
                    const matchesApprovalDate = advApprovalDate ? pdf.approvalDate.toLowerCase().includes(lowerAdvApprovalDate) : true;
                    const matchesTags =
                        advSelectedTags.length > 0
                            ? advSelectedTags.every((selectedTag) => pdf.tags.some((pdfTag) => pdfTag.toLowerCase() === selectedTag.toLowerCase()))
                            : true;

                    return matchesAuthor && matchesApprovalDate && matchesTags;
                });
            }
        }
        setFilteredPdfs(pdfsToDisplay);
    }, [currentCategory, searchTerm, advAuthor, advApprovalDate, advSelectedTags, showBookmarks, bookmarkedPdfs, lawData, categories]);

    useEffect(() => {
        if (!selectedPdfForComments) {
            return;
        }
        setCommentLoading(true);
        setCommentLoading(false);
    }, [selectedPdfForComments]);

    useEffect(() => {
        const fetchRatings = async () => {
            if (!selectedPdfForComments) {
                setAverageRating(0);
                setTotalRatingsCount(0);
                setUserRating(0);
                return;
            }

            setRatingsLoading(true);
            try {
                await getRatingsByPdfId(selectedPdfForComments.id, currentUserId);
                setAverageRating(isRatings.averageRating || 0);
                setTotalRatingsCount(isRatings.totalRatingsCount || 0);
                setUserRating(isRatings.userRating || 0);
            } catch (error) {
                console.error("Error fetching ratings:", error);
                setAverageRating(0);
                setTotalRatingsCount(0);
                setUserRating(0);
            } finally {
                setRatingsLoading(false);
            }
        };

        fetchRatings();
    }, [selectedPdfForComments, getRatingsByPdfId, isRatings, currentUserId]);

    const handleCategoryClick = useCallback((categoryId) => {
        setCurrentCategory(categoryId);
        setSearchTerm("");
        setAdvAuthor("");
        setAdvApprovalDate("");
        setAdvSelectedTags([]);
        setSelectedPdfForComments(null);
        setShowBookmarks(false);
        setShowMobileSidebar(false);
    }, []);

    const handleSearchChange = useCallback((event) => {
        setSearchTerm(event.target.value);
        setCurrentCategory(null);
        setAdvAuthor("");
        setAdvApprovalDate("");
        setAdvSelectedTags([]);
        setSelectedPdfForComments(null);
        setShowBookmarks(false);
    }, []);

    const toggleAdvancedSearch = useCallback(() => {
        setShowAdvancedSearch((prev) => !prev);
        if (showAdvancedSearch) {
            setAdvAuthor("");
            setAdvApprovalDate("");
            setAdvSelectedTags([]);
        }
        setSelectedPdfForComments(null);
        setShowBookmarks(false);
    }, [showAdvancedSearch]);

    const handleAdvAuthorChange = useCallback((value) => {
        setAdvAuthor(value);
        setSearchTerm("");
    }, []);

    const handleAdvApprovalDateChange = useCallback((value) => {
        setAdvApprovalDate(value);
        setSearchTerm("");
    }, []);

    const handleTagToggle = useCallback((tag) => {
        setAdvSelectedTags((prevTags) => {
            if (prevTags.includes(tag)) {
                return prevTags.filter((t) => t !== tag);
            } else {
                return [...prevTags, tag];
            }
        });
        setSearchTerm("");
    }, []);

    const clearAdvancedFilters = useCallback(() => {
        setAdvAuthor("");
        setAdvApprovalDate("");
        setAdvSelectedTags([]);
    }, []);

    const downloadPdf = useCallback((pdfUrl, filename) => {
        if (pdfUrl) {
            alert(`Downloading: ${filename}`);
            window.open(pdfUrl, "_blank");
        } else {
            alert(`No direct download URL available for ${filename}.`);
        }
    }, []);

    const sharePdf = useCallback(async (title, filename, pdfUrl) => {
        const urlToShare = pdfUrl || `${window.location.origin}/pdfs/${filename}`;
        try {
            const tempInput = document.createElement("textarea");
            tempInput.value = urlToShare;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            alert(`Link copied to clipboard!\n\n${urlToShare}\n\nYou can also share via email.`);
        } catch (err) {
            console.error("Failed to copy text: ", err);
            alert(`Could not copy link to clipboard. You can manually copy it:\n\n${urlToShare}\n\nOr share via email.`);
        }

        const emailSubject = encodeURIComponent(`Check out this document: ${title}`);
        const emailBody = encodeURIComponent(
            `Hi,\n\nI thought you might be interested in this document: ${title}.\n\nYou can find it here: ${urlToShare}\n\nRegards,`,
        );
        const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        window.open(mailtoLink, "_blank");
    }, []);

    const showPdfDetails = useCallback((pdf) => {
        console.log("Debug PublicAccess: showPdfDetails called with PDF:", pdf);
        setSelectedPdfForComments(pdf);
        setActiveSidebarTab("pdf");
        setTimeout(() => {
            const commentsSection = document.getElementById("comments-sidebar");
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 100);
    }, []);

    const closeSidebar = useCallback(() => {
        console.log("Debug PublicAccess: Closing sidebar.");
        setSelectedPdfForComments(null);
    }, []);

    const addComment = useCallback(async () => {
        if (!selectedPdfForComments || !newCommentText.trim()) {
            alert("Please type a comment.");
            return;
        }

        const newComment = {
            id: Date.now().toString(),
            pdfId: selectedPdfForComments.id,
            commentText: newCommentText.trim(),
            userId: currentUserId,
        };
        await createComment(newComment);
        setNewCommentText("");
    }, [selectedPdfForComments, newCommentText, createComment, currentUserId]);

    const handleRating = useCallback(
        async (rating) => {
            if (!selectedPdfForComments) {
                alert("Please select a document to rate.");
                return;
            }

            if (rating < 1 || rating > 5) return;

            try {
                const result = await createRatings({ pdfId: selectedPdfForComments.id, rating, userId: currentUserId });
                if (result?.success) {
                    await getRatingsByPdfId(selectedPdfForComments.id, currentUserId);
                }
                alert(`You rated this document ${rating} star(s)!`);
            } catch (err) {
                console.error("Error submitting rating:", err);
                alert("There was an error submitting your rating.");
            }
        },
        [selectedPdfForComments, createRatings, getRatingsByPdfId, currentUserId],
    );

    const toggleBookmark = useCallback(async (pdfId) => {
        setBookmarkedPdfs((prevBookmarks) => {
            const newState = {
                ...prevBookmarks,
                [pdfId]: !prevBookmarks[pdfId],
            };
            alert(`Document ${newState[pdfId] ? "bookmarked" : "unbookmarked"}!`);
            return newState;
        });
    }, []);

    const handleShowBookmarks = useCallback(() => {
        setShowBookmarks(true);
        setCurrentCategory(null);
        setSearchTerm("");
        setAdvAuthor("");
        setAdvApprovalDate("");
        setAdvSelectedTags([]);
        setSelectedPdfForComments(null);
        setShowMobileSidebar(false);
    }, []);

    const truncateText = (text, maxLength) => {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + "...";
    };

    // Skeleton components
    const renderCategorySkeleton = () => (
        <div className="mb-4">
            <Skeleton
                height={28}
                width="70%"
            />
        </div>
    );

    const renderDocumentCardSkeleton = () => (
        <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg">
            <div className="h-40 bg-gray-200">
                <Skeleton height={160} />
            </div>
            <div className="p-4">
                <Skeleton
                    height={24}
                    width="80%"
                    className="mb-2"
                />
                <Skeleton count={2} />
                <div className="mt-3 flex">
                    <Skeleton
                        circle
                        width={24}
                        height={24}
                        className="mr-2"
                    />
                    <Skeleton width={60} />
                </div>
            </div>
        </div>
    );

    const renderDetailsSkeleton = () => (
        <div className="h-full rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
                <Skeleton
                    width={120}
                    height={24}
                />
                <Skeleton
                    circle
                    width={32}
                    height={32}
                />
            </div>

            <Skeleton
                height={28}
                width="70%"
                className="mb-4"
            />
            <Skeleton
                count={3}
                className="mb-3"
            />

            <div className="my-4 flex flex-wrap gap-2">
                {[1, 2, 3].map((_, i) => (
                    <Skeleton
                        key={i}
                        width={60}
                        height={24}
                    />
                ))}
            </div>

            <div className="my-6">
                <Skeleton
                    height={24}
                    width="40%"
                    className="mb-2"
                />
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                        <Skeleton
                            key={i}
                            circle
                            width={28}
                            height={28}
                            className="mr-1"
                        />
                    ))}
                </div>
            </div>

            <div>
                <Skeleton
                    height={24}
                    width="30%"
                    className="mb-3"
                />
                <div className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-start"
                        >
                            <Skeleton
                                circle
                                width={32}
                                height={32}
                                className="mr-3"
                            />
                            <div className="flex-1">
                                <Skeleton
                                    width={100}
                                    height={16}
                                    className="mb-1"
                                />
                                <Skeleton
                                    height={14}
                                    count={2}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex">
                    <Skeleton
                        height={36}
                        containerClassName="flex-1 mr-2"
                    />
                    <Skeleton
                        width={80}
                        height={36}
                    />
                </div>
            </div>
        </div>
    );

    const renderHeaderSkeleton = () => (
        <div className="bg-white p-4 shadow-md">
            <div className="container mx-auto flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center space-x-4">
                    <Skeleton
                        circle
                        width={40}
                        height={40}
                    />
                    <Skeleton
                        width={150}
                        height={24}
                    />
                </div>

                <div className="max-w-xl flex-1">
                    <div className="relative">
                        <Skeleton
                            height={40}
                            borderRadius={8}
                        />
                    </div>
                </div>

                <div className="flex space-x-3">
                    <Skeleton
                        width={40}
                        height={40}
                    />
                    <Skeleton
                        width={40}
                        height={40}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="font-inter flex min-h-screen flex-col bg-gray-50">
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
            />

            {isLoading ? (
                renderHeaderSkeleton()
            ) : (
                <Header
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                    showAdvancedSearch={showAdvancedSearch}
                    toggleAdvancedSearch={toggleAdvancedSearch}
                >
                    {showAdvancedSearch && (
                        <AdvancedSearch
                            variants={advancedSearchVariants}
                            advAuthor={advAuthor}
                            handleAdvAuthorChange={handleAdvAuthorChange}
                            advApprovalDate={advApprovalDate}
                            handleAdvApprovalDateChange={handleAdvApprovalDateChange}
                            allUniqueTags={allUniqueTags}
                            advSelectedTags={advSelectedTags}
                            handleTagToggle={handleTagToggle}
                            clearAdvancedFilters={clearAdvancedFilters}
                        />
                    )}
                </Header>
            )}

            <main className="container mx-auto flex flex-grow items-start gap-8 p-4 md:p-6">
                {/* Mobile sidebar toggle */}
                <div className="fixed bottom-6 right-6 z-30 md:hidden">
                    <button
                        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Toggle sidebar"
                    >
                        <i className={`fas ${showMobileSidebar ? "fa-times" : "fa-filter"} text-xl text-white`}></i>
                    </button>
                </div>

                {/* Mobile Categories Sidebar */}
                <div
                    className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${showMobileSidebar ? "visible opacity-100" : "invisible opacity-0"}`}
                    onClick={() => setShowMobileSidebar(false)}
                >
                    <div
                        className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white p-6 shadow-xl transition-transform"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton
                                    height={32}
                                    width="60%"
                                    className="mb-6"
                                />
                                {Array(5)
                                    .fill()
                                    .map((_, i) => renderCategorySkeleton(i))}
                            </div>
                        ) : (
                            <CategoriesSidebar
                                categories={categories}
                                currentCategory={currentCategory}
                                showBookmarks={showBookmarks}
                                handleCategoryClick={handleCategoryClick}
                                handleShowBookmarks={handleShowBookmarks}
                                hasNewApprovedFiles={hasNewApprovedFiles}
                            />
                        )}
                    </div>
                </div>

                {/* Desktop Categories Sidebar */}
                <div className="hidden flex-[1] md:block lg:flex-[1.2]">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton
                                height={32}
                                width="60%"
                                className="mb-6"
                            />
                            {Array(5)
                                .fill()
                                .map((_, i) => renderCategorySkeleton(i))}
                            <div className="mt-8">
                                <Skeleton
                                    height={32}
                                    width="80%"
                                />
                            </div>
                        </div>
                    ) : (
                        <CategoriesSidebar
                            categories={categories}
                            currentCategory={currentCategory}
                            showBookmarks={showBookmarks}
                            handleCategoryClick={handleCategoryClick}
                            handleShowBookmarks={handleShowBookmarks}
                            hasNewApprovedFiles={hasNewApprovedFiles}
                        />
                    )}
                </div>

                {/* Document List */}
                <div className={`${selectedPdfForComments ? "flex-[5]" : "flex-[6]"} w-full`}>
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Array(6)
                                .fill()
                                .map((_, i) => renderDocumentCardSkeleton(i))}
                        </div>
                    ) : (
                        <>
                            {/* Mobile category indicator */}
                            <div className="mb-4 flex items-center md:hidden">
                                <span className="mr-2 text-sm font-medium text-gray-500">Viewing:</span>
                                {showBookmarks ? (
                                    <span className="flex items-center text-blue-600">
                                        <i className="fas fa-bookmark mr-1"></i>
                                        <span className="font-medium">Bookmarks</span>
                                    </span>
                                ) : currentCategory === "new_approved_files" ? (
                                    <span className="font-medium text-blue-600">New Approved Files</span>
                                ) : currentCategory ? (
                                    <span className="font-medium text-blue-600">{categories.find((c) => c.id === currentCategory)?.name}</span>
                                ) : (
                                    <span className="font-medium text-blue-600">All Documents</span>
                                )}
                            </div>

                            <DocumentList
                                selectedPdfForComments={selectedPdfForComments}
                                showBookmarks={showBookmarks}
                                currentCategory={currentCategory}
                                categories={categories}
                                filteredPdfs={filteredPdfs}
                                showPdfDetails={showPdfDetails}
                                cardVariants={cardVariants}
                            />
                        </>
                    )}
                </div>

                {/* Desktop Document Details Sidebar */}
                {selectedPdfForComments && (
                    <div className="hidden flex-[2] lg:block">
                        {isLoading ? (
                            renderDetailsSkeleton()
                        ) : (
                            <DocumentDetailsSidebar
                                selectedPdfForComments={selectedPdfForComments}
                                closeSidebar={closeSidebar}
                                sidebarVariants={sidebarVariants}
                                activeSidebarTab={activeSidebarTab}
                                setActiveSidebarTab={setActiveSidebarTab}
                                downloadPdf={downloadPdf}
                                sharePdf={sharePdf}
                                bookmarkedPdfs={bookmarkedPdfs}
                                toggleBookmark={toggleBookmark}
                                truncateText={truncateText}
                                userRating={userRating}
                                averageRating={averageRating}
                                totalRatingsCount={totalRatingsCount}
                                handleRating={handleRating}
                                comments={isComments}
                                commentLoading={commentLoading}
                                newCommentText={newCommentText}
                                setNewCommentText={setNewCommentText}
                                addComment={addComment}
                            />
                        )}
                    </div>
                )}

                {/* Mobile Document Details Sidebar */}
                {selectedPdfForComments && (
                    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden">
                        <div className="absolute right-0 top-0 h-full w-full bg-white sm:w-4/5">
                            <DocumentDetailsSidebar
                                selectedPdfForComments={selectedPdfForComments}
                                closeSidebar={closeSidebar}
                                sidebarVariants={sidebarVariants}
                                activeSidebarTab={activeSidebarTab}
                                setActiveSidebarTab={setActiveSidebarTab}
                                downloadPdf={downloadPdf}
                                sharePdf={sharePdf}
                                bookmarkedPdfs={bookmarkedPdfs}
                                toggleBookmark={toggleBookmark}
                                truncateText={truncateText}
                                userRating={userRating}
                                averageRating={averageRating}
                                totalRatingsCount={totalRatingsCount}
                                handleRating={handleRating}
                                comments={isComments}
                                commentLoading={commentLoading}
                                newCommentText={newCommentText}
                                setNewCommentText={setNewCommentText}
                                addComment={addComment}
                            />
                        </div>
                    </div>
                )}
            </main>
            {!isLoading && filteredPdfs.length === 0 && (
                <div className="container mx-auto flex flex-grow flex-col items-center justify-center p-8 text-center">
                    <div className="mb-6 rounded-full bg-gray-100 p-6">
                        <i className="fas fa-file-search text-4xl text-gray-400"></i>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-800">{showBookmarks ? "No bookmarks yet" : "No documents found"}</h3>
                    <p className="max-w-md text-gray-500">
                        {showBookmarks
                            ? "Save documents to your bookmarks to find them easily later"
                            : "Try adjusting your search or filter criteria to find what you're looking for"}
                    </p>
                </div>
            )}
             <Footer />

        </div>
    );
}

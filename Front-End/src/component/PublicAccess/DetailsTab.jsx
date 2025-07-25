import React, { useState } from 'react';

export default function DetailsTab({
    pdf,
    bookmarkedPdfs,
    toggleBookmark,
    truncateText,
    userRating,
    averageRating,
    totalRatingsCount,
    handleRating
}) {
    const [showPlainSummary, setShowPlainSummary] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    if (!pdf) return <p className="text-center text-gray-500 py-4">No PDF selected.</p>;

    // Improved star rendering with hover effects
    const renderStars = (ratingValue, isInteractive = false) => {
        return [1, 2, 3, 4, 5].map((star) => {
            let starClass = "text-xl";
            
            if (isInteractive) {
                starClass += " cursor-pointer transition-transform duration-150 hover:scale-110";
                
                if (star <= (hoverRating || userRating)) {
                    starClass += " text-yellow-400";
                } else {
                    starClass += " text-gray-300";
                }
            } else {
                if (star <= Math.floor(ratingValue)) {
                    starClass += " text-yellow-400";
                } else if (star === Math.ceil(ratingValue) && ratingValue % 1 >= 0.5) {
                    starClass += " text-yellow-400";
                } else {
                    starClass += " text-gray-300";
                }
            }

            return (
                <span key={`star-${star}`} className="relative">
                    {isInteractive ? (
                        <button
                            onClick={() => handleRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className={starClass}
                            aria-label={`Rate ${star} stars`}
                        >
                            <i className="fas fa-star"></i>
                        </button>
                    ) : (
                        <span className={starClass}>
                            {star <= ratingValue ? (
                                <i className="fas fa-star"></i>
                            ) : star - 0.5 <= ratingValue ? (
                                <i className="fas fa-star-half-alt"></i>
                            ) : (
                                <i className="far fa-star"></i>
                            )}
                        </span>
                    )}
                </span>
            );
        });
    };

    return (
        <div className="details-tab bg-white rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Document Information</h3>

            <div className="space-y-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="min-w-[200px]">
                        <p className="text-gray-600 mb-1"><strong>Title:</strong></p>
                        <p className="text-gray-800 font-medium">{pdf.title}</p>
                    </div>
                    
                    <div className="min-w-[200px]">
                        <p className="text-gray-600 mb-1"><strong>Author:</strong></p>
                        <p className="text-gray-800">{pdf.author}</p>
                    </div>
                    
                    <div className="min-w-[200px]">
                        <p className="text-gray-600 mb-1"><strong>Approval Date:</strong></p>
                        <p className="text-gray-800">{pdf.approvalDate}</p>
                    </div>
                    
                    <div className="min-w-[200px]">
                        <p className="text-gray-600 mb-1"><strong>Category:</strong></p>
                        <p className="text-gray-800">{pdf.category}</p>
                    </div>
                    
                    <div className="min-w-[200px]">
                        <p className="text-gray-600 mb-1"><strong>Access Level:</strong></p>
                        <p className={`font-medium ${pdf.accessLevel === 'public' ? 'text-green-600' : 'text-red-600'}`}>
                            {pdf.accessLevel.charAt(0).toUpperCase() + pdf.accessLevel.slice(1)}
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-gray-600 mb-2"><strong>Tags:</strong></p>
                    <div className="flex flex-wrap gap-2">
                        {pdf.tags?.length > 0 ? (
                            pdf.tags.map((tag, index) => (
                                <span 
                                    key={index} 
                                    className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full flex items-center"
                                >
                                    <i className="fas fa-tag mr-2 text-xs"></i>
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500 text-sm">No tags available.</span>
                        )}
                    </div>
                </div>

                <div className="mt-5">
                    <p className="text-gray-600 mb-2 flex items-center">
                        <strong>Summary:</strong>
                        <i className="fas fa-file-alt ml-2 text-gray-400"></i>
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 text-base leading-relaxed">
                            {showPlainSummary ? pdf.plainSummary : truncateText(pdf.plainSummary, 200)}
                        </p>
                        {pdf.plainSummary.length > 200 && (
                            <button
                                onClick={() => setShowPlainSummary(!showPlainSummary)}
                                className="mt-3 text-indigo-600 hover:text-indigo-800 font-medium flex items-center text-sm focus:outline-none"
                            >
                                {showPlainSummary ? (
                                    <>
                                        <i className="fas fa-chevron-up mr-1"></i> Show Less
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-chevron-down mr-1"></i> Show More
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-gray-200">
                <button
                    onClick={() => toggleBookmark(pdf.id)}
                    className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center
                        ${bookmarkedPdfs[pdf.id]
                            ? 'bg-yellow-50 border-2 border-yellow-500 text-yellow-700 shadow-sm'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                >
                    <i className={`fas fa-bookmark mr-2 ${bookmarkedPdfs[pdf.id] ? 'text-yellow-500' : 'text-gray-400'}`}></i>
                    {bookmarkedPdfs[pdf.id] ? 'Bookmarked' : 'Bookmark'}
                </button>

                <div className="flex-1 max-w-md">
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="flex items-center">
                                <span className="text-gray-700 font-medium mr-2">Average Rating:</span>
                                <span className="text-amber-600 font-bold text-lg">{averageRating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center text-amber-500">
                                {renderStars(averageRating)}
                            </div>
                            <span className="text-gray-500 text-sm">({totalRatingsCount} ratings)</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between">
                            <span className="text-gray-700 font-medium">Your Rating:</span>
                            <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                                {renderStars(userRating, true)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
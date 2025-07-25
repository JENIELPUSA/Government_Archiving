import React from 'react';
import { motion } from 'framer-motion';

export default function DocumentCard({ pdf, showPdfDetails, cardVariants }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            showPdfDetails(pdf);
        }
    };

    return (
        <motion.div
            key={pdf.id}
            className="group bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-stretch cursor-pointer overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            onClick={() => showPdfDetails(pdf)}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label={`View ${pdf.title} document details`}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex flex-col h-full">
                {/* Modern SVG Icon */}
                <div className="flex justify-center mb-4 text-red-500">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-16 w-16 group-hover:text-red-600 transition-colors"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>

                {/* Content Area */}
                <div className="flex-grow mb-4">
                    {/* Title with responsive truncation */}
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-center mb-3 line-clamp-2">
                        {pdf.title}
                    </h3>
                    
                    <div className="space-y-2 mt-4">
                        <p className="text-sm text-gray-600 flex items-start">
                            <span className="font-medium w-24 flex-shrink-0">Author:</span>
                            <span className="flex-grow truncate">{pdf.author}</span>
                        </p>
                        
                        <p className="text-sm text-gray-600 flex items-start">
                            <span className="font-medium w-24 flex-shrink-0">Approved:</span>
                            <span>{pdf.approvalDate}</span>
                        </p>
                    </div>

                    {/* Tags with fade gradient */}
                    {pdf.tags?.length > 0 && (
                        <div className="mt-4 relative">
                            <div className="flex flex-wrap gap-2 py-2 max-h-20 overflow-hidden">
                                {pdf.tags.map((tag, index) => (
                                    <span 
                                        key={index} 
                                        className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full group-hover:bg-blue-100 transition-colors"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        </div>
                    )}
                </div>
                
                {/* Interactive Footer */}
                <div className="pt-4 border-t border-gray-100 text-center">
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
                        View Details
                        <span className="ml-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">→</span>
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// Default variants for fallback
DocumentCard.defaultProps = {
    cardVariants: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 }
    }
};
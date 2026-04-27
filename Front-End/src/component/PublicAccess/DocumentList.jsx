import React from 'react';
import { AnimatePresence } from 'framer-motion';
import DocumentCard from './DocumentCard';

export default function DocumentList({ selectedPdfForComments, showBookmarks, currentCategory, categories, filteredPdfs, showPdfDetails, cardVariants }) {
    return (
        <section className={`bg-white rounded-xl shadow-lg p-6 ${selectedPdfForComments ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-3'}`}>
            <h2 className="text-2xl font-semibold mb-5 text-gray-800">
                {showBookmarks ? 'My Bookmarked Documents' : (currentCategory ? categories.find(cat => cat.id === currentCategory)?.name : 'All Documents')}
            </h2>
            <div id="lawPdfList" className="grid grid-cols-1 sm:grid-cols-3 gap-6 scrollable-content">
                <AnimatePresence>
                    {filteredPdfs.length > 0 ? (
                        filteredPdfs.map(pdf => (
                            <DocumentCard
                                key={pdf.id}
                                pdf={pdf}
                                showPdfDetails={showPdfDetails}
                                cardVariants={cardVariants}
                            />
                        ))
                    ) : (
                        <p className="text-gray-600 text-lg col-span-full text-center py-10">No documents found matching your criteria.</p>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
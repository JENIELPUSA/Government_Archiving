import React, { useContext, useState, useEffect } from 'react';
import DocumentFilter from './DocumentFilter';
import DocumentTable from './DocumentTable';
import ViewedByList from './ViewedByList';
import DocumentModal from './DocumentModal';
import { FilesDisplayContext } from '../../../contexts/FileContext/FileContext';

const RecentDocument = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDetails, setModalDetails] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const { isFile } = useContext(FilesDisplayContext);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const openModal = (document) => {
    setModalTitle(document.title);

    const createdAt = new Date(document.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const updatedAt = document.updatedAt
      ? new Date(document.updatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—';

    const details = `
      Author: ${document.author}<br>
      Category: ${document.category}<br>
      Status: ${document.status}<br>
      Uploaded: ${createdAt}<br>
      Last Modified: ${updatedAt}
    `;

    setModalDetails(details);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleFilterChange = ({ search, status, category, tags, dateFrom, dateTo }) => {
    setSearchTerm(search);
    setFilterStatus(status);
    setFilterCategory(category);
    setFilterTags(tags);
    setFilterDateFrom(dateFrom);
    setFilterDateTo(dateTo);
    setCurrentPage(1);
  };

  const filteredDocuments = isFile?.filter((doc) => {
    const matchSearch =
      searchTerm === '' ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === '' || doc.status === filterStatus;
    const matchCategory = filterCategory === '' || doc.category === filterCategory;
    const matchTags =
      filterTags.length === 0 ||
      (doc.tags && filterTags.every((tag) => doc.tags.includes(tag)));

    const docDate = new Date(doc.createdAt);
    const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
    const toDate = filterDateTo ? new Date(filterDateTo) : null;
    const matchDateFrom = !fromDate || docDate >= fromDate;
    const matchDateTo = !toDate || docDate <= toDate;

    return matchSearch && matchStatus && matchCategory && matchTags && matchDateFrom && matchDateTo;
  });

  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments?.slice(indexOfFirstDocument, indexOfLastDocument);

  const totalPages = Math.ceil((filteredDocuments?.length || 0) / documentsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // ===== SKELETON COMPONENTS =====
  const DocumentFilterSkeleton = () => (
    <div className="mb-6 animate-pulse">
      <div className="flex flex-wrap gap-4">
        <div className="h-10 w-full rounded bg-gray-200 md:w-64 dark:bg-gray-700"></div>
        <div className="h-10 w-full rounded bg-gray-200 md:w-48 dark:bg-gray-700"></div>
        <div className="h-10 w-full rounded bg-gray-200 md:w-48 dark:bg-gray-700"></div>
        <div className="h-10 w-full rounded bg-gray-200 md:w-56 dark:bg-gray-700"></div>
        <div className="h-10 w-full rounded bg-gray-200 md:w-40 dark:bg-gray-700"></div>
        <div className="h-10 w-full rounded bg-gray-200 md:w-40 dark:bg-gray-700"></div>
        <div className="h-10 w-full rounded bg-gray-200 md:w-24 dark:bg-gray-700"></div>
        <div className="h-10 w-full rounded bg-gray-200 md:w-24 dark:bg-gray-700"></div>
      </div>
    </div>
  );

  const DocumentTableSkeleton = () => (
    <div className="animate-pulse mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-5 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-700">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 rounded bg-gray-200 dark:bg-gray-600"></div>
          ))}
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(5)].map((_, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-5 gap-4 px-6 py-4">
              {[...Array(5)].map((_, colIdx) => (
                <div 
                  key={colIdx} 
                  className={`h-4 rounded bg-gray-200 dark:bg-gray-700 ${colIdx === 4 ? 'w-24' : ''}`}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ViewedByListSkeleton = () => (
    <div className="animate-pulse mt-8">
      <div className="mb-4 h-6 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="mr-3 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div>
              <div className="mb-1 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="p-6 rounded-xl shadow-lg dark:bg-gray-800 dark:text-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <i className="fas fa-folder-open mr-3 text-blue-600 dark:text-blue-400"></i>
            Recent Documents
          </h1>
        </div>

        {/* Document Filter - Skeleton or Component */}
        {loading ? (
          <DocumentFilterSkeleton />
        ) : (
          <DocumentFilter documents={isFile || []} onFilterChange={handleFilterChange} />
        )}

        {/* Document Table - Skeleton or Component */}
        {loading ? (
          <DocumentTableSkeleton />
        ) : (
          <DocumentTable documents={currentDocuments} onPreview={openModal} />
        )}
      </div>

      {/* Document Modal */}
      {showModal && (
        <DocumentModal
          title={modalTitle}
          details={modalDetails}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default RecentDocument;
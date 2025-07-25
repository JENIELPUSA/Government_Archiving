import React, { useState, useEffect, useMemo } from "react";
import { Hash, BookOpen, Tag, FileText, User, CheckCircle, ChevronLeft, ChevronRight, Calendar, Search } from "lucide-react";

// Component for a single document entry
const DocumentEntry = ({ doc, onClick }) => (
  <div
    className="flex items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
    onClick={() => onClick(doc)}
  >
    {/* # Field */}
    <div className="w-[5%] text-gray-600 dark:text-gray-400 text-sm flex items-center">
      <Hash size={16} className="mr-2 text-blue-500" /> {doc.id}
    </div>
    {/* Title Field */}
    <div className="w-[20%] text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center truncate">
      <BookOpen size={16} className="mr-2 text-purple-500" /> {doc.title}
    </div>
    {/* Category Field */}
    <div className="w-[15%] text-gray-700 dark:text-gray-300 text-sm flex items-center truncate">
      <Tag size={16} className="mr-2 text-orange-500" /> {doc.category}
    </div>
    {/* Summary Field */}
    <div className="flex-1 text-gray-800 dark:text-gray-200 text-sm truncate">
      <FileText size={16} className="mr-2 text-teal-500" /> {String(doc.summary || '')}
    </div>
    {/* Author Field */}
    <div className="w-[15%] text-gray-600 dark:text-gray-400 text-sm flex items-center truncate">
      <User size={16} className="mr-2 text-green-500" /> {doc.author}
    </div>
    {/* Status Field */}
    <div className="w-[10%] text-gray-600 dark:text-gray-400 text-sm text-right flex items-center justify-end truncate">
      <CheckCircle size={16} className="mr-2 text-red-500" /> {String(doc.status || '')}
    </div>
  </div>
);

// Section for all documents
function DocumentsSection({ setSelectedDocForDetail }) {
  // Dummy Data
  const allDocuments = useMemo(() => [
    { id: 1, title: "Report sa Proyekto A", category: "Ulat", summary: "Pangkalahatang-ideya ng pag-unlad ng proyekto A.", author: "Juan Dela Cruz", status: "Kumpleto", date: "2023-01-15" },
    { id: 2, title: "Memorandum sa Bagong Patakaran", category: "Memo", summary: "Mga pagbabago sa patakaran sa pagliban.", author: "Maria Santos", status: "Nasa Pagsusuri", date: "2023-02-20" },
    { id: 3, title: "Panukala sa Marketing Campaign", category: "Panukala", summary: "Mga ideya para sa susunod na marketing campaign.", author: "Pedro Reyes", status: "Draft", date: "2023-03-01" },
    { id: 4, title: "Gabay sa Paggamit ng Software", category: "Gabay", summary: "Detalyadong instruksyon sa paggamit ng bagong software.", author: "Anna Garcia", status: "Kumpleto", date: "2023-03-10" },
    { id: 5, title: "Minutes ng Pulong (Q1)", category: "Pulong", summary: "Mga desisyon at aksyon mula sa Q1 meeting.", author: "Juan Dela Cruz", status: "Kumpleto", date: "2023-04-05" },
    { id: 6, title: "Pagsusuri ng Data ng Benta", category: "Pagsusuri", summary: "Pag-aaral ng data ng benta para sa nakaraang quarter.", author: "Maria Santos", status: "Nasa Pagsusuri", date: "2023-05-12" },
    { id: 7, title: "Plano ng Pagsasanay sa Empleyado", category: "Plano", summary: "Mga module at iskedyul ng pagsasanay.", author: "Pedro Reyes", status: "Draft", date: "2023-06-01" },
    { id: 8, title: "Feedback sa Produkto", category: "Feedback", summary: "Koleksyon ng feedback mula sa mga customer.", author: "Anna Garcia", status: "Kumpleto", date: "2023-06-25" },
    { id: 9, title: "Ulat sa Seguridad ng IT", category: "Ulat", summary: "Pagsusuri ng kasalukuyang seguridad ng IT infrastructure.", author: "Juan Dela Cruz", status: "Nasa Pagsusuri", date: "2023-07-01" },
    { id: 10, title: "Patakaran sa Remote Work", category: "Patakaran", summary: "Bagong patakaran para sa remote work arrangements.", author: "Maria Santos", status: "Kumpleto", date: "2023-07-10" },
    { id: 11, title: "Project X Proposal", category: "Proposal", summary: "Detailed proposal for Project X.", author: "John Doe", status: "Pending", date: "2024-01-05" },
    { id: 12, title: "Marketing Strategy 2024", category: "Strategy", summary: "Overview of marketing plans for 2024.", author: "Jane Smith", status: "Approved", date: "2024-02-10" },
    { id: 13, title: "Financial Report Q1 2024", category: "Report", summary: "First quarter financial performance.", author: "Alice Brown", status: "Finalized", date: "2024-04-01" },
    { id: 14, title: "Client Meeting Notes", category: "Notes", summary: "Summary of discussions with key client.", author: "Bob White", status: "Draft", date: "2024-04-15" },
    { id: 15, title: "Product Development Roadmap", category: "Roadmap", summary: "Future plans for product features.", author: "Charlie Green", status: "In Progress", date: "2024-05-20" },
    { id: 16, title: "Employee Handbook Update", category: "HR", summary: "Revisions to the employee handbook.", author: "David Black", status: "Review", date: "2024-06-01" },
    { id: 17, title: "Sales Performance Analysis", category: "Analysis", summary: "Deep dive into sales figures for H1.", author: "Eve Blue", status: "Complete", date: "2024-06-30" },
    { id: 18, title: "New Feature Design Doc", category: "Design", summary: "Technical specifications for new software feature.", author: "Frank Grey", status: "Draft", date: "2024-07-05" },
    { id: 19, title: "Vendor Contract Review", category: "Legal", summary: "Review of terms for new vendor agreement.", author: "Grace Red", status: "Pending", date: "2024-07-10" },
    { id: 20, title: "Team Building Event Plan", category: "Event", summary: "Logistics and activities for team building.", author: "Harry Yellow", status: "Approved", date: "2024-07-15" },
  ], []);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPageDocs, setCurrentPageDocs] = useState(1);
  const docsPerPage = 5; // Number of documents per page

  // Filtered documents based on search term and date range
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter(doc => {
      const matchesSearch = searchTerm === "" ||
        Object.values(doc).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

      const docDate = new Date(doc.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      const matchesDateRange = (!fromDate || docDate >= fromDate) &&
                               (!toDate || docDate <= toDate);

      return matchesSearch && matchesDateRange;
    });
  }, [allDocuments, searchTerm, dateFrom, dateTo]);

  // Calculate total pages for filtered documents
  const totalPagesDocs = Math.ceil(filteredDocuments.length / docsPerPage);

  // Get current documents for the current page
  const currentDocs = useMemo(() => {
    const indexOfLastDoc = currentPageDocs * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    return filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc);
  }, [currentPageDocs, filteredDocuments, docsPerPage]);

  // Handle page change
  const paginateDocs = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPagesDocs) {
      setCurrentPageDocs(pageNumber);
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPageDocs(1);
  }, [searchTerm, dateFrom, dateTo]);

  return (
    <section className="mt-6 rounded-xl border-t border-blue-200 bg-white p-6 shadow-lg transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-6 px-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        Documents
      </h2>

      {/* Filter and Search Section */}
      <div className="mb-6 px-4 flex flex-wrap items-center gap-4">
        {/* Date From */}
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
          <label htmlFor="dateFrom" className="text-sm text-gray-700 dark:text-gray-300">Date From:</label>
          <input
            type="date"
            id="dateFrom"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-500 dark:text-gray-400" />
          <label htmlFor="dateTo" className="text-sm text-gray-700 dark:text-gray-300">Date To:</label>
          <input
            type="date"
            id="dateTo"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-grow">
          <Search size={20} className="text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Column Headers */}
      <div className="mb-4 flex items-center px-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="w-[5%] font-medium">#</div>
        <div className="w-[20%] font-medium">Title</div>
        <div className="w-[15%] font-medium">Category</div>
        <div className="flex-1 font-medium">Summary</div>
        <div className="w-[15%] font-medium">Author</div>
        <div className="w-[10%] text-right font-medium">Status</div>
      </div>

      {/* Document Entries */}
      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
        {currentDocs.length > 0 ? (
          currentDocs.map((doc, index) => (
            <DocumentEntry
              key={doc.id || index} // Use doc.id if available, otherwise index
              doc={doc}
              onClick={setSelectedDocForDetail}
            />
          ))
        ) : (
          <p className="p-4 text-center text-gray-500 dark:text-gray-400">
            No document entries available.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPagesDocs > 1 && (
        <div className="mt-4 flex items-center justify-center space-x-2">
          <button
            onClick={() => paginateDocs(1)} // Go to first page
            disabled={currentPageDocs === 1}
            className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            &lt;&lt; {/* First page button */}
          </button>
          <button
            onClick={() => paginateDocs(currentPageDocs - 1)}
            disabled={currentPageDocs === 1}
            className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPagesDocs }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginateDocs(i + 1)}
              className={`rounded-full px-3 py-1 ${
                currentPageDocs === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              } transition-colors duration-200`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginateDocs(currentPageDocs + 1)}
            disabled={currentPageDocs === totalPagesDocs}
            className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => paginateDocs(totalPagesDocs)} // Go to last page
            disabled={currentPageDocs === totalPagesDocs}
            className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            &gt;&gt; {/* Last page button */}
          </button>
        </div>
      )}
    </section>
  );
}

export default DocumentsSection;

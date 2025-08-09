import React, { useContext, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext";

const DocumentTableList = ({
  documents,
  title,
  icon: Icon,
  iconColorClass,
  onBack,
  onViewDocument,
  isNewDocument,
}) => {
  const officerContext = useContext(OfficerDisplayContext);

  const { totalPages, currentPage, setCurrentPage, fetchData } = useMemo(() => {
    const {
      totalPagesPending,
      totalPagesApproved,
      totalPagesRejected,
      currentPagePending,
      currentPageApproved,
      currentPageRejected,
      setCurrentPagePending,
      setCurrentPageApproved,
      setCurrentPageRejected,
      FetchOfficerFiles,
    } = officerContext;

    switch (title) {
      case "Pending Documents":
        return {
          totalPages: totalPagesPending,
          currentPage: currentPagePending,
          setCurrentPage: setCurrentPagePending,
          fetchData: () => FetchOfficerFiles(currentPagePending, "pending"),
        };
      case "Approved Documents":
        return {
          totalPages: totalPagesApproved,
          currentPage: currentPageApproved,
          setCurrentPage: setCurrentPageApproved,
          fetchData: () => FetchOfficerFiles(currentPageApproved, "approved"),
        };
      case "Rejected Documents":
        return {
          totalPages: totalPagesRejected,
          currentPage: currentPageRejected,
          setCurrentPage: setCurrentPageRejected,
          fetchData: () => FetchOfficerFiles(currentPageRejected, "rejected"),
        };
      default:
        return {
          totalPages: 1,
          currentPage: 1,
          setCurrentPage: () => {},
          fetchData: () => {},
        };
    }
  }, [
    title,
    officerContext.totalPagesPending,
    officerContext.totalPagesApproved,
    officerContext.totalPagesRejected,
    officerContext.currentPagePending,
    officerContext.currentPageApproved,
    officerContext.currentPageRejected,
    officerContext.setCurrentPagePending,
    officerContext.setCurrentPageApproved,
    officerContext.setCurrentPageRejected,
    officerContext.FetchOfficerFiles,
  ]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <button
        onClick={onBack}
        className="mb-6 flex items-center font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back
      </button>

      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center">
          <Icon className={`mr-3 h-7 w-7 ${iconColorClass}`} />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        {documents?.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {documents.map((doc, index) => (
                  <motion.tr
                    key={doc._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-gray-500" />
                        <div className="max-w-xs truncate text-sm font-medium text-gray-900 dark:text-white">
                          {doc.fileName}
                          {isNewDocument(doc.createdAt) && (
                            <span className="ml-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {doc.title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          doc.status === "Approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : doc.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : doc.status === "Rejected"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : doc.status === "Draft"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : ""
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => onViewDocument(doc)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      Page <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-600 dark:hover:bg-gray-700"
                      >
                        <span className="sr-only">Previous</span>
                        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              page === currentPage
                                ? "bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500"
                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-600 dark:text-white dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-gray-600 dark:hover:bg-gray-700"
                      >
                        <span className="sr-only">Next</span>
                        <ArrowLeft
                          className="h-5 w-5 rotate-180"
                          aria-hidden="true"
                        />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            <p>No documents found for this category.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DocumentTableList;
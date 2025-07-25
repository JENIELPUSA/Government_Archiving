import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OfficerDashboard = () => {
  const [activeSection, setActiveSection] = useState('pending');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');

  const [documents, setDocuments] = useState([
    {
      id: "687b05c7b14b994f291992c4",
      title: "Barangay Annual Report 2024",
      summary: "A comprehensive summary of the barangay's accomplishments, finances, and activities for the year 2024.",
      author: "Maria Lopez",
      fullText: "PDF",
      fileUrl: "https://res.cloudinary.com/dskqeyqns/raw/upload/v1752892870/Government%20Archiving/68776346bc4a051d05a6c173/1752892859757_sample",
      fileName: "1752892859757_sample.pdf",
      status: "Approved",
      tags: ["barangay", "annual", "report", "2024", "comprehensive"],
      ArchivedStatus: "Archived",
      createdAt: "2025-07-19T02:41:11.088Z",
      updatedAt: "2025-07-19T02:43:20.940Z",
      archivedMetadata: {
        dateArchived: "2025-07-19T02:43:20.939Z",
        archivedBy: "68725094719ee6052f54bb39",
        notes: "Archived due to update"
      },
      category: "IT Department",
      categoryID: "68776346bc4a051d05a6c173",
      admin: "68725094719ee6052f54bb39",
      admin_first_name: "Juan",
      admin_last_name: "Dela Cruz",
      officer: "68778256129d069cedc152cb",
      officer_first_name: "Juan",
      officer_last_name: "Dela Cruz"
    },
    {
      id: "687b064eb14b994f291992d5",
      title: "Barangay Annual Report 2024 - V2",
      summary: "A comprehensive summary of the barangay's accomplishments, finances, and activities for the year 2024, version 2.",
      author: "Juan Dela Cruz",
      fullText: "PDF",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      fileName: "1752893001027_document_v1.pdf",
      status: "Approved",
      tags: ["barangay", "annual", "report", "2024", "comprehensive"],
      ArchivedStatus: "Active",
      createdAt: "2025-07-19T02:43:26.873Z",
      updatedAt: "2025-07-19T02:43:26.873Z",
      category: "IT Department",
      categoryID: "68776346bc4a051d05a6c173",
      admin: "68725094719ee6052f54bb39",
      admin_first_name: "Juan",
      admin_last_name: "Dela Cruz"
    },
    {
      id: 'doc-pending-001',
      title: 'Proposed Budget for Q3 2025',
      summary: 'Detailed budget proposal for the third quarter of 2025.',
      author: 'Anna Garcia',
      fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      status: 'Pending',
      createdAt: '2025-07-18T10:00:00.000Z',
      category: 'Finance Department',
      isUrgent: true,
      lastActionComment: '',
    },
    {
      id: 'doc-rejected-001',
      title: 'New Employee Onboarding Guide',
      summary: 'Revised guide for new employee onboarding process.',
      author: 'Pedro Reyes',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'Rejected',
      createdAt: '2025-07-17T14:30:00.000Z',
      category: 'HR Department',
      isUrgent: false,
      lastActionComment: 'Missing details in employee benefits section.',
    },
    {
      id: 'doc-pending-002',
      title: 'IT System Upgrade Proposal',
      summary: 'Proposal for upgrading the current IT infrastructure.',
      author: 'David Lim',
      fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      status: 'Pending',
      createdAt: '2025-07-16T09:15:00.000Z',
      category: 'IT Department',
      isUrgent: false,
      lastActionComment: '',
    },
    {
      id: 'doc-pending-003',
      title: 'Quarterly Sales Report Q2 2025',
      summary: 'Analysis of sales performance for the second quarter of 2025.',
      author: 'Sarah Chen',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'Pending',
      createdAt: '2025-07-19T08:00:00.000Z',
      category: 'Sales Department',
      isUrgent: true,
      lastActionComment: '',
    },
    {
      id: 'doc-approved-003',
      title: 'Company Policy Manual Update',
      summary: 'Updates to the company policy manual, including new remote work guidelines.',
      author: 'Olivia Tan',
      fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
      status: 'Approved',
      createdAt: '2025-07-19T09:30:00.000Z',
      category: 'HR Department',
      isUrgent: false,
      lastActionComment: '',
    },
  ].map(doc => ({
    id: doc._id || doc.id,
    title: doc.title,
    description: doc.summary || doc.description,
    submittedBy: doc.author,
    submittedByContact: doc.admin_first_name && doc.admin_last_name
      ? `${doc.admin_first_name.toLowerCase()}.${doc.admin_last_name.toLowerCase()}@example.com`
      : `${doc.author.toLowerCase().replace(/\s/g, '.')}@example.com`,
    dateSubmitted: new Date(doc.createdAt).toISOString().split('T')[0],
    createdAt: new Date(doc.createdAt),
    status: doc.status.toLowerCase(),
    type: doc.category || 'General',
    fileUrl: doc.fileUrl,
    isUrgent: doc.isUrgent || false,
    lastActionComment: doc.lastActionComment || '',
  })));


  const documentTypes = ['All', ...new Set(documents.map(doc => doc.type))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSection = (activeSection === 'all' || doc.status === activeSection);
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = (filterType === 'All' || doc.type === filterType);
    return matchesSection && matchesSearch && matchesType;
  });

  const recentDocuments = [...documents]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);


  const handleApprove = (docId) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === docId ? { ...doc, status: 'approved', lastActionComment: '' } : doc
      )
    );
    alert(`Document ${docId} has been approved.`);
    setSelectedDocument(null);
    setShowDocumentViewer(false);
  };

  const initiateReject = (doc) => {
    setSelectedDocument(doc);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedDocument) {
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === selectedDocument.id ? { ...doc, status: 'rejected', lastActionComment: rejectionComment } : doc
        )
      );
      alert(`Document ${selectedDocument.id} has been rejected. Comment: ${rejectionComment}`);
      setSelectedDocument(null);
      setShowDocumentViewer(false);
      setShowRejectModal(false);
      setRejectionComment('');
    }
  };

  const handleShowDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentViewer(true);
  };

  const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
    </svg>
  );

  const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle">
      <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
  );

  const LoaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-2 animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );

  const FilePdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-type-pdf">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z"/><path d="M10 10.5H8.5V14H10a2 2 0 0 0 0-4Z"/><path d="M12 12.5H11.5V14H12a1 1 0 0 0 0-2Z"/><path d="M14 10.5h-1.5V14H14a2 2 0 0 0 0-4Z"/><path d="M17 10.5h-1.5V14H17a2 2 0 0 0 0-4Z"/>
    </svg>
  );

  const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  );

  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );

  const approvedCount = documents.filter(doc => doc.status === 'approved').length;
  const rejectedCount = documents.filter(doc => doc.status === 'rejected').length;
  const pendingCount = documents.filter(doc => doc.status === 'pending').length;

  const pieData = [
    { name: 'Approved', value: approvedCount },
    { name: 'Rejected', value: rejectedCount },
    { name: 'Pending', value: pendingCount },
  ];

  const COLORS = ['#4CAF50', '#F44336', '#FFC107'];

  const prepareLineGraphData = (docs) => {
    const dailyData = {};

    docs.forEach(doc => {
      const date = doc.dateSubmitted;
      if (!dailyData[date]) {
        dailyData[date] = { date, approved: 0, rejected: 0 };
      }
      if (doc.status === 'approved') {
        dailyData[date].approved += 1;
      } else if (doc.status === 'rejected') {
        dailyData[date].rejected += 1;
      }
    });

    const sortedDates = Object.keys(dailyData).sort();
    return sortedDates.map(date => dailyData[date]);
  };

  const lineGraphData = prepareLineGraphData(documents);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        {`
          body { font-family: 'Inter', sans-serif; }
          .scroll-container {
            max-height: calc(100vh - 200px);
            overflow-y: auto;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scroll-container::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <header className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-2 sm:mb-0">Approval Officer Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
            <BellIcon />
          </button>
          <span className="text-sm sm:text-base">Welcome, Approval Officer!</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-semibold">AO</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 border-b pb-3">Analytics</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Document Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-3 gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">Documents</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search document..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg w-full sm:w-auto focus:ring-indigo-500 focus:border-indigo-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-4 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => { setActiveSection('pending'); setSelectedDocument(null); setShowDocumentViewer(false); }}
                className={`flex-shrink-0 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                  activeSection === 'pending' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <LoaderIcon className="inline-block mr-1" /> Pending ({documents.filter(d => d.status === 'pending').length})
              </button>
              <button
                onClick={() => { setActiveSection('approved'); setSelectedDocument(null); setShowDocumentViewer(false); }}
                className={`flex-shrink-0 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                  activeSection === 'approved' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <CheckCircleIcon className="inline-block mr-1" /> Approved ({documents.filter(d => d.status === 'approved').length})
              </button>
              <button
                onClick={() => { setActiveSection('rejected'); setSelectedDocument(null); setShowDocumentViewer(false); }}
                className={`flex-shrink-0 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                  activeSection === 'rejected' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <XCircleIcon className="inline-block mr-1" /> Rejected ({documents.filter(d => d.status === 'rejected').length})
              </button>
            </div>

            <div className="scroll-container">
              {filteredDocuments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No documents in this section matching your search/filter.</p>
              ) : (
                <ul className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <li
                      key={doc.id}
                      className={`bg-gray-50 p-4 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:bg-indigo-50 hover:shadow-md
                        ${selectedDocument?.id === doc.id ? 'border-2 border-indigo-500 bg-indigo-100' : 'border border-gray-200'}
                      `}
                      onClick={() => { setSelectedDocument(doc); setShowDocumentViewer(false); }}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold text-indigo-800 mb-1 sm:mb-0">{doc.title}</h3>
                        <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
                          {doc.isUrgent && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse mb-1 sm:mb-0">
                              URGENT
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full
                              ${doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${doc.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                              ${doc.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                            `}
                          >
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Submitted by: <span className="font-medium">{doc.submittedBy}</span> on {doc.dateSubmitted}</p>
                      <p className="text-sm text-gray-500 mt-1">Type: {doc.type}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 border-b pb-3">Document Details</h2>

            {selectedDocument ? (
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h3 className="text-lg sm:text-xl font-bold text-indigo-800 mb-2">{selectedDocument.title}</h3>
                  <p className="text-sm text-gray-700 mb-1"><strong>ID:</strong> {selectedDocument.id}</p>
                  <p className="text-sm text-gray-700 mb-1"><strong>Submitted by:</strong> <span className="font-medium">{selectedDocument.submittedBy}</span></p>
                  <p className="text-sm text-gray-700 mb-1"><strong>Contact:</strong> <a href={`mailto:${selectedDocument.submittedByContact}`} className="text-blue-600 hover:underline">{selectedDocument.submittedByContact}</a></p>
                  <p className="text-sm text-gray-700 mb-1"><strong>Submission Date:</strong> {selectedDocument.dateSubmitted}</p>
                  <p className="text-sm text-gray-700 mb-1"><strong>Type:</strong> {selectedDocument.type}</p>
                  <p className="text-sm text-gray-700 flex flex-wrap items-center">
                    <strong>Status:</strong>
                    <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full
                      ${selectedDocument.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${selectedDocument.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      ${selectedDocument.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                    </span>
                    {selectedDocument.isUrgent && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mt-1 sm:mt-0">
                        URGENT
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Description:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedDocument.description}</p>
                </div>

                {selectedDocument.lastActionComment && selectedDocument.status === 'rejected' && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="text-base sm:text-lg font-semibold text-red-700 mb-2">Reason for Rejection:</h4>
                    <p className="text-sm text-red-600 leading-relaxed">{selectedDocument.lastActionComment}</p>
                  </div>
                )}

                <div className="flex items-center justify-center mt-6">
                  <button
                    onClick={() => handleShowDocument(selectedDocument)}
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    <FilePdfIcon className="mr-2" /> View Document
                  </button>
                </div>

                {showDocumentViewer && selectedDocument && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                      <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Viewing: {selectedDocument.title}</h3>
                        <button
                          onClick={() => setShowDocumentViewer(false)}
                          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                          &times;
                        </button>
                      </div>
                      <div className="flex-grow overflow-y-auto mb-4">
                        {selectedDocument.fileUrl ? (
                          <iframe
                            src={selectedDocument.fileUrl}
                            title={selectedDocument.title}
                            className="w-full h-[500px] border border-gray-300 rounded-md"
                            onError={(e) => console.error("Error loading PDF:", e)}
                          >
                            Your browser does not support PDFs. You can <a href={selectedDocument.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">download the PDF here</a>.
                          </iframe>
                        ) : (
                          <p className="text-center text-gray-600 py-10">No file URL available for this document.</p>
                        )}
                      </div>
                      {selectedDocument.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                          <button
                            onClick={() => handleApprove(selectedDocument.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                          >
                            <CheckCircleIcon className="mr-2" /> Approve
                          </button>
                          <button
                            onClick={() => initiateReject(selectedDocument)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                          >
                            <XCircleIcon className="mr-2" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showRejectModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Provide Reason for Rejection</h3>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-y"
                        rows="4"
                        placeholder="Enter the reason for rejection here..."
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => { setShowRejectModal(false); setRejectionComment(''); }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmReject}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Select a document from the list to view details.</p>
              </div>
            )}
          </div>

          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 border-b pb-3">Recent Documents</h2>
            {recentDocuments.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent documents to display.</p>
            ) : (
              <ul className="space-y-3">
                {recentDocuments.map(doc => (
                  <li
                    key={doc.id}
                    className="bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-colors"
                    onClick={() => { setSelectedDocument(doc); setShowDocumentViewer(false); }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-indigo-700">{doc.title}</h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full
                          ${doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${doc.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          ${doc.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}
                      >
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Submitted by: {doc.submittedBy}</p>
                    <p className="text-xs text-gray-500">Date: {doc.dateSubmitted}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;

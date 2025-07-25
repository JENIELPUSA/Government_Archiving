import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Users, CreditCard, TrendingUp, FileText, UploadCloud, UserCheck, HardDrive, Sun, Moon, Clock, User, Info, Globe } from 'lucide-react'; // Import additional lucide-react icons, including Globe for IP

const SidebarNavItem = ({ icon, title, description, onClick }) => (
  <div
    className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200 cursor-pointer mb-2 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
    onClick={onClick}
  >
    <div className="mr-3 text-blue-600 dark:text-blue-400">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

const StatisticsCard = ({ icon, value, label, trend }) => (
  <div className="flex flex-col rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700"> {/* Outer card styling */}
    <div className="flex items-center justify-between p-4"> {/* card-header */}
      <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
        {icon}
      </div>
      <p className="text-base font-semibold text-gray-700 dark:text-gray-300">{label}</p> {/* card-title */}
    </div>
    <div className="flex flex-col items-start p-4 bg-slate-100 rounded-b-xl transition-colors dark:bg-gray-800"> {/* card-body */}
      <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{value}</p>
      <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
        <TrendingUp size={18} />
        {trend}
      </span>
    </div>
  </div>
);

// Component for a recent document row
const RecentDocumentRow = ({ typeIcon, fileName, location, lastModified, size, tags }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150">
    <div className="w-8 flex-shrink-0 mb-2 sm:mb-0">
      {typeIcon}
    </div>
    <div className="flex-1 ml-4 text-gray-800 dark:text-gray-200 font-medium">
      {fileName}
      {tags && tags.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tags: {tags.map(tag => (
            <span key={tag} className="inline-block bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-200 mr-1 mb-1">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className="w-full sm:w-1/5 text-gray-600 dark:text-gray-400 text-sm mt-1 sm:mt-0 hidden md:block">{location}</div>
    <div className="w-full sm:w-1/6 text-gray-600 dark:text-gray-400 text-sm mt-1 sm:mt-0 hidden sm:block">{lastModified}</div>
    <div className="w-full sm:w-20 text-gray-600 dark:text-gray-400 text-sm text-right mt-1 sm:mt-0">{size}</div>
  </div>
);

const LogsAndAuditEntry = ({ log, onClick }) => (
  <div
    className="flex items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
    onClick={() => onClick(log)} // Pass the entire log object on click
  >
    <div className="w-1/4 text-gray-600 dark:text-gray-400 text-sm flex items-center">
      <Clock size={16} className="mr-2 text-blue-500" /> {log.timestamp}
    </div>
    <div className="w-1/6 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center">
      <Info size={16} className="mr-2 text-purple-500" /> {log.type}
    </div>
    <div className="flex-1 text-gray-800 dark:text-gray-200 text-sm">{log.event}</div>
    <div className="w-1/5 text-gray-600 dark:text-gray-400 text-sm text-right flex items-center justify-end">
      <User size={16} className="mr-2 text-green-500" /> {log.user}
    </div>
  </div>
);

const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null; 

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg transition-colors duration-300">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Log Details</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Timestamp:</strong> {log.timestamp}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Type:</strong> {log.type}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <strong>IP Address:</strong> <Globe size={16} className="ml-2 mr-1 text-orange-500" /> {log.ipAddress || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Event:</strong> {log.event}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400"><strong>User:</strong> {log.user}</p>
        </div>

        {log.oldData && (
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Old Data:</p>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200 overflow-auto">
              {JSON.stringify(log.oldData, null, 2)}
            </pre>
          </div>
        )}

        {log.newData && (
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Data:</p>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200 overflow-auto">
              {JSON.stringify(log.newData, null, 2)}
            </pre>
          </div>
        )}

        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-6"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};


// Main App component
function App() {
  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to 'light'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // Effect to apply/remove 'dark' class to document.documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };


  // Mock data for features (now sidebar navigation items)
  const initialFeatures = [
    {
      id: 'upload',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
        </svg>
      ),
      title: 'Upload Document',
      description: 'Upload new documents to the archive system.',
    },
    {
      id: 'search',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      ),
      title: 'Search Archive',
      description: 'Search for past documents using keywords or dates.',
    },
    {
      id: 'categories',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      ),
      title: 'Manage Categories',
      description: 'Organize and manage document categories.',
    },
    {
      id: 'reports',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
      title: 'View Reports',
      description: 'Generate and view archive activity reports.',
    },
  ];

  // Mock data for statistics with lucide-react icons and trend values
  const statisticsData = [
    {
      icon: <FileText size={26} />, // Changed icon to FileText
      value: '25,154',
      label: 'Total Documents',
      trend: '25%',
    },
    {
      icon: <UploadCloud size={26} />, // Changed icon to UploadCloud
      value: '25',
      label: 'New Documents (Today)',
      trend: '12%',
    },
    {
      icon: <UserCheck size={26} />, // Changed icon to UserCheck
      value: '12',
      label: 'Active Users',
      trend: '15%',
    },
    {
      icon: <HardDrive size={26} />, // Changed icon to HardDrive
      value: '300 GB',
      label: 'Storage Used',
      trend: '19%',
    },
  ];

  const initialDocuments = [
    {
      typeIcon: <span className="text-red-500 font-bold text-xl">PDF</span>,
      fileName: '2025 Annual Budget Report.pdf',
      fileType: 'PDF', // Added fileType for filtering
      location: 'C:\\Archive\\Finance...',
      lastModified: '2025-05-13',
      size: '1.8 MB',
      tags: ['budget', 'finance', 'report', '2025'],
    },
    {
      typeIcon: <span className="text-blue-500 font-bold text-xl">DOC</span>,
      fileName: 'Policy Guidelines 2024.docx',
      fileType: 'DOC', // Added fileType for filtering
      location: 'C:\\Archive\\Policies...',
      lastModified: '2025-05-13',
      size: '1.3 MB',
      tags: ['policy', 'guidelines', '2024', 'governance'],
    },
    {
      typeIcon: <span className="text-green-500 font-bold text-xl">XLS</span>,
      fileName: 'Employee Records Q2.xlsx',
      fileType: 'XLS', 
      location: 'C:\\Archive\\HR...',
      lastModified: '2025-05-13',
      size: '1.5 MB',
      tags: ['hr', 'records', 'employees', 'q2'],
    },
    {
      typeIcon: <span className="text-orange-500 font-bold text-xl">PPT</span>,
      fileName: 'Project Proposal Presentation.pptx',
      fileType: 'PPT', 
      location: 'C:\\Archive\\Projects...',
      lastModified: '2025-06-19',
      size: '809 KB',
      tags: ['project', 'proposal', 'presentation'],
    },
    {
      typeIcon: <span className="text-red-500 font-bold text-xl">PDF</span>,
      fileName: 'Procurement Plan 2025.pdf',
      fileType: 'PDF', // Added fileType for filtering
      location: 'C:\\Archive\\Procurement...',
      lastModified: '2025-06-01',
      size: '2.1 MB',
      tags: ['procurement', 'plan', '2025', 'finance'],
    },
  ];

  // Mock data for Logs and Audit with new 'type', 'oldData', 'newData' properties
  const logsData = [
    {
      timestamp: '2025-07-11 10:00:15 AM',
      event: 'User "Admin" uploaded "Annual Budget Report.pdf"',
      user: 'Admin',
      type: 'Create',
      ipAddress: '192.168.1.100',
      oldData: null, // Walang lumang data para sa bagong upload
      newData: { fileName: 'Annual Budget Report.pdf', size: '1.8 MB', tags: ['budget', 'finance'] }
    },
    {
      timestamp: '2025-07-11 09:45:30 AM',
      event: 'User "JohnDoe" searched for "policy guidelines"',
      user: 'JohnDoe',
      type: 'Search',
      ipAddress: '10.0.0.50',
      oldData: null,
      newData: { query: 'policy guidelines' }
    },
    {
      timestamp: '2025-07-10 03:20:05 PM',
      event: 'Category "Procurement" added by "Admin"',
      user: 'Admin',
      type: 'Create',
      ipAddress: '192.168.1.100',
      oldData: null,
      newData: { categoryName: 'Procurement' }
    },
    {
      timestamp: '2025-07-10 11:00:00 AM',
      event: 'User "JaneSmith" viewed "Employee Records Q2.xlsx"',
      user: 'JaneSmith',
      type: 'View',
      ipAddress: '172.16.0.10',
      oldData: null,
      newData: { fileName: 'Employee Records Q2.xlsx' }
    },
    {
      timestamp: '2025-07-09 08:30:40 AM',
      event: 'System generated "Monthly Activity Report"',
      user: 'System',
      type: 'Report Generation',
      ipAddress: '127.0.0.1',
      oldData: null,
      newData: { reportName: 'Monthly Activity Report' }
    },
    {
      timestamp: '2025-07-08 02:00:20 PM',
      event: 'Document "Old Policy.docx" updated by "Admin"',
      user: 'Admin',
      type: 'Update',
      ipAddress: '192.168.1.100',
      oldData: { fileName: 'Old Policy.docx', version: '1.0', tags: ['old', 'policy'], status: 'draft' },
      newData: { fileName: 'Old Policy.docx', version: '1.1', tags: ['updated', 'policy', '2024'], status: 'final' }
    },
    {
      timestamp: '2025-07-07 05:00:10 PM',
      event: 'Document "Draft Proposal.doc" deleted by "JohnDoe"',
      user: 'JohnDoe',
      type: 'Delete',
      ipAddress: '10.0.0.50',
      oldData: { fileName: 'Draft Proposal.doc', size: '500 KB', author: 'JohnDoe' },
      newData: null
    },
    {
      timestamp: '2025-07-06 09:15:00 AM',
      event: 'User "Admin" updated user "JaneSmith" profile',
      user: 'Admin',
      type: 'Update',
      ipAddress: '192.168.1.100',
      oldData: { username: 'JaneSmith', role: 'Viewer', department: 'HR' },
      newData: { username: 'JaneSmith', role: 'Editor', department: 'HR' }
    },
    {
      timestamp: '2025-07-05 01:40:55 PM',
      event: 'Document "Q1 Financial Report.xlsx" updated by "FinanceUser"',
      user: 'FinanceUser',
      type: 'Update',
      ipAddress: '172.16.0.20',
      oldData: { fileName: 'Q1 Financial Report.xlsx', totalRevenue: '1.2M', status: 'pending review' },
      newData: { fileName: 'Q1 Financial Report.xlsx', totalRevenue: '1.3M', status: 'approved' }
    },
  ];


  const [activeModal, setActiveModal] = useState(null); // State to manage which modal is open
  const [uploadMessage, setUploadMessage] = useState('');
  const [documentContent, setDocumentContent] = useState(''); // New state for document content (for auto-tagging simulation)
  const [selectedFiles, setSelectedFiles] = useState([]); // New state for selected files
  const [isDragging, setIsDragging] = useState(false); // New state for drag-and-drop visual feedback
  const [suggestedTags, setSuggestedTags] = useState([]); // New state for auto-suggested tags
  const [manualTagInput, setManualTagInput] = useState(''); // New state for manual tag input
  const [finalTags, setFinalTags] = useState([]); // New state for final tags to be stored

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState(initialDocuments);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState(['Finance', 'Policies', 'HR', 'Projects', 'Procurement']);
  const [reportMessage, setReportMessage] = useState('');

  // New states for type filter
  const [selectedType, setSelectedType] = useState('All Types');
  const [showTypeFilterDropdown, setShowTypeFilterDropdown] = useState(false);

  // State para sa pagpapakita ng log details modal
  const [selectedLogForDetail, setSelectedLogForDetail] = useState(null);


  // Get unique document types for the filter dropdown
  const uniqueDocumentTypes = ['All Types', ...new Set(initialDocuments.map(doc => doc.fileType))];


  // Handler for opening modals
  const handleFeatureClick = (featureId) => {
    setActiveModal(featureId);
    // Reset states when opening a new modal
    setUploadMessage('');
    setDocumentContent('');
    setSelectedFiles([]); // Clear selected files
    setIsDragging(false); // Reset drag state
    setSuggestedTags([]);
    setManualTagInput('');
    setFinalTags([]);
    setReportMessage('');
    setSearchQuery('');
    setFilteredDocuments(initialDocuments); // Reset filtered documents when opening any modal
    setSelectedType('All Types'); // Reset type filter
    setShowTypeFilterDropdown(false); // Close dropdown
    setSelectedLogForDetail(null); // Isara ang log detail modal
  };

  // --- Upload Document Functions ---
  const handleDocumentContentChange = (e) => {
    setDocumentContent(e.target.value);
  };

  // Handles file selection from input or drop
  const handleFileSelection = (files) => {
    const newFiles = Array.from(files);
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);

    // For auto-tagging simulation, use the content of the first file if available
    if (newFiles.length > 0) {
      // In a real app, you'd read file content here (e.g., using FileReader for text files)
      // For simulation, we'll just use the documentContent textarea as a proxy
      setUploadMessage('Files selected. Enter content or simulate auto-tagging for the first file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelection(files);
  };

  const simulateAutoTagging = () => {
    if (documentContent.trim() === '' && selectedFiles.length === 0) {
      setUploadMessage('Please enter some document content or select a file to simulate auto-tagging.');
      return;
    }

    const contentToTag = documentContent.trim() !== '' ? documentContent : (selectedFiles[0] ? selectedFiles[0].name : ''); // Use file name as content if no text entered
    const lowerCaseContent = contentToTag.toLowerCase();
    const generated = [];

    // Basic keyword-based auto-tagging simulation
    if (lowerCaseContent.includes('budget') || lowerCaseContent.includes('finance') || lowerCaseContent.includes('financial')) {
      generated.push('finance');
    }
    if (lowerCaseContent.includes('policy') || lowerCaseContent.includes('guidelines') || lowerCaseContent.includes('rule')) {
      generated.push('policy');
    }
    if (lowerCaseContent.includes('employee') || lowerCaseContent.includes('hr') || lowerCaseContent.includes('human resources')) {
      generated.push('hr');
    }
    if (lowerCaseContent.includes('project') || lowerCaseContent.includes('proposal') || lowerCaseContent.includes('plan')) {
      generated.push('project');
    }
    if (lowerCaseContent.includes('procurement') || lowerCaseContent.includes('tender') || lowerCaseContent.includes('bid')) {
      generated.push('procurement');
    }
    // Add year tags if found
    const yearMatch = lowerCaseContent.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      generated.push(yearMatch[0]);
    }

    const uniqueTags = [...new Set(generated)]; // Remove duplicates
    setSuggestedTags(uniqueTags);
    setFinalTags(uniqueTags); // Initialize final tags with suggested tags
    setUploadMessage('Auto-tagging simulated. Review suggested tags.');
  };

  const handleManualTagInputChange = (e) => {
    setManualTagInput(e.target.value);
  };

  const addManualTag = () => {
    if (manualTagInput.trim() !== '' && !finalTags.includes(manualTagInput.trim().toLowerCase())) {
      setFinalTags([...finalTags, manualTagInput.trim().toLowerCase()]);
      setManualTagInput('');
    }
  };

  const handleUploadConfirm = () => {
    if (selectedFiles.length === 0) {
      setUploadMessage('Please select at least one file to upload.');
      return;
    }

    const uploadedFileNames = selectedFiles.map(file => file.name).join(', ');
    setUploadMessage(`Files uploaded: ${uploadedFileNames}. Content: "${documentContent.substring(0, 50)}..." and tags: [${finalTags.join(', ')}]. (Simulated)`);
    // In a real app, you would send each file and associated metadata (like finalTags) to a backend
    // For simplicity, we're just showing a message.
    setSelectedFiles([]); // Clear files after simulated upload
    setDocumentContent('');
    setSuggestedTags([]);
    setManualTagInput('');
    setFinalTags([]);
  };

  // --- Search Archive Functions ---
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const performSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredDocuments(initialDocuments);
      return;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    const results = initialDocuments.filter(doc =>
      doc.fileName.toLowerCase().includes(lowerCaseQuery) ||
      doc.location.toLowerCase().includes(lowerCaseQuery) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))) // Search within tags
    );
    setFilteredDocuments(results);
  };

  // --- Manage Categories Functions ---
  const handleNewCategoryChange = (e) => {
    setNewCategory(e.target.value);
  };

  const addCategory = () => {
    if (newCategory.trim() !== '' && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  // --- View Reports Functions ---
  const generateReport = () => {
    setReportMessage('Generating comprehensive archive report... (Simulated)');
    // Simulate a delay for report generation
    setTimeout(() => {
      setReportMessage('Report generated successfully! (Simulated)');
    }, 2000);
  };

  // --- Type Filter Functions ---
  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setShowTypeFilterDropdown(false); // Close dropdown after selection
  };

  // Combine search and type filters
  const getFilteredAndTypedDocuments = () => {
    let currentDocs = searchQuery ? filteredDocuments : initialDocuments;

    if (selectedType !== 'All Types') {
      currentDocs = currentDocs.filter(doc => doc.fileType === selectedType);
    }
    return currentDocs;
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row transition-colors duration-300">
      {/* Sidebar Section */}
      <aside className="w-full lg:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:mr-6 mb-6 lg:mb-0 flex-shrink-0 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Navigation</h2>
        {initialFeatures.map((feature) => (
          <SidebarNavItem
            key={feature.id}
            {...feature}
            onClick={() => handleFeatureClick(feature.id)}
          />
        ))}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Header Section (remains at the top of the main content) */}
        <header className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center border-b border-blue-200 dark:border-gray-700 transition-colors duration-300">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to the Government Archiving System!</h1>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-300">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </header>

        {/* Statistics Overview Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-4">Statistics Overview</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {statisticsData.map((stat, index) => (
              <StatisticsCard key={index} {...stat} />
            ))}
          </div>
        </section>

        {/* Recent Documents Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t border-blue-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              Recent Documents
              <button className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356-2A8.001 8.001 0 004 12c0 2.972 1.153 5.727 3.056 7.727L9 21m4-14h.582m-9.356 2A8.001 8.001 0 0120 12c0 2.972-1.153 5.727-3.056 7.727L15 21"></path>
                </svg>
              </button>
            </h2>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Filter and Column Headers */}
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4 px-4 relative"> {/* Added relative for dropdown positioning */}
            <div
              className="flex items-center mr-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setShowTypeFilterDropdown(!showTypeFilterDropdown)}
            >
              <span className="font-medium">{selectedType}</span>
              <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            {showTypeFilterDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                <ul className="py-1">
                  {uniqueDocumentTypes.map(type => (
                    <li
                      key={type}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200"
                      onClick={() => handleTypeFilter(type)}
                    >
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex-1 font-medium hidden md:block">Location</div>
            <div className="w-1/6 font-medium hidden sm:block">Last Modified</div>
            <div className="w-20 font-medium text-right">Size</div>
          </div>

          {/* "Earlier" Section Header */}
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 px-4">Earlier</h3>

          {/* List of Recent Documents */}
          <div>
            {/* Display filtered documents based on search and type filters */}
            {getFilteredAndTypedDocuments().map((doc, index) => (
              <RecentDocumentRow key={index} {...doc} />
            ))}
            {getFilteredAndTypedDocuments().length === 0 && (
              <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No documents found matching your criteria.</p>
            )}
          </div>
        </section>

        {/* Logs and Audit Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t border-blue-200 dark:border-gray-700 mt-6 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-4">Logs and Audit</h2>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4 px-4">
            <div className="w-1/4 font-medium">Timestamp</div>
            <div className="w-1/6 font-medium">Type</div>
            <div className="flex-1 font-medium">Event</div>
            <div className="w-1/5 font-medium text-right">User</div>
          </div>
          <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {logsData.length > 0 ? (
              logsData.map((log, index) => (
                <LogsAndAuditEntry key={index} log={log} onClick={setSelectedLogForDetail} />
              ))
            ) : (
              <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No log entries available.</p>
            )}
          </div>
        </section>

      </main>

      {/* Modals for Features */}
      {activeModal === 'upload' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Upload Document(s)</h3>

            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors duration-200 ${
                isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple // Allow multiple files
                className="hidden"
                id="file-upload-input"
                onChange={(e) => handleFileSelection(e.target.files)}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Drag and drop files here, or <span className="font-medium text-blue-600 dark:text-blue-400">click to browse</span>
                </p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Files:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 max-h-24 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name} ({ (file.size / 1024 / 1024).toFixed(2) } MB)</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="documentContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Content (for Auto-tagging Simulation - optional)
              </label>
              <textarea
                id="documentContent"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                rows="3"
                placeholder="Enter some text content or leave blank to use file name for tagging..."
                value={documentContent}
                onChange={handleDocumentContentChange}
              ></textarea>
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4"
              onClick={simulateAutoTagging}
            >
              Simulate Auto-Tagging
            </button>

            {suggestedTags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggested Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="manualTag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Manual Tag
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="manualTag"
                  className="flex-1 border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder="e.g., urgent, confidential"
                  value={manualTagInput}
                  onChange={handleManualTagInputChange}
                  onKeyPress={(e) => { if (e.key === 'Enter') addManualTag(); }}
                />
                <button
                  className="bg-blue-600 text-white py-3 px-6 rounded-r-lg hover:bg-blue-700 transition-colors"
                  onClick={addManualTag}
                >
                  Add Tag
                </button>
              </div>
              {finalTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {finalTags.map(tag => (
                    <span key={tag} className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-gray-600 dark:text-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors mb-4"
              onClick={handleUploadConfirm}
            >
              Confirm Upload
            </button>

            {uploadMessage && (
              <p className="text-sm text-center text-green-600 dark:text-green-400 mb-4">{uploadMessage}</p>
            )}
            <button
              className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {activeModal === 'search' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Search Archive</h3>
            <div className="flex mb-4">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder="Enter keyword, document name, or tag..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button
                className="bg-blue-600 text-white py-3 px-6 rounded-r-lg hover:bg-blue-700 transition-colors"
                onClick={performSearch}
              >
                Search
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc, index) => (
                  <RecentDocumentRow key={index} {...doc} />
                ))
              ) : (
                <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No documents found matching your search.</p>
              )}
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-6"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {activeModal === 'categories' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Manage Categories</h3>
            <div className="flex mb-4">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder="Add new category"
                value={newCategory}
                onChange={handleNewCategoryChange}
              />
              <button
                className="bg-blue-600 text-white py-3 px-6 rounded-r-lg hover:bg-blue-700 transition-colors"
                onClick={addCategory}
              >
                Add
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
              {categories.length > 0 ? (
                <ul className="list-disc list-inside">
                  {categories.map((cat, index) => (
                    <li key={index} className="py-1 text-gray-700 dark:text-gray-200">{cat}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">No categories added yet.</p>
              )}
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-6"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {activeModal === 'reports' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">View Reports</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Click the button below to generate a new archive report.</p>
            <button
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              onClick={generateReport}
            >
              Generate Report
            </button>
            {reportMessage && (
              <p className="text-sm text-center text-blue-600 dark:text-blue-400 mt-4">{reportMessage}</p>
            )}
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-6"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      <LogDetailModal
        log={selectedLogForDetail}
        onClose={() => setSelectedLogForDetail(null)}
      />
    </div>
  );
}

export default App;

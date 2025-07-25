import React, { useState, useEffect } from 'react';

// Inline SVG Icons from Lucide for a self-contained environment
const CheckCircleIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 20}
        height={props.size || 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

const XCircleIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 20}
        height={props.size || 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
);

const Trash2Icon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 20}
        height={props.size || 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const EditIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 20}
        height={props.size || 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const EyeIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 20}
        height={props.size || 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

// Main App component
const App = () => {
    // Dummy data provided by the user
    // Added a 'status' field to each item for demonstration
    const dummyData = {
        "status": "success",
        "data": [
            {
                "_id": "68722db44c9a899f0c9c2aa8",
                "title": "hrthrthrh",
                "category": "Research & Development",
                "summary": "htrhrhrhtrhtr",
                "author": "hrthtrh",
                "fullText": "PDF",
                "fileUrl": "https://res.cloudinary.com/dskqeyqns/image/upload/v1752313268/Government%20Archiving/Research_Development/1752313266952_Appointment_10cb15.pdf.pdf",
                "fileName": "file",
                "createdAt": "2025-07-12T09:41:08.857Z",
                "updatedAt": "2025-07-12T09:41:08.857Z",
                "itemStatus": "Approved"
            },
            {
                "_id": "68722c9b3e3f216ba1b6abaf",
                "title": "htrhrhrh",
                "category": "Research & Development",
                "summary": "hrthrhrh",
                "author": "hrthrth",
                "fullText": "PDF Document",
                "fileUrl": "https://res.cloudinary.com/dskqeyqns/image/upload/v1752312987/Government%20Archiving/Research_Development/1752312985929_Profilling_Report%20%2840%29.pdf.pdf",
                "fileName": "file",
                "createdAt": "2025-07-12T09:36:27.670Z",
                "updatedAt": "2025-07-12T09:36:27.670Z",
                "itemStatus": "Pending"
            },
            {
                "_id": "68722bb53e3f216ba1b6ab87",
                "title": "hrthtr",
                "category": "HR",
                "summary": "hrthrhrth",
                "author": "hrthrhrh",
                "fullText": "PDF Document",
                "fileUrl": "https://res.cloudinary.com/dskqeyqns/image/upload/v1752312757/Government%20Archiving/HR/1752312755379_Profilling_Report%20%2838%29.pdf.pdf",
                "fileName": "file",
                "createdAt": "2025-07-12T09:32:37.767Z",
                "updatedAt": "2025-07-12T09:32:37.767Z",
                "itemStatus": "Approved"
            },
            {
                "_id": "68722a2838f8e415365ad4e6",
                "title": "rthrh",
                "category": "HR",
                "summary": "hrthrhrth",
                "author": "hrhrhrh",
                "fullText": "PDF",
                "fileUrl": "https://res.cloudinary.com/dskqeyqns/image/upload/v1752312360/Government%20Archiving/HR/1752312359623_Profilling_Report%20%2840%29.pdf.pdf",
                "fileName": "file",
                "createdAt": "2025-07-12T09:26:00.841Z",
                "updatedAt": "2025-07-12T09:26:00.841Z",
                "itemStatus": "Rejected"
            },
            {
                "_id": "68722a2838f8e415365ad4e7",
                "title": "Another Doc",
                "category": "Finance",
                "summary": "Financial report summary",
                "author": "Jane Doe",
                "fullText": "PDF",
                "fileUrl": "https://placehold.co/100x100/FF0000/FFFFFF?text=Doc5",
                "fileName": "finance_report.pdf",
                "createdAt": "2025-07-11T10:00:00.000Z",
                "updatedAt": "2025-07-11T10:00:00.000Z",
                "itemStatus": "Approved"
            },
            {
                "_id": "68722a2838f8e415365ad4e8",
                "title": "Project Plan",
                "category": "Project Management",
                "summary": "Detailed project plan for Q3",
                "author": "John Smith",
                "fullText": "DOCX",
                "fileUrl": "https://placehold.co/100x100/00FF00/000000?text=Doc6",
                "fileName": "Q3_plan.docx",
                "createdAt": "2025-07-10T11:30:00.000Z",
                "updatedAt": "2025-07-10T11:30:00.000Z",
                "itemStatus": "Pending"
            },
            {
                "_id": "68722a2838f8e415365ad4e9",
                "title": "Marketing Strategy",
                "category": "Marketing",
                "summary": "New marketing initiatives",
                "author": "Alice Brown",
                "fullText": "PDF",
                "fileUrl": "https://placehold.co/100x100/0000FF/FFFFFF?text=Doc7",
                "fileName": "marketing_strategy.pdf",
                "createdAt": "2025-07-09T14:00:00.000Z",
                "updatedAt": "2025-07-09T14:00:00.000Z",
                "itemStatus": "Rejected"
            },
            {
                "_id": "68722a2838f8e415365ad4ea",
                "title": "Sales Report Q2",
                "category": "Sales",
                "summary": "Quarterly sales performance",
                "author": "Bob Johnson",
                "fullText": "XLSX",
                "fileUrl": "https://placehold.co/100x100/FFFF00/000000?text=Doc8",
                "fileName": "Q2_sales.xlsx",
                "createdAt": "2025-07-08T09:00:00.000Z",
                "updatedAt": "2025-07-08T09:00:00.000Z",
                "itemStatus": "Approved"
            },
            {
                "_id": "68722a2838f8e415365ad4eb",
                "title": "HR Policy Update",
                "category": "HR",
                "summary": "Updated HR policies for 2025",
                "author": "Carol White",
                "fullText": "PDF",
                "fileUrl": "https://placehold.co/100x100/FF00FF/FFFFFF?text=Doc9",
                "fileName": "HR_policy.pdf",
                "createdAt": "2025-07-07T16:00:00.000Z",
                "updatedAt": "2025-07-07T16:00:00.000Z",
                "itemStatus": "Approved"
            },
            {
                "_id": "68722a2838f8e415365ad4ec",
                "title": "IT Security Audit",
                "category": "IT",
                "summary": "Results of the annual security audit",
                "author": "David Green",
                "fullText": "PDF",
                "fileUrl": "https://placehold.co/100x100/00FFFF/000000?text=Doc10",
                "fileName": "security_audit.pdf",
                "createdAt": "2025-07-06T13:00:00.000Z",
                "updatedAt": "2025-07-06T13:00:00.000Z",
                "itemStatus": "Pending"
            }
        ]
    };

    // State for search, date filters, and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // Number of items per page, now a state

    // Effect to filter data whenever search term, start date, or end date changes
    useEffect(() => {
        let currentFilteredData = dummyData.data.filter(item => {
            // Search filter
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.author.toLowerCase().includes(searchTerm.toLowerCase());

            // Date filter
            const itemDate = new Date(item.createdAt);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            // Adjust end date to include the whole day
            if (end) {
                end.setHours(23, 59, 59, 999);
            }

            const matchesDate = (!start || itemDate >= start) && (!end || itemDate <= end);

            return matchesSearch && matchesDate;
        });
        setFilteredData(currentFilteredData);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, startDate, endDate, dummyData.data]); // Depend on search and date states, and dummyData.data if it could change

    // Calculate current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    // Placeholder functions for button actions
    const handleApprove = (item) => {
        console.log('Approve:', item.title);
        // Add your approval logic here
    };

    const handleReject = (item) => {
        console.log('Reject:', item.title);
        // Add your rejection logic here
    };

    const handleDelete = (item) => {
        console.log('Delete:', item.title);
        // Add your deletion logic here
    };

    const handleEdit = (item) => {
        console.log('Edit:', item.title);
        // Add your edit logic here (e.g., open a modal with item data)
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start p-8 font-sans">
            <div className="table-container w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
                <h1 className="text-3xl font-bold text-gray-800 p-6 border-b border-gray-200">
                    Document Archive
                </h1>

                {/* Search and Date Filters */}
                <div className="p-6 flex flex-wrap gap-4 items-center border-b border-gray-200">
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            id="search"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Search by title, category, author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            id="startDate"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            id="endDate"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto"> {/* Added for horizontal scrolling on small screens */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Summary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Full Text</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">File Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">View File</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={item._id} className="hover:bg-blue-50 transition duration-200 ease-in-out">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {indexOfFirstItem + index + 1} {/* Corrected row number for pagination */}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">{item.summary}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fullText}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fileName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${item.itemStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                                  item.itemStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-red-100 text-red-800'}`}>
                                                {item.itemStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center justify-center">
                                                <EyeIcon className="h-5 w-5" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleApprove(item)}
                                                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                                                    title="Approve"
                                                >
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(item)}
                                                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                                                    title="Reject"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                                                    title="Delete"
                                                >
                                                    <Trash2Icon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                                                    title="Edit"
                                                >
                                                    <EditIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                                        No data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-6 flex justify-between items-center flex-wrap gap-2">
                    {/* Show entries dropdown */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">Show</label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <span className="text-sm font-medium text-gray-700">entries</span>
                    </div>

                    <span className="text-sm text-gray-700">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                    </span>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default App;

import React, { useState } from 'react';

// Main App component
const App = () => {
    // State for managing the document preview modal
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalDetails, setModalDetails] = useState('');

    // Function to open the document preview modal
    const openModal = (title) => {
        setModalTitle(title);
        let details = "";
        // Populate modal details based on the document title
        switch (title) {
            case '2025 Budget Allocation Memo':
                details = "Author: Juan Dela Cruz<br>Department: Budget<br>Status: Approved<br>Uploaded: July 15, 2025<br>Last Modified: July 16, 2025";
                break;
            case 'Barangay Health Survey Report':
                details = "Author: Maria Reyes<br>Department: Health<br>Status: Pending<br>Uploaded: July 14, 2025<br>Last Modified: —";
                break;
            case 'Ordinance No. 101':
                details = "Author: Atty. Santos<br>Department: Legal<br>Status: Archived<br>Uploaded: July 10, 2025<br>Last Modified: July 11, 2025";
                break;
            case 'New Employee Onboarding Policy':
                details = "Author: Sarah Garcia<br>Department: HR<br>Status: Approved<br>Uploaded: July 8, 2025<br>Last Modified: July 9, 2025";
                break;
            default:
                details = "No additional details.";
        }
        setModalDetails(details);
        setShowModal(true); // Show the modal
    };

    // Function to close the document preview modal
    const closeModal = () => {
        setShowModal(false); // Hide the modal
    };

    return (
        <div className="p-4 sm:p-8 font-['Inter'] bg-gray-100 min-h-screen">
            {/* Main content container */}
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                {/* Page Title */}
                <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <i className="fas fa-folder-open mr-3 text-blue-600"></i> Document Management
                </h1>

                {/* Search and Filter Section */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-inner">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <i className="fas fa-filter mr-2 text-purple-600"></i> Search and Filter
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Search document..." className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                        <select className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">All Status</option>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Archived">Archived</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <select className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <option value="">All Categories</option>
                            <option value="Memo">Memo</option>
                            <option value="Report">Report</option>
                            <option value="Ordinance">Ordinance</option>
                            <option value="Policy">Policy</option>
                        </select>
                        <select className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 md:col-span-1">
                            <option value="">All Departments</option>
                            <option value="Budget">Budget</option>
                            <option value="Health">Health</option>
                            <option value="Legal">Legal</option>
                            <option value="HR">HR</option>
                        </select>
                        <button className="md:col-span-2 p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105">
                            <i className="fas fa-search mr-2"></i> Search
                        </button>
                    </div>
                </div>

                {/* Document List Table */}
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-white border-collapse">
                        <thead className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                            <tr>
                                <th className="py-3 px-6 text-left rounded-tl-lg">Title</th>
                                <th className="py-3 px-6 text-left">Author</th>
                                <th className="py-3 px-6 text-left">Department</th>
                                <th className="py-3 px-6 text-left">Status</th>
                                <th className="py-3 px-6 text-left">Uploaded</th>
                                <th className="py-3 px-6 text-left">Last Modified</th>
                                <th className="py-3 px-6 text-center rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {/* Example Row 1 */}
                            <tr className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">
                                    <a href="#" className="font-medium text-blue-600 hover:underline" onClick={() => openModal('2025 Budget Allocation Memo')}>2025 Budget Allocation Memo</a>
                                    <div className="text-xs text-gray-500 mt-1">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold mr-2">#Budget</span>
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">#Memo</span>
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-left">Juan Dela Cruz</td>
                                <td className="py-3 px-6 text-left">Budget</td>
                                <td className="py-3 px-6 text-left">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">Approved</span>
                                </td>
                                <td className="py-3 px-6 text-left">July 15, 2025</td>
                                <td className="py-3 px-6 text-left">July 16, 2025</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center space-x-2">
                                        <button className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition duration-300 ease-in-out transform hover:scale-110" title="View">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition duration-300 ease-in-out transform hover:scale-110" title="Download">
                                            <i className="fas fa-download"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {/* Example Row 2 */}
                            <tr className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">
                                    <a href="#" className="font-medium text-blue-600 hover:underline" onClick={() => openModal('Barangay Health Survey Report')}>Barangay Health Survey Report</a>
                                    <div className="text-xs text-gray-500 mt-1">
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold mr-2">#Health</span>
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">#Report</span>
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-left">Maria Reyes</td>
                                <td className="py-3 px-6 text-left">Health</td>
                                <td className="py-3 px-6 text-left">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800">Pending</span>
                                </td>
                                <td className="py-3 px-6 text-left">July 14, 2025</td>
                                <td className="py-3 px-6 text-left">—</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center space-x-2">
                                        <button className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition duration-300 ease-in-out transform hover:scale-110" title="View">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition duration-300 ease-in-out transform hover:scale-110" title="Edit">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {/* Example Row 3 */}
                            <tr className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">
                                    <a href="#" className="font-medium text-blue-600 hover:underline" onClick={() => openModal('Ordinance No. 101')}>Ordinance No. 101</a>
                                    <div className="text-xs text-gray-500 mt-1">
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold mr-2">#Legal</span>
                                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">#Ordinance</span>
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-left">Atty. Santos</td>
                                <td className="py-3 px-6 text-left">Legal</td>
                                <td className="py-3 px-6 text-left">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">Archived</span>
                                </td>
                                <td className="py-3 px-6 text-left">July 10, 2025</td>
                                <td className="py-3 px-6 text-left">July 11, 2025</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center space-x-2">
                                        <button className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition duration-300 ease-in-out transform hover:scale-110" title="View">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {/* Example Row 4 */}
                            <tr className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">
                                    <a href="#" className="font-medium text-blue-600 hover:underline" onClick={() => openModal('New Employee Onboarding Policy')}>New Employee Onboarding Policy</a>
                                    <div className="text-xs text-gray-500 mt-1">
                                        <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-semibold mr-2">#HR</span>
                                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-semibold">#Policy</span>
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-left">Sarah Garcia</td>
                                <td className="py-3 px-6 text-left">HR</td>
                                <td className="py-3 px-6 text-left">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">Approved</span>
                                </td>
                                <td className="py-3 px-6 text-left">July 8, 2025</td>
                                <td className="py-3 px-6 text-left">July 9, 2025</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center space-x-2">
                                        <button className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition duration-300 ease-in-out transform hover:scale-110" title="View">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition duration-300 ease-in-out transform hover:scale-110" title="Download">
                                            <i className="fas fa-download"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Recent Notifications Section */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg shadow-inner">
                    <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                        <i className="fas fa-bell mr-2 text-blue-600"></i> Recent Notifications
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start text-gray-700">
                            <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                            <div>
                                <span className="font-medium">2025 Budget Allocation Memo</span> was <span className="font-semibold text-green-600">reviewed and approved</span> by Juan Dela Cruz.
                                <span className="text-xs text-gray-500 block">July 16, 2025, 10:30 AM</span>
                            </div>
                        </li>
                        <li className="flex items-start text-gray-700">
                            <i className="fas fa-comment-dots text-yellow-500 mr-3 mt-1"></i>
                            <div>
                                New remarks on <span className="font-medium">Barangay Health Survey Report</span> from Maria Reyes.
                                <span className="text-xs text-gray-500 block">July 15, 2025, 02:15 PM</span>
                            </div>
                        </li>
                        <li className="flex items-start text-gray-700">
                            <i className="fas fa-archive text-gray-500 mr-3 mt-1"></i>
                            <div>
                                <span className="font-medium">Ordinance No. 101</span> was <span className="font-semibold text-gray-600">archived</span> by Atty. Santos.
                                <span className="text-xs text-gray-500 block">July 11, 2025, 09:00 AM</span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Viewed By / Last Accessed Section */}
                <div className="mt-8 p-4 bg-purple-50 rounded-lg shadow-inner">
                    <h2 className="text-xl font-semibold text-purple-700 mb-4 flex items-center">
                        <i className="fas fa-users mr-2 text-purple-600"></i> Viewed By / Last Accessed
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start text-gray-700">
                            <i className="fas fa-user-circle text-purple-500 mr-3 mt-1"></i>
                            <div>
                                <span className="font-medium">2025 Budget Allocation Memo:</span> Last Accessed by Juan Dela Cruz on July 16, 2025, 10:30 AM.
                            </div>
                        </li>
                        <li className="flex items-start text-gray-700">
                            <i className="fas fa-user-circle text-purple-500 mr-3 mt-1"></i>
                            <div>
                                <span className="font-medium">Barangay Health Survey Report:</span> Last Accessed by Maria Reyes on July 15, 2025, 02:15 PM.
                            </div>
                        </li>
                        <li className="flex items-start text-gray-700">
                            <i className="fas fa-user-circle text-purple-500 mr-3 mt-1"></i>
                            <div>
                                <span className="font-medium">Ordinance No. 101:</span> Last Accessed by Atty. Santos on July 11, 2025, 09:00 AM.
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* The Modal for Document Preview */}
            {showModal && (
                <div className="modal fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-1000">
                    <div className="modal-content bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-2xl relative">
                        <span className="close-button absolute top-4 right-6 text-gray-400 text-3xl font-bold cursor-pointer hover:text-black" onClick={closeModal}>&times;</span>
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">{modalTitle}</h3>
                        <p className="text-gray-700">This is a placeholder for the document preview. The content of the document will be displayed here when the title is clicked.</p>
                        <div className="mt-4 p-4 bg-gray-100 rounded-md border border-gray-200">
                            <p className="text-gray-600">
                                <strong className="text-gray-800">Document Details:</strong><br/>
                                {/* Dangerously set inner HTML for details that contain <br> tags */}
                                <span dangerouslySetInnerHTML={{ __html: modalDetails }}></span>
                            </p>
                        </div>
                        <div className="mt-6 text-right">
                            <button className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;

import React, { useState } from 'react';

const billData = [
    {
        id: 'HB01628',
        title: 'AN ACT PROVIDING FOR CIVIL FORFEITURE IN FAVOR OF THE STATE ANY UNLAWFULLY ACQUIRED REAL ESTATE PROPERTIES BY ANY FOREIGN NATIONAL',
        significance: 'National',
        dateFiled: '2025-07-09',
        principalAuthors: ['F. DIONISIO, ERNESTO M., JR.', 'GUTIERREZ, RAMON RODRIGO L.', 'SUAN, LORDAN G.', 'LUISTRO, ATTY. GERVILLE "INKY BITRICS" R.', 'FLORES, JONATHAN KEITH T.'],
        dateRead: '2025-07-30',
        primaryReferral: 'JUSTICE',
        billStatus: 'Pending with the Committee on JUSTICE since 2025-07-30'
    },
    {
        id: 'HB01629',
        title: 'AN ACT CREATING THE DEPARTMENT OF FILIPINO SEAFARERS, DEFINING ITS POWERS AND FUNCTIONS, APPROPRIATING FUNDS THEREFOR AND FOR OTHER PURPOSES',
        significance: 'Local',
        dateFiled: '2025-07-01',
        principalAuthors: ['F. DIONISIO, ERNESTO M., JR.', 'TORRES, MARIA LOURDES V.', 'MENDOZA, RAFAEL V.'],
        dateRead: '2025-07-28',
        primaryReferral: 'LABOR AND EMPLOYMENT',
        billStatus: 'Pending with the Committee on LABOR AND EMPLOYMENT since 2025-07-28'
    },
    {
        id: 'HB01630',
        title: 'AN ACT MANDATING THE INCLUSION OF CYBERSECURITY EDUCATION IN THE K-12 CURRICULUM',
        significance: 'National',
        dateFiled: '2025-07-15',
        principalAuthors: ['ABANTE, BIENVENIDO M., JR.', 'ROXAS, JOHN PAUL G.', 'TEO, MICHAEL A.'],
        dateRead: '2025-07-31',
        primaryReferral: 'EDUCATION',
        billStatus: 'Pending with the Committee on EDUCATION since 2025-07-31'
    }
];

// Main App Component
const App = () => {
    const [activeTab, setActiveTab] = useState('principal');
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter bills based on search query
    const filteredBills = billData.filter(bill =>
        bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
    };

    return (
        <div className="bg-gray-100 min-h-screen flex justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
                
                {/* Profile Header Section */}
                <div className="flex items-start p-6 border-b border-gray-200">
                    <img src="https://placehold.co/128x160/e2e8f0/64748b?text=Portrait" alt="Hon. ABANTE, BIENVENIDO M., JR. Portrait" className="w-32 h-40 sm:w-36 sm:h-44 rounded-lg shadow-md object-cover mr-6" />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hon. ABANTE, BIENVENIDO M., JR.</h1>
                        <p className="text-sm text-gray-600 mt-1">District Representative</p>
                        <p className="text-sm text-gray-600">City of Manila, 6th District</p>
                        <div className="mt-4 text-xs sm:text-sm text-gray-600">
                            <p>House of Representatives, Quezon City</p>
                            <p>Rm. SWA-316</p>
                            <p>Phone: (632) 8931-5001, Local: 7940</p>
                            <p>Direct: 8442-4422</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation Section */}
                <nav className="flex border-b border-gray-200">
                    <button
                        className={`py-4 px-6 text-sm font-medium focus:outline-none ${activeTab === 'principal' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'}`}
                        onClick={() => setActiveTab('principal')}
                    >
                        Principal Authored Bills
                    </button>
                    <button
                        className={`py-4 px-6 text-sm font-medium focus:outline-none ${activeTab === 'co-authored' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'}`}
                        onClick={() => setActiveTab('co-authored')}
                    >
                        Co-Authored Bills
                    </button>
                    <button
                        className={`py-4 px-6 text-sm font-medium focus:outline-none ${activeTab === 'committee' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'}`}
                        onClick={() => setActiveTab('committee')}
                    >
                        Committee Membership
                    </button>
                </nav>

                {/* Main Content Area */}
                <div className="p-6">
                    {activeTab === 'principal' && (
                        <>
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center">
                                    PRINCIPAL AUTHORED BILLS
                                    <span className="ml-2 text-xs font-bold bg-blue-500 text-white rounded-full px-2 py-1">{filteredBills.length}</span>
                                </h2>
                                
                                <div className="flex items-center space-x-2 w-full sm:w-auto">
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            placeholder="Bill No, Title or Keywords"
                                            className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <i className="fas fa-search text-gray-400"></i>
                                        </div>
                                    </div>
                                    <select
                                        className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                            </div>

                            {filteredBills.slice(0, itemsPerPage).map((bill) => (
                                <BillItem key={bill.id} bill={bill} />
                            ))}

                            {/* Scroll to Top Button (optional) */}
                            <button
                                className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                <i className="fas fa-arrow-up"></i>
                            </button>
                        </>
                    )}

                    {activeTab === 'co-authored' && (
                        <div className="text-gray-500 text-center py-10">
                            Walang Co-Authored Bills na available.
                        </div>
                    )}

                    {activeTab === 'committee' && (
                        <div className="text-gray-500 text-center py-10">
                            Walang Committee Membership na available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Component for a single bill item
const BillItem = ({ bill }) => {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-md mr-3">{bill.id}</span>
                <p className="text-sm font-semibold text-blue-700 leading-relaxed">
                    {bill.title}
                </p>
            </div>
            
            <div className="mt-4 text-xs text-gray-600">
                <p><span className="font-medium text-gray-800">Significance:</span> {bill.significance}</p>
                <p><span className="font-medium text-gray-800">Date Filed:</span> {bill.dateFiled}</p>
                <p className="mt-2"><span className="font-medium text-gray-800">Principal Author/s:</span> {bill.principalAuthors.join(', ')}</p>
                <p className="mt-2"><span className="font-medium text-gray-800">Date Read:</span> {bill.dateRead}</p>
                <p><span className="font-medium text-gray-800">Primary Referral:</span> {bill.primaryReferral}</p>
                <p><span className="font-medium text-gray-800">Bill Status:</span> {bill.billStatus}</p>
            </div>

            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                <button className="flex items-center hover:text-blue-600 transition-colors">
                    <i className="fas fa-history mr-1"></i>
                    <span>History</span>
                </button>
                <button className="flex items-center hover:text-blue-600 transition-colors">
                    <i className="fas fa-file-alt mr-1"></i>
                    <span>Text as Filed</span>
                </button>
            </div>
        </div>
    );
};

export default App;

import React, { useState, useEffect } from 'react';

// Main App Component
const App = () => {
  // Hardcoded member data for demonstration
  const [members] = useState([
    {
      id: 1,
      name: 'ABALOS, JC M.',
      position: 'Party-list Representative',
      district: '4PS',
      laws: 15,
      resolutions: 28,
      ordinances: 3,
      imageUrl: 'https://placehold.co/112x176/d1d5db/6b7280?text=Profile',
      detailedInfo: 'Ito ay isang sample na kumpletong impormasyon para kay ABALOS, JC M. Magkakaroon ng mas detalyadong background, plataporma, at iba pang datos dito.'
    },
    {
      id: 2,
      name: 'ABANTE, BIENVENIDO M., JR.',
      position: 'District Representative',
      district: 'City of Manila, 6th District',
      laws: 12,
      resolutions: 25,
      ordinances: 5,
      imageUrl: 'https://placehold.co/112x176/d1d5db/6b7280?text=Profile',
      detailedInfo: 'Ito ay isang sample na kumpletong impormasyon para kay ABANTE, BIENVENIDO M., JR. Magkakaroon ng mas detalyadong background, plataporma, at iba pang datos dito.'
    },
    {
      id: 3,
      name: 'ACIDRE, JUDE A.',
      position: 'Party-list Representative',
      district: 'TINGGOG',
      laws: 20,
      resolutions: 30,
      ordinances: 2,
      imageUrl: 'https://placehold.co/112x176/d1d5db/6b7280?text=Profile',
      detailedInfo: 'Ito ay isang sample na kumpletong impormasyon para kay ACIDRE, JUDE A. Magkakaroon ng mas detalyadong background, plataporma, at iba pang datos dito.'
    },
    {
      id: 4,
      name: 'ACOP, ROMEO M.',
      position: 'District Representative',
      district: 'City of Antipolo, 2nd District',
      laws: 18,
      resolutions: 22,
      ordinances: 1,
      imageUrl: 'https://placehold.co/112x176/d1d5db/6b7280?text=Profile',
      detailedInfo: 'Ito ay isang sample na kumpletong impormasyon para kay ACOP, ROMEO M. Magkakaroon ng mas detalyadong background, plataporma, at iba pang datos dito.'
    },
    {
      id: 5,
      name: 'ACOSTA, GIL "KABARANGAY" JR. A.',
      position: 'District Representative',
      district: 'Palawan, 3rd District',
      laws: 14,
      resolutions: 20,
      ordinances: 4,
      imageUrl: 'https://placehold.co/112x176/d1d5db/6b7280?text=Profile',
      detailedInfo: 'Ito ay isang sample na kumpletong impormasyon para kay ACOSTA, GIL "KABARANGAY" JR. A. Magkakaroon ng mas detalyadong background, plataporma, at iba pang datos dito.'
    },
    {
      id: 6,
      name: 'ADIONG, ZIA ALONTO',
      position: 'District Representative',
      district: 'Lanao Del Sur, 1st District',
      laws: 10,
      resolutions: 18,
      ordinances: 0,
      imageUrl: 'https://placehold.co/112x176/d1d5db/6b7280?text=Profile',
      detailedInfo: 'Ito ay isang sample na kumpletong impormasyon para kay ADIONG, ZIA ALONTO. Magkakaroon ng mas detalyadong background, plataporma, at iba pang datos dito.'
    },
    {
      id: 7,
      name: 'ADVINCULA, ADRIAN JAY C.',
      position: 'District Representative',
      district: 'Cavite, 3rd District',
      laws: 22,
      resolutions: 35,
      ordinances: 6,
      imageUrl: 'https://placehold.co/112x176/d1d5db/6b7280?text=Profile',
      detailedInfo: 'Ito ay isang sample na kumpletong impormasyon para kay ADVINCULA, ADRIAN JAY C. Magkakaroon ng mas detalyadong background, plataporma, at iba pang datos dito.'
    },
    {
      id: 8,
      name: 'AGARAO, BENJAMIN C., JR.',
      position: 'District Representative',
      district: 'Laguna, 4th District',
      laws: 17,
      resolutions: 29,
      ordinances: 2,
      imageUrl: 'https://placehold.co/112x176/d1d5db/6b7280?text=Profile',
      detailedInfo: 'Ito ay isang sample na kumpletong impormasyon para kay AGARAO, BENJAMIN C., JR. Magkakaroon ng mas detalyadong background, plataporma, at iba pang datos dito.'
    },
    {
      id: 9,
      name: 'AGYAO, CAROLINE B.',
      position: 'District Representative',
      district: 'Kalinga, Lone District',
      laws: 19,
      resolutions: 27,
      ordinances: 1,
      imageUrl: 'https://placehold.co/112x176/d1d5db/6b7280?text=Profile',
      detailedInfo: 'Ito ay isang sample na kumpletong impormasyon para kay AGYAO, CAROLINE B. Magkakaroon ng mas detalyadong background, plataporma, at iba pang datos dito.'
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Function to open the modal and set the selected member
  const openModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  // Hook for back-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Member Card Component
  const MemberCard = ({ member, openModal }) => (
    <div className="flex items-start bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      <img src={member.imageUrl} alt="Profile Picture" className="w-28 h-44 mr-4 object-cover" />
      <div className="flex-grow">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h2>
        <p className="text-sm font-medium text-gray-600">{member.position}</p>
        <p className="text-sm font-light text-gray-500">{member.district}</p>
        <button onClick={() => openModal(member)} className="text-blue-700 text-sm font-bold mt-2 inline-block hover:underline focus:outline-none">
          View Profile
        </button>
      </div>
    </div>
  );

  // Member Modal Component
  const MemberModal = ({ member, closeModal }) => {
    if (!member) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-11/12 max-w-4xl max-h-screen overflow-y-auto">
          <div className="flex justify-end">
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
          </div>
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 mt-4">
            <div className="w-full md:w-1/3 flex-shrink-0">
              <img src={member.imageUrl.replace('112x176', '300x450')} alt="Member Profile Picture" className="w-full h-auto object-cover shadow-md" />
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h2>
              <p className="text-base text-gray-600 mb-4 font-medium" dangerouslySetInnerHTML={{ __html: `**${member.position}** <br/> ${member.district} <br/><br/> ${member.detailedInfo}` }}></p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-4 border-t pt-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{member.laws}</p>
                  <p className="text-sm font-medium text-gray-500">Total na Batas</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{member.resolutions}</p>
                  <p className="text-sm font-medium text-gray-500">Total na Resolution</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{member.ordinances}</p>
                  <p className="text-sm font-medium text-gray-500">Total na Ordinance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg p-6 md:p-8">

        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">HOUSE MEMBERS</h1>
          <p className="text-red-500 font-bold mt-1 text-base md:text-lg">Total number of seats: (317)</p>
        </header>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-3/5">
            <input type="text" placeholder="Search Name" className="w-full p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md" />
          </div>
          <div className="w-full md:w-2/5 lg:w-1/4 relative">
            <select className="w-full p-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white font-medium rounded-md">
              <option value="all">ALL</option>
              <option value="party-list">Party-list</option>
              <option value="district">District</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <MemberCard key={member.id} member={member} openModal={openModal} />
          ))}
        </div>
      </div>

      {/* Modal is conditionally rendered */}
      {isModalOpen && <MemberModal member={selectedMember} closeModal={closeModal} />}

      {/* Scroll-to-top button */}
      <button
        id="backToTopBtn"
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-blue-500 text-white rounded-full p-3 shadow-lg transition-opacity duration-300 ${showBackToTop ? 'opacity-100' : 'opacity-0'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default App;

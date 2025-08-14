import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion'; // Import Framer Motion

const App = () => {
  // Array of image URLs for the main carousel, using placehold.co for placeholders.
  // The text on the images is in English and relevant to a provincial council.
  const images = [
    'https://placehold.co/1200x600/1e3a8a/FFFFFF?text=Provincial+Council+Session',
    'https://placehold.co/1200x600/991b1b/FFFFFF?text=Committee+Meeting',
    'https://placehold.co/1200x600/365314/FFFFFF?text=Public+Hearing+on+Provincial+Ordinance',
  ];

  // Array of news items, updated with provincial-level content in English.
  const newsItems = [
    {
      id: 1,
      title: "NEW WATER CONSERVATION ORDINANCE PASSED",
      date: "2023-08-07 09:31 AM",
      excerpt: "The Provincial Council has approved an ordinance aimed at setting guidelines for the responsible use of water throughout the province...",
      category: "News"
    },
    {
      id: 2,
      title: "ROAD REPAIR AND EXPANSION PROJECT LAUNCHED",
      date: "2023-08-06 02:15 PM",
      excerpt: "Construction has begun for the expansion and repair of major roads under the Cavite provincial infrastructure project...",
      category: "Project"
    },
    {
      id: 3,
      title: "AGRICULTURE PROGRAM FUNDED BY LGU",
      date: "2023-08-05 10:45 AM",
      excerpt: "The Provincial Council allocated additional funds for the agriculture program, which will help local farmers...",
      category: "Policy"
    }
  ];

  // Array of featured ordinances, now reflecting provincial-level laws in English.
  const featuredOrdinances = [
    { id: 1, title: "Solid Waste Management Ordinance", author: "Board Member Dela Cruz", status: "Approved" },
    { id: 2, title: "Cavite Tourism Development Plan", author: "Board Member Reyes", status: "In Committee" },
    { id: 3, title: "Youth Program Ordinance", author: "Board Member Santos", status: "Finalizing" },
    { id: 4, title: "Local Products Promotion Ordinance", author: "Board Member Tan", status: "Filed" }
  ];

  // Array of video gallery items with English titles.
  const videos = [
    { id: 1, thumbnail: 'https://placehold.co/400x225/1e3a8a/FFFFFF?text=Session+Highlights', title: 'Session Highlights: August 2024' },
    { id: 2, thumbnail: 'https://placehold.co/400x225/991b1b/FFFFFF?text=Governor+Press+Briefing', title: 'Press Briefing with the Governor' },
    { id: 3, thumbnail: 'https://placehold.co/400x225/365314/FFFFFF?text=Committee+Hearing', title: 'Health Committee Hearing' },
  ];

  // State variables for managing the carousels
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  // Functions to navigate the main image carousel
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Functions to navigate the news item carousel
  const nextNews = () => {
    setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
  };

  const prevNews = () => {
    setCurrentNewsIndex((prevIndex) => (prevIndex - 1 + newsItems.length) % newsItems.length);
  };

  // useEffect hook to handle the automatic rotation of the image carousel
  useEffect(() => {
    // Stop the auto-rotation when the user hovers over the carousel
    if (isHoveringCarousel) return;
    
    // Set up an interval to change the image every 5 seconds
    const interval = setInterval(() => {
      nextImage();
    }, 5000);
    
    // Clean up the interval when the component unmounts or dependencies change
    return () => clearInterval(interval);
  }, [isHoveringCarousel]);

  // Variasi animasi untuk Framer Motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      {/* Header Section */}
      <header className="bg-white py-4 text-center border-b border-gray-200 shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide">PROVINCIAL COUNCIL OF CAVITE</h1>
            <p className="text-sm text-gray-600 mt-1">Province of Cavite</p>
          </div>
          <div className="flex space-x-4">
            <button className="text-blue-900 hover:text-blue-700 text-sm font-medium">Log In</button>
            <button className="bg-blue-900 text-white px-4 py-1 rounded text-sm font-medium hover:bg-blue-800 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-900 to-red-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <ul className="flex flex-wrap justify-center space-x-1 lg:space-x-6 text-sm font-medium mb-2 lg:mb-0">
              {['HOME', 'BOARD MEMBERS', 'COMMITTEES', 'ORDINANCES', 'RESOLUTIONS', 'NEWS'].map((item) => (
                <li key={item} className="relative group py-1">
                  <a href="#" className="px-3 py-2 hover:bg-white hover:bg-opacity-20 rounded transition-all duration-200 flex items-center">
                    {item}
                    {!['HOME', 'NEWS'].includes(item) && <span className="ml-1">&#9662;</span>}
                  </a>
                  {/* Dropdown for non-simple items */}
                  <div className="absolute left-0 mt-1 w-48 bg-white text-gray-800 shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">Submenu Item</a>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100">Another Item</a>
                  </div>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap justify-center space-x-1 lg:space-x-4 text-sm font-medium">
              {['PROGRAMS', 'BUDGET', 'ABOUT US'].map((item) => (
                <li key={item} className="relative group py-1">
                  <a href="#" className="px-3 py-2 hover:bg-white hover:bg-opacity-20 rounded transition-all duration-200 flex items-center">
                    {item}
                    {item === 'ABOUT US' && <span className="ml-1">&#9662;</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content Section */}
      <main className="container mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        {/* Grid Utama */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          variants={staggerContainer}
        >
          {/* Carousel Section */}
          <motion.div 
            className="lg:col-span-2 relative rounded-xl shadow-lg overflow-hidden"
            variants={fadeInUp}
            onMouseEnter={() => setIsHoveringCarousel(true)}
            onMouseLeave={() => setIsHoveringCarousel(false)}
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={images[currentImageIndex]}
                alt="Provincial Council Event"
                className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
              />
            </div>
            
            {/* Carousel Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white text-blue-900 p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-200 focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white text-blue-900 p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-200 focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            
            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white w-4' : 'bg-white bg-opacity-50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* News & Article Section */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
            variants={fadeInUp}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded mb-2">
                    {newsItems[currentNewsIndex].category}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {newsItems[currentNewsIndex].title}
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">
                    {newsItems[currentNewsIndex].date}
                  </p>
                </div>
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                {newsItems[currentNewsIndex].excerpt}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 mt-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors duration-300 font-semibold mb-3 sm:mb-0 shadow-md hover:shadow-lg">
                  Read Full Article
                </button>
                <div className="flex items-center space-x-4 text-gray-600 text-sm">
                  <button 
                    onClick={prevNews}
                    className="flex items-center space-x-1 hover:text-blue-900 transition-colors duration-200 font-medium"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                  <button 
                    onClick={nextNews}
                    className="flex items-center space-x-1 hover:text-blue-900 transition-colors duration-200 font-medium"
                  >
                    <span>Next</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Links Section */}
        <motion.div 
          className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {/* Tinanggal ang mga cards na Board Members, Committees, Ordinances, at Programs & Projects */}
        </motion.div>

        {/* Latest News Section */}
        <motion.div 
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest News & Updates</h2>
            <a href="#" className="text-blue-900 font-medium hover:underline flex items-center">
              View All News
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsItems.map((news) => (
              <motion.div 
                key={news.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                variants={fadeInUp}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                      {news.category}
                    </span>
                    <span className="text-xs text-gray-500">{news.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{news.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{news.excerpt}</p>
                  <button className="text-blue-900 text-sm font-medium hover:underline">
                    Read more
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Featured Ordinances Section */}
        <motion.div 
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Ordinances</h2>
            <a href="#" className="text-blue-900 font-medium hover:underline flex items-center">
              View All Ordinances
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredOrdinances.map((ordinance) => (
              <motion.div 
                key={ordinance.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                variants={fadeInUp}
              >
                <div className="p-5">
                  <span className="text-xs font-medium text-gray-500">{ordinance.author}</span>
                  <h3 className="font-bold text-gray-900 mt-1 mb-2">{ordinance.title}</h3>
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <p className="text-sm text-gray-600 font-medium">{ordinance.status}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Video Gallery Section */}
        <motion.div 
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Video Gallery</h2>
            <a href="#" className="text-blue-900 font-medium hover:underline flex items-center">
              View All Videos
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <motion.div 
                key={video.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                variants={fadeInUp}
              >
                <a href="#">
                  <div className="relative pb-[56.25%] h-0"> {/* 16:9 Aspect Ratio */}
                    <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{video.title}</h3>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Visit Us Section */}
        <motion.div 
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Visit Us</h2>
              <a href="#" className="text-blue-900 font-medium hover:underline flex items-center">
                  Book a Visit
                  <ChevronRightIcon className="ml-1 h-4 w-4" />
              </a>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                  <img 
                      src="http://googleusercontent.com/file_content/1" 
                      alt="House of Representatives Visitors Program"
                      className="w-full h-auto object-cover rounded-t-lg"
                  />
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 p-2 rounded-lg text-center">
                      <a href="#" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300">
                          BOOK YOUR VISIT HERE
                      </a>
                  </div>
              </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Provincial Council</h3>
              <p className="text-gray-400 text-sm">
                Cavite Capitol, Trece Martires City, Cavite
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {['About Us', 'Board Members', 'Committees', 'Video Gallery', 'Contact Us'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {['Ordinances', 'Publications', 'Media Gallery', 'Downloads'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Contact Us</h4>
              <address className="text-sm text-gray-400 not-italic">
                <p>Phone: (046) 419-0145</p>
                <p>Email: spcavite@gmail.com</p>
                <div className="mt-3 flex space-x-3">
                  {['Facebook', 'Twitter', 'YouTube'].map((social) => (
                    <a key={social} href="#" className="text-white hover:text-blue-400">
                      {social}
                    </a>
                  ))}
                </div>
              </address>
          </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2024 Provincial Council of Cavite. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
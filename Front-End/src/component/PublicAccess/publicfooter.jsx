import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="bg-blue-600 p-2 rounded-lg mr-3">
                📚
              </span>
              Legislative Library
            </h3>
            <p className="text-blue-100 max-w-xs">
              Your trusted source for legislative documents and legal resources.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 border-l-4 border-blue-400 pl-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white transition hover:underline">Browse Documents</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition hover:underline">Recent Updates</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition hover:underline">Search Tools</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 border-l-4 border-blue-400 pl-3">Contact Us</h4>
            <ul className="space-y-2 text-blue-200">
              <li className="flex items-start">
                <span className="mr-2">📧</span> contact@biliran.gov
              </li>
              <li className="flex items-start">
                <span className="mr-2">📞</span> (123) 456-7890
              </li>
              <li className="flex items-start">
                <span className="mr-2">🏢</span> Government Of Biliran
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-blue-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-300 text-sm mb-4 md:mb-0">
              © {currentYear} Government File Archiving System. All rights reserved.
            </p>

          </div>
          
          <div className="mt-6 flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <a href="#" className="text-blue-300 hover:text-white transition hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="text-blue-300 hover:text-white transition hover:underline">
              Terms of Service
            </a>
            <a href="#" className="text-blue-300 hover:text-white transition hover:underline">
              Accessibility
            </a>
            <a href="#" className="text-blue-300 hover:text-white transition hover:underline">
              Feedback
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
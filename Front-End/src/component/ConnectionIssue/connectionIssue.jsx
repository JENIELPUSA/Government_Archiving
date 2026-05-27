import React from 'react';
import { useNavigate } from 'react-router-dom';

const ConnectionIssue = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    // Mag-navigate sa current path para mag-render muli ang component
    navigate(0); // Ang 0 ay parang refresh/reload ng current route
  };

  const goToHomePage = () => {
    // Mag-navigate sa home page (i-adjust ang path depende sa route mo)
    navigate('/');
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] px-4 overflow-hidden">

      {/* Background waves sa ilalim */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-blue-100/20 to-transparent pointer-events-none" />

      <div className="z-10 text-center max-w-md w-full">
        {/* Illustration Area */}
        <div className="relative flex justify-center mb-6">
          {/* Decorative Clouds */}
          <div className="absolute top-8 left-1/4 -translate-x-10 w-16 h-8 bg-slate-200/50 rounded-full blur-[1px] opacity-60 hidden sm:block" />
          <div className="absolute top-12 right-1/4 translate-x-12 w-20 h-10 bg-slate-200/50 rounded-full blur-[1px] opacity-60 hidden sm:block" />

          {/* Main Globe Icon Container */}
          <div className="relative p-4">
            {/* Wi-Fi Signal Symbol */}
            <svg className="absolute -top-1 right-2 w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19h.01M8.5 15.5a5 5 0 017 0M5.5 12.5a9 9 0 0113 0" />
            </svg>

            {/* Globe */}
            <svg className="w-32 h-32 text-slate-400/80 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
              <path strokeWidth="1" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>

            {/* Red "X" Badge */}
            <div className="absolute bottom-2 right-2 bg-[#f46a6a] text-white rounded-full p-1.5 border-[4px] border-white shadow-sm flex items-center justify-center">
              <svg className="w-5 h-5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-[#1e293b] text-3xl font-bold tracking-tight mb-3">
          Connection Issue Detected
        </h1>
        <p className="text-[#64748b] text-[15px] leading-relaxed mb-8 px-2">
          A network connection issue has been detected.<br />
          Please retry your request.
        </p>

        {/* Refresh Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          {/* Optional: Home Page Button */}
          <button
            onClick={goToHomePage}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#64748b] font-semibold py-3 px-8 rounded-xl transition-all duration-200 border border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>

        {/* Footer Support Text */}
        <div className="mt-4 flex items-start sm:items-center justify-center gap-2 text-left sm:text-center text-[13px] text-[#64748b] px-4">
          {/* Question Mark Icon */}
          <div className="flex-shrink-0 w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-slate-500 font-bold text-[10px] mt-0.5 sm:mt-0">
            ?
          </div>
          <p>
            If the problem persists, please check your internet connection
          </p>
        </div>

      </div>
    </div>
  );
};

export default ConnectionIssue;
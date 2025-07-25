import React from "react";

const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[999] flex flex-col items-center justify-center text-white">
      <div className="spinner"></div>
      <p className="mt-4 text-xl">{message}</p>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            border: 8px solid rgba(255, 255, 255, 0.3);
            border-top: 8px solid #3498db;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default LoadingOverlay;
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <AlertTriangle className="w-24 h-24 text-blue-500 animate-bounce" />
            <div className="absolute inset-0 w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">Page Not Found</h2>
        <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}
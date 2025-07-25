import React from 'react';

const RoleSelection = ({ onSelectRole, selectedRole, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-12 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl dark:shadow-gray-800">
        <div className="text-center mb-10">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skeleton Card */}
          {[1, 2].map((_, index) => (
            <div key={index} className="p-8 rounded-2xl shadow-lg border-2 border-transparent dark:bg-gray-800">
              <div className="flex flex-col items-center">
                <div className="bg-gray-200 dark:bg-gray-700 p-5 rounded-full mb-6 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                </div>
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
                </div>
                <div className="mt-6 w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl dark:shadow-gray-800 transition-all">
      <div className="text-center mb-10">
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Fill in the required details to create a new account. Choose the appropriate role to define the user's access and responsibilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Admin Card */}
        <div
          onClick={() => onSelectRole('Admin')}
          className={`p-8 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 border-2 ${
            selectedRole === 'Admin'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 scale-[1.02] shadow-blue-200 dark:shadow-blue-800'
              : 'border-transparent hover:border-blue-300 hover:shadow-xl dark:hover:border-blue-400'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-5 rounded-full mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-blue-600 dark:text-blue-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Admin</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Full system access with administrative privileges and control
            </p>
            <div className="mt-6 w-12 h-1 bg-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Official Card */}
        <div
          onClick={() => onSelectRole('Official')}
          className={`p-8 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 border-2 ${
            selectedRole === 'Official'
              ? 'border-green-500 bg-green-50 dark:bg-green-950 scale-[1.02] shadow-green-200 dark:shadow-green-800'
              : 'border-transparent hover:border-green-300 hover:shadow-xl dark:hover:border-green-400'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="bg-green-100 dark:bg-green-900 p-5 rounded-full mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-green-600 dark:text-green-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 11.5c1.38 0 2.5-1.12 2.5-2.5S13.38 6.5 12 6.5 9.5 7.62 9.5 9s1.12 2.5 2.5 2.5zm-7 7.5v1h14v-1c0-2.02-4.03-3.08-7-3.08S5 16.98 5 19z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Official</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Limited access for operational tasks and data management
            </p>
            <div className="mt-6 w-12 h-1 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

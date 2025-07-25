import React from 'react';

const ViewedByList = ({ documents }) => {
  return (
    <div className="mt-8 p-6 rounded-xl shadow-lg bg-purple-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-6 flex items-center gap-2">
        <i className="fas fa-users text-purple-600 dark:text-purple-400"></i>
        Viewed By / Last Accessed
      </h2>

      <ul className="space-y-4">
        {documents.map((document) => {
          const fullName = `${document.admin_first_name} ${document.admin_last_name}`;
          const accessedDate = new Date(document.updatedAt || document.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <li
              key={document._id}
              className="flex items-start bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-600 text-purple-800 dark:text-white flex items-center justify-center text-lg font-semibold">
                  {document.admin_first_name?.[0]}
                  {document.admin_last_name?.[0]}
                </div>
              </div>

              <div className="ml-4 text-sm leading-relaxed">
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {document.title}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Last accessed by <span className="font-semibold">{fullName}</span> on {accessedDate}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ViewedByList;

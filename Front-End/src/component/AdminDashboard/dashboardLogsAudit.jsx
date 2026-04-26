import React from "react";
import { Clock, Info, User, ChevronLeft, ChevronRight } from "lucide-react";

// Component for a single log/audit entry
const LogsAndAuditEntry = ({ log, onClick }) => (
  <div
    className="flex items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
    onClick={() => onClick(log)} // Pass the entire log object on click
  >
    <div className="w-1/4 text-gray-600 dark:text-gray-400 text-sm flex items-center">
      <Clock size={16} className="mr-2 text-blue-500" /> {log.timestamp}
    </div>
    <div className="w-1/6 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center">
      <Info size={16} className="mr-2 text-purple-500" /> {log.type}
    </div>
    <div className="flex-1 text-gray-800 dark:text-gray-200 text-sm">{log.event}</div>
    <div className="w-1/5 text-gray-600 dark:text-gray-400 text-sm text-right flex items-center justify-end">
      <User size={16} className="mr-2 text-green-500" /> {log.user}
    </div>
  </div>
);

// Section for all logs and audit entries
function LogsAndAuditSection({
  currentLogs,
  totalPagesLogs,
  currentPageLogs,
  paginateLogs,
  setSelectedLogForDetail,
}) {
  return (
    <section className="mt-6 rounded-xl border-t border-blue-200 bg-white p-6 shadow-lg transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-6 px-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        Logs and Audit
      </h2>

      {/* Column Headers */}
      <div className="mb-4 flex items-center px-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="w-1/4 font-medium">Timestamp</div>
        <div className="w-1/6 font-medium">Type</div>
        <div className="flex-1 font-medium">Event</div>
        <div className="w-1/5 text-right font-medium">User</div>
      </div>

      {/* Log Entries */}
      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
        {currentLogs.length > 0 ? (
          currentLogs.map((log, index) => (
            <LogsAndAuditEntry
              key={index}
              log={log}
              onClick={setSelectedLogForDetail}
            />
          ))
        ) : (
          <p className="p-4 text-center text-gray-500 dark:text-gray-400">
            No log entries available.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPagesLogs > 1 && (
        <div className="mt-4 flex items-center justify-center space-x-2">
          <button
            onClick={() => paginateLogs(currentPageLogs - 1)}
            disabled={currentPageLogs === 1}
            className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPagesLogs }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginateLogs(i + 1)}
              className={`rounded-full px-3 py-1 ${
                currentPageLogs === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              } transition-colors duration-200`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginateLogs(currentPageLogs + 1)}
            disabled={currentPageLogs === totalPagesLogs}
            className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  );
}

export default LogsAndAuditSection;

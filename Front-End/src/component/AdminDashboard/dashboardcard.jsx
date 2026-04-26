import React from 'react';
import { TrendingUp } from 'lucide-react'; // Make sure this matches your icon library

function StatisticsCard({ icon, value, label, trend }) {
  return (
    <div className="flex flex-col rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700">
      {/* Outer card styling */}
      <div className="flex items-center justify-between p-4">
        {/* card-header */}
        <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
          {icon}
        </div>
        <p className="text-base font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      </div>

      <div className="flex flex-col items-start p-4 bg-slate-100 rounded-b-xl transition-colors dark:bg-gray-800">
        {/* card-body */}
        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{value}</p>
        <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
          <TrendingUp size={18} />
          {trend}
        </span>
      </div>
    </div>
  );
}

export default StatisticsCard;

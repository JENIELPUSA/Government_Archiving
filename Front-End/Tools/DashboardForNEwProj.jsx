import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
// Iba pang import ng libraries
// Ang Phosphor Icons ay pinalitan ng mga inline SVG components para maiwasan ang compilation error.

// Custom icon components na gumagamit ng inline SVG
const MoonIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="currentColor"
    {...props}
  >
    <path d="M128 26a102 102 0 0 0 0 204c35.6 0 69.1-13.6 94.7-38.4a102 102 0 0 0-20.9-142.1A101.4 101.4 0 0 0 128 26Zm-16.7 186.2a86 86 0 1 1 89-138.8a86 86 0 0 1-89 138.8Z" />
  </svg>
);

const SunIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="currentColor"
    {...props}
  >
    <path d="M128 64a64 64 0 1 0 64 64a64.07 64.07 0 0 0-64-64Zm-16.6 44a8 8 0 0 1-13.3-8.8l10.9-20.6a8 8 0 0 1 15 7.9l-12.6 21.5a8 8 0 0 1-2.9.2ZM45.6 195.4a8 8 0 0 1-10.4-12.5l19.1-15.9a8 8 0 0 1 10.9 11.8l-19.6 16.6a8 8 0 0 1-.0.0Zm70.9-106.6a8 8 0 0 1-15.1-6.7l-4.5-22.1a8 8 0 0 1 15.6-3.2l4 21.6a8 8 0 0 1 0.0.4Zm70.9 106.6a8 8 0 0 1-10.9-11.8l19.1-15.9a8 8 0 0 1 10.4 12.5l-18.6 15.2a8 8 0 0 1-0.0.0ZM24 128a8 8 0 0 1-8-8v-8a8 8 0 0 1 16 0v8a8 8 0 0 1-8 8Zm208 0a8 8 0 0 1-8-8v-8a8 8 0 0 1 16 0v8a8 8 0 0 1-8 8Zm-19.4-44a8 8 0 0 1-15-7.9l12.6-21.5a8 8 0 0 1 13.3 8.8l-10.9 20.6a8 8 0 0 1 0.0.0Zm19.4 44a8 8 0 0 1-8-8v-8a8 8 0 0 1 16 0v8a8 8 0 0 1-8 8Zm-19.4 44a8 8 0 0 1-13.3 8.8l10.9-20.6a8 8 0 0 1 15-7.9l-12.6 21.5a8 8 0 0 1 0.0.0ZM128 232a8 8 0 0 1-8-8v-8a8 8 0 0 1 16 0v8a8 8 0 0 1-8 8Zm0-208a8 8 0 0 1-8-8v-8a8 8 0 0 1 16 0v8a8 8 0 0 1-8 8Zm-70.9 106.6a8 8 0 0 1-15.1 6.7l-4.5 22.1a8 8 0 0 1 15.6-3.2l4-21.6a8 8 0 0 1 0.0-.4Zm70.9 106.6a8 8 0 0 1-15.1 6.7l-4.5 22.1a8 8 0 0 1 15.6-3.2l4-21.6a8 8 0 0 1 0.0-.4Z" />
  </svg>
);

const ListIcon = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="currentColor"
    {...props}
  >
    <path d="M40 128a8 8 0 0 1 8-8h160a8 8 0 0 1 0 16H48a8 8 0 0 1-8-8Zm8-56h160a8 8 0 0 0 0-16H48a8 8 0 0 0 0 16Zm160 120H48a8 8 0 0 0 0 16h160a8 8 0 0 0 0-16Z" />
  </svg>
);

// Main App component
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Create refs for the chart canvas elements
  const eventsOverTimeChartRef = useRef(null);
  const eventTypeChartRef = useRef(null);

  // Store chart instances in state to manage them
  const [eventsOverTimeChartInstance, setEventsOverTimeChartInstance] = useState(null);
  const [eventTypeChartInstance, setEventTypeChartInstance] = useState(null);

  // Initial data for charts
  const eventsOverTimeData = {
    labels: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
    // Updated data to show more varied fluctuations
    datasets: [{
      label: 'Bilang ng Kaganapan',
      data: [12, 19, 15, 22, 18, 25, 10, 14, 20, 15, 28, 23],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };

  const eventTypeData = {
    labels: ['Selebrasyon', 'Komunidad', 'Edukasyon', 'Isports'],
    datasets: [{
      label: 'Distribusyon ng Uri ng Kaganapan',
      data: [40, 25, 20, 15],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      hoverOffset: 4,
    }],
  };

  // Effect to handle theme changes and update charts
  useEffect(() => {
    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    }

    // Function to initialize charts
    const createCharts = () => {
      // Line chart
      const eventsOverTimeCtx = eventsOverTimeChartRef.current.getContext('2d');
      const newEventsOverTimeChart = new Chart(eventsOverTimeCtx, {
        type: 'line',
        data: eventsOverTimeData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: { y: { beginAtZero: true } },
        },
      });
      setEventsOverTimeChartInstance(newEventsOverTimeChart);

      // Pie chart
      const eventTypeCtx = eventTypeChartRef.current.getContext('2d');
      const newEventTypeChart = new Chart(eventTypeCtx, {
        type: 'pie',
        data: eventTypeData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false },
          },
        },
      });
      setEventTypeChartInstance(newEventTypeChart);
    };

    createCharts();

    // Cleanup function to destroy chart instances when the component unmounts
    return () => {
      if (eventsOverTimeChartInstance) {
        eventsOverTimeChartInstance.destroy();
      }
      if (eventTypeChartInstance) {
        eventTypeChartInstance.destroy();
      }
    };
  }, []);

  // Effect to update chart theme when isDarkMode state changes
  useEffect(() => {
    if (eventsOverTimeChartInstance && eventTypeChartInstance) {
      const textColor = isDarkMode ? '#e2e8f0' : '#4b5563';
      const gridColor = isDarkMode ? '#4a5568' : '#e5e7eb';

      // Update line chart options
      eventsOverTimeChartInstance.options.scales.y.ticks.color = textColor;
      eventsOverTimeChartInstance.options.scales.x.ticks.color = textColor;
      eventsOverTimeChartInstance.options.scales.y.grid.color = gridColor;
      eventsOverTimeChartInstance.options.scales.x.grid.color = gridColor;
      eventsOverTimeChartInstance.options.plugins.legend.labels.color = textColor;
      eventsOverTimeChartInstance.update();

      // Update pie chart options
      eventTypeChartInstance.options.plugins.legend.labels.color = textColor;
      eventTypeChartInstance.update();
    }
  }, [isDarkMode, eventsOverTimeChartInstance, eventTypeChartInstance]);


  // Theme toggle handler
  const handleThemeToggle = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      if (newMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      return newMode;
    });
  };

  return (
    <div className={`bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300`}>
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg p-4 mb-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <a href="#" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
              LGU-EMS
            </a>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 dark:text-gray-400 font-semibold hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300">Dashboard</a>
            <a href="#" className="text-gray-600 dark:text-gray-400 font-semibold hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300">Kaganapan</a>
            <a href="#" className="text-gray-600 dark:text-gray-400 font-semibold hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300">Ulat</a>
            <a href="#" className="text-gray-600 dark:text-gray-400 font-semibold hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300">Setting</a>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300"
            >
              {isDarkMode ? <SunIcon size={24} /> : <MoonIcon size={24} />}
            </button>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden text-gray-800 dark:text-gray-200 rounded-md"
            >
              <ListIcon size={24} />
            </button>
          </div>
        </div>
        {/* Mobile Menu (Hidden by default) */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4">
            <a href="#" className="block p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Dashboard</a>
            <a href="#" className="block p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Kaganapan</a>
            <a href="#" className="block p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Ulat</a>
            <a href="#" className="block p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Setting</a>
          </div>
        )}
      </nav>
      
      {/* Main Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* New Banner Section */}
        <div className="mb-8 p-6 sm:p-8 rounded-2xl text-white text-center shadow-xl 
                        bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 
                        dark:from-purple-900 dark:via-pink-900 dark:to-red-900">
          <h2 className="text-3xl font-bold">Maligayang Pagdating!</h2>
          <p className="mt-2 text-lg">Pamahalaan ang lahat ng iyong LGU events sa isang lugar.</p>
          <button className="mt-4 px-6 py-2 bg-white text-purple-700 rounded-full font-semibold shadow-md hover:bg-gray-200 transition-colors duration-300">
            Magdagdag ng Kaganapan
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Total Events */}
          <div className="bg-gradient-to-r from-blue-400 to-indigo-600 dark:from-blue-700 dark:to-indigo-900 rounded-2xl shadow-xl p-6 text-white text-center transform transition-transform duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold">785</h2>
            <p className="mt-2 text-lg">Kabuuan ng mga Kaganapan</p>
          </div>

          {/* Card 2: Upcoming Events */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-700 dark:to-orange-800 rounded-2xl shadow-xl p-6 text-white text-center transform transition-transform duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold">155</h2>
            <p className="mt-2 text-lg">Mga Parating na Kaganapan</p>
          </div>

          {/* Card 3: Completed Events */}
          <div className="bg-gradient-to-r from-pink-400 to-red-500 dark:from-pink-700 dark:to-red-800 rounded-2xl shadow-xl p-6 text-white text-center transform transition-transform duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold">610</h2>
            <p className="mt-2 text-lg">Mga Natapos na Kaganapan</p>
          </div>

          {/* Card 4: Events this Month */}
          <div className="bg-gradient-to-r from-teal-400 to-cyan-500 dark:from-teal-700 dark:to-cyan-800 rounded-2xl shadow-xl p-6 text-white text-center transform transition-transform duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold">45</h2>
            <p className="mt-2 text-lg">Kaganapan ngayong Buwan</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Chart 1: Events over Time (Line Graph) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Mga Kaganapan sa Paglipas ng Panahon</h2>
            <canvas ref={eventsOverTimeChartRef} id="eventsOverTimeChart"></canvas>
          </div>

          {/* Chart 2: Event Type Distribution (Pie Chart) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribusyon ng Uri ng Kaganapan</h2>
            <canvas ref={eventTypeChartRef} id="eventTypeChart"></canvas>
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Mga Kamakailang Kaganapan</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pangalan ng Kaganapan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Petsa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lokasyon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Dummy data for the table */}
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Araw ng Lungsod na Pagdiriwang</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Oktubre 26, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Plaza Rizal</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Natapos</span>
                    </td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Clean-up Drive sa Bayan</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Nobyembre 15, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Iba't Ibang Barangay</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Parating</span>
                    </td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Seminar sa Agrikultura</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Nobyembre 22, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Cultural Center</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Parating</span>
                    </td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Paligsahan sa Pag-awit</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Disyembre 5, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Covered Court</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Parating</span>
                    </td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Christmas Party ng mga Senior Citizen</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Disyembre 18, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Function Hall</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Parating</span>
                    </td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Family Day at Sports Fest</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Enero 10, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Municipal Grounds</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Natapos</span>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

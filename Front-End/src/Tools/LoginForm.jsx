import React, { useState } from 'react';

// Main Logh component para sa login form
function LoginForm() {
  // State para sa username/email at password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State para sa mensahe ng error o tagumpay
  const [message, setMessage] = useState('');

  // Handler para sa pagbabago ng email input
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Handler para sa pagbabago ng password input
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Handler para sa pag-submit ng form
  const handleSubmit = (e) => {
    e.preventDefault(); // Pigilan ang default form submission

    // Simpleng validation (maaaring palitan ng mas kumplikadong logic)
    if (email === 'admin@gov.ph' && password === 'password123') {
      setMessage('Login successful! Welcome to the Government Archiving System.');
      // Dito mo maaaring ilagay ang logic para sa redirection o pag-load ng dashboard
    } else {
      setMessage('Invalid credentials. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <div className="text-center mb-8">
          {/* Icono ng Gobyerno o Archive - Maaaring palitan ng mas angkop na SVG o image */}
          <svg
            className="mx-auto h-16 w-16 text-blue-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
            ></path>
          </svg>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Government Archiving System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Mag-log in upang ma-access ang iyong account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="iyong.email@gobyerno.ph"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={handlePasswordChange}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="********"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Nakalimutan ang password?
              </a>
            </div>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:scale-100"
            >
              Mag-log In
            </button>
          </div>
        </form>

        {/* Mensahe ng Status (Error/Success) */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-center text-sm ${
              message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginForm;

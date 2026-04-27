import React from 'react';
import backgroundImage from "../../../src/assets/logo-login.png";
import police from "../../../src/assets/PNP.png";
import DPHW from "../../../src/assets/DPHW.png";
import PSA from "../../../src/assets/PSA.png";
import BFP from "../../../src/assets/BFP.png";
import dole from "../../../src/assets/dole.webp";

const logos = [
  { id: 1, name: 'Municipal Hall', type: 'image', src: backgroundImage}, 
  { id: 2, name: 'dole', type: 'image', src: dole },
  { id: 3, name: 'Police Department', type: 'image',src: police},
  { id: 4, name: 'Fire Department', type: 'image', src: BFP}, 
  { id: 5, name: 'PSA', type: 'image', src: PSA },
  { id: 6, name: 'Engineering Dept', type: 'image', src: DPHW }, 
];

// Combined array for seamless loop: [logos, logos]
const marqueeLogos = [...logos, ...logos];

/**
 * Component for rendering each logo item.
 * @param {{logo: Object}} props - The data of a single logo.
 */
const LogoItem = ({ logo }) => {
  return (
    <div className="flex-shrink-0 w-[100px] h-[60px] mx-3 sm:w-[120px] sm:h-[70px] sm:mx-5 md:w-[150px] md:h-[80px] md:mx-8 flex justify-center items-center bg-white border border-gray-200 rounded-lg shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
      {logo.type === 'image' ? (
        <img
          src={logo.src}
          alt={`Logo of ${logo.name}`}
          className="max-h-full max-w-full object-contain p-1 sm:p-2"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x80/e5e7eb/374151?text=Error"; }}
        />
      ) : (
        logo.component
      )}
    </div>
  );
};

const LocalServices = () => {
  return (
    <>
      <style>{`
        /* Keyframes for continuous scroll left */
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* Faster animation for mobile, slower for desktop */
        .logo-marquee-track {
          animation: scroll-left 20s linear infinite;
          animation-play-state: running;
          width: fit-content;
        }

        /* Slower animation on larger screens */
        @media (min-width: 768px) {
          .logo-marquee-track {
            animation: scroll-left 30s linear infinite;
          }
        }

        /* Pause the animation on hover */
        .logo-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Main Container */}
      <div className="flex flex-col justify-center items-center mt-2 sm:mt-4 px-2 sm:px-4">
        <div className="max-w-8xl mx-auto w-full">
          <div className="relative overflow-hidden w-full bg-white p-3 sm:p-4 md:p-6 shadow-xl sm:shadow-2xl border-t-2 sm:border-t-4 border-indigo-600 rounded-lg">
            
            {/* Gradient overlays - responsive width */}
            <div className="absolute inset-y-0 left-0 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            {/* Optional: Add a title for mobile context */}
            <div className="text-center mb-3 sm:mb-4 md:hidden">
              <h3 className="text-sm font-semibold text-gray-700">Partner Agencies</h3>
            </div>

            <div className="flex">
              <div className="logo-marquee-track flex">
                {marqueeLogos.map((logo, index) => (
                  <LogoItem key={index} logo={logo} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalServices;
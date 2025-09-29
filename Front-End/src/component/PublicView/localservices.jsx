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
    <div className="flex-shrink-0 w-[150px] h-[80px] mx-8 flex justify-center items-center bg-white border border-gray-200 shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
      {logo.type === 'image' ? (
        <img
          src={logo.src}
          alt={`Logo of ${logo.name}`}
          className="max-h-full max-w-full object-contain p-2"
          // Fallback if the image fails to load (optional)
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x80/e5e7eb/374151?text=Error"; }}
        />
      ) : (
        // Render the SVG component
        logo.component
      )}
    </div>
  );
};

const localservices = () => {
  return (
    <>
      <style>{`
        /* Keyframes for continuous scroll left */
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); } /* Exactly 50% for the seamless loop */
        }

        /* Container class to apply the animation */
        .logo-marquee-track {
          animation: scroll-left 30s linear infinite; /* 30 seconds speed */
          animation-play-state: running;
          width: fit-content;
        }

        /* Pause the animation on hover */
        .logo-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      
  {/* Main Container */}
<div className="flex flex-col justify-center items-center mt-4 xs:mt-2">
  <div className="max-w-8xl mx-auto w-full"> {/* Removed py-8 sm:py-16 */}
    <div className="relative overflow-hidden w-full bg-white p-6 shadow-2xl border-t-4 border-indigo-600">
      
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

      <div className="flex">
        <div className="logo-marquee-track flex">
          {/* Render the combined list of logos */}
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

export default localservices;

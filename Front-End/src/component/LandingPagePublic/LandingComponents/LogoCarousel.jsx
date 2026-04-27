import React from "react";
import dilgLogo from "../../../assets/DILG.png";
import bfplogo from "../../../assets/BFP.png";
import dphwlogo from "../../../assets/DPHW.png";
import pnplogo from "../../../assets/PNP.png";
import dolelogo from "../../../assets/dole.webp";
import pasalogo from "../../../assets/PSA.png";
import biliranlogo from "../../../assets/logo-login.png";
import philhealthlogo from "../../../assets/philhealth.png";
import costguardlogo from "../../../assets/coastguard.png";
import electriclogo from "../../../assets/electricbill.png";

const LogoCarousel = () => {
  const logos = [
    { id: 1, image: dilgLogo, name: "DILG" },
    { id: 2, image: bfplogo, name: "BFP" },
    { id: 3, image: philhealthlogo, name: "PHILHEALTH" },
    { id: 4, image: dphwlogo, name: "DPWH" },
    { id: 5, image: costguardlogo, name: "COSTGUARD" },
    { id: 6, image: biliranlogo, name: "BILIRAN" },
    { id: 7, image: pnplogo, name: "PNP" },
    { id: 8, image: dolelogo, name: "DOLE" },
    { id: 9, image: pasalogo, name: "PSA" },
    { id: 10, image: electriclogo, name: "BILECO" },
  ];

  return (
    <div className="relative z-20 w-full overflow-hidden border-t-4 border-blue-800/20 bg-blue-950 py-4">
      <div
        className="flex animate-marquee"
        style={{ animationPlayState: "running" }} // paused on hover via CSS
      >
        {/* First Set */}
        {logos.concat(logos).map((logo, index) => (
          <div
            key={index}
            className="group mx-4 flex flex-col items-center justify-center md:mx-8"
          >
            <div className="mb-1 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-blue-100 shadow-md transition-transform duration-300 group-hover:scale-110">
              <img
                src={logo.image}
                alt={logo.name}
                className="object-contain"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <span className="text-center text-xs font-bold text-blue-50 opacity-70 transition-opacity group-hover:opacity-100">
              {logo.name}
            </span>
          </div>
        ))}
      </div>

      {/* CSS in JSX for hover pause */}
      <style jsx>{`
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default LogoCarousel;

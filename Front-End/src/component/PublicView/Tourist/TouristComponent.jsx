import React, { useState, useEffect } from "react";
import sambawan from "../../../assets/sambawan.jpg";
import Tinago from "../../../assets/Tinago.JPG";
import Tumalistis from "../../../assets/tumalistis.jpg";
import ulan from "../../../assets/ulan-ulan.jpg";
import marinour from "../../../assets/marinour.jpg";

const images = [
  {
    url: Tinago,
    title: "Tinago Waterfalls",
    subtitle:
      "Tinago Waterfalls. The most hypnotic waterfalls magnificently lay its beauty in the heart of Caibiran rainforest, a loop trail taking 10 minutes from the highway. A hideaway that blends perfectly for nature lovers; rich blend of trees, vines, & other exotic plants accompanied by the cooling & enchanting sounds of rushing streams.",
  },
  {
    url: Tumalistis,
    title: "Tomalistis Falls",
    subtitle:
      "Tomalistis Falls Brgy. Asug, Caibiran, Biliran; 20 minutes from the town proper. The Tomalistis Falls is believed and has been reported to have the sweetest-tasting water in the world. Its water's taste has a different kind of peculiarity that makes it exquisite.",
  },
  {
    url: ulan,
    title: "Ulan Ulan Falls",
    subtitle:
      "Ulan Ulan Falls Ulan-Ulan means rain in the local dialect 25m-high falls, surrounded by thick tropical forest, are some of the most spectacular in Biliran Ulan Ulan Falls. The famed waterfalls of Sampao are very picturesque.",
  },
  {
    url: marinour,
    title: "The Marienor Mountain Resort",
    subtitle:
      "The Marienor Mountain Resort is a privately owned pool that recently opened to the public. Its water is sourced from the spring water in the nearby mountains. It is located in Brgy. Capiñahan Sitio Anislag, Naval, Biliran.",
  },
  {
    url: sambawan,
    title: "Sambawan Island",
    subtitle:
      "Sambawan Island is Biliran's answer to paradise. White sands, thriving marine life and warm blue waters lapping up the tree-lined shore is a must for those wanting escape from reality. Maria Benita, our good fairy must have worked wonders in this place.",
  },
];

const LandingPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState('next');

  const nextSlide = () => {
    setDirection('next');
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection('prev');
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setDirection(index > activeIndex ? 'next' : 'prev');
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, activeIndex]);

  const activeImage = images[activeIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Images */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
            index === activeIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          }`}
          style={{ 
            backgroundImage: `url(${img.url})`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      ))}

      {/* Gradient Overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
      
      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8 lg:px-12 z-20">
        <div className="max-w-5xl w-full space-y-4 sm:space-y-6">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 animate-fade-in-down">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-xs sm:text-sm font-medium">Biliran Province, Philippines</span>
          </div>

          {/* Title with enhanced responsive typography */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 animate-fade-in-up leading-tight sm:leading-tighter">
            <span 
              className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl"
              style={{
                fontSize: 'clamp(1.75rem, 5vw, 4.5rem)',
                lineHeight: 'clamp(2.25rem, 6vw, 5.5rem)'
              }}
            >
              {activeImage.title}
            </span>
          </h1>

          {/* Subtitle with enhanced responsive design */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-fade-in-up-delay shadow-2xl max-w-4xl mx-auto">
            <p 
              className="text-gray-100 leading-relaxed sm:leading-loose"
              style={{
                fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
                lineHeight: 'clamp(1.375rem, 3vw, 1.875rem)'
              }}
            >
              {activeImage.subtitle}
            </p>
          </div>

          {/* CTA Button with responsive sizing */}
          <button
            className="group relative inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold 
                       py-3 px-6 sm:py-4 sm:px-8 rounded-full 
                       hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
                       animate-fade-in-up-delay-2 shadow-lg shadow-blue-500/50 text-sm sm:text-base"
            onClick={() =>
              window.open(
                "https://tourism.biliranisland.com/island-attractions",
                "_blank"
              )
            }
          >
            <span>Explore More</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Enhanced Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 md:left-8 top-1/2 transform -translate-y-1/2 
                   bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 sm:p-3 rounded-full 
                   transition-all duration-300 z-30 border border-white/20 hover:scale-110 group
                   shadow-lg hover:shadow-xl"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-6 sm:w-6 transform group-hover:-translate-x-0.5 sm:group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 md:right-8 top-1/2 transform -translate-y-1/2 
                   bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 sm:p-3 rounded-full 
                   transition-all duration-300 z-30 border border-white/20 hover:scale-110 group
                   shadow-lg hover:shadow-xl"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-6 sm:w-6 transform group-hover:translate-x-0.5 sm:group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Enhanced Thumbnail Carousel - Right side */}
      <div className="absolute hidden sm:flex sm:flex-col sm:gap-3 md:gap-4 lg:gap-5
                      sm:right-4 md:right-6 lg:right-8 xl:right-12
                      sm:top-1/2 sm:transform sm:-translate-y-1/2 z-30">
        {images.map((img, index) => (
          <div
            key={index}
            className={`cursor-pointer transition-all duration-500 relative group
              ${
                index === activeIndex
                  ? "sm:w-24 sm:h-20 md:w-32 md:h-24 lg:w-40 lg:h-32 xl:w-48 xl:h-36"
                  : "sm:w-16 sm:h-12 md:w-24 md:h-18 lg:w-32 lg:h-24 xl:w-36 xl:h-28 opacity-70 hover:opacity-100"
              }`}
            onClick={() => goToSlide(index)}
          >
            <img
              src={img.url}
              alt={img.title}
              className={`w-full h-full object-cover rounded-lg sm:rounded-xl transition-all duration-500
                         border-2 ${index === activeIndex ? 'border-blue-400 shadow-lg sm:shadow-xl shadow-blue-500/50' : 'border-white/30 hover:border-white/60'}
                         ${index === activeIndex ? 'scale-100' : 'scale-95 hover:scale-100'}`}
            />
            {index === activeIndex && (
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-t from-blue-500/30 to-transparent" />
            )}
            {/* Thumbnail label */}
            <div className={`absolute bottom-1 left-1 right-1 sm:bottom-2 sm:left-2 sm:right-2 text-white font-medium transition-opacity duration-300
                           text-xs sm:text-sm lg:text-base
                           ${index === activeIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <div className="bg-black/50 backdrop-blur-sm rounded px-1 sm:px-2 py-0.5 sm:py-1 truncate text-xs sm:text-sm">
                {img.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Thumbnail Carousel - Bottom */}
      <div className="absolute flex sm:hidden bottom-16 left-1/2 transform -translate-x-1/2 gap-2 px-4 z-30 max-w-full overflow-x-auto py-2">
        {images.map((img, index) => (
          <div
            key={index}
            className={`cursor-pointer transition-all duration-500 flex-shrink-0
              ${
                index === activeIndex
                  ? "w-14 h-12 ring-2 ring-blue-400 shadow-lg shadow-blue-500/50"
                  : "w-10 h-8 opacity-60 hover:opacity-100"
              }`}
            onClick={() => goToSlide(index)}
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-full object-cover rounded-md border border-white/30"
            />
          </div>
        ))}
      </div>

      {/* Enhanced Progress Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2 z-30">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === activeIndex 
                ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-gradient-to-r from-blue-400 to-cyan-400 shadow-lg shadow-blue-500/50" 
                : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Custom CSS for enhanced animations and responsive text */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }
        .animate-fade-in-up-delay {
          animation: fade-in-up 0.8s ease-out 0.4s both;
        }
        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 0.8s ease-out 0.6s both;
        }
        
        /* Extra small breakpoint for very small devices */
        @media (min-width: 375px) {
          .xs\\:text-3xl {
            font-size: 1.875rem;
            line-height: 2.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
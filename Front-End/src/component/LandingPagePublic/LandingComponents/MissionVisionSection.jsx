import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiTargetArrows, GiEyeTarget } from "react-icons/gi";

// Static assets para sa overlays at background
import logo1 from "../../../assets/bagongpilipinas.png";
import logo2 from "../../../assets/logo-login.png";
import background from "../../../assets/Bacground.jpg";

// Custom Hook for Count Animation (Keep this as is)
const useCountAnimation = (targetValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  const extractNumber = (value) => {
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const extractSuffix = (value) => {
    const match = value.match(/\d+(.*)/);
    return match ? match[1] : "";
  };

  const targetNumber = extractNumber(targetValue);
  const suffix = extractSuffix(targetValue);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsAnimating(true);
            setHasAnimated(true);
            const startTime = Date.now();
            const animateCount = () => {
              const currentTime = Date.now();
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeOutQuad = 1 - Math.pow(1 - progress, 2);
              const currentCount = Math.floor(easeOutQuad * targetNumber);
              setCount(currentCount);
              if (progress < 1) requestAnimationFrame(animateCount);
              else setIsAnimating(false);
            };
            requestAnimationFrame(animateCount);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => { if (elementRef.current) observer.unobserve(elementRef.current); };
  }, [targetNumber, duration, hasAnimated]);

  return { displayCount: `${count}${suffix}`, ref: elementRef, isAnimating, hasAnimated };
};

const AnimatedStat = ({ value, label, delay = 0 }) => {
  const { displayCount, ref, isAnimating, hasAnimated } = useCountAnimation(value, 2000);
  return (
    <motion.div
      ref={ref}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 text-center border border-white/20 shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: "easeOut" } }}
      whileHover={{ scale: 1.05, y: -5 }}
      viewport={{ once: true }}
    >
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 flex items-center justify-center min-h-[60px]">
        {displayCount}
      </div>
      <div className="h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-400 to-emerald-400" 
          initial={{ width: 0 }} 
          animate={{ width: hasAnimated ? "100%" : 0 }} 
          transition={{ duration: 2, delay: delay + 0.3 }}
        />
      </div>
      <div className="text-blue-100 text-sm md:text-base font-medium">{label}</div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
// Inayos ang destructuring ng props dito
const MissionVisionSection = ({ formData, previews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Gamitin ang previews array mula sa props, kung empty, gumamit ng fallback array
  const carouselImages = previews && previews.length > 0 
    ? previews 
    : [{ url: background, name: "Default" }];

  useEffect(() => {
    let interval;
    if (isAutoPlaying && carouselImages.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselImages.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };

  const stats = [
    { label: "Years of Service", value: "33+" },
    { label: "Communities Served", value: "132" },
    { label: "Projects Completed", value: "500+" },
    { label: "Satisfaction Rate", value: "98%" }
  ];

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center py-12 md:py-24 px-4 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/80 to-emerald-900/90" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <motion.div className="text-center mb-12" variants={textVariants}>
          <h2 className="text-3xl md:text-6xl font-bold text-white">
            Our <span className="bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent">Mission & Vision</span>
          </h2>
        </motion.div>

        {/* MISSION & VISION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl" variants={textVariants}>
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 p-3 rounded-xl mr-4"><GiTargetArrows className="text-white text-2xl" /></div>
              <h3 className="text-2xl font-bold text-white">Our Mission</h3>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">{formData?.Mission || "Loading..."}</p>
          </motion.div>

          <motion.div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl" variants={textVariants}>
            <div className="flex items-center mb-4">
              <div className="bg-emerald-500 p-3 rounded-xl mr-4"><GiEyeTarget className="text-white text-2xl" /></div>
              <h3 className="text-2xl font-bold text-white">Our Vision</h3>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">{formData?.Vission || "Loading..."}</p>
          </motion.div>
        </div>

        {/* DYNAMIC CAROUSEL SECTION */}
        <motion.div className="w-full max-w-4xl mx-auto mb-20" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
          <div className="relative group" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
            <div className="relative h-[300px] md:h-[500px] overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl bg-black/20">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={carouselImages[currentIndex]?.url} // Gamit ang dynamic URL
                  alt={carouselImages[currentIndex]?.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Logos */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                <img src={logo1} alt="Logo 1" className="h-12 w-12 md:h-16 md:w-16 object-contain bg-white/20 p-2 rounded-full backdrop-blur-md" />
                <img src={logo2} alt="Logo 2" className="h-12 w-12 md:h-16 md:w-16 object-contain bg-white/20 p-2 rounded-full backdrop-blur-md" />
              </div>

              {/* Navigation */}
              {carouselImages.length > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-3 rounded-full text-white hover:bg-black/50 transition z-20">
                    <FaChevronLeft />
                  </button>
                  <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 p-3 rounded-full text-white hover:bg-black/50 transition z-20">
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MissionVisionSection;
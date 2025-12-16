import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { GiTargetArrows, GiEyeTarget } from "react-icons/gi";

import document1 from "../../../assets/ros222.jpg";
import document2 from "../../../assets/Ros1.jpg";
import document3 from "../../../assets/ros2233.jpg";
import document4 from "../../../assets/ros12.jpg";
import document5 from "../../../assets/ros3.jpg";
import document6 from "../../../assets/ros444.jpg";
import document7 from "../../../assets/ros555.jpg";
import document8 from "../../../assets/ros888.jpg";
import document9 from "../../../assets/ros999.jpg";
import logo1 from "../../../assets/bagongpilipinas.png";
import logo2 from "../../../assets/logo-login.png";
import background from "../../../assets/Bacground.jpg";

// Carousel image list
const images = [
  { src: document2 },
  { src: document3},
  { src: document4},
  { src: document5},
  { src: document6},
  { src: document7},
  { src: document8 },
  { src: document9 },
];

// Custom Hook for Count Animation
const useCountAnimation = (targetValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  // Extract number from values like "33+" or "98%"
  const extractNumber = (value) => {
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Extract suffix from values like "33+" or "98%"
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
            const endTime = startTime + duration;

            const animateCount = () => {
              const currentTime = Date.now();
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // Easing function for smooth animation
              const easeOutQuad = 1 - Math.pow(1 - progress, 2);
              const currentCount = Math.floor(easeOutQuad * targetNumber);

              setCount(currentCount);

              if (progress < 1) {
                requestAnimationFrame(animateCount);
              } else {
                setIsAnimating(false);
              }
            };

            requestAnimationFrame(animateCount);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [targetNumber, duration, hasAnimated]);

  return {
    displayCount: `${count}${suffix}`,
    ref: elementRef,
    isAnimating,
    hasAnimated
  };
};

// Animated Stat Component
const AnimatedStat = ({ value, label, delay = 0 }) => {
  const { displayCount, ref, isAnimating, hasAnimated } = useCountAnimation(value, 2000);

  return (
    <motion.div
      ref={ref}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 text-center border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.6, 
          delay: delay,
          ease: "easeOut" 
        }
      }}
      whileHover={{ 
        scale: 1.05,
        y: -5,
        boxShadow: "0 20px 40px rgba(59, 130, 246, 0.2)",
        transition: { duration: 0.3 }
      }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="relative">
        {/* Animated Number */}
        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2 min-h-[60px] flex items-center justify-center">
          <motion.span
            key={displayCount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {displayCount}
          </motion.span>
          
          {/* Loading dots while animating */}
          {isAnimating && (
            <motion.div
              className="ml-2 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                className="h-1 w-1 bg-white rounded-full mx-[1px]"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="h-1 w-1 bg-white rounded-full mx-[1px]"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="h-1 w-1 bg-white rounded-full mx-[1px]"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </motion.div>
          )}
        </div>
        
        {/* Progress Bar Animation */}
        <div className="h-1 bg-white/20 rounded-full mt-2 mb-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ 
              width: hasAnimated && !isAnimating ? "100%" : "0%",
              transition: { 
                duration: 2, 
                delay: delay + 0.3,
                ease: "easeInOut"
              }
            }}
          />
        </div>
        
        {/* Label */}
        <div className="text-blue-100 text-sm md:text-base font-medium">
          {label}
        </div>
        
        {/* Animated Icon */}
        <motion.div
          className="absolute -top-3 -left-3 h-10 w-10 bg-gradient-to-br from-blue-500/30 to-emerald-500/30 rounded-full flex items-center justify-center"
          animate={{ 
            rotate: hasAnimated ? [0, 360] : 0,
            scale: hasAnimated ? [1, 1.1, 1] : 1
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
          }}
        >
          <div className="h-4 w-4 bg-blue-400 rounded-full" />
        </motion.div>

        {/* Completion indicator */}
        {hasAnimated && !isAnimating && (
          <motion.div
            className="absolute -top-2 -right-2 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="h-2 w-2 bg-white rounded-full" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const MissionVisionSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const carouselVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Stats data
  const stats = [
    { label: "Years of Service", value: "33+" },
    { label: "Communities Served", value: "132" },
    { label: "Projects Completed", value: "500+" },
    { label: "Satisfaction Rate", value: "98%" }
  ];

  return (
    <motion.section 
      className="relative min-h-screen flex items-center justify-center py-12 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* ENHANCED BACKGROUND WITH GRADIENT */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${background})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/80 to-emerald-900/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* SECTION TITLE - RESPONSIVE */}
        <motion.div 
          className="text-center mb-12 md:mb-16 px-4"
          variants={textVariants}
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-400 to-red-400 rounded-full mr-4" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Our <span className="bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent">Mission & Vision</span>
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-red-400 to-blue-400 rounded-full ml-4" />
          </div>
          <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto">
            Guiding Principles for a Progressive Biliran Province
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          
          {/* TEXT CONTENT - RESPONSIVE */}
          <motion.div 
            className="w-full lg:w-1/2"
            variants={textVariants}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 lg:p-10 border border-white/20 shadow-2xl">
              
              {/* MISSION CARD */}
              <motion.div 
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-lg rounded-2xl p-6 md:p-7 mb-6 md:mb-8 border border-blue-400/30 shadow-xl"
                variants={itemVariants}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                  transition: { duration: 0.3 }
                }}
              >
                <div className="flex items-start mb-4 md:mb-6">
                  <div className="bg-blue-500 p-3 rounded-xl mr-4">
                    <GiTargetArrows className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                      Our Mission
                    </h3>
                    <div className="h-1 w-20 bg-blue-400 rounded-full" />
                  </div>
                </div>
                <p className="text-white/90 text-base md:text-lg leading-relaxed font-medium pl-14">
                  To deliver exceptional public service through transparent governance, 
                  sustainable development, and community empowerment, ensuring the 
                  prosperity and well-being of every resident in our province.
                </p>
              </motion.div>

              {/* VISION CARD */}
              <motion.div 
                className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 backdrop-blur-lg rounded-2xl p-6 md:p-7 mb-8 md:mb-10 border border-emerald-400/30 shadow-xl"
                variants={itemVariants}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)",
                  transition: { duration: 0.3 }
                }}
              >
                <div className="flex items-start mb-4 md:mb-6">
                  <div className="bg-emerald-500 p-3 rounded-xl mr-4">
                    <GiEyeTarget className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                      Our Vision
                    </h3>
                    <div className="h-1 w-20 bg-emerald-400 rounded-full" />
                  </div>
                </div>
                <p className="text-white/90 text-base md:text-lg leading-relaxed font-medium pl-14">
                  A progressive, resilient, and united province where every community 
                  thrives through collaborative governance, economic growth, and 
                  sustainable environmental stewardship.
                </p>
              </motion.div>

              {/* TAGLINE */}
              <motion.div 
                className="relative"
                variants={itemVariants}
              >
                <div className="relative bg-gradient-to-r from-blue-600/20 via-yellow-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 overflow-hidden">
                  {/* DECORATIVE ELEMENTS */}
                  <div className="absolute top-0 left-0 w-20 h-20 bg-blue-400/10 rounded-full -translate-x-10 -translate-y-10" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full translate-x-10 translate-y-10" />
                  
                  <div className="relative z-10 text-center">
                    <FaQuoteLeft className="text-yellow-300/50 text-3xl mb-4 mx-auto" />
                    <p className="text-white text-lg md:text-xl lg:text-2xl font-semibold italic mb-4 leading-snug">
                      "Excellence in Service, Unity in Purpose, Progress for All"
                    </p>
                    <FaQuoteRight className="text-yellow-300/50 text-3xl mt-4 mx-auto" />
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <p className="text-blue-100 text-sm md:text-base">
                        Provincial Government of Biliran
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* CAROUSEL - RESPONSIVE */}
          <motion.div 
            className="w-full lg:w-1/2"
            variants={carouselVariants}
          >
            <div className="relative"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {/* CAROUSEL CONTAINER */}
              <motion.div 
                ref={carouselRef}
                className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[550px] overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={images[currentIndex].src}
                    alt={images[currentIndex].title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>

                {/* GRADIENT OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-emerald-900/30" />



                {/* LOGOS - RESPONSIVE */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 md:space-x-6">
                  <motion.div 
                    className="h-14 w-14 md:h-20 md:w-20 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-lg border-2 border-white/30 shadow-xl"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={logo1} alt="Bagong Pilipinas" className="h-full w-full object-contain p-2" />
                  </motion.div>
                  <motion.div 
                    className="h-14 w-14 md:h-20 md:w-20 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-lg border-2 border-white/30 shadow-xl"
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={logo2} alt="Provincial Government" className="h-full w-full object-contain p-2" />
                  </motion.div>
                </div>

                {/* CONTROLS - RESPONSIVE */}
                <motion.button
                  onClick={prevSlide}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-3 md:p-4 rounded-full hover:bg-black/70 transition-all duration-300 shadow-xl"
                  aria-label="Previous image"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <FaChevronLeft className="text-lg md:text-xl" />
                </motion.button>

                <motion.button
                  onClick={nextSlide}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-3 md:p-4 rounded-full hover:bg-black/70 transition-all duration-300 shadow-xl"
                  aria-label="Next image"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <FaChevronRight className="text-lg md:text-xl" />
                </motion.button>

                {/* INDICATORS - RESPONSIVE */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`transition-all duration-300 rounded-full ${
                        idx === currentIndex
                          ? "bg-white w-8 md:w-10 h-2"
                          : "bg-white/50 w-2 h-2 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* SLIDE COUNTER */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">
                    {currentIndex + 1} / {images.length}
                  </span>
                </div>
              </motion.div>

              {/* AUTOPLAY INDICATOR */}
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className={`h-2 w-2 rounded-full transition-all duration-300 ${isAutoPlaying ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                <span className="text-blue-100 text-sm">
                  {isAutoPlaying ? 'Auto-playing' : 'Paused'}
                </span>
              </div>
            </div>

            {/* SWIPE HINT FOR MOBILE */}
            <div className="mt-4 text-center lg:hidden">
              <p className="text-blue-200 text-sm flex items-center justify-center">
                <FaChevronLeft className="mr-2" />
                Swipe to navigate
                <FaChevronRight className="ml-2" />
              </p>
            </div>
          </motion.div>
        </div>

        {/* ANIMATED STATS SECTION */}
        <div className="mt-12 md:mt-16">
          <motion.div 
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Our <span className="text-yellow-300">Achievements</span> in Numbers
            </h3>
            <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">
              Years of dedicated service and impactful community development
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <AnimatedStat
                key={index}
                value={stat.value}
                label={stat.label}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default MissionVisionSection;
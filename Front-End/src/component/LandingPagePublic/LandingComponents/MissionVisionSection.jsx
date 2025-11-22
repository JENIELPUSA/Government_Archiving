import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
  { src: document1 },
  { src: document2 },
  { src: document3 },
  { src: document4 },
  { src: document5 },
  { src: document6 },
  { src: document7 },
  { src: document8 },
  { src: document9 },
];

const MissionVisionSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const carouselVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    }
  };

  return (
    <motion.section 
      className="relative flex min-h-full items-center overflow-hidden py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {/* BACKGROUND */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${background})`,
          filter: "grayscale(100%) brightness(0.7)",
          zIndex: 1,
        }}
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* DARKER OVERLAY FOR BETTER TEXT READABILITY */}
      <div className="absolute inset-0 bg-black/60 z-2" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          
          {/* TEXT CONTENT - IMPROVED READABILITY */}
          <motion.div 
            className="z-10 lg:w-1/2"
            variants={textVariants}
          >
            <motion.div
              className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20"
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2 
                className="mb-8 text-4xl font-bold leading-tight text-white md:text-5xl"
                variants={itemVariants}
              >
                Our <span className="text-blue-300">Mission & Vision</span>
              </motion.h2>

              <div className="space-y-8">
                {/* MISSION */}
                <motion.div 
                  className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border-l-4 border-blue-400"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    borderLeftWidth: "6px",
                    transition: { duration: 0.3 }
                  }}
                >
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <motion.span 
                      className="w-3 h-3 bg-blue-400 rounded-full mr-3"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    />
                    Our Mission
                  </h3>
                  <p className="text-white text-lg leading-relaxed font-medium">
                    To deliver exceptional public service through transparent governance, 
                    sustainable development, and community empowerment, ensuring the 
                    prosperity and well-being of every resident in our province.
                  </p>
                </motion.div>

                {/* VISION */}
                <motion.div 
                  className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border-l-4 border-green-400"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    borderLeftWidth: "6px",
                    transition: { duration: 0.3 }
                  }}
                >
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <motion.span 
                      className="w-3 h-3 bg-green-400 rounded-full mr-3"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: 1,
                        repeatType: "loop"
                      }}
                    />
                    Our Vision
                  </h3>
                  <p className="text-white text-lg leading-relaxed font-medium">
                    A progressive, resilient, and united province where every community 
                    thrives through collaborative governance, economic growth, and 
                    sustainable environmental stewardship.
                  </p>
                </motion.div>

                {/* TAGLINE */}
                <motion.div 
                  className="text-center mt-8"
                  variants={itemVariants}
                >
                  <motion.div 
                    className="inline-block bg-gradient-to-r from-blue-500/30 to-green-500/30 px-6 py-4 rounded-full backdrop-blur-sm border border-white/20"
                    whileHover={{
                      scale: 1.05,
                      background: "linear-gradient(45deg, rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.4))",
                      transition: { duration: 0.3 }
                    }}
                  >
                    <p className="text-xl font-semibold text-white italic">
                      "Excellence in Service, Unity in Purpose, Progress for All"
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* CAROUSEL */}
          <motion.div 
            className="relative w-full lg:w-1/2"
            variants={carouselVariants}
          >
            <motion.div 
              className="relative h-[400px] w-full overflow-hidden rounded-2xl border-4 border-white/80 shadow-2xl md:h-[500px]"
              whileInView={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                rotateY: 0 
              }}
              viewport={{ once: true, amount: 0.3 }}
              initial={{ opacity: 0, x: 50, scale: 0.9, rotateY: 10 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex].src}
                  alt={`Provincial Development ${currentIndex + 1}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>

              {/* ENHANCED OVERLAY FOR BETTER CONTRAST */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* SMOKE WAVE EFFECT */}
              <motion.div 
                className="pointer-events-none absolute bottom-0 left-0 right-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="relative h-32 w-full">
                  <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-blue-900/80 via-blue-700/50 to-transparent backdrop-blur-[3px]" />
                  
                  <div
                    className="absolute bottom-4 h-20 w-full bg-gradient-to-t from-red-600/40 via-red-500/30 to-transparent backdrop-blur-[4px] mix-blend-overlay"
                    style={{
                      maskImage: "radial-gradient(ellipse 80% 50% at 50% 100%, black 40%, transparent 70%)",
                    }}
                  />

                  <div
                    className="absolute bottom-2 h-16 w-full bg-gradient-to-t from-purple-600/35 via-purple-500/25 to-transparent backdrop-blur-[5px] mix-blend-screen"
                    style={{
                      maskImage: "radial-gradient(ellipse 60% 40% at 30% 100%, black 30%, transparent 60%)",
                    }}
                  />
                </div>
              </motion.div>

              {/* LOGOS */}
              <motion.div 
                className="absolute bottom-8 left-1/2 flex -translate-x-1/2 transform items-center justify-center space-x-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
              >
                <motion.div 
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 backdrop-blur-md border-2 border-white/40 shadow-xl"
                  variants={logoVariants}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.3 }
                  }}
                >
                  <img src={logo1} alt="Bagong Pilipinas Logo" className="h-full w-full object-contain p-2" />
                </motion.div>
                <motion.div 
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 backdrop-blur-md border-2 border-white/40 shadow-xl"
                  variants={logoVariants}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: -5,
                    transition: { duration: 0.3 }
                  }}
                >
                  <img src={logo2} alt="Provincial Government Logo" className="h-full w-full object-contain p-2" />
                </motion.div>
              </motion.div>

              {/* CONTROLS */}
              <motion.button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/40 p-4 text-white backdrop-blur-md transition-all hover:bg-white/60 hover:scale-110 shadow-xl"
                aria-label="Previous image"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.6)" }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <FaChevronLeft className="text-xl" />
              </motion.button>

              <motion.button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/40 p-4 text-white backdrop-blur-md transition-all hover:bg-white/60 hover:scale-110 shadow-xl"
                aria-label="Next image"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.6)" }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <FaChevronRight className="text-xl" />
              </motion.button>

              {/* INDICATORS */}
              <motion.div 
                className="absolute bottom-24 left-1/2 flex -translate-x-1/2 transform gap-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {images.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-10 bg-white shadow-lg"
                        : "w-4 bg-white/70 hover:bg-white/90"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* DECORATIVE ELEMENTS */}
            <motion.div 
              className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-red-500/30 blur-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.div 
              className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-blue-500/30 blur-2xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }}
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default MissionVisionSection;
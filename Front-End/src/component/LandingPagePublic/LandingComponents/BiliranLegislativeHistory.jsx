import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import historical from "../../../assets/historical.jpg";
import historical2 from "../../../assets/history2.jfif";
import historical7 from "../../../assets/history7.jfif";
import historical3 from "../../../assets/history3.jfif";
import historical5 from "../../../assets/history5.jfif";
import historical8 from "../../../assets/history8.jfif";
import Background from "../../../assets/Bacground.jpg";

const BiliranLegislativeHistory = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const sectionRef = useRef(null);

  const legislativeData = [
    {
      period: "1959",
      title: "Biliran Becomes Sub-Province",
      description: "Biliran officially becomes a sub-province of Leyte through Republic Act 2141",
      icon: <MapPin className="w-6 h-6" />,
      type: "legislation",
      color: "bg-blue-500",
      image: historical
    },
    {
      period: "1961-1972",
      title: "3rd District Representation",
      description: "Represented as part of Leyte's 3rd congressional district",
      icon: <Users className="w-6 h-6" />,
      type: "representation",
      color: "bg-green-500",
      image: historical2
    },
    {
      period: "1991",
      title: "Local Government Code",
      description: "R.A. 7160 provides for Biliran's conversion to a regular province",
      icon: <MapPin className="w-6 h-6" />,
      type: "legislation",
      color: "bg-purple-500",
      image: historical7
    },
    {
      period: "1992",
      title: "Plebiscite Ratification",
      description: "May 11: Plebiscite ratifies Biliran's conversion to regular province",
      icon: <Calendar className="w-6 h-6" />,
      type: "event",
      color: "bg-orange-500",
      image: historical3
    },
    {
      period: "1992",
      title: "Independent Province",
      description: "May 21: Biliran officially proclaimed an independent province",
      icon: <MapPin className="w-6 h-6" />,
      type: "event",
      color: "bg-red-500",
      image: historical5
    },
    {
      period: "1995-Present",
      title: "Lone District Era",
      description: "Biliran's lone congressional district created with independent representation",
      icon: <Users className="w-6 h-6" />,
      type: "representation",
      color: "bg-indigo-500",
      image: historical8
    }
  ];

  // Scroll animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === legislativeData.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, legislativeData.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === legislativeData.length - 1 ? 0 : prev + 1));
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? legislativeData.length - 1 : prev - 1));
    setAutoPlay(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: -50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const carouselVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const slideVariants = {
    hidden: { 
      opacity: 0,
      x: 100 
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.3
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      scale: 1.1,
      rotateY: -10 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const timelineDotVariants = {
    hidden: { 
      scale: 0,
      opacity: 0 
    },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "backOut"
      }
    }
  };

  return (
    <motion.div 
      ref={sectionRef}
      className="relative min-h-screen py-12 px-4 overflow-hidden"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Grayscale Background Image with Animation */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${Background})`,
          filter: "grayscale(100%) brightness(0.6)"
        }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      ></motion.div>

      {/* Animated Overlay */}
      <motion.div 
        className="absolute inset-0 bg-black/30 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      ></motion.div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto z-10">
        {/* Animated Header */}
        <motion.div 
          className="text-center mb-16"
          variants={headerVariants}
        >
          <motion.div 
            className="inline-block"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-white">
              Legislative History of Biliran
            </h1>
            <motion.div 
              className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            />
          </motion.div>
          <motion.p 
            className="text-xl mt-6 text-gray-300 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Journey from sub-province to independent congressional representation
          </motion.p>
        </motion.div>

        {/* Main Carousel with Animation */}
        <motion.div 
          className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
          variants={carouselVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="w-full flex-shrink-0"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="grid md:grid-cols-2 gap-8 items-center px-4">
                    {/* Content Side */}
                    <motion.div 
                      className="space-y-6 text-white"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className={`p-4 rounded-2xl text-white ${legislativeData[currentSlide].color} shadow-lg`}
                          whileHover={{ 
                            scale: 1.1,
                            rotate: 5,
                            transition: { type: "spring", stiffness: 400 }
                          }}
                        >
                          {legislativeData[currentSlide].icon}
                        </motion.div>
                        <motion.span 
                          className="text-sm font-bold text-gray-300 uppercase tracking-wider px-4 py-1 bg-white/10 rounded-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          {legislativeData[currentSlide].type}
                        </motion.span>
                      </div>

                      <div className="space-y-2">
                        <motion.h2 
                          className="text-xl font-semibold text-blue-400"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          {legislativeData[currentSlide].period}
                        </motion.h2>
                        <motion.h3 
                          className="text-4xl font-black leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          {legislativeData[currentSlide].title}
                        </motion.h3>
                      </div>

                      <motion.p 
                        className="text-lg leading-relaxed text-gray-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        {legislativeData[currentSlide].description}
                      </motion.p>

                      <motion.div 
                        className="flex items-center gap-2 text-sm text-gray-400 pt-4 border-t border-gray-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="font-medium">{legislativeData[currentSlide].period}</span>
                      </motion.div>
                    </motion.div>

                    {/* Image Side */}
                    <motion.div 
                      className="relative group"
                      variants={imageVariants}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                      <motion.div 
                        className="relative bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl overflow-hidden h-80 shadow-2xl border border-gray-600"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {legislativeData[currentSlide].image ? (
                          <motion.img 
                            src={legislativeData[currentSlide].image} 
                            alt={legislativeData[currentSlide].title}
                            className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="text-7xl font-black text-white/20 mb-4">
                              {legislativeData[currentSlide].period.split('-')[0]}
                            </div>
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <motion.button
              onClick={prevSlide}
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 border border-gray-600"
              aria-label="Previous slide"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>

            <motion.button
              onClick={nextSlide}
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 border border-gray-600"
              aria-label="Next slide"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
          </div>

          {/* Dots Indicator */}
          <motion.div 
            className="flex justify-center mt-8 space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {legislativeData.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-gradient-to-r from-blue-400 to-purple-500 w-12' 
                    : 'bg-gray-600 w-2 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                variants={timelineDotVariants}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Timeline Indicator */}
        <motion.div 
          className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700"
          variants={carouselVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between relative px-4">
            <motion.div 
              className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 -translate-y-1/2"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
            />
            {legislativeData.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative z-10 flex flex-col items-center transition-all duration-300 group ${
                  index === currentSlide ? 'scale-125' : 'hover:scale-110'
                }`}
                aria-label={`Jump to ${item.period}`}
                variants={timelineDotVariants}
                whileHover={{ scale: 1.3 }}
              >
                <motion.div
                  className={`w-5 h-5 rounded-full border-4 border-gray-900 shadow-lg transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-gradient-to-br from-blue-400 to-purple-500 shadow-blue-500/50' 
                      : 'bg-gray-600 group-hover:bg-gray-500'
                  }`}
                  animate={index === currentSlide ? { 
                    scale: [1, 1.2, 1],
                    transition: { duration: 2, repeat: Infinity }
                  } : {}}
                />
                <motion.span
                  className={`text-xs font-bold mt-3 transition-all duration-300 ${
                    index === currentSlide 
                      ? 'text-blue-400' 
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                >
                  {item.period}
                </motion.span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-20 left-10 w-3 h-3 bg-blue-400 rounded-full opacity-60"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 right-20 w-4 h-4 bg-purple-400 rounded-full opacity-40"
          animate={{
            y: [0, 15, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </motion.div>
  );
};

export default BiliranLegislativeHistory;
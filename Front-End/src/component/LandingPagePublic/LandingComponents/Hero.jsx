import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import LogoCarousel from "./LogoCarousel";
import Biliran from "../../../assets/Biliran-Bridge-2.jpg";
import logo from "../../../assets/logo-login.png";

const Hero = ({ scrollContainerRef }) => {
  // Scroll-based parallax
  const { scrollY } = useScroll({
    container: scrollContainerRef,
  });

  const y = useTransform(scrollY, [0, 500], [0, -100]); // background parallax
  const opacity = useTransform(scrollY, [0, 300], [1, 0]); // fade-out text

  return (
    <section className="relative flex h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-blue-900">
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <img
          src={Biliran}
          alt="Biliran Landscape"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-900/50 to-blue-900/90"></div>
      </motion.div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 flex w-full flex-col items-center justify-center text-center px-4"
        style={{ opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Logo */}
          <motion.div
            className="mb-6 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex h-32 w-32 items-center justify-center rounded-full shadow-2xl bg-white">
              <img
                src={logo}
                alt="Biliran Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl text-yellow-500">
            Provincial{" "}
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Government
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-gray-200 md:text-xl">
            Discover the island paradise of Eastern Visayas. A haven of
            natural wonders, warm hospitality, and progressive governance.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
               onClick={() =>
              window.open(
                "https://tourism.biliranisland.com/island-attractions",
                "_blank"
              )
            }
              className="rounded-full bg-red-600 px-8 py-4 font-bold text-white shadow-lg shadow-red-600/30 transition-colors hover:bg-red-700"
            >
              Explore Tourism
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

import React, { useState, useEffect, useContext, useRef } from "react";
import { ChevronLeft, ChevronRight, FileText, Calendar, User, Tag, ArrowUp } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import defaultCover from "../../../../src/assets/billpicture.jpg";
import backgroundImage from "../../../../src/assets/capitol.png";
import NewsandLatest from "../NewandInformation/NewsandLatest";
import logo from "../../../../src/assets/logo-login.png";
import PDFview from "../PDFview";
import AboutUsPage from "../AboutUs";
import Transparency from "../../../../src/assets/Transparency.svg";
import BagongPilipinas from "../../../../src/assets/bagongpilipinas.png";
import Hotline from "../NewandInformation/Hotline";
import LatestBills from "../LatestBill";
import NewsContent from "../NewandInformation/NewsContent";
import Recentpost from "../NewandInformation/Recentpost"

// Scroll to Top button component
const ScrollToTop = () => {
  const { scrollYProgress } = useScroll();
  const scrollY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setVisible(latest > 0.2);
    });

    return () => unsubscribe();
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.button
      className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 2xs:bottom-5 2xs:right-5 xs:bottom-6 xs:right-6 xs-max:bottom-6 xs-max:right-6 xm:bottom-8 xm:right-8 xm:h-12 xm:w-12"
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.5,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <ArrowUp
        size={16}
        className="xm:size-5"
      />
      <motion.div
        className="absolute inset-0 -z-10 rounded-full bg-blue-800"
        style={{
          scale: scrollY,
        }}
      />
    </motion.button>
  );
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      when: "beforeChildren",
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const Home = ({ aboutUsRef }) => {
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { isLatestBill } = useContext(FilesDisplayContext);
  const { pictures,loading,setLoading } = useContext(NewsDisplayContext);

  // New: Create a ref for the News and Latest section
  const newsAndLatestRef = useRef(null);

  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(heroScrollY, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(heroScrollY, [0, 0.5], [1, 0]);

  const newsItems = pictures.filter((item) => item.category === "Carousel");
  const documentsummary = pictures.filter((item) => item.category === "Documentation");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [spCarouselIndex, setSPCarouselIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const [isHoveringSPCarousel, setIsHoveringSPCarousel] = useState(false);
  // Ref for scroll-triggered animations
  const featuredRef = useRef(null);
  const billsRef = useRef(null);
  const servicesRef = useRef(null);

  // Check if elements are in view
  const featuredInView = useInView(featuredRef, { once: true, margin: "-20% 0px" });
  const servicesInView = useInView(servicesRef, { once: true, margin: "-10% 0px" });

  const handleViewFile = (fileId, fileData) => {
    setSelectedFile({ fileId, fileData });
  };

  const handleViewNews = (news) => {
    setSelectedNews(news);
  };

  // New: Function to go back from NewsContent and scroll to the NewsandLatest section
  const handleBackFromNews = () => {
    setSelectedNews(null);
    if (newsAndLatestRef.current) {
      newsAndLatestRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (newsItems.length === 0 ? 0 : (prevIndex + 1) % newsItems.length));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (newsItems.length === 0 ? 0 : (prevIndex - 1 + newsItems.length) % newsItems.length));
  };

  const nextSPSlide = () => {
    setSPCarouselIndex((prevIndex) => (prevIndex + 1) % documentsummary.length);
  };

  const prevSPSlide = () => {
    setSPCarouselIndex((prevIndex) => (prevIndex - 1 + documentsummary.length) % documentsummary.length);
  };

  useEffect(() => {
    if (isHoveringCarousel || newsItems.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isHoveringCarousel, newsItems.length]);

  useEffect(() => {
    if (isHoveringSPCarousel) return;

    const interval = setInterval(() => {
      nextSPSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [isHoveringSPCarousel]);

  if (selectedFile) {
    return (
      <PDFview
        fileId={selectedFile.fileId}
        fileData={selectedFile.fileData}
      />
    );
  }

  if (selectedNews) {
    // Update: Pass the handleBackFromNews function to the onBack prop
    return <NewsContent news={selectedNews} onBack={handleBackFromNews} />;
  }

  const currentSPSlide = documentsummary[spCarouselIndex];

  // Data for Government Services section
  const governmentServices = [
    {
      icon: FileText,
      title: "Documents",
      desc: "Official forms and publications",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Calendar,
      title: "Events",
      desc: "Government events and meetings",
      color: "from-green-500 to-green-600",
    },
    {
      icon: User,
      title: "Officials",
      desc: "Government representatives",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Tag,
      title: "Services",
      desc: "Public services and programs",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-slate-800 antialiased">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5 },
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500"
          >
            <motion.div
              initial={{ scale: 1 }}
              exit={{
                scale: 2,
                opacity: 0,
                transition: {
                  duration: 1,
                  ease: "easeOut",
                },
              }}
            >
              <motion.img
                src={logo}
                alt="Provincial Government Logo"
                className="h-28 w-28 opacity-95 drop-shadow-2xl xs:h-32 xs:w-32 xs-max:h-36 xs-max:w-36 xm:h-40 xm:w-40"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{
                  duration: 2,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top button */}
      <ScrollToTop />

      {/* Hero Section with Parallax */}
      <motion.section
        ref={heroRef}
        className="relative flex h-screen items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(30, 64, 175, 0.85), rgba(55, 48, 163, 0.8)), url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 px-4 text-center text-white"
        >
          <motion.img
            src={logo}
            alt="Provincial Government Logo"
            className="mx-auto mb-4 h-24 w-24 opacity-95 drop-shadow-2xl xs:mb-4 xs:h-28 xs:w-28 xs-max:mb-5 xs-max:h-32 xs-max:w-32 xm:mb-6 xm:h-40 xm:w-40"
            initial={loading ? { opacity: 0, scale: 2 } : { opacity: 1, scale: 1 }}
            animate={loading ? { opacity: 0, scale: 2 } : { opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              delay: 0.5,
              ease: "easeOut",
            }}
          />
          <h1 className="mb-3 text-xl font-bold drop-shadow-lg xs:text-2xl xs-max:text-2xl xm:text-3xl sm:text-4xl md:text-5xl">Provincial Government</h1>
          <p className="mx-auto max-w-2xl text-sm text-blue-100 drop-shadow-md xs:text-base xs-max:text-base xm:text-lg sm:text-xl">
            Serving the community with integrity and dedication
          </p>
        </motion.div>
      </motion.section>

      {/* Quote Section */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-red-700 to-blue-600 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="px-4 py-8 text-center xs:px-5 xs:py-9 xs-max:px-5 xs-max:py-10 xm:px-6 xm:py-12 sm:px-8 sm:py-16">
          <motion.div
            className="mx-auto max-w-6xl"
            variants={fadeInUp}
          >
            <h2 className="mb-4 font-serif text-base italic leading-relaxed xs:text-lg xs-max:text-lg xm:text-xl lg-custom:text-4xl">
              "Together as one province, we commit to serve with integrity and unity, building a future where every community thrives in
              progress and peace."
            </h2>
          </motion.div>
        </div>
      </motion.div>

{/* Announcements and Hotlines Section */}
<section
  ref={featuredRef}
  className="container mx-auto mt-4 px-3 xs:px-2 xs-max:px-2 sm:px-6"
  id="news"
>
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    variants={staggerContainer}
    className="grid grid-cols-1 gap-4 xs:gap-4 xs-max:gap-5 xm:gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-3 lg:px-16 2xs:px-2"
  >
    {/* News and Latest - 2/3 width on desktop, full width on mobile */}
    <motion.div
      variants={fadeInUp}
      className="md:col-span-2 order-1 xs:order-1 xs-max:order-1"
    >
      <LatestBills
        onFileView={handleViewFile}
        loading={loading}
      />
      <NewsandLatest
        ref={newsAndLatestRef}
        onNewsView={handleViewNews}
        loading={loading}
      />
    </motion.div>

    {/* Logos Box & Hotline - 1/3 width on desktop, full width on mobile */}
    <motion.div
      variants={fadeInUp}
      className="flex flex-col space-y-4 md:col-span-1 order-2 xs:order-2 xs-max:order-2 md:order-none"
    >
      {/* Logo 1 */}
      <div className="flex items-center justify-center rounded-xl bg-white p-3 shadow-md xs:p-3 xs-max:p-4 xm:p-4">
        <img
          src={BagongPilipinas}
          alt="Bagong Pilipinas"
          className="h-20 object-contain xs:h-24 xs-max:h-28 xm:h-32 sm:h-36"
        />
      </div>

      {/* Logo 2 */}
      <div className="flex items-center justify-center rounded-xl bg-white p-3 shadow-md xs:p-3 xs-max:p-4 xm:p-4">
        <img
          src={Transparency}
          alt="Transparency"
          className="h-20 object-contain xs:h-24 xs-max:h-28 xm:h-32 sm:h-36"
        />
      </div>

      {/* Hotline */}
      <div className="flex items-center justify-center rounded-xl bg-white p-3 shadow-md xs:p-3 xs-max:p-4 xm:p-4">
        <Hotline />
      </div>

      {/* Recent Post */}
      <div className="items-center">
        <Recentpost />
      </div>
    </motion.div>
  </motion.div>
</section>


      {/* About Us Section */}
      <section
        ref={aboutUsRef}
        id="about-us"
        className="min-h-screen bg-white"
      >
        <AboutUsPage />
      </section>

      {/* Government Services Section */}
      <section
        ref={servicesRef}
        className="bg-white py-8 xs:py-9 xs-max:py-10 xm:py-12 sm:py-16 lg:px-16 2xs:px-2"
        id="services"
      >
        <div className="container mx-auto px-3 xs:px-4 xs-max:px-4 xm:px-5 sm:px-6">
          <motion.div
            initial="hidden"
            animate={servicesInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="mb-6 text-center xs:mb-7 xs-max:mb-8 xm:mb-10 sm:mb-12"
          >
            <h2 className="text-lg font-bold text-slate-900 xs:text-xl xs-max:text-xl xm:text-2xl sm:text-3xl">Government Services</h2>
            <p className="mt-2 text-sm text-slate-600 xs:mt-2 xs-max:mt-3 xm:mt-3 xm:text-base">Access our services and resources</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-3 xs:gap-3 xs-max:gap-4 xm:grid-cols-4 xm:gap-4 sm:gap-5 lg:grid-cols-4">
            {governmentServices.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                custom={index}
                initial="hidden"
                animate={servicesInView ? "visible" : "hidden"}
                whileHover={{ y: -8 }}
                className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 p-4 text-center shadow-md transition-all duration-300 hover:border-blue-200 hover:shadow-lg xs:p-4 xs-max:p-4 xm:p-5"
              >
                <div
                  className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${service.color} text-white shadow-lg xs:mb-3 xs:h-10 xs:w-10 xs-max:mb-4 xs-max:h-12 xs-max:w-12 xm:mb-4 xm:h-12 xm:w-12`}
                >
                  <service.icon className="h-5 w-5 xs:h-5 xs:w-5 xs-max:h-6 xs-max:w-6 xm:h-6 xm:w-6" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-slate-900 xs:text-base xs-max:text-lg xm:text-lg">{service.title}</h3>
                <p className="text-xs text-slate-600 xs:text-xs xs-max:text-sm xm:text-sm">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Update: Add forwardRef to the Home component so it can receive a ref from its parent
const HomeWithRef = React.forwardRef(Home);
export default HomeWithRef;
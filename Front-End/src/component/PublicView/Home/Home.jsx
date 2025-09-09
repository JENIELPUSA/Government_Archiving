import React, { useState, useEffect, useContext, useRef } from "react";
import { ChevronLeft, ChevronRight, FileText, Calendar, User, Tag, ArrowUp } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import defaultCover from "../../../../src/assets/billpicture.jpg";
import backgroundImage from "../../../../src/assets/capitol.png";
import logo from "../../../../src/assets/logo-login.png";
import PDFview from "../PDFview";
import AboutUsPage from "../AboutUs";

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
            className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                opacity: visible ? 1 : 0,
                scale: visible ? 1 : 0.5,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <ArrowUp size={20} />
            <motion.div
                className="absolute inset-0 -z-10 rounded-full bg-blue-800"
                style={{
                    scale: scrollY,
                }}
            />
        </motion.button>
    );
};

const Home = ({ aboutUsRef }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const { isLatestBill } = useContext(FilesDisplayContext);
    const { pictures } = useContext(NewsDisplayContext);

    // Scroll progress for header animation
    const { scrollYProgress } = useScroll();
    const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
    const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);

    // Parallax effects for hero section
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
    const [isLoading, setIsLoading] = useState(true);

    // Ref for scroll-triggered animations
    const featuredRef = useRef(null);
    const billsRef = useRef(null);
    const servicesRef = useRef(null);

    // Check if elements are in view
    const featuredInView = useInView(featuredRef, { once: true, margin: "-20% 0px" });
    const billsInView = useInView(billsRef, { once: true, margin: "-10% 0px" });
    const servicesInView = useInView(servicesRef, { once: true, margin: "-10% 0px" });

    // Simulate loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleViewFile = (fileId, fileData) => {
        setSelectedFile({ fileId, fileData });
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

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const currentSPSlide = documentsummary[spCarouselIndex];

    // Skeletons
    const CarouselSkeleton = () => (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-gray-200 shadow-xl">
            <div className="grid min-h-[500px] grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center p-8 lg:p-12">
                    <div className="mx-auto max-w-md lg:mx-0">
                        <div className="mb-6 h-7 w-32 animate-pulse rounded-full bg-gray-300"></div>
                        <div className="mb-4 h-10 animate-pulse rounded-lg bg-gray-300"></div>
                        <div className="mb-2 h-6 animate-pulse rounded bg-gray-300"></div>
                        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-300"></div>
                        <div className="mb-8 h-6 w-1/2 animate-pulse rounded bg-gray-300"></div>
                    </div>
                </div>
                <div className="relative animate-pulse overflow-hidden bg-gray-300"></div>
            </div>
        </div>
    );

    const BillCardSkeleton = () => (
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
            <div className="h-48 flex-shrink-0 animate-pulse bg-gray-300"></div>
            <div className="flex flex-grow flex-col justify-between p-6">
                <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-300"></div>
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
                    </div>
                    <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-300"></div>
                    <div className="mb-1 h-4 w-full animate-pulse rounded bg-gray-300"></div>
                    <div className="mb-4 h-4 w-2/3 animate-pulse rounded bg-gray-300"></div>
                </div>
                <div className="mt-4 h-5 w-32 animate-pulse rounded bg-gray-300"></div>
            </div>
        </div>
    );

    if (selectedFile) {
        return (
            <PDFview
                fileId={selectedFile.fileId}
                fileData={selectedFile.fileData}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-slate-800 antialiased">
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
                    className="relative z-10 text-center text-white"
                >
                    <motion.img
                        src={logo}
                        alt="Provincial Government Logo"
                        className="mx-auto mb-8 h-60 w-60 opacity-95 drop-shadow-2xl"
                        initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                        animate={{ opacity: 0.95, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1 }}
                    />
                    <h1 className="mb-6 text-4xl font-bold drop-shadow-lg md:text-5xl lg:text-6xl">Provincial Government</h1>
                    <p className="mx-auto max-w-2xl text-xl text-blue-100 drop-shadow-md md:text-2xl">
                        Serving the community with integrity and dedication
                    </p>
                </motion.div>
            </motion.section>

            <motion.div
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-red-700 to-blue-600 text-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeIn}
            >
                <div className="px-8 py-16 text-center">
                    <motion.div
                        className="mx-auto max-w-6xl"
                        variants={fadeInUp}
                    >
                        <h2 className="mb-8 font-serif text-2xl italic leading-relaxed md:text-4xl lg:text-5xl">
                            "Together as one province, we commit to serve with integrity and unity, building a future where every community thrives in
                            progress and peace."
                        </h2>
                    </motion.div>
                </div>
            </motion.div>

            {/* Featured Documents */}
            <section
                ref={featuredRef}
                className="bg-white py-16"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        animate={featuredInView ? "visible" : "hidden"}
                        variants={fadeInUp}
                        className="mb-12 text-center"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Featured Documents</h2>
                        <p className="mt-4 text-lg text-slate-600">Important updates and announcements from the provincial government</p>
                    </motion.div>

                    {isLoading || documentsummary.length === 0 ? (
                        <CarouselSkeleton />
                    ) : (
                        <motion.div
                            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 shadow-xl"
                            onMouseEnter={() => setIsHoveringSPCarousel(true)}
                            onMouseLeave={() => setIsHoveringSPCarousel(false)}
                            initial="hidden"
                            animate={featuredInView ? "visible" : "hidden"}
                            variants={scaleIn}
                        >
                            <div className="grid min-h-[500px] grid-cols-1 lg:grid-cols-2">
                                <motion.div
                                    key={spCarouselIndex + "content"}
                                    className="flex flex-col justify-center p-8 lg:p-12"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    <div className="mx-auto max-w-md lg:mx-0">
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold uppercase tracking-wider text-blue-700">
                                            Featured
                                        </span>
                                        <h2 className="mb-4 mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">{currentSPSlide?.title}</h2>
                                        <p className="mb-8 text-lg leading-relaxed text-slate-600">{currentSPSlide?.excerpt}</p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    key={spCarouselIndex + "image"}
                                    className="relative overflow-hidden"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    {currentSPSlide?.avatar?.url ? (
                                        <motion.img
                                            src={currentSPSlide.avatar.url}
                                            alt={currentSPSlide.title}
                                            className="h-full w-full object-cover"
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-200">
                                            <span className="text-slate-500">No Image Available</span>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Latest Bills Section */}
            <section
                ref={billsRef}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        animate={billsInView ? "visible" : "hidden"}
                        variants={staggerContainer}
                    >
                        <motion.div
                            variants={fadeInUp}
                            className="mb-12 text-center"
                        >
                            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Latest Bills</h2>
                            <p className="mt-4 text-lg text-slate-600">Recently proposed legislation and government documents</p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {isLoading || isLatestBill.length === 0
                                ? Array.from({ length: 3 }).map((_, index) => <BillCardSkeleton key={index} />)
                                : isLatestBill.slice(0, 3).map((news, index) => (
                                      <motion.div
                                          key={news.id || news._id}
                                          className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
                                          variants={fadeInUp}
                                          custom={index}
                                          initial="hidden"
                                          animate={billsInView ? "visible" : "hidden"}
                                      >
                                          <div className="h-48 flex-shrink-0 overflow-hidden bg-slate-200">
                                              <img
                                                  src={news.avatar?.url || defaultCover}
                                                  alt={news.title || "Default Cover"}
                                                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                              />
                                          </div>
                                          <div className="flex flex-grow flex-col justify-between p-6">
                                              <div>
                                                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                      <span className="rounded-full border border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                                          {news.category}
                                                      </span>
                                                      <span className="text-sm text-slate-500">{news.date}</span>
                                                  </div>
                                                  <h3 className="mb-2 text-xl font-bold text-slate-900">{news.title}</h3>
                                                  <p className="mb-4 line-clamp-3 text-slate-600">{news.summary}</p>
                                              </div>
                                              <button
                                                  onClick={() => handleViewFile(news._id, news)}
                                                  className="group mt-4 flex items-center font-medium text-blue-700 transition-colors hover:text-blue-900"
                                              >
                                                  <FileText className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                                                  Read Document
                                              </button>
                                          </div>
                                      </motion.div>
                                  ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <section
                ref={aboutUsRef}
                id="about-us"
                className="min-h-screen bg-white"
            >
                <AboutUsPage />
            </section>

            {/* Government Services */}
            <section
                ref={servicesRef}
                className="bg-white py-16"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        animate={servicesInView ? "visible" : "hidden"}
                        variants={fadeInUp}
                        className="mb-12 text-center"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Government Services</h2>
                        <p className="mt-4 text-lg text-slate-600">Access our services and resources</p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
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
                        ].map((service, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                custom={index}
                                initial="hidden"
                                animate={servicesInView ? "visible" : "hidden"}
                                whileHover={{ y: -8 }}
                                className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 p-6 text-center shadow-md transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
                            >
                                <div
                                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${service.color} text-white shadow-lg`}
                                >
                                    <service.icon className="h-8 w-8" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-900">{service.title}</h3>
                                <p className="text-slate-600">{service.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

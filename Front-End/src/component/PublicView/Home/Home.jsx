import React, { useState, useEffect, useContext, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import NewsandLatest from "../NewandInformation/NewsandLatest";
import logo from "../../../../src/assets/logo-login.png";
import PDFview from "../PDFview";
import AboutUsPage from "../AboutUs";
import Transparency from "../../../../src/assets/Transparency.svg";
import BagongPilipinas from "../../../../src/assets/bagongpilipinas.png";
import Hotline from "../NewandInformation/Hotline";
import LatestBills from "../LatestBill";
import NewsContent from "../../LandingPagePublic/LandingComponents/NewsContent";
import Recentpost from "../NewandInformation/Recentpost";
import LocalServicesGovernment from "../localservices";
import Baground2 from "../../../../src/assets/ros2221.jpg";
import Baground3 from "../../../../src/assets/ros12.jpg";
import Baground4 from "../../../../src/assets/ros2233.jpg";
import Baground5 from "../../../../src/assets/ros41.jpg";
import Baground7 from "../../../../src/assets/ros100.jpg";
import Baground8 from "../../../../src/assets/ros777.jpg";
import Baground9 from "../../../../src/assets/ros888.jpg";
import Baground10 from "../../../../src/assets/ros555.jpg";

import CardSwap, { Card } from "../CardSwap";

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
                style={{ scale: scrollY }}
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

const Home = ({ aboutUsRef }) => {
    const [selectedNews, setSelectedNews] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const { pictures, loading } = useContext(NewsDisplayContext);

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

    // Hero background hooks — moved UP
    const heroBackgrounds = [Baground2, Baground3, Baground4, Baground5];
    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        const heroInterval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroBackgrounds.length);
        }, 15000);
        return () => clearInterval(heroInterval);
    }, []);

    // Carousel intervals
    useEffect(() => {
        if (isHoveringCarousel || newsItems.length === 0) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isHoveringCarousel, newsItems.length]);

    useEffect(() => {
        if (isHoveringSPCarousel) return;
        const interval = setInterval(nextSPSlide, 6000);
        return () => clearInterval(interval);
    }, [isHoveringSPCarousel]);

    // Handler functions
    const handleViewFile = (fileId, fileData) => {
        setSelectedFile({ fileId, fileData });
    };

    const handleViewNews = (news) => {
        setSelectedNews(news);
    };

    const handleBackFromNews = () => {
        setSelectedNews(null);
        if (newsAndLatestRef.current) {
            newsAndLatestRef.current.scrollIntoView({ behavior: "smooth" });
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

    // CONDITIONAL RETURNS — now SAFE because all hooks are already called above
    if (selectedFile) {
        return (
            <PDFview
                fileId={selectedFile.fileId}
                fileData={selectedFile.fileData}
            />
        );
    }

    if (selectedNews) {
        return (
            <NewsContent
                news={selectedNews}
                onBack={handleBackFromNews}
            />
        );
    }

    // Main JSX
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-50 font-sans text-slate-800 antialiased">
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.5 } }}
                        className="fixed inset-0 z-[999] flex h-screen w-screen items-center justify-center overflow-hidden bg-blue-500"
                    >
                        <motion.div
                            initial={{ scale: 1 }}
                            exit={{ scale: 2, opacity: 0, transition: { duration: 1, ease: "easeOut" } }}
                        >
                            <motion.img
                                src={logo}
                                alt="Provincial Government Logo"
                                className="h-24 max-h-[80vh] w-24 max-w-[80vw] opacity-95 drop-shadow-2xl sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-40 lg:w-40 xs:h-28 xs:w-28"
                                initial={{ rotateY: 0 }}
                                animate={{ rotateY: 360 }}
                                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ScrollToTop />

            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                className="relative flex h-dvh items-center justify-center overflow-hidden"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={heroIndex}
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        style={{
                            backgroundImage: `linear-gradient(135deg, rgba(30, 64, 175, 0.85), rgba(55, 48, 163, 0.8)), url(${heroBackgrounds[heroIndex]})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                </AnimatePresence>

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
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    />
                    <h1 className="mb-3 text-xl font-bold drop-shadow-lg md:text-5xl xs:text-2xl xs-max:text-2xl xm:text-3xl">
                        Provincial Government
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm text-blue-100 drop-shadow-md xs:text-base xs-max:text-base xm:text-lg">
                        Serving the community with integrity and dedication
                    </p>
                </motion.div>
            </motion.section>

            {/* Quote Section */}
            <motion.div
                className="relative bg-gradient-to-r from-blue-600 via-red-700 to-blue-600 px-4 text-white sm:px-6 md:px-8 lg:px-12 xl:px-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
            >
                <div className="mx-auto max-w-7xl">
                    <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 sm:min-h-[500px] sm:flex-row sm:justify-between sm:py-20 lg:min-h-[600px] lg:py-16 xs:min-h-[250px]">
                        <motion.div
                            className="flex-1 text-center sm:text-left"
                            variants={fadeInUp}
                        >
                            <h1 className="mt-10 font-serif italic leading-snug sm:leading-relaxed md:leading-relaxed lg:mt-0 custom-3xs:mt-[200px]">
                                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xs:text-lg">
                                    "Together as one province, we commit to serve with integrity and unity, building a future where every community
                                    thrives in progress and peace."
                                </span>
                            </h1>
                        </motion.div>

                        <motion.div
                            className="hidden flex-1 justify-center sm:flex sm:justify-start"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <CardSwap
                                cardDistance={60}
                                verticalDistance={70}
                                delay={5000}
                                pauseOnHover={false}
                            >
                                <Card style={{ backgroundImage: `url(${Baground7})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                                <Card style={{ backgroundImage: `url(${Baground8})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                                <Card style={{ backgroundImage: `url(${Baground9})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                                <Card style={{ backgroundImage: `url(${Baground10})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                            </CardSwap>
                        </motion.div>
                        {/* Wave Divider */}
                        <div className="absolute bottom-0 left-0 right-0">
                            <svg
                                viewBox="0 0 1440 120"
                                className="h-auto w-full"
                            >
                                <path
                                    fill="#f8fafc"
                                    d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Announcements and Hotlines */}
            <section
                id="news"
                className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {/* Left Column: Bills & News - Takes 3 columns on desktop */}
                        <div className="lg:col-span-3">
                            <div className="space-y-6">
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeInUp}
                                >
                                    <LatestBills
                                        onFileView={handleViewFile}
                                        loading={loading}
                                    />
                                </motion.div>

                                <motion.div
                                    ref={newsAndLatestRef}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeInUp}
                                >
                                    <NewsandLatest
                                        onNewsView={handleViewNews}
                                        loading={loading}
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* Right Column: Cards - Takes 1 column on desktop */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 mb-2 space-y-4">
                                {/* Bagong Pilipinas Card */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeInUp}
                                    className="flex items-center justify-center rounded-xl bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
                                >
                                    <img
                                        src={BagongPilipinas}
                                        alt="Bagong Pilipinas"
                                        className="h-24 w-auto object-contain transition-transform duration-300 hover:scale-105 sm:h-28 md:h-32 lg:h-36"
                                    />
                                </motion.div>

                                {/* Transparency Card */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeInUp}
                                    className="flex items-center justify-center rounded-xl bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
                                >
                                    <img
                                        src={Transparency}
                                        alt="Transparency"
                                        className="h-24 w-auto object-contain transition-transform duration-300 hover:scale-105 sm:h-28 md:h-32 lg:h-36"
                                    />
                                </motion.div>

                                {/* Hotline Card */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeInUp}
                                    className="rounded-xl bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
                                >
                                    <Hotline />
                                </motion.div>

                                {/* Recent Post Card */}
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeInUp}
                                    className="rounded-xl bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
                                >
                                    <Recentpost />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us */}
            <motion.section
                ref={aboutUsRef}
                id="about-us"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
            >
                <AboutUsPage />
            </motion.section>

            {/* Local Services */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
            >
                <LocalServicesGovernment />
            </motion.div>
        </div>
    );
};

const HomeWithRef = React.forwardRef((props, ref) => (
    <Home
        {...props}
        aboutUsRef={ref}
    />
));

export default HomeWithRef;
